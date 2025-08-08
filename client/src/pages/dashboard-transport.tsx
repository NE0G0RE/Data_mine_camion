import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useToast } from '../hooks/use-toast';
import { 
  Truck, Plus, Upload, Download, Users, Activity, TrendingUp, AlertTriangle,
  MapPin, Fuel, Clock, Route, Settings, Bell, Search, Filter, Eye, Edit, Trash2,
  BarChart3, PieChart, Calendar, Navigation, Shield, Zap
} from 'lucide-react';
import NewExcelImportModal from '../components/new-excel-import-modal';
import UserProfileModalSimple from '../components/user-profile-modal-simple';
import AddTruckModal from '../components/add-truck-modal';
import GoogleSheetsImportModal from '../components/google-sheets-import-modal';

// Types
interface SimpleTruck {
  id: string;
  numero: string;
  filiale: string;
  marque?: string;
  modele?: string;
  status?: string;
}

export default function DashboardTransport() {
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isAddTruckOpen, setIsAddTruckOpen] = useState(false);
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const { toast } = useToast();

  // Query connectée au vrai backend avec fallback
  const { data: trucks = [], isLoading, error, refetch } = useQuery({
    queryKey: ['trucks'],
    queryFn: async (): Promise<SimpleTruck[]> => {
      try {
        const response = await fetch('/api/trucks');
        if (response.ok) {
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        }
        throw new Error('Erreur API');
      } catch (error) {
        console.warn('⚠️ API non disponible, utilisation des données de démonstration');
        return [
          { id: '1', numero: 'TR-001', filiale: 'Paris', marque: 'Volvo', modele: 'FH16', status: 'Actif' },
          { id: '2', numero: 'TR-002', filiale: 'Lyon', marque: 'Mercedes', modele: 'Actros', status: 'En maintenance' },
          { id: '3', numero: 'TR-003', filiale: 'Marseille', marque: 'Scania', modele: 'R500', status: 'Actif' },
          { id: '4', numero: 'TR-004', filiale: 'Toulouse', marque: 'DAF', modele: 'XF', status: 'Inactif' },
          { id: '5', numero: 'TR-005', filiale: 'Bordeaux', marque: 'Iveco', modele: 'S-Way', status: 'Actif' }
        ];
      }
    },
  });

  // Statistiques calculées
  const stats = {
    total: trucks.length,
    active: trucks.filter(t => t.status === 'Actif').length,
    maintenance: trucks.filter(t => t.status === 'En maintenance').length,
    inactive: trucks.filter(t => t.status === 'Inactif').length,
    filiales: [...new Set(trucks.map(t => t.filiale))].length
  };

  // Filtrage des camions
  const filteredTrucks = trucks.filter(truck => {
    const matchesSearch = truck.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         truck.filiale.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (truck.marque && truck.marque.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || truck.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleExcelImport = () => setIsExcelImportOpen(true);
  const handleGoogleSheetsImport = () => setIsGoogleSheetsOpen(true);
  const handleAddTruck = () => setIsAddTruckOpen(true);

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

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Actif':
        return <Badge className="bg-green-100 text-green-800 border-green-200">🟢 Actif</Badge>;
      case 'En maintenance':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">🔧 Maintenance</Badge>;
      case 'Inactif':
        return <Badge className="bg-red-100 text-red-800 border-red-200">🔴 Inactif</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">❓ Inconnu</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center theme-charlesandre">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl">Chargement de MaFlotte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 theme-charlesandre">
      {/* Header Principal */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et Titre */}
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-2 rounded-lg">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">MaFlotte</h1>
                <p className="text-sm text-blue-200">Gestion Transport Routier</p>
              </div>
            </div>

            {/* Actions Principales */}
            <div className="flex items-center space-x-3">
              <Button 
                onClick={handleAddTruck}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Camion
              </Button>
              
              <Button 
                onClick={handleExcelImport}
                className="bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white shadow-lg border-0"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Excel
              </Button>
              
              <Button 
                onClick={handleGoogleSheetsImport}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg border-0"
              >
                <Upload className="w-4 h-4 mr-2" />
                Google Sheets
              </Button>
              
              <Button 
                onClick={handleExport}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Bell className="w-5 h-5" />
              </Button>

              {/* Avatar Profil */}
              <Avatar 
                className="cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                onClick={() => setIsUserProfileOpen(true)}
              >
                <AvatarImage src="/placeholder-avatar.jpg" alt="Profil utilisateur" />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white">
                  <Users className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques en Cartes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Camions */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Camions</CardTitle>
              <Truck className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-blue-200">Flotte complète</p>
            </CardContent>
          </Card>

          {/* Camions Actifs */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">En Service</CardTitle>
              <Zap className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.active}</div>
              <p className="text-xs text-green-200">Opérationnels</p>
            </CardContent>
          </Card>

          {/* Maintenance */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Maintenance</CardTitle>
              <Settings className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{stats.maintenance}</div>
              <p className="text-xs text-orange-200">En révision</p>
            </CardContent>
          </Card>

          {/* Inactifs */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-100">Hors Service</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{stats.inactive}</div>
              <p className="text-xs text-red-200">Indisponibles</p>
            </CardContent>
          </Card>

          {/* Filiales */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Filiales</CardTitle>
              <MapPin className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{stats.filiales}</div>
              <p className="text-xs text-purple-200">Sites actifs</p>
            </CardContent>
          </Card>
        </div>

        {/* Barre de Recherche et Filtres */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par numéro, filiale, marque..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-blue-300 w-4 h-4" />
              <select
                value={selectedStatus}
                onChange={(e: any) => setSelectedStatus(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">Tous les statuts</option>
                <option value="Actif">Actif</option>
                <option value="En maintenance">En maintenance</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des Camions */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Truck className="w-5 h-5 mr-2 text-blue-400" />
              Flotte de Camions ({filteredTrucks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTrucks.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="w-16 h-16 text-blue-300 mx-auto mb-4 opacity-50" />
                <p className="text-blue-200 text-lg mb-2">Aucun camion trouvé</p>
                <p className="text-blue-300 text-sm">
                  {searchTerm || selectedStatus !== 'all' 
                    ? 'Essayez de modifier vos critères de recherche'
                    : 'Commencez par ajouter des camions à votre flotte'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTrucks.map((truck) => (
                  <div
                    key={truck.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-2 rounded-lg mr-3">
                          <Truck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">{truck.numero}</h3>
                          <p className="text-blue-200 text-sm flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {truck.filiale}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(truck.status)}
                    </div>
                    
                    {(truck.marque || truck.modele) && (
                      <div className="mb-3">
                        <p className="text-blue-100 text-sm">
                          <span className="font-medium">{truck.marque}</span>
                          {truck.marque && truck.modele && ' • '}
                          <span>{truck.modele}</span>
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button size="sm" variant="ghost" className="text-blue-300 hover:text-white hover:bg-white/10">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-blue-300 hover:text-white hover:bg-white/10">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-300 hover:text-white hover:bg-red-500/20">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modals */}
      <NewExcelImportModal
        isOpen={isExcelImportOpen}
        onClose={() => setIsExcelImportOpen(false)}
        onImportComplete={() => {
          refetch();
          setIsExcelImportOpen(false);
        }}
      />

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
