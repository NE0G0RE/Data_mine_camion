
import { ArrowLeft, Edit, Calendar, MapPin, Truck as TruckIcon, Tablet, Camera, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Truck } from "@shared/schema";

interface TruckDetailViewProps {
  truck: Truck;
  onBack: () => void;
  onEdit: () => void;
}

const getStatusBadge = (status: string | null | undefined, type: 'etat' | 'truck4u' | 'tablette' | 'materiel') => {
  if (!status) {
    return <Badge className="status-na">Non défini</Badge>;
  }

  const statusMap: Record<string, { variant: string; label: string; icon: React.ReactNode }> = {
    // État
    oui: { variant: 'status-ok', label: 'Oui', icon: <CheckCircle className="w-3 h-3" /> },
    non: { variant: 'status-nok', label: 'Non', icon: <XCircle className="w-3 h-3" /> },
    na: { variant: 'status-na', label: 'N/A', icon: null },
    
    // Truck4U
    fonctionnel: { variant: 'status-ok', label: 'Fonctionnel', icon: <CheckCircle className="w-3 h-3" /> },
    non_fonctionnel: { variant: 'status-nok', label: 'Non Fonctionnel', icon: <XCircle className="w-3 h-3" /> },
    test_requis: { variant: 'status-pending', label: 'Test Requis', icon: <Clock className="w-3 h-3" /> },
    
    // Tablette
    compatible: { variant: 'status-ok', label: 'Compatible', icon: <CheckCircle className="w-3 h-3" /> },
    incompatible: { variant: 'status-nok', label: 'Incompatible', icon: <XCircle className="w-3 h-3" /> },
    installe: { variant: 'status-ok', label: 'Installé', icon: <CheckCircle className="w-3 h-3" /> },
    non_installe: { variant: 'status-nok', label: 'Non Installé', icon: <XCircle className="w-3 h-3" /> },
    erreur: { variant: 'status-nok', label: 'Erreur', icon: <XCircle className="w-3 h-3" /> },
    
    // Matériel
    complet: { variant: 'status-ok', label: 'Complet', icon: <CheckCircle className="w-3 h-3" /> },
    partiel: { variant: 'status-pending', label: 'Partiel', icon: <Clock className="w-3 h-3" /> },
    manquant: { variant: 'status-nok', label: 'Manquant', icon: <XCircle className="w-3 h-3" /> },
    pas_besoin: { variant: 'status-na', label: 'Pas besoin', icon: null },
    en_cours: { variant: 'status-pending', label: 'En cours', icon: <Clock className="w-3 h-3" /> },
  };

  const config = statusMap[status] || { variant: 'status-na', label: status, icon: null };
  return (
    <Badge className={config.variant}>
      {config.icon && <span className="mr-1">{config.icon}</span>}
      {config.label}
    </Badge>
  );
};

const InfoRow = ({ label, value, icon }: { label: string; value: string | null | undefined; icon?: React.ReactNode }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center space-x-2">
      {icon && <span className="text-gray-400">{icon}</span>}
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
    <span className="text-sm text-gray-900">{value || "Non défini"}</span>
  </div>
);

const StatusRow = ({ label, status, type, icon }: { 
  label: string; 
  status: string | null | undefined; 
  type: 'etat' | 'truck4u' | 'tablette' | 'materiel';
  icon?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center space-x-2">
      {icon && <span className="text-gray-400">{icon}</span>}
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
    {getStatusBadge(status, type)}
  </div>
);

export default function TruckDetailView({ truck, onBack, onEdit }: TruckDetailViewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Détails du Camion</h1>
              <p className="text-sm text-gray-500">N° {truck.numero} - {truck.modele}</p>
            </div>
          </div>
          <Button onClick={onEdit} className="bg-primary hover:bg-blue-700">
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TruckIcon className="w-5 h-5" />
              <span>Informations Générales</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <InfoRow label="Numéro de Camion" value={truck.numero} />
                <InfoRow label="Modèle" value={truck.modele} />
                <InfoRow label="Localisation Fonctionnelle" value={truck.localisationFonctionnelle} icon={<MapPin className="w-4 h-4" />} />
              </div>
              <div className="space-y-2">
                <InfoRow label="Installé par" value={truck.installePar} />
                <InfoRow label="Date d'Installation" value={truck.dateInstallation} icon={<Calendar className="w-4 h-4" />} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section État */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>État du Véhicule</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <InfoRow label="Numéro DA" value={truck.numeroDA} />
                <InfoRow label="Date DA" value={truck.dateDA} icon={<Calendar className="w-4 h-4" />} />
                <StatusRow label="DA Validé" status={truck.daValide} type="etat" />
                <InfoRow label="Numéro CA" value={truck.numeroCA} />
              </div>
              <div className="space-y-2">
                <InfoRow label="Date CA" value={truck.dateCA} icon={<Calendar className="w-4 h-4" />} />
                <InfoRow label="Date Réception" value={truck.dateReception} icon={<Calendar className="w-4 h-4" />} />
                <StatusRow label="Validation Réception" status={truck.validationReception} type="etat" />
                <StatusRow label="Paramétrage Réalisé" status={truck.parametrageRealise} type="etat" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Truck4U */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TruckIcon className="w-5 h-5" />
              <span>Système Truck4U</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <InfoRow label="Numéro Truck4U" value={truck.numeroTruck4U} />
                <StatusRow label="Statut Conduite" status={truck.statutConduite} type="truck4u" />
                <StatusRow label="Téléchargement Mémoire Masse" status={truck.telechargementMemoireMasse} type="truck4u" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Tablette */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tablet className="w-5 h-5" />
              <span>Tablette et Applications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <StatusRow label="Présence Tablette" status={truck.presenceTablette} type="tablette" />
                <InfoRow label="Type de Tablette" value={truck.typeTablette} />
                <InfoRow label="IMEI" value={truck.imei} />
                <StatusRow label="Tablette Fonctionnelle" status={truck.fonctionnelle} type="tablette" />
              </div>
              <div className="space-y-2">
                <StatusRow label="Compatibilité" status={truck.compatibilite} type="tablette" />
                <StatusRow label="DeliverUp" status={truck.deliverup} type="tablette" />
                <InfoRow label="Applications Spécifiques" value={truck.applicationsSpecifiques} />
                <InfoRow label="Raisons Non Installé" value={truck.raisonsNonInstalle} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Matériel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Matériel et Équipements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <StatusRow label="Caméra Cabine Telematics" status={truck.cameraCabineTelematics} type="materiel" icon={<Camera className="w-4 h-4" />} />
                <StatusRow label="Dashcam" status={truck.dashcam} type="materiel" icon={<Camera className="w-4 h-4" />} />
                <InfoRow label="Numéro PDA" value={truck.numeroPDA} />
              </div>
              <div className="space-y-2">
                <StatusRow label="Matériel Requis" status={truck.materielRequis} type="materiel" />
                <StatusRow label="Tests OK" status={truck.testsOK} type="materiel" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Actions et Observations */}
        <Card>
          <CardHeader>
            <CardTitle>Actions et Observations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Champ Action</label>
                <div className="bg-gray-50 p-3 rounded-md border min-h-[60px]">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {truck.champAction || "Aucune action définie"}
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Observations</label>
                <div className="bg-gray-50 p-3 rounded-md border min-h-[80px]">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {truck.observations || "Aucune observation"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
