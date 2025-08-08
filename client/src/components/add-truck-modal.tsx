import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../hooks/use-toast';
import { Truck, X } from 'lucide-react';

interface AddTruckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTruckAdded: () => void;
}

interface TruckFormData {
  numero: string;
  filiale: string;
  marque: string;
  modele: string;
  immatriculation: string;
  status: string;
}

const INITIAL_FORM_DATA: TruckFormData = {
  numero: '',
  filiale: '',
  marque: '',
  modele: '',
  immatriculation: '',
  status: 'Actif'
};

const FILIALES = [
  'Paris',
  'Lyon',
  'Marseille',
  'Toulouse',
  'Bordeaux',
  'Lille',
  'Nantes',
  'Strasbourg'
];

const MARQUES = [
  'Volvo',
  'Mercedes',
  'Scania',
  'DAF',
  'Iveco',
  'MAN',
  'Renault',
  'Ford'
];

const STATUS_OPTIONS = [
  'Actif',
  'En maintenance',
  'Inactif',
  'En réparation'
];

export default function AddTruckModal({ isOpen, onClose, onTruckAdded }: AddTruckModalProps) {
  const [formData, setFormData] = useState<TruckFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof TruckFormData, value: string) => {
    setFormData((prev: TruckFormData) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    if (!formData.numero || !formData.filiale) {
      toast({
        title: "Champs obligatoires",
        description: "Le numéro et la filiale sont obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/trucks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        toast({
          title: "Camion ajouté",
          description: `Le camion ${formData.numero} a été ajouté avec succès.`,
        });
        
        // Reset form
        setFormData(INITIAL_FORM_DATA);
        onTruckAdded();
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'ajout');
      }
    } catch (error) {
      console.error('❌ Add truck error:', error);
      toast({
        title: "Erreur d'ajout",
        description: error instanceof Error ? error.message : "Erreur inconnue lors de l'ajout du camion.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM_DATA);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 to-blue-900 border-blue-500/30 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg mr-3">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-lg">Nouveau Camion</DialogTitle>
                <p className="text-blue-200 text-sm">Ajouter un véhicule à la flotte</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose} className="text-white hover:bg-white/10">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Numéro - Obligatoire */}
          <div className="space-y-2">
            <Label htmlFor="numero" className="text-blue-100 font-medium">Numéro de camion *</Label>
            <Input
              id="numero"
              value={formData.numero}
              onChange={(e: any) => handleInputChange('numero', e.target.value)}
              placeholder="Ex: TR-001, CAM-123, etc."
              required
              className="bg-white/10 border-white/20 text-white placeholder-blue-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>

          {/* Filiale - Obligatoire */}
          <div className="space-y-2">
            <Label htmlFor="filiale" className="text-blue-100 font-medium">Filiale *</Label>
            <Select
              value={formData.filiale}
              onValueChange={(value: any) => handleInputChange('filiale', value)}
              required
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-blue-400">
                <SelectValue placeholder="Sélectionner une filiale" className="text-blue-200" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {FILIALES.map(filiale => (
                  <SelectItem key={filiale} value={filiale} className="text-white hover:bg-slate-700">
                    {filiale}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Marque */}
          <div className="space-y-2">
            <Label htmlFor="marque">Marque</Label>
            <Select
              value={formData.marque}
              onValueChange={(value: any) => handleInputChange('marque', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une marque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- Aucune --</SelectItem>
                {MARQUES.map(marque => (
                  <SelectItem key={marque} value={marque}>
                    {marque}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modèle */}
          <div className="space-y-2">
            <Label htmlFor="modele">Modèle</Label>
            <Input
              id="modele"
              value={formData.modele}
              onChange={(e: any) => handleInputChange('modele', e.target.value)}
              placeholder="Ex: FH16, Actros, R500, etc."
            />
          </div>

          {/* Immatriculation */}
          <div className="space-y-2">
            <Label htmlFor="immatriculation">Immatriculation</Label>
            <Input
              id="immatriculation"
              value={formData.immatriculation}
              onChange={(e: any) => handleInputChange('immatriculation', e.target.value)}
              placeholder="Ex: AB-123-CD"
            />
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex justify-between pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ajout en cours...
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 mr-2" />
                  Ajouter le camion
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
