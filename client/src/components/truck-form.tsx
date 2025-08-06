import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { type InsertTruck } from "@shared/schema";

interface TruckFormProps {
  initialData?: Partial<InsertTruck>;
  onSubmit: (data: InsertTruck) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function TruckForm({ initialData, onSubmit, onCancel, loading }: TruckFormProps) {
  const [formData, setFormData] = useState<InsertTruck>({
    filialeId: initialData?.filialeId || "",
    numero: initialData?.numero || "",
    modele: initialData?.modele || "",
    numeroDA: initialData?.numeroDA || "",
    dateDA: initialData?.dateDA || "",
    daValide: initialData?.daValide || "na",
    numeroCA: initialData?.numeroCA || "",
    dateCA: initialData?.dateCA || "",
    dateReception: initialData?.dateReception || "",
    validationReception: initialData?.validationReception || "na",
    installePar: initialData?.installePar || "",
    dateInstallation: initialData?.dateInstallation || "",
    parametrageRealise: initialData?.parametrageRealise || "non",
    localisationFonctionnelle: initialData?.localisationFonctionnelle || "",
    statutConduite: initialData?.statutConduite || "test_requis",
    telechargementMemoireMasse: initialData?.telechargementMemoireMasse || "",
    numeroTruck4U: initialData?.numeroTruck4U || "",
    presenceTablette: initialData?.presenceTablette || "non",
    typeTablette: initialData?.typeTablette || "",
    imei: initialData?.imei || "",
    fonctionnelle: initialData?.fonctionnelle || "non",
    compatibilite: initialData?.compatibilite || "test_requis",
    deliverup: initialData?.deliverup || "non_installe",
    applicationsSpecifiques: initialData?.applicationsSpecifiques || "",
    raisonsNonInstalle: initialData?.raisonsNonInstalle || "",
    cameraCabineTelematics: initialData?.cameraCabineTelematics || "pas_besoin",
    dashcam: initialData?.dashcam || "pas_besoin",
    numeroPDA: initialData?.numeroPDA || "",
    materielRequis: initialData?.materielRequis || "complet",
    testsOK: initialData?.testsOK || "non",
    champAction: initialData?.champAction || "",
    observations: initialData?.observations || "",
  });

  const handleChange = (field: keyof InsertTruck, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de base</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="numero">Numéro</Label>
            <Input
              id="numero"
              value={formData.numero}
              onChange={(e) => handleChange("numero", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="modele">Modèle</Label>
            <Input
              id="modele"
              value={formData.modele}
              onChange={(e) => handleChange("modele", e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* État des documents */}
      <Card>
        <CardHeader>
          <CardTitle>État des documents</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="numeroDA">N° DA</Label>
            <Input
              id="numeroDA"
              value={formData.numeroDA}
              onChange={(e) => handleChange("numeroDA", e.target.value)}
            />
          </div>
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
              value={formData.daValide}
              onChange={(e) => handleChange("daValide", e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="na">N/A</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Truck4U */}
      <Card>
        <CardHeader>
          <CardTitle>Installation Truck4U</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="installePar">Installé par</Label>
            <Input
              id="installePar"
              value={formData.installePar}
              onChange={(e) => handleChange("installePar", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="dateInstallation">Date installation</Label>
            <Input
              id="dateInstallation"
              type="date"
              value={formData.dateInstallation}
              onChange={(e) => handleChange("dateInstallation", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="parametrageRealise">Paramétrage réalisé</Label>
            <select
              id="parametrageRealise"
              value={formData.parametrageRealise}
              onChange={(e) => handleChange("parametrageRealise", e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="non">Non</option>
              <option value="partiel">Partiel</option>
              <option value="oui">Oui</option>
            </select>
          </div>
          <div>
            <Label htmlFor="statutConduite">Statut conduite</Label>
            <select
              id="statutConduite"
              value={formData.statutConduite}
              onChange={(e) => handleChange("statutConduite", e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="test_requis">Test requis</option>
              <option value="fonctionnel">Fonctionnel</option>
              <option value="non_fonctionnel">Non fonctionnel</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tablette */}
      <Card>
        <CardHeader>
          <CardTitle>Équipement Tablette</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="presenceTablette">Présence tablette</Label>
            <select
              id="presenceTablette"
              value={formData.presenceTablette}
              onChange={(e) => handleChange("presenceTablette", e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="non">Non</option>
              <option value="oui">Oui</option>
            </select>
          </div>
          <div>
            <Label htmlFor="typeTablette">Type tablette</Label>
            <Input
              id="typeTablette"
              value={formData.typeTablette}
              onChange={(e) => handleChange("typeTablette", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="imei">IMEI</Label>
            <Input
              id="imei"
              value={formData.imei}
              onChange={(e) => handleChange("imei", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="fonctionnelle">Fonctionnelle</Label>
            <select
              id="fonctionnelle"
              value={formData.fonctionnelle}
              onChange={(e) => handleChange("fonctionnelle", e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="non">Non</option>
              <option value="partiel">Partiel</option>
              <option value="oui">Oui</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>
    </form>
  );
} 