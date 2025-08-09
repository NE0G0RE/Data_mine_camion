import { useState } from 'react';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import { Upload, FileSpreadsheet, X } from 'lucide-react';

interface ExcelImportButtonProps {
  onImportComplete: () => void;
  className?: string;
}

export default function ExcelImportButton({ onImportComplete, className = '' }: ExcelImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    setIsImporting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/trucks/import-excel', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'import du fichier');
      }
      
      const result = await response.json();
      
      toast({
        title: "Import réussi",
        description: `${result.imported || 0} camions importés avec succès.`,
      });
      
      onImportComplete();
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Erreur lors de l\'import du fichier:', error);
      toast({
        title: "Erreur d'import",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'import du fichier.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="file"
        onChange={handleFileChange}
        accept=".xls,.xlsx"
        className="hidden"
        id="excel-file-upload"
        disabled={isImporting}
      />
      <label
        htmlFor="excel-file-upload"
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
          isImporting 
            ? 'bg-gray-500 cursor-not-allowed' 
            : 'bg-purple-700 hover:bg-purple-600 cursor-pointer'
        } text-white`}
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        {selectedFile ? selectedFile.name : 'Sélectionner un fichier Excel'}
      </label>
      
      {selectedFile && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-gray-200"
          onClick={() => setSelectedFile(null)}
          disabled={isImporting}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      <Button
        onClick={handleFileUpload}
        disabled={!selectedFile || isImporting}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {isImporting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Importation...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </>
        )}
      </Button>
    </div>
  );
}
