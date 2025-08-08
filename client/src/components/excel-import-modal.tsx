import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import * as XLSX from 'xlsx';

interface ExcelRow {
  [key: string]: any;
}

interface FieldMapping {
  numero: string;
  modele: string;
  filiale: string;
  imei: string;
  numeroTruck4U: string;
  statutConduite: string;
  equipement: string;
  compatibilite: string;
  deliverup: string;
  testsOK: string;
  commentaires: string;
}

interface ImportStep {
  id: 'upload' | 'preview' | 'mapping' | 'import' | 'complete';
  title: string;
  description: string;
}

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

const importSteps: ImportStep[] = [
  { id: 'upload', title: 'Télécharger', description: 'Sélectionner le fichier Excel' },
  { id: 'preview', title: 'Aperçu', description: 'Vérifier les données' },
  { id: 'mapping', title: 'Mappage', description: 'Associer les colonnes' },
  { id: 'import', title: 'Import', description: 'Importer les données' },
  { id: 'complete', title: 'Terminé', description: 'Import réussi' }
];

const fieldLabels = {
  numero: 'Numéro de camion *',
  modele: 'Modèle',
  filiale: 'Filiale *',
  imei: 'IMEI',
  numeroTruck4U: 'Numéro Truck4U',
  statutConduite: 'Statut de conduite',
  equipement: 'Équipement',
  compatibilite: 'Compatibilité',
  deliverup: 'Deliverup',
  testsOK: 'Tests OK',
  commentaires: 'Commentaires'
};

