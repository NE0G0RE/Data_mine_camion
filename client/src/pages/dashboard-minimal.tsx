import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useToast } from "../hooks/use-toast";
import { Upload, Download, Plus, Truck, User } from "lucide-react";
import NewExcelImportModal from "../components/new-excel-import-modal";
import UserProfileModalSimple from "../components/user-profile-modal-simple";
import AddTruckModal from '../components/add-truck-modal';
import GoogleSheetsImportModal from '../components/google-sheets-import-modal';

// Types simples pour éviter les erreurs d'import
interface SimpleTruck {
  id: number;
  numero: string;
  filiale: string;
  marque?: string;
  modele?: string;
  immatriculation?: string;
  status?: string;
}

export default function DashboardMinimal() {
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isAddTruckOpen, setIsAddTruckOpen] = useState(false);
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const { toast } = useToast();

  // Query connectée au vrai backend
  const { 
    data: trucks = [], 
    isLoading: trucksLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ["trucks"],
    queryFn: async (): Promise<SimpleTruck[]> => {
      try {
        const response = await fetch('/api/trucks');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('✅ API data loaded:', data.length, 'trucks');
        return data;
      } catch (error) {
        console.error('❌ API fetch error:', error);
        // Fallback vers données de test uniquement si nécessaire
        const mockData = [
          { id: 1, numero: "001", filiale: "Paris", marque: "Volvo", modele: "FH16", status: "Actif" },
          { id: 2, numero: "002", filiale: "Lyon", marque: "Mercedes", modele: "Actros", status: "En maintenance" },
          { id: 3, numero: "003", filiale: "Marseille", marque: "Scania", modele: "R500", status: "Actif" }
        ];
        console.warn('🔄 Using fallback mock data');
        return mockData;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes pour des données plus fraîches
    retry: 2, // Retry 2 fois
    refetchOnWindowFocus: false, // Éviter les refetch trop fréquents
  });

  const handleExcelImport = () => {
    setIsExcelImportOpen(true);
  };

  const handleExcelImportComplete = () => {
    setIsExcelImportOpen(false);
    // Rafraîchir les données après import
    refetch();
    toast({
      title: "Import terminé",
      description: "Les données ont été importées avec succès.",
    });
  };

  const handleGoogleSheetsImport = () => {
    setIsGoogleSheetsOpen(true);
  };

  const handleAddTruck = () => {
    setIsAddTruckOpen(true);
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/trucks/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `camions_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Export réussi",
          description: "Le fichier Excel a été téléchargé avec succès.",
        });
      } else {
        throw new Error('Erreur lors de l\'export');
      }
    } catch (error) {
      console.error('❌ Export error:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données.",
        variant: "destructive",
      });
    }
  };

  // Affichage de chargement simple
  if (trucksLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">MaFlotte</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              <Button variant="outline" onClick={handleGoogleSheetsImport}>
                <Upload className="w-4 h-4 mr-2" />
                Google Sheets
              </Button>
              <Button variant="outline" onClick={handleExcelImport}>
                <Upload className="w-4 h-4 mr-2" />
                Importer Excel
              </Button>
              <Button onClick={handleAddTruck}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
              
              {/* Avatar pour accès profil utilisateur */}
              <Avatar 
                className="cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                onClick={() => setIsUserProfileOpen(true)}
              >
                <AvatarImage src="/placeholder-avatar.jpg" alt="Profil utilisateur" />
                <AvatarFallback className="bg-blue-600 text-white">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Camions</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trucks.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actifs</CardTitle>
              <div className="h-4 w-4 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trucks.filter(t => t.status === 'Actif').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En maintenance</CardTitle>
              <div className="h-4 w-4 bg-orange-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trucks.filter(t => t.status === 'En maintenance').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
              <div className="h-4 w-4 bg-red-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trucks.filter(t => t.status === 'Inactif').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trucks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Camions</CardTitle>
          </CardHeader>
          <CardContent>
            {trucks.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun camion trouvé</p>
                <Button onClick={handleAddTruck} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter le premier camion
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Numéro</th>
                      <th className="text-left p-4 font-medium">Filiale</th>
                      <th className="text-left p-4 font-medium">Marque</th>
                      <th className="text-left p-4 font-medium">Modèle</th>
                      <th className="text-left p-4 font-medium">Immatriculation</th>
                      <th className="text-left p-4 font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trucks.map((truck) => (
                      <tr key={truck.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{truck.numero}</td>
                        <td className="p-4">{truck.filiale}</td>
                        <td className="p-4">{truck.marque || '-'}</td>
                        <td className="p-4">{truck.modele || '-'}</td>
                        <td className="p-4">{truck.immatriculation || '-'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            truck.status === 'Actif' ? 'bg-green-100 text-green-800' :
                            truck.status === 'En maintenance' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {truck.status || 'Inconnu'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Info */}
        {error && (
          <Card className="mt-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Informations de Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                Erreur API détectée. L'application utilise des données de test.
              </p>
              <p className="text-sm text-red-600 mt-2">
                Erreur: {error instanceof Error ? error.message : 'Erreur inconnue'}
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Excel Import Modal */}
      {isExcelImportOpen && (
        <NewExcelImportModal
          isOpen={isExcelImportOpen}
          onClose={() => setIsExcelImportOpen(false)}
          onImportComplete={() => {
            refetch();
            setIsExcelImportOpen(false);
          }}
        />
      )}

      <AddTruckModal
        isOpen={isAddTruckOpen}
        onClose={() => setIsAddTruckOpen(false)}
        onTruckAdded={() => {
          refetch();
          setIsAddTruckOpen(false);
        }}
      />

      <GoogleSheetsImportModal
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
        onImportComplete={() => {
          refetch();
          setIsGoogleSheetsOpen(false);
        }}
      />

      <UserProfileModalSimple
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
      />
    </div>
  );
}
