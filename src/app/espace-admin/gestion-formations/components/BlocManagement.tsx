'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BlocksListView } from './BlocksListView';
import { FormationHeader } from './FormationHeader';
import { EditBloc } from './EditBloc';
import { Modal } from '@/app/espace-admin/components/Modal';
import { getFormationById } from '@/lib/formations';
import { getBlocsByFormationId, createBlocWithModules, updateBloc, deleteBloc } from '@/lib/blocs-api';
import { Formation } from '@/types/formations';
import { BlocCompetence } from '@/types/formation-detailed';
import { FormationInfo } from '@/types/block';

interface BlocManagementProps {
  formationId: string;
}

export const BlocManagement = ({ formationId }: BlocManagementProps) => {
  const router = useRouter();
  const [formation, setFormation] = useState<Formation | null>(null);
  const [blocs, setBlocs] = useState<BlocCompetence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingBloc, setEditingBloc] = useState<BlocCompetence | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // États pour les modales
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blocToDelete, setBlocToDelete] = useState<BlocCompetence | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const id = parseInt(formationId);
        if (isNaN(id)) {
          router.push('/espace-admin/gestion-formations');
          return;
        }

        // Charger la formation
        const fetchedFormation = await getFormationById(id);
        if (!fetchedFormation) {
          router.push('/espace-admin/gestion-formations');
          return;
        }
        setFormation(fetchedFormation);

        // Charger les blocs
        const fetchedBlocs = await getBlocsByFormationId(id);
        setBlocs(fetchedBlocs);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        router.push('/espace-admin/gestion-formations');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [formationId, router]);

  const handleAddBlock = async (blocData: { titre: string; description: string; modules: string[] }) => {
    if (!formation) return;

    try {
      const result = await createBlocWithModules({
        formation_id: formation.id,
        titre: blocData.titre,
        description: blocData.description,
        modules: blocData.modules
      });

      if (result.success && result.bloc) {
        // Recharger les blocs
        const updatedBlocs = await getBlocsByFormationId(formation.id);
        setBlocs(updatedBlocs);
        setModalMessage('Bloc créé avec succès !');
        setIsSuccessModalOpen(true);
      } else {
        setModalMessage(result.error || 'Erreur lors de la création du bloc');
        setIsErrorModalOpen(true);
      }
    } catch (error) {
      setModalMessage('Erreur interne lors de la création du bloc');
      setIsErrorModalOpen(true);
    }
  };

  const handleViewBlock = (blockId: string) => {
    router.push(`/espace-admin/gestion-formations/${formationId}/${blockId}`);
  };

  const handleEditBlock = async (blockId: string) => {
    const bloc = blocs.find(b => b.id.toString() === blockId);
    if (bloc) {
      setEditingBloc(bloc);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = async (blocId: number, updates: { titre: string; description?: string; duree_estimee?: number }) => {
    try {
      const result = await updateBloc(blocId, updates);
      
      if (result.success) {
        // Recharger les blocs
        if (formation) {
          const updatedBlocs = await getBlocsByFormationId(formation.id);
          setBlocs(updatedBlocs);
          setModalMessage('Bloc modifié avec succès !');
          setIsSuccessModalOpen(true);
        }
      } else {
        setModalMessage(result.error || 'Erreur lors de la modification du bloc');
        setIsErrorModalOpen(true);
      }
    } catch (error) {
      setModalMessage('Erreur interne lors de la modification du bloc');
      setIsErrorModalOpen(true);
    }
  };


  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingBloc(null);
  };


  const handleDeleteBlock = async (blockId: string) => {
    const bloc = blocs.find(b => b.id.toString() === blockId);
    if (bloc) {
      setBlocToDelete(bloc);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeleteBlock = async () => {
    if (!blocToDelete) return;

    try {
      const result = await deleteBloc(blocToDelete.id);
      
      if (result.success) {
        // Recharger les blocs
        if (formation) {
          const updatedBlocs = await getBlocsByFormationId(formation.id);
          setBlocs(updatedBlocs);
          setModalMessage('Bloc supprimé avec succès !');
          setIsSuccessModalOpen(true);
        }
      } else {
        setModalMessage(result.error || 'Erreur lors de la suppression du bloc');
        setIsErrorModalOpen(true);
      }
    } catch (error) {
      setModalMessage('Erreur interne lors de la suppression du bloc');
      setIsErrorModalOpen(true);
    } finally {
      setIsDeleteModalOpen(false);
      setBlocToDelete(null);
    }
  };

  const handleBackToFormations = () => {
    router.push('/espace-admin/gestion-formations');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
          <p className="text-[#032622]">Chargement des blocs...</p>
        </div>
      </div>
    );
  }

  if (!formation) {
    return null; // Should redirect by now
  }

  const formationInfo: FormationInfo = {
    id: formation.id.toString(),
    title: formation.titre,
    level: formation.niveau || 'FORMATION',
    levelCode: formation.theme || 'THÈME'
  };

  return (
    <div className="min-h-screen bg-[#F8F5E4] flex">
      <div className="flex-1 p-6">
        <div className="space-y-8">
          <FormationHeader />
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToFormations}
                className="text-[#032622] hover:text-[#032622]/70 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour aux formations
              </button>
            </div>

            <BlocksListView
              formation={formationInfo}
              blocks={blocs}
              onViewBlock={handleViewBlock}
              onEditBlock={handleEditBlock}
              onDeleteBlock={handleDeleteBlock}
              onAddBlock={handleAddBlock}
            />
          </div>
        </div>
      </div>

      {/* Edit Bloc Modal */}
      <EditBloc
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
        bloc={editingBloc}
      />

      {/* Modales de confirmation et messages */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmation de suppression"
        message={`Êtes-vous sûr de vouloir supprimer le bloc "${blocToDelete?.titre}" ? Cette action est irréversible.`}
        type="warning"
        isConfirm={true}
        onConfirm={confirmDeleteBlock}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Succès"
        message={modalMessage}
        type="success"
      />

      <Modal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Erreur"
        message={modalMessage}
        type="error"
      />
    </div>
  );
};
