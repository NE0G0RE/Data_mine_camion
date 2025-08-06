import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Upload, Plus, Search, Filter, User, Truck as TruckIcon, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import TruckTable from "@/components/truck-table";
import TruckModal from "@/components/simple-truck-modal";
import { Navbar } from "@/components/navbar";
import { useToast } from "@/hooks/use-toast";
import type { Truck } from "@shared/schema";
import type { TruckStats } from "@/lib/types";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: trucks = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/trucks"],
    select: (data: Truck[]) => data,
  });

  const filteredTrucks = trucks.filter((truck) => {
    const matchesSearch = !searchQuery || 
      truck.numero?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.modele?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.imei?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.numeroTruck4U?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || statusFilter === "all";

    return matchesSearch && matchesStatus;
  });

  const stats: TruckStats = {
    totalTrucks: trucks.length,
    installationsOk: trucks.filter(t => t.statutConduite === 'fonctionnel' && t.testsOK === 'oui').length,
    pending: trucks.filter(t => t.statutConduite === 'test_requis' || t.testsOK === 'en_cours').length,
    issues: trucks.filter(t => t.statutConduite === 'non_fonctionnel' || t.testsOK === 'non').length,
  };

  const handleAddTruck = () => {
    setSelectedTruck(null);
    setIsModalOpen(true);
  };

  const handleEditTruck = (truck: Truck) => {
    setSelectedTruck(truck);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTruck(null);
  };

  const handleModalSave = () => {
    refetch();
    toast({
      title: "Succès",
      description: "Les données ont été sauvegardées avec succès.",
    });
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: "Export",
      description: "Fonctionnalité d'export en cours de développement.",
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/trucks/import', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          toast({
            title: "Import réussi",
            description: result.message,
          });
          refetch();
        } else {
          toast({
            title: "Erreur d'import",
            description: result.message || "Une erreur s'est produite lors de l'import.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erreur d'import",
          description: "Une erreur s'est produite lors de l'import.",
          variant: "destructive",
        });
      }
    };
    input.click();
  };

  const [isGoogleSheetModalOpen, setIsGoogleSheetModalOpen] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleGoogleSheetImport = () => {
    setIsGoogleSheetModalOpen(true);
  };

  const handleGoogleSheetSubmit = async () => {
    if (!googleSheetUrl.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir l'URL du Google Sheet.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const response = await fetch('/api/trucks/import-google-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetUrl: googleSheetUrl,
          sheetName: sheetName || 0,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Import réussi",
          description: result.message,
        });
        refetch();
        setIsGoogleSheetModalOpen(false);
        setGoogleSheetUrl("");
        setSheetName("");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Erreur d'import",
        description: error.message || "Impossible d'importer depuis Google Sheets.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Rechercher par N° camion, IMEI, N° Truck4U..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="ok">OK</SelectItem>
                      <SelectItem value="nok">Pas OK</SelectItem>
                      <SelectItem value="na">Pas besoin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Camions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTrucks}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TruckIcon className="text-primary text-xl w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Installations OK</p>
                    <p className="text-2xl font-bold text-green-600">{stats.installationsOk}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-green-600 text-xl w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">En Attente</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-orange-600 text-xl w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Problèmes</p>
                    <p className="text-2xl font-bold text-red-600">{stats.issues}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="text-red-600 text-xl w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Data Table */}
          <TruckTable 
            trucks={filteredTrucks} 
            isLoading={isLoading}
            onEdit={handleEditTruck}
            onAdd={handleAddTruck}
          />
        </div>
      </div>

      {/* Modal */}
      <TruckModal
        truck={selectedTruck}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />

      {/* Google Sheets Import Modal */}
      <Dialog open={isGoogleSheetModalOpen} onOpenChange={setIsGoogleSheetModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Importer depuis Google Sheets</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="googleSheetUrl">URL du Google Sheet</Label>
              <Input
                id="googleSheetUrl"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={googleSheetUrl}
                onChange={(e) => setGoogleSheetUrl(e.target.value)}
                disabled={isImporting}
              />
              <p className="text-xs text-gray-500">
                Le Google Sheet doit être accessible publiquement (partagé en lecture)
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sheetName">Nom de la feuille (optionnel)</Label>
              <Input
                id="sheetName"
                placeholder="Sheet1 (par défaut: première feuille)"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                disabled={isImporting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGoogleSheetModalOpen(false)}
              disabled={isImporting}
            >
              Annuler
            </Button>
            <Button onClick={handleGoogleSheetSubmit} disabled={isImporting}>
              {isImporting ? "Import en cours..." : "Importer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}