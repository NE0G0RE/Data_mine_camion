// @ts-nocheck
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../hooks/use-toast';
import { Truck, X } from 'lucide-react';

// Interface pour les filiales (à remplacer par un appel API dans une version future)
interface Filiale {
  id: string;
  nom: string;
}

interface AddTruckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTruckAdded: () => void;
}

interface TruckFormData {
  immatriculation: string;
  filialeId: string;
  modele: string;
  status: string;
  marque?: string; // Optionnel selon le schéma
}

const INITIAL_FORM_DATA: TruckFormData = {
  immatriculation: '',
  filialeId: '',
  modele: '',
  status: 'Actif',
  marque: ''
};

// Données factices pour les filiales (à remplacer par un appel API dans une version future)
const FILIALES: Filiale[] = [
  { id: '1', nom: 'Paris' },
  { id: '2', nom: 'Lyon' },
  { id: '3', nom: 'Marseille' },
  { id: '4', nom: 'Toulouse' },
  { id: '5', nom: 'Bordeaux' },
  { id: '6', nom: 'Lille' },
  { id: '7', nom: 'Nantes' },
  { id: '8', nom: 'Strasbourg' }
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
  const [formData, setFormData] = React.useState<TruckFormData>({
    immatriculation: '',
    filialeId: '',
    modele: '',
    marque: '',
    status: 'Actif'
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof TruckFormData, value: string) => {
    setFormData((prev: TruckFormData) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    if (!formData.immatriculation || !formData.filialeId || !formData.modele) {
      toast({
        title: "Champs obligatoires",
        description: "L'immatriculation, la filiale et le modèle sont obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparer les données pour l'envoi au format attendu par le serveur
      const truckData = {
        immatriculation: formData.immatriculation,
        filialeId: formData.filialeId,
        modele: formData.modele,
        // Champs optionnels
        marque: formData.marque || undefined,
        // Valeurs par défaut pour les champs requis par le schéma
        statutConduite: formData.status === 'Actif' ? 'fonctionnel' : 'non_fonctionnel',
        daValide: 'na',
        validationReception: 'na',
        parametrageRealise: 'non',
        presenceTablette: 'non',
        compatibilite: 'test_requis',
        deliverup: 'non_installe',
        materielRequis: 'manquant',
        testsOK: 'non'
      };

      const response = await fetch('/api/trucks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(truckData),
      });

      if (response.ok) {
        toast({
          title: "Camion ajouté",
          description: `Le camion ${formData.immatriculation} a été ajouté avec succès.`,
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
    <Dialog open={isOpen} onOpenChange={(open: boolean) => open === false && handleClose()}>
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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Numéro - Obligatoire */}
          <div className="space-y-2">
            <Label htmlFor="immatriculation" className="text-blue-100 font-medium">Immatriculation *</Label>
            <Input
              id="immatriculation"
              value={formData.immatriculation}
              onChange={(e: any) => handleInputChange('immatriculation', e.target.value)}
              placeholder="Ex: AA-123-BB"
              required
              className="bg-white/10 border-white/20 text-white placeholder-blue-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>

          {/* Filiale - Obligatoire */}
          <div className="space-y-2">
            <Label htmlFor="filialeId" className="text-blue-100 font-medium">Filiale *</Label>
            <Select
              value={formData.filialeId}
              onValueChange={(value: string) => handleInputChange('filialeId', value)}
              required
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-blue-400">
                <SelectValue placeholder="Sélectionner une filiale" className="text-blue-200" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {FILIALES.map(filiale => (
                  <SelectItem key={filiale.id} value={filiale.id} className="text-white hover:bg-slate-700">
                    {filiale.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modèle */}
          <div className="space-y-2">
            <Label htmlFor="modele" className="text-blue-100 font-medium">Modèle *</Label>
            <Input
              id="modele"
              value={formData.modele}
              onChange={(e: any) => handleInputChange('modele', e.target.value)}
              placeholder="Ex: Actros, FH16, etc."
              required
              className="bg-white/10 border-white/20 text-white placeholder-blue-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>

          {/* Marque */}
          <div className="space-y-2">
            <Label htmlFor="marque" className="text-blue-100 font-medium">Marque</Label>
            <Select
              value={formData.marque || ''}
              onValueChange={(value: string) => handleInputChange('marque', value)}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-blue-400">
                <SelectValue placeholder="Sélectionner une marque" className="text-blue-200" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {MARQUES.map(marque => (
                  <SelectItem key={marque} value={marque} className="text-white hover:bg-slate-700">
                    {marque}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
