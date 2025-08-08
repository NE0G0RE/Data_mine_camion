import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { useToast } from '../hooks/use-toast';
import { Upload, X, AlertCircle, Navigation, Truck } from 'lucide-react';

interface GoogleSheetsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export default function GoogleSheetsImportModal({ isOpen, onClose, onImportComplete }: GoogleSheetsImportModalProps) {
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!sheetUrl.trim()) {
      toast({
        title: "URL manquante",
        description: "Veuillez saisir l'URL de la Google Sheet.",
        variant: "destructive",
      });
      return;
    }

    // Validation basique de l'URL Google Sheets
    if (!sheetUrl.includes('docs.google.com/spreadsheets')) {
      toast({
        title: "URL invalide",
        description: "L'URL doit être une Google Sheet valide.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      console.log('🔄 Starting Google Sheets import:', { sheetUrl, sheetName });

      const response = await fetch('/api/trucks/import-google-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheetUrl: sheetUrl.trim(),
          sheetName: sheetName.trim() || undefined
        }),
      });

      console.log('📡 Response status:', response.status);

      // Vérifier le Content-Type de la réponse
      const contentType = response.headers.get('content-type');
      console.log('📋 Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Non-JSON response:', textResponse);
        throw new Error('La réponse du serveur n\'est pas au format JSON valide');
      }

      const result = await response.json();
      console.log('✅ Import result:', result);

      if (response.ok && result.success) {
        toast({
          title: "Import réussi",
          description: `${result.imported || 0} camions importés avec succès.`,
        });
        
        // Reset form
        setSheetUrl('');
        setSheetName('');
        onImportComplete();
        onClose();
      } else {
        throw new Error(result.message || result.error || 'Erreur lors de l\'import');
      }
    } catch (error) {
      console.error('❌ Google Sheets import error:', error);
      toast({
        title: "Erreur d'import",
        description: error instanceof Error ? error.message : "Erreur inconnue lors de l'import Google Sheets.",
        variant: "destructive",
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
                  Importer depuis le cloud
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
