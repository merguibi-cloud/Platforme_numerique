'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BlocksListView } from './BlocksListView';
import { FormationHeader } from './FormationHeader';
import { EditBloc } from './EditBloc';
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingBloc, setEditingBloc] = useState<BlocCompetence | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
        
        router.push('/espace-admin/gestion-formations');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [formationId, router]);

  const handleAddBlock = async (blocData: { titre: string; description: string; modules: string[] }) => {
    if (!formation) return;

    setError(null);
    setSuccess(null);

    try {
      const nextBlocNumber = blocs.length + 1;
      
      const result = await createBlocWithModules({
        formation_id: formation.id,
        numero_bloc: nextBlocNumber,
        titre: blocData.titre,
        description: blocData.description,
        modules: blocData.modules
      });

      if (result.success && result.bloc) {
        // Recharger les blocs
        const updatedBlocs = await getBlocsByFormationId(formation.id);
        setBlocs(updatedBlocs);
        setSuccess('Bloc créé avec succès !');
      } else {
        setError(result.error || 'Erreur lors de la création du bloc');
      }
    } catch (error) {
      
      setError('Erreur interne lors de la création du bloc');
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

  const handleSaveEdit = async (blocId: number, updates: { titre: string; description?: string; objectifs?: string[]; duree_estimee?: number }) => {
    setError(null);
    setSuccess(null);

    console.log('Mise à jour du bloc:', blocId, updates);

    try {
      const result = await updateBloc(blocId, updates);
      
      console.log('Résultat de la mise à jour:', result);
      
      if (result.success) {
        // Recharger les blocs
        if (formation) {
          const updatedBlocs = await getBlocsByFormationId(formation.id);
          console.log('Blocs rechargés:', updatedBlocs);
          setBlocs(updatedBlocs);
          setSuccess('Bloc modifié avec succès !');
        }
      } else {
        setError(result.error || 'Erreur lors de la modification du bloc');
      }
    } catch (error) {
      console.error('Erreur lors de la modification du bloc:', error);
      setError('Erreur interne lors de la modification du bloc');
    }
  };


  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingBloc(null);
  };


  const handleDeleteBlock = async (blockId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce bloc ?')) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const result = await deleteBloc(parseInt(blockId));
      
      if (result.success) {
        // Recharger les blocs
        if (formation) {
          const updatedBlocs = await getBlocsByFormationId(formation.id);
          setBlocs(updatedBlocs);
          setSuccess('Bloc supprimé avec succès !');
        }
      } else {
        setError(result.error || 'Erreur lors de la suppression du bloc');
      }
    } catch (error) {
      
      setError('Erreur interne lors de la suppression du bloc');
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

            {/* Messages d'erreur et de succès */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong>Erreur :</strong> {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <strong>Succès :</strong> {success}
              </div>
            )}
            
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
    </div>
  );
};