export default function ExcelImportModal({ isOpen, onClose, onImportComplete }: ExcelImportModalProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep['id']>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({
    numero: '',
    modele: '',
    filiale: '',
    imei: '',
    numeroTruck4U: '',
    statutConduite: '',
    equipement: '',
    compatibilite: '',
    deliverup: '',
    testsOK: '',
    commentaires: ''
  });
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const resetModal = useCallback(() => {
    setCurrentStep('upload');
    setFile(null);
    setExcelData([]);
    setAvailableColumns([]);
    setFieldMapping({
      numero: '',
      modele: '',
      filiale: '',
      imei: '',
      numeroTruck4U: '',
      statutConduite: '',
      equipement: '',
      compatibilite: '',
      deliverup: '',
      testsOK: '',
      commentaires: ''
    });
    setImportProgress(0);
    setImportResults(null);
    setIsImporting(false);
  }, []);

  const handleFileUpload = useCallback(async (selectedFile: File) => {
    try {
      console.log('Starting file upload:', selectedFile.name);
      const buffer = await selectedFile.arrayBuffer();
      console.log('Buffer created, size:', buffer.byteLength);
      
      const workbook = XLSX.read(buffer);
      console.log('Workbook read, sheets:', workbook.SheetNames);
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('Aucune feuille trouvée dans le fichier Excel');
      }
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      if (!worksheet) {
        throw new Error('Impossible de lire la première feuille du fichier Excel');
      }
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log('JSON data extracted:', jsonData.length, 'rows');

      if (jsonData.length === 0) {
        toast({
          title: "Erreur",
          description: "Le fichier Excel est vide ou ne contient pas de données valides.",
          variant: "destructive",
        });
        return;
      }

      const firstRow = jsonData[0] as Record<string, any>;
      const columns = Object.keys(firstRow);
      console.log('Available columns:', columns);
      console.log('Sample data:', firstRow);
      
      setFile(selectedFile);
      setExcelData(jsonData as ExcelRow[]);
      setAvailableColumns(columns);
      
      console.log('State updated, moving to preview step');
      
      // Auto-mapping based on column names
      const autoMapping: Partial<FieldMapping> = {};
      columns.forEach(col => {
        const lowerCol = col.toLowerCase();
        if (lowerCol.includes('numero') || lowerCol.includes('numéro') || lowerCol.includes('camion')) {
          if (!autoMapping.numero) autoMapping.numero = col;
        } else if (lowerCol.includes('modele') || lowerCol.includes('modèle')) {
          if (!autoMapping.modele) autoMapping.modele = col;
        } else if (lowerCol.includes('filiale')) {
          if (!autoMapping.filiale) autoMapping.filiale = col;
        } else if (lowerCol.includes('imei')) {
          if (!autoMapping.imei) autoMapping.imei = col;
        } else if (lowerCol.includes('truck4u')) {
          if (!autoMapping.numeroTruck4U) autoMapping.numeroTruck4U = col;
        } else if (lowerCol.includes('statut') || lowerCol.includes('conduite')) {
          if (!autoMapping.statutConduite) autoMapping.statutConduite = col;
        } else if (lowerCol.includes('equipement') || lowerCol.includes('équipement')) {
          if (!autoMapping.equipement) autoMapping.equipement = col;
        } else if (lowerCol.includes('compatibilite') || lowerCol.includes('compatibilité')) {
          if (!autoMapping.compatibilite) autoMapping.compatibilite = col;
        } else if (lowerCol.includes('deliverup')) {
          if (!autoMapping.deliverup) autoMapping.deliverup = col;
        } else if (lowerCol.includes('test')) {
          if (!autoMapping.testsOK) autoMapping.testsOK = col;
        } else if (lowerCol.includes('commentaire')) {
          if (!autoMapping.commentaires) autoMapping.commentaires = col;
        }
      });

      setFieldMapping(prev => ({ ...prev, ...autoMapping }));
      setCurrentStep('preview');
    } catch (error) {
      console.error('Error reading Excel file:', error);
      toast({
        title: "Erreur",
        description: "Impossible de lire le fichier Excel. Vérifiez le format du fichier.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleImport = useCallback(async () => {
    if (!file) return;

    // Validate required fields
    if (!fieldMapping.numero || !fieldMapping.filiale) {
      toast({
        title: "Erreur",
        description: "Les champs 'Numéro de camion' et 'Filiale' sont obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setCurrentStep('import');
    setImportProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fieldMapping', JSON.stringify(fieldMapping));

      const response = await fetch('/api/trucks/import-with-mapping', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setImportResults(result);
        setImportProgress(100);
        setCurrentStep('complete');
        toast({
          title: "Import réussi",
          description: `${result.processed} camions importés avec succès.`,
        });
        onImportComplete();
      } else {
        throw new Error(result.message || 'Erreur lors de l\'import');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Erreur d'import",
        description: error instanceof Error ? error.message : "Erreur inconnue lors de l'import.",
        variant: "destructive",
      });
      setCurrentStep('mapping');
    } finally {
      setIsImporting(false);
    }
  }, [file, fieldMapping, toast, onImportComplete]);

  const handleClose = useCallback(() => {
    resetModal();
    onClose();
  }, [resetModal, onClose]);

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-6">
      {importSteps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
            ${currentStep === step.id ? 'bg-blue-600 text-white' : 
              importSteps.findIndex(s => s.id === currentStep) > index ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}
          `}>
            {importSteps.findIndex(s => s.id === currentStep) > index ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              index + 1
            )}
          </div>
          {index < importSteps.length - 1 && (
            <div className={`w-16 h-0.5 mx-2 ${
              importSteps.findIndex(s => s.id === currentStep) > index ? 'bg-green-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderUploadStep = () => (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Sélectionner un fichier Excel
        </h3>
        <p className="text-gray-500 mb-4">
          Formats supportés: .xlsx, .xls
        </p>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) {
              handleFileUpload(selectedFile);
            }
          }}
          className="hidden"
          id="excel-file-input"
        />
        <Button asChild>
          <label htmlFor="excel-file-input" className="cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Choisir un fichier
          </label>
        </Button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Aperçu des données</h3>
        <span className="text-sm text-gray-500">
          {excelData.length} lignes détectées
        </span>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Colonnes détectées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableColumns.map(col => (
              <span key={col} className="px-2 py-1 bg-gray-100 rounded text-sm">
                {col}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Aperçu des données (5 premières lignes)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {availableColumns.slice(0, 6).map(col => (
                    <th key={col} className="text-left p-2 font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.slice(0, 5).map((row, index) => (
                  <tr key={index} className="border-b">
                    {availableColumns.slice(0, 6).map(col => (
                      <td key={col} className="p-2">
                        {String(row[col] || '').substring(0, 30)}
                        {String(row[col] || '').length > 30 ? '...' : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('upload')}>
          Retour
        </Button>
        <Button onClick={() => setCurrentStep('mapping')}>
          Continuer vers le mappage
        </Button>
      </div>
    </div>
  );

  const renderMappingStep = () => {
    console.log('Rendering mapping step with:', {
      availableColumns,
      fieldMapping,
      fieldLabels: Object.keys(fieldLabels)
    });

    if (!availableColumns || availableColumns.length === 0) {
      return (
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erreur: Aucune colonne disponible pour le mappage. Veuillez retourner à l'étape précédente.
            </AlertDescription>
          </Alert>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('preview')}>
              Retour
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Mappage des champs</h3>
          <span className="text-sm text-gray-500">
            Associez les colonnes Excel aux champs de l'application
          </span>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Les champs marqués d'un astérisque (*) sont obligatoires pour l'import.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(fieldLabels).map(([field, label]) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>{label}</Label>
              <Select
                value={fieldMapping[field as keyof FieldMapping] || ''}
                onValueChange={(value) => {
                  console.log(`Mapping ${field} to ${value}`);
                  setFieldMapping(prev => ({ ...prev, [field]: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une colonne" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- Aucune --</SelectItem>
                  {availableColumns.map(col => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep('preview')}>
            Retour
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!fieldMapping.numero || !fieldMapping.filiale}
          >
            Lancer l'import ({fieldMapping.numero ? '✓' : '✗'} Numéro, {fieldMapping.filiale ? '✓' : '✗'} Filiale)
          </Button>
        </div>
      </div>
    );
  };

  const renderImportStep = () => (
    <div className="space-y-4 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <Upload className="w-8 h-8 text-blue-600 animate-pulse" />
      </div>
      <h3 className="text-lg font-medium">Import en cours...</h3>
      <p className="text-gray-500">
        Veuillez patienter pendant l'import des données.
      </p>
      <Progress value={importProgress} className="w-full" />
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-4 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-lg font-medium text-green-600">Import terminé !</h3>
      
      {importResults && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {importResults.processed || 0}
                </div>
                <div className="text-sm text-gray-500">Importés</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {importResults.updated || 0}
                </div>
                <div className="text-sm text-gray-500">Mis à jour</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {importResults.failed || 0}
                </div>
                <div className="text-sm text-gray-500">Échecs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleClose} className="w-full">
        Fermer
      </Button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return renderUploadStep();
      case 'preview':
        return renderPreviewStep();
      case 'mapping':
        return renderMappingStep();
      case 'import':
        return renderImportStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return renderUploadStep();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Import Excel avec mappage des champs</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4">
          {renderStepIndicator()}
          {renderCurrentStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
