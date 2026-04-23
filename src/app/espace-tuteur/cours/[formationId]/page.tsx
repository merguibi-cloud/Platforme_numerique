'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { BlocksListView } from '@/app/espace-admin/gestion-formations/components/BlocksListView';
import { EditBloc } from '@/app/espace-admin/gestion-formations/components/EditBloc';
import { Modal } from '@/app/Modal';
import { getFormationById } from '@/lib/formations';
import { getBlocsByFormationId, createBlocWithModules, updateBloc, deleteBloc } from '@/lib/blocs-api';
import type { Formation } from '@/types/formations';
import type { BlocCompetence } from '@/types/formation-detailed';
import type { FormationInfo } from '@/types/block';

export default function TutorFormationBlocsPage({
  params,
}: {
  params: Promise<{ formationId: string }>;
}) {
  const { formationId } = use(params);
  const router = useRouter();

  const [formation, setFormation] = useState<Formation | null>(null);
  const [blocs, setBlocs] = useState<BlocCompetence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [editingBloc, setEditingBloc] = useState<BlocCompetence | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blocToDelete, setBlocToDelete] = useState<BlocCompetence | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const sessionRes = await fetch('/api/auth/session', { credentials: 'include' });
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.user?.id) setCurrentUserId(sessionData.user.id);
        }

        const id = parseInt(formationId);
        if (isNaN(id)) {
          router.push('/espace-tuteur/cours');
          return;
        }
        const fetchedFormation = await getFormationById(id);
        if (!fetchedFormation) {
          router.push('/espace-tuteur/cours');
          return;
        }
        setFormation(fetchedFormation);
        setBlocs(await getBlocsByFormationId(id));
      } catch {
        router.push('/espace-tuteur/cours');
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
        modules: blocData.modules,
      });
      if (result.success) {
        setBlocs(await getBlocsByFormationId(formation.id));
        setModalMessage('Bloc créé avec succès !');
        setIsSuccessModalOpen(true);
      } else {
        setModalMessage(result.error || 'Erreur lors de la création du bloc');
        setIsErrorModalOpen(true);
      }
    } catch {
      setModalMessage('Erreur interne lors de la création du bloc');
      setIsErrorModalOpen(true);
    }
  };

  const handleViewBlock = (blockId: string) => {
    router.push(`/espace-tuteur/cours/${formationId}/${blockId}`);
  };

  const handleEditBlock = (blockId: string) => {
    const bloc = blocs.find((b) => b.id.toString() === blockId);
    if (bloc) {
      setEditingBloc(bloc);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = async (
    blocId: number,
    updates: { titre: string; description?: string; duree_estimee?: number }
  ) => {
    try {
      const result = await updateBloc(blocId, updates);
      if (result.success && formation) {
        setBlocs(await getBlocsByFormationId(formation.id));
        setModalMessage('Bloc modifié avec succès !');
        setIsSuccessModalOpen(true);
      } else {
        setModalMessage(result.error || 'Erreur lors de la modification');
        setIsErrorModalOpen(true);
      }
    } catch {
      setModalMessage('Erreur interne lors de la modification du bloc');
      setIsErrorModalOpen(true);
    }
  };

  const handleDeleteBlock = (blockId: string) => {
    const bloc = blocs.find((b) => b.id.toString() === blockId);
    if (bloc) {
      setBlocToDelete(bloc);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeleteBlock = async () => {
    if (!blocToDelete) return;
    try {
      const result = await deleteBloc(blocToDelete.id);
      if (result.success && formation) {
        setBlocs(await getBlocsByFormationId(formation.id));
        setModalMessage('Bloc supprimé avec succès !');
        setIsSuccessModalOpen(true);
      } else {
        setModalMessage(result.error || 'Erreur lors de la suppression');
        setIsErrorModalOpen(true);
      }
    } catch {
      setModalMessage('Erreur interne lors de la suppression du bloc');
      setIsErrorModalOpen(true);
    } finally {
      setIsDeleteModalOpen(false);
      setBlocToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F5E4]">
        <div className="animate-spin h-10 w-10 border-b-2 border-[#032622]" />
      </div>
    );
  }

  if (!formation) return null;

  const formationInfo: FormationInfo = {
    id: formation.id.toString(),
    title: formation.titre,
    level: formation.niveau || 'FORMATION',
    levelCode: formation.theme || 'THÈME',
  };

  return (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 bg-[#F8F5E4] min-h-screen">
      <div className="space-y-4 sm:space-y-6">
        <button
          onClick={() => router.push('/espace-tuteur/cours')}
          className="text-[#032622] hover:opacity-70 transition-opacity flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux formations
        </button>

        <BlocksListView
          formation={formationInfo}
          blocks={blocs}
          currentUserId={currentUserId}
          showAddButton={false}
          onViewBlock={handleViewBlock}
          onEditBlock={handleEditBlock}
          onDeleteBlock={handleDeleteBlock}
          onAddBlock={handleAddBlock}
        />
      </div>

      <EditBloc
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingBloc(null); }}
        onSave={handleSaveEdit}
        bloc={editingBloc}
      />

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
}
