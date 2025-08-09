import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { useToast } from '../hooks/use-toast';
import { Upload, X, AlertCircle, Navigation, Truck, FileSpreadsheet } from 'lucide-react';

interface GoogleSheetsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export default function GoogleSheetsImportModal({ isOpen, onClose, onImportComplete }: GoogleSheetsImportModalProps) {
  const [sheetUrl, setSheetUrl] = React.useState('');
  const [sheetName, setSheetName] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      // Effacer l'URL si un fichier est sélectionné
      setSheetUrl('');
    }
  };

  // Fonction pour valider le fichier Excel
  const validateExcelFile = (file: File): { isValid: boolean; message?: string } => {
    if (!file) {
      return { isValid: false, message: "Aucun fichier sélectionné" };
    }

    // Vérifier le type de fichier
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream',
    ];
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const isValidType = validTypes.includes(file.type) || 
                       ['.xls', '.xlsx', '.csv'].includes(`.${fileExt}`);
    
    if (!isValidType) {
      return { 
        isValid: false, 
        message: "Type de fichier non pris en charge. Veuillez importer un fichier Excel (.xls, .xlsx)." 
      };
    }

    // Vérifier la taille du fichier (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { 
        isValid: false, 
        message: "Le fichier est trop volumineux. La taille maximale autorisée est de 10 Mo." 
      };
    }

    return { isValid: true };
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    // Valider le fichier avant l'upload
    const { isValid, message } = validateExcelFile(file);
    if (!isValid) {
      toast({
        title: "Fichier invalide",
        description: message || "Le fichier sélectionné n'est pas valide.",
        variant: "destructive",
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Ajouter un timeout pour éviter les requêtes trop longues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes de timeout
      
      const response = await fetch('/api/trucks/import-excel', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Vérifier le Content-Type de la réponse
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Réponse non-JSON du serveur:', textResponse);
        throw new Error('Le serveur a renvoyé une réponse inattendue. Veuillez réessayer.');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(
          result.message || 
          result.error || 
          `Erreur lors de l'import du fichier (${response.status})`
        );
      }
      
      toast({
        title: "Import réussi",
        description: (
          <div className="space-y-1">
            <p>{result.imported || 0} camions importés avec succès.</p>
            {result.errors > 0 && (
              <p className="text-yellow-200">
                {result.errors} erreur(s) rencontrée(s) lors de l'import.
              </p>
            )}
          </div>
        ),
      });
      
      onImportComplete();
      onClose();
      
    } catch (error) {
      console.error('Erreur lors de l\'import du fichier:', error);
      
      let errorMessage = "Une erreur est survenue lors de l'import du fichier.";
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "L'import a pris trop de temps. Le fichier est peut-être trop volumineux ou le serveur est lent à répondre.";
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = "Impossible de se connecter au serveur. Vérifiez votre connexion Internet.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erreur d'import",
        description: errorMessage,
        variant: "destructive",
        duration: 8000, // Afficher plus longtemps pour les erreurs
      });
    } finally {
      setIsImporting(false);
      setSelectedFile(null);
      // Réinitialiser l'input file
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  // Fonction pour valider l'URL Google Sheets
  const validateGoogleSheetsUrl = (url: string): { isValid: boolean; message?: string } => {
    if (!url.trim()) {
      return { isValid: false, message: "L'URL ne peut pas être vide" };
    }

    try {
      const urlObj = new URL(url);
      
      // Vérifier que c'est bien une URL Google Sheets
      if (!urlObj.hostname.includes('docs.google.com') || 
          !urlObj.pathname.includes('/spreadsheets/')) {
        return { 
          isValid: false, 
          message: "L'URL doit être une Google Sheet valide (docs.google.com/spreadsheets/...)" 
        };
      }

      // Vérifier que la feuille est accessible (au moins en lecture)
      if (url.includes('/edit')) {
        return { 
          isValid: false, 
          message: "L'URL semble être en mode édition. Assurez-vous d'utiliser l'URL de partage" 
        };
      }

      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        message: "Format d'URL invalide. Veuillez vérifier et réessayer." 
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si un fichier est sélectionné, utiliser l'import de fichier
    if (selectedFile) {
      await handleFileUpload(selectedFile);
      return;
    }
    
    // Valider l'URL Google Sheets
    const { isValid, message } = validateGoogleSheetsUrl(sheetUrl);
    if (!isValid) {
      toast({
        title: "URL invalide",
        description: message || "L'URL fournie n'est pas valide.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      console.log('🔄 Starting Google Sheets import:', { sheetUrl, sheetName });

      // Ajouter un timeout pour éviter les requêtes trop longues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 secondes de timeout

      const response = await fetch('/api/trucks/import-google-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetUrl: sheetUrl.trim(), // Utiliser le nom de paramètre préféré
          sheetName: sheetName.trim() || undefined
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📡 Response status:', response.status);

      // Vérifier le Content-Type de la réponse
      const contentType = response.headers.get('content-type');
      console.log('📋 Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Non-JSON response:', textResponse);
        throw new Error('La réponse du serveur n\'est pas au format JSON valide. Le serveur a peut-être rencontré une erreur.');
      }

      const result = await response.json();
      console.log('✅ Import result:', result);

      if (response.ok && result.success) {
        toast({
          title: "Import réussi",
          description: (
            <div className="space-y-1">
              <p>{result.imported || 0} camions importés avec succès.</p>
              {result.errors > 0 && (
                <p className="text-yellow-200">
                  {result.errors} erreur(s) rencontrée(s) lors de l'import.
                </p>
              )}
            </div>
          ),
        });
        
        // Reset form
        setSheetUrl('');
        setSheetName('');
        onImportComplete();
        onClose();
      } else {
        // Essayer d'extraire un message d'erreur détaillé
        const errorMessage = result.details 
          ? `${result.message || 'Erreur lors de l\'import'}: ${result.details}`
          : result.message || result.error || 'Erreur inconnue lors de l\'import';
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Google Sheets import error:', error);
      
      let errorMessage = "Erreur inconnue lors de l'import Google Sheets.";
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "La requête a pris trop de temps. Vérifiez votre connexion et réessayez.";
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = "Impossible de se connecter au serveur. Vérifiez votre connexion Internet.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erreur d'import",
        description: errorMessage,
        variant: "destructive",
        duration: 8000, // Afficher plus longtemps pour les erreurs
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setSheetUrl('');
    setSheetName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/30 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg mr-3">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-lg">Import Google Sheets</DialogTitle>
                <p className="text-purple-200 text-sm">Synchroniser depuis le cloud</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose} className="text-white hover:bg-white/10">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert className="bg-blue-500/20 border-blue-400/30 text-blue-100">
            <AlertCircle className="h-4 w-4 text-blue-300" />
            <AlertDescription className="text-blue-100">
              La Google Sheet doit être <strong className="text-white">publique</strong> ou partagée avec accès en lecture pour que l'import fonctionne.
            </AlertDescription>
          </Alert>

          {/* Section d'import de fichier */}
          <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-dashed border-gray-600">
            <div className="text-center">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-purple-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-200">Importer un fichier Excel</h3>
              <p className="mt-1 text-xs text-gray-400">
                Téléchargez un fichier .xls ou .xlsx
              </p>
              <div className="mt-4">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".xls,.xlsx"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-100 bg-purple-700 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {selectedFile ? selectedFile.name : 'Sélectionner un fichier'}
                </label>
                {selectedFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-gray-400 hover:text-gray-200"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">OU</span>
            </div>
          </div>

          {/* URL de la Google Sheet */}
          <div className="space-y-2">
            <Label htmlFor="sheetUrl" className="text-purple-100 font-medium">URL de la Google Sheet *</Label>
            <Input
              id="sheetUrl"
              type="url"
              value={sheetUrl}
              onChange={(e: any) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              required
              className="bg-white/10 border-white/20 text-white placeholder-purple-200 focus:border-purple-400 focus:ring-purple-400"
            />
            <p className="text-sm text-purple-200">
              Copiez l'URL complète de votre Google Sheet
            </p>
          </div>

          {/* Nom de l'onglet (optionnel) */}
          <div className="space-y-2">
            <Label htmlFor="sheetName">Nom de l'onglet (optionnel)</Label>
            <Input
              id="sheetName"
              value={sheetName}
              onChange={(e: any) => setSheetName(e.target.value)}
              placeholder="Feuil1, Camions, etc."
            />
            <p className="text-sm text-gray-500">
              Laissez vide pour utiliser le premier onglet
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-purple-500/20 border border-purple-400/30 p-4 rounded-lg">
            <h4 className="font-medium text-purple-100 mb-2 flex items-center">
              <Navigation className="w-4 h-4 mr-2" />
              Comment obtenir l'URL :
            </h4>
            <ol className="text-sm text-purple-200 space-y-1">
              <li>1. Ouvrez votre Google Sheet</li>
              <li>2. Cliquez sur "Partager" en haut à droite</li>
              <li>3. Changez l'accès à "Tous les utilisateurs avec le lien"</li>
              <li>4. Copiez le lien et collez-le ci-dessus</li>
            </ol>
          </div>

          {/* Colonnes attendues */}
          <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
            <h4 className="font-medium text-slate-100 mb-2 flex items-center">
              <Truck className="w-4 h-4 mr-2" />
              Colonnes attendues :
            </h4>
            <div className="text-sm text-slate-300 grid grid-cols-2 gap-2">
              <span>• Numero / Immatriculation</span>
              <span>• Filiale</span>
              <span>• Marque</span>
              <span>• Modele</span>
              <span>• Status</span>
              <span>• ...</span>
            </div>
          </div>

          <DialogFooter className="flex justify-between pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isImporting}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Import en cours...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {selectedFile ? 'Importer le fichier' : 'Importer depuis Google Sheets'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
