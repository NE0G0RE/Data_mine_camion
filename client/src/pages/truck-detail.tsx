
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import TruckDetailView from "@/components/truck-detail-view";
import TruckModal from "@/components/simple-truck-modal";
import { useToast } from "@/hooks/use-toast";
import type { Truck } from "@shared/schema";

export default function TruckDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: truck, isLoading, refetch } = useQuery({
    queryKey: [`/api/trucks/${id}`],
    enabled: !!id,
  });

  const handleBack = () => {
    navigate('/');
  };

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSave = () => {
    refetch();
    toast({
      title: "Succès",
      description: "Les données ont été sauvegardées avec succès.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des détails du camion...</p>
        </div>
      </div>
    );
  }

  if (!truck) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Camion non trouvé</h2>
          <p className="text-gray-600 mb-4">Le camion demandé n'existe pas ou a été supprimé.</p>
          <button
            onClick={handleBack}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <TruckDetailView
        truck={truck}
        onBack={handleBack}
        onEdit={handleEdit}
      />
      
      <TruckModal
        truck={truck}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
    </>
  );
}
