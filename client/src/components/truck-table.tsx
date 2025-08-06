import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Truck } from "@shared/schema";

interface TruckTableProps {
  trucks: Truck[];
  isLoading: boolean;
  onEdit: (truck: Truck) => void;
  onAdd: () => void;
}

const getStatusBadge = (status: string | null | undefined, type: 'etat' | 'truck4u' | 'tablette' | 'materiel') => {
  if (!status) {
    return <Badge className="status-na">Non défini</Badge>;
  }

  const statusMap: Record<string, { variant: string; label: string }> = {
    // État
    oui: { variant: 'status-ok', label: 'Oui' },
    non: { variant: 'status-nok', label: 'Non' },
    na: { variant: 'status-na', label: 'N/A' },
    
    // Truck4U
    fonctionnel: { variant: 'status-ok', label: 'Fonctionnel' },
    non_fonctionnel: { variant: 'status-nok', label: 'Non Fonctionnel' },
    test_requis: { variant: 'status-pending', label: 'Test Requis' },
    
    // Tablette
    compatible: { variant: 'status-ok', label: 'Compatible' },
    incompatible: { variant: 'status-nok', label: 'Incompatible' },
    installe: { variant: 'status-ok', label: 'Installé' },
    non_installe: { variant: 'status-nok', label: 'Non Installé' },
    erreur: { variant: 'status-nok', label: 'Erreur' },
    
    // Matériel
    complet: { variant: 'status-ok', label: 'Complet' },
    partiel: { variant: 'status-pending', label: 'Partiel' },
    manquant: { variant: 'status-nok', label: 'Manquant' },
    pas_besoin: { variant: 'status-na', label: 'Pas besoin' },
    en_cours: { variant: 'status-pending', label: 'En cours' },
  };

  const config = statusMap[status] || { variant: 'status-na', label: status };
  return <Badge className={config.variant}>{config.label}</Badge>;
};

export default function TruckTable({ trucks, isLoading, onEdit, onAdd }: TruckTableProps) {
  const navigate = useNavigate();
  const [selectedTrucks, setSelectedTrucks] = useState<Set<string>>(new Set());

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTrucks(new Set(trucks.map(t => t.id)));
    } else {
      setSelectedTrucks(new Set());
    }
  };

  const handleSelectTruck = (truckId: string, checked: boolean) => {
    const newSelection = new Set(selectedTrucks);
    if (checked) {
      newSelection.add(truckId);
    } else {
      newSelection.delete(truckId);
    }
    setSelectedTrucks(newSelection);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Chargement des données...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-gray-200 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium text-gray-900">Suivi des Installations</CardTitle>
        <Button onClick={onAdd} className="bg-primary hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle entrée
        </Button>
      </CardHeader>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTrucks.size === trucks.length && trucks.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>N° Camion</TableHead>
              <TableHead>État</TableHead>
              <TableHead>Truck4U</TableHead>
              <TableHead>Tablette</TableHead>
              <TableHead>Matériel</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trucks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Aucun camion trouvé. Cliquez sur "Nouvelle entrée" pour commencer.
                </TableCell>
              </TableRow>
            ) : (
              trucks.map((truck) => (
                <TableRow key={truck.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Checkbox
                      checked={selectedTrucks.has(truck.id)}
                      onCheckedChange={(checked) => handleSelectTruck(truck.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-gray-900">{truck.numero}</div>
                    <div className="text-sm text-gray-500">{truck.modele}</div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(truck.daValide, 'etat')}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        {truck.dateInstallation ? 'Installé' : 'En attente'}
                      </div>
                      {truck.dateInstallation && (
                        <div className="text-sm text-gray-500">{truck.dateInstallation}</div>
                      )}
                      {getStatusBadge(truck.statutConduite, 'truck4u')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">{truck.typeTablette || 'Non défini'}</div>
                      {truck.imei && (
                        <div className="text-sm text-gray-500">IMEI: {truck.imei}</div>
                      )}
                      {getStatusBadge(truck.fonctionnelle, 'tablette')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {truck.cameraCabineTelematics && (
                        <div className="flex items-center">
                          {getStatusBadge(truck.cameraCabineTelematics, 'materiel')}
                        </div>
                      )}
                      {truck.testsOK && (
                        <div className="flex items-center">
                          {getStatusBadge(truck.testsOK, 'materiel')}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/truck/${truck.id}`)}
                        className="text-primary hover:text-blue-700"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(truck)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-600"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {trucks.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button variant="outline">Précédent</Button>
            <Button variant="outline">Suivant</Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">1</span> à{' '}
                <span className="font-medium">{Math.min(10, trucks.length)}</span> sur{' '}
                <span className="font-medium">{trucks.length}</span> résultats
              </p>
            </div>
            <div className="flex space-x-1">
              <Button variant="outline" size="sm">
                Précédent
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-white">
                1
              </Button>
              <Button variant="outline" size="sm">
                Suivant
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
