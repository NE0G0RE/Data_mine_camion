import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { useToast } from '../hooks/use-toast';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, X } from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface FieldMapping {
  numero: string;
  filiale: string;
  marque: string;
  modele: string;
  immatriculation: string;
  status: string;
  truckStatus: string;
  presence: string;
  compatibility: string;
  appStatus: string;
  material: string;
  materialStatus: string;
  testStatus: string;
  notes: string;
}

const FIELD_LABELS = {
  numero: 'Numéro de camion *',
  filiale: 'Filiale *',
  marque: 'Marque',
  modele: 'Modèle',
  immatriculation: 'Immatriculation',
  status: 'Statut',
  truckStatus: 'Statut camion',
  presence: 'Présence',
  compatibility: 'Compatibilité',
  appStatus: 'Statut app',
  material: 'Matériel',
  materialStatus: 'Statut matériel',
  testStatus: 'Statut test',
  notes: 'Notes'
};

const INITIAL_MAPPING: FieldMapping = {
  numero: '',
  filiale: '',
  marque: '',
  modele: '',
  immatriculation: '',
  status: '',
  truckStatus: '',
  presence: '',
  compatibility: '',
  appStatus: '',
  material: '',
  materialStatus: '',
  testStatus: '',
  notes: ''
};

type Step = 'upload' | 'preview' | 'mapping' | 'import' | 'complete';

export default function NewExcelImportModal({ isOpen, onClose, onImportComplete }: ExcelImportModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>(INITIAL_MAPPING);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const resetModal = useCallback(() => {
    setCurrentStep('upload');
    setFile(null);
    setExcelData([]);
    setAvailableColumns([]);
    setFieldMapping(INITIAL_MAPPING);
    setImportProgress(0);
    setImportResults(null);
    setIsImporting(false);
  }, []);

  const handleFileUpload = useCallback(async (selectedFile: File) => {
    if (!selectedFile) return;

    try {
      console.log('📁 Processing file:', selectedFile.name);
      
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer);
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('Aucune feuille trouvée dans le fichier Excel');
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast({
          title: "Fichier vide",
          description: "Le fichier Excel ne contient aucune donnée.",
          variant: "destructive",
        });
        return;
      }

      const firstRow = jsonData[0] as Record<string, any>;
      const columns = Object.keys(firstRow);

      console.log('📊 Columns found:', columns);
      console.log('📋 Sample data:', firstRow);

      setFile(selectedFile);
      setExcelData(jsonData);
      setAvailableColumns(columns);
      
      // Auto-mapping intelligent
      const autoMapping: Partial<FieldMapping> = {};
      columns.forEach(col => {
        const lowerCol = col.toLowerCase();
        if (lowerCol.includes('numero') || lowerCol.includes('number') || lowerCol === 'id') {
          autoMapping.numero = col;
        } else if (lowerCol.includes('immatriculation') || lowerCol.includes('plate')) {
          // IMPORTANT: Immatriculation dans le fichier = numéro du camion dans l'application
          autoMapping.numero = col;
        } else if (lowerCol.includes('filiale') || lowerCol.includes('company')) {
          autoMapping.filiale = col;
        } else if (lowerCol.includes('marque') || lowerCol.includes('brand')) {
          autoMapping.marque = col;
        } else if (lowerCol.includes('modele') || lowerCol.includes('model')) {
          autoMapping.modele = col;
        }
      });

      setFieldMapping(prev => ({ ...prev, ...autoMapping }));
      setCurrentStep('preview');

      toast({
        title: "Fichier chargé",
        description: `${jsonData.length} lignes détectées avec ${columns.length} colonnes.`,
      });

    } catch (error) {
      console.error('❌ File upload error:', error);
      toast({
        title: "Erreur de lecture",
        description: error instanceof Error ? error.message : "Impossible de lire le fichier Excel.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleImport = useCallback(async () => {
    if (!file || !fieldMapping.numero || !fieldMapping.filiale) {
      toast({
        title: "Mappage incomplet",
        description: "Les champs 'Numéro' et 'Filiale' sont obligatoires.",
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
          description: `${result.processed || result.imported || 0} camions traités avec succès.`,
        });
        
        onImportComplete();
      } else {
        throw new Error(result.message || 'Erreur lors de l\'import');
      }
    } catch (error) {
      console.error('❌ Import error:', error);
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

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium mb-2">Sélectionner un fichier Excel</h3>
        <p className="text-gray-500 mb-6">
          Choisissez un fichier Excel (.xlsx, .xls) contenant les données des camions
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
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
        <label htmlFor="excel-file-input" className="cursor-pointer">
          <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Cliquez pour sélectionner un fichier
          </p>
          <p className="text-sm text-gray-500">
            Formats supportés: .xlsx, .xls
          </p>
        </label>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Aperçu des données</h3>
        <span className="text-sm text-gray-500">
          {excelData.length} lignes • {availableColumns.length} colonnes
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Colonnes détectées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableColumns.map(col => (
              <span key={col} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
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

  const renderMappingStep = () => (
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
        {Object.entries(FIELD_LABELS).map(([field, label]) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <Select
              value={fieldMapping[field as keyof FieldMapping]}
              onValueChange={(value) => {
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
          Lancer l'import
        </Button>
      </div>
    </div>
  );

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
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Traités:</span>
                <span className="ml-2">{importResults.processed || 0}</span>
              </div>
              <div>
                <span className="font-medium">Créés:</span>
                <span className="ml-2">{importResults.inserted || 0}</span>
              </div>
              <div>
                <span className="font-medium">Mis à jour:</span>
                <span className="ml-2">{importResults.updated || 0}</span>
              </div>
              <div>
                <span className="font-medium">Erreurs:</span>
                <span className="ml-2">{importResults.failed || 0}</span>
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

  const getStepNumber = (step: Step) => {
    const steps: Step[] = ['upload', 'preview', 'mapping', 'import', 'complete'];
    return steps.indexOf(step) + 1;
  };

  const isStepCompleted = (step: Step) => {
    const steps: Step[] = ['upload', 'preview', 'mapping', 'import', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);
    return stepIndex < currentIndex;
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

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 py-4">
          {(['upload', 'preview', 'mapping', 'import', 'complete'] as Step[]).map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step
                    ? 'bg-blue-600 text-white'
                    : isStepCompleted(step)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isStepCompleted(step) ? '✓' : getStepNumber(step)}
              </div>
              {index < 4 && (
                <div
                  className={`w-12 h-0.5 ${
                    isStepCompleted(step) ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="py-4">
          {renderCurrentStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
