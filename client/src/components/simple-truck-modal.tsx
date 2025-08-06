import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, File, Truck as TruckIcon, Tablet, Video } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { type Truck, type InsertTruck } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface TruckModalProps {
  truck?: Truck | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function TruckModal({ truck, isOpen, onClose, onSave }: TruckModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<InsertTruck>({
    numero: truck?.numero ?? "",
    modele: truck?.modele ?? "",
    numeroDA: truck?.numeroDA ?? "",
    dateDA: truck?.dateDA ?? "",
    daValide: truck?.daValide ?? "na",
    numeroCA: truck?.numeroCA ?? "",
    dateCA: truck?.dateCA ?? "",
    dateReception: truck?.dateReception ?? "",
    validationReception: truck?.validationReception ?? "na",
    installePar: truck?.installePar ?? "technicien1",
    dateInstallation: truck?.dateInstallation ?? "",
    parametrageRealise: truck?.parametrageRealise ?? "non",
    localisationFonctionnelle: truck?.localisationFonctionnelle ?? "",
    statutConduite: truck?.statutConduite ?? "test_requis",
    telechargementMemoireMasse: truck?.telechargementMemoireMasse ?? "test_requis",
    numeroTruck4U: truck?.numeroTruck4U ?? "",
    presenceTablette: truck?.presenceTablette ?? "non",
    typeTablette: truck?.typeTablette ?? "samsung",
    imei: truck?.imei ?? "",
    fonctionnelle: truck?.fonctionnelle ?? "non",
    compatibilite: truck?.compatibilite ?? "test_requis",
    deliverup: truck?.deliverup ?? "non_installe",
    applicationsSpecifiques: truck?.applicationsSpecifiques ?? "",
    raisonsNonInstalle: truck?.raisonsNonInstalle ?? "",
    cameraCabineTelematics: truck?.cameraCabineTelematics ?? "pas_besoin",
    dashcam: truck?.dashcam ?? "pas_besoin",
    numeroPDA: truck?.numeroPDA ?? "",
    materielRequis: truck?.materielRequis ?? "complet",
    testsOK: truck?.testsOK ?? "non",
    champAction: truck?.champAction ?? "",
    observations: truck?.observations ?? "",
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertTruck) => apiRequest("POST", "/api/trucks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
      onSave();
      onClose();
      toast({
        title: "Succès",
        description: "Camion créé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le camion.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertTruck) => apiRequest("PATCH", `/api/trucks/${truck?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
      onSave();
      onClose();
      toast({
        title: "Succès",
        description: "Camion mis à jour avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le camion.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (truck) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (field: keyof InsertTruck, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {truck ? `Détails du Camion ${truck.numero}` : "Nouveau Camion"}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numero">N° Camion *</Label>
              <Input
                id="numero"
                placeholder="CAM001"
                value={formData.numero}
                onChange={(e) => handleChange("numero", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="modele">Modèle *</Label>
              <Input
                id="modele"
                placeholder="Volvo FH16"
                value={formData.modele}
                onChange={(e) => handleChange("modele", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* État Section */}
            <Card className="bg-gray-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base">
                  <File className="w-4 h-4 mr-2 text-primary" />
                  État
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="numeroDA">N° Demande d'Achat</Label>
                  <Input
                    id="numeroDA"
                    placeholder="DA-2024-001"
                    value={formData.numeroDA}
                    onChange={(e) => handleChange("numeroDA", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="dateDA">Date DA</Label>
                    <Input
                      id="dateDA"
                      type="date"
                      value={formData.dateDA}
                      onChange={(e) => handleChange("dateDA", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="daValide">DA Validé</Label>
                    <select
                      id="daValide"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.daValide}
                      onChange={(e) => handleChange("daValide", e.target.value)}
                    >
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                      <option value="na">N/A</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="numeroCA">N° Commande d'Achat</Label>
                  <Input
                    id="numeroCA"
                    placeholder="CA-2024-001"
                    value={formData.numeroCA}
                    onChange={(e) => handleChange("numeroCA", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="dateReception">Date Réception</Label>
                    <Input
                      id="dateReception"
                      type="date"
                      value={formData.dateReception}
                      onChange={(e) => handleChange("dateReception", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="validationReception">Validation Réception</Label>
                    <select
                      id="validationReception"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.validationReception}
                      onChange={(e) => handleChange("validationReception", e.target.value)}
                    >
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                      <option value="na">N/A</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Truck4U Section */}
            <Card className="bg-gray-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base">
                  <TruckIcon className="w-4 h-4 mr-2 text-primary" />
                  Truck4U
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="installePar">Installé par</Label>
                  <select
                    id="installePar"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.installePar}
                    onChange={(e) => handleChange("installePar", e.target.value)}
                  >
                    <option value="technicien1">Technicien A</option>
                    <option value="technicien2">Technicien B</option>
                    <option value="externe">Externe</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="dateInstallation">Date Installation</Label>
                    <Input
                      id="dateInstallation"
                      type="date"
                      value={formData.dateInstallation}
                      onChange={(e) => handleChange("dateInstallation", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parametrageRealise">Paramétrage Réalisé</Label>
                    <select
                      id="parametrageRealise"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.parametrageRealise}
                      onChange={(e) => handleChange("parametrageRealise", e.target.value)}
                    >
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                      <option value="partiel">Partiel</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="localisationFonctionnelle">Localisation Fonctionnelle</Label>
                  <Input
                    id="localisationFonctionnelle"
                    placeholder="Zone A - Dock 1"
                    value={formData.localisationFonctionnelle}
                    onChange={(e) => handleChange("localisationFonctionnelle", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="statutConduite">Statut Conduite</Label>
                    <select
                      id="statutConduite"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.statutConduite}
                      onChange={(e) => handleChange("statutConduite", e.target.value)}
                    >
                      <option value="fonctionnel">Fonctionnel</option>
                      <option value="non_fonctionnel">Non Fonctionnel</option>
                      <option value="test_requis">Test Requis</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="telechargementMemoireMasse">Téléchargement Mémoire Masse</Label>
                    <select
                      id="telechargementMemoireMasse"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.telechargementMemoireMasse}
                      onChange={(e) => handleChange("telechargementMemoireMasse", e.target.value)}
                    >
                      <option value="fonctionnel">Fonctionnel</option>
                      <option value="non_fonctionnel">Non Fonctionnel</option>
                      <option value="test_requis">Test Requis</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="numeroTruck4U">N° Truck4U</Label>
                  <Input
                    id="numeroTruck4U"
                    placeholder="T4U-001"
                    value={formData.numeroTruck4U}
                    onChange={(e) => handleChange("numeroTruck4U", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tablette Section */}
            <Card className="bg-gray-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base">
                  <Tablet className="w-4 h-4 mr-2 text-primary" />
                  État Tablette
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="presenceTablette">Présence Tablette</Label>
                  <select
                    id="presenceTablette"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.presenceTablette}
                    onChange={(e) => handleChange("presenceTablette", e.target.value)}
                  >
                    <option value="oui">Oui</option>
                    <option value="non">Non</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="typeTablette">Type de Tablette</Label>
                  <select
                    id="typeTablette"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.typeTablette}
                    onChange={(e) => handleChange("typeTablette", e.target.value)}
                  >
                    <option value="samsung">Samsung</option>
                    <option value="huawei">Huawei</option>
                    <option value="lenovo">Lenovo</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="imei">IMEI Tablette</Label>
                  <Input
                    id="imei"
                    placeholder="123456789012345"
                    value={formData.imei}
                    onChange={(e) => handleChange("imei", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="fonctionnelle">Tablette Fonctionnelle</Label>
                    <select
                      id="fonctionnelle"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.fonctionnelle}
                      onChange={(e) => handleChange("fonctionnelle", e.target.value)}
                    >
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                      <option value="partiel">Partiel</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="compatibilite">Compatibilité</Label>
                    <select
                      id="compatibilite"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.compatibilite}
                      onChange={(e) => handleChange("compatibilite", e.target.value)}
                    >
                      <option value="compatible">Compatible</option>
                      <option value="incompatible">Incompatible</option>
                      <option value="test_requis">Test Requis</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="deliverup">Application DeliverUp</Label>
                  <select
                    id="deliverup"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.deliverup}
                    onChange={(e) => handleChange("deliverup", e.target.value)}
                  >
                    <option value="installe">Installé</option>
                    <option value="non_installe">Non Installé</option>
                    <option value="erreur">Erreur</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="applicationsSpecifiques">Applications Spécifiques</Label>
                  <Input
                    id="applicationsSpecifiques"
                    placeholder="App1, App2"
                    value={formData.applicationsSpecifiques}
                    onChange={(e) => handleChange("applicationsSpecifiques", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="raisonsNonInstalle">Raisons si non installé</Label>
                  <Textarea
                    id="raisonsNonInstalle"
                    placeholder="Expliquer..."
                    value={formData.raisonsNonInstalle}
                    onChange={(e) => handleChange("raisonsNonInstalle", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Matériel Section */}
            <Card className="bg-gray-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base">
                  <Video className="w-4 h-4 mr-2 text-primary" />
                  État Matériel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="cameraCabineTelematics">Caméra Cabine</Label>
                    <select
                      id="cameraCabineTelematics"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.cameraCabineTelematics}
                      onChange={(e) => handleChange("cameraCabineTelematics", e.target.value)}
                    >
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                      <option value="pas_besoin">Pas besoin</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="dashcam">Dashcam</Label>
                    <select
                      id="dashcam"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.dashcam}
                      onChange={(e) => handleChange("dashcam", e.target.value)}
                    >
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                      <option value="pas_besoin">Pas besoin</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="numeroPDA">Numéro PDA</Label>
                  <Input
                    id="numeroPDA"
                    placeholder="PDA-001"
                    value={formData.numeroPDA}
                    onChange={(e) => handleChange("numeroPDA", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="materielRequis">Matériel Requis</Label>
                    <select
                      id="materielRequis"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.materielRequis}
                      onChange={(e) => handleChange("materielRequis", e.target.value)}
                    >
                      <option value="complet">Complet</option>
                      <option value="partiel">Partiel</option>
                      <option value="manquant">Manquant</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="testsOK">Tests OK</Label>
                    <select
                      id="testsOK"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.testsOK}
                      onChange={(e) => handleChange("testsOK", e.target.value)}
                    >
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                      <option value="en_cours">En cours</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="champAction">Champ d'Action</Label>
              <Textarea
                id="champAction"
                placeholder="Actions à effectuer..."
                rows={3}
                value={formData.champAction}
                onChange={(e) => handleChange("champAction", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="observations">Observations</Label>
              <Textarea
                id="observations"
                placeholder="Observations et notes..."
                rows={3}
                value={formData.observations}
                onChange={(e) => handleChange("observations", e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-primary hover:bg-blue-700"
            >
              {isLoading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}