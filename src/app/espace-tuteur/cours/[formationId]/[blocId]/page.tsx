'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ModuleManagement } from '@/app/espace-admin/gestion-formations/components/ModuleManagement';
import { getFormationById } from '@/lib/formations';
import { Modal } from '@/app/Modal';

interface ModuleManagementPageProps {
  params: Promise<{
    formationId: string;
    blocId: string;
  }>;
}

interface ModuleWithStatus {
  id: string;
  moduleName: string;
  cours: string[];
  coursDetails?: { id: string; titre: string }[];
  creationModification?: string;
  creePar?: string;
  statut: 'en_ligne' | 'brouillon' | 'manquant';
  cours_count?: number;
  cours_actifs?: number;
  ordre_affichage?: number;
  numero_module?: number;
}

export default function TutorModuleManagementPage({ params }: ModuleManagementPageProps) {
  const router = useRouter();
  const { formationId, blocId } = use(params);

  const [isLoading, setIsLoading] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [modules, setModules] = useState<ModuleWithStatus[]>([]);
  const [blocInfo, setBlocInfo] = useState<{ titre: string; numero_bloc: number } | null>(null);
  const [formationInfo, setFormationInfo] = useState<{ titre: string; ecole?: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  const BASE_PATH = '/espace-tuteur/cours';

  const loadBlocInfo = async () => {
    try {
      const response = await fetch(`/api/blocs?formationId=${formationId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        const bloc = data.blocs?.find((b: any) => b.id.toString() === blocId);
        if (bloc) {
          setBlocInfo({ titre: bloc.titre, numero_bloc: bloc.numero_bloc });
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du bloc:', error);
    }
  };

  const loadFormationInfo = async () => {
    try {
      const formation = await getFormationById(parseInt(formationId, 10));
      if (formation) {
        setFormationInfo({ titre: formation.titre || '', ecole: formation.ecole });
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la formation:', error);
    }
  };

  const loadModules = async () => {
    try {
      const response = await fetch(`/api/cours?formationId=${formationId}&blocId=${blocId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        const coursData = data.cours || data.modules || [];
        const formattedModules = coursData.map((cours: any) => ({
          id: cours.id?.toString() || String(cours.id),
          moduleName: cours.coursName || cours.titre || 'Cours sans titre',
          cours: cours.chapitres || cours.cours || [],
          coursDetails: cours.chapitresDetails || cours.coursDetails || [],
          creationModification: cours.creationModification,
          creePar: cours.creePar,
          statut: cours.statut || 'brouillon',
          cours_count: cours.chapitres_count || cours.cours_count || 0,
          cours_actifs: cours.chapitres_actifs || cours.cours_actifs || 0,
          ordre_affichage: cours.ordre_affichage,
          numero_module: cours.numero_cours || cours.numero_module,
          hasEtudeCas: cours.hasEtudeCas || false,
          created_by: cours.created_by ?? null,
        }));
        setModules(formattedModules);
      } else {
        setModules([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des modules:', error);
      setModules([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const sessionRes = await fetch('/api/auth/session', { credentials: 'include' });
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData.user?.id) setCurrentUserId(sessionData.user.id);
      }
      await Promise.all([loadBlocInfo(), loadFormationInfo(), loadModules()]);
      setIsLoading(false);
    };
    loadData();
  }, [formationId, blocId]);

  const handleAddModule = async (moduleData: { titre?: string; cours: Array<{ id?: number; titre: string }> | string[]; moduleId?: string }) => {
    try {
      const chapitres =
        Array.isArray(moduleData.cours) && moduleData.cours.length > 0 && typeof moduleData.cours[0] === 'object'
          ? moduleData.cours
          : (moduleData.cours as string[]).map((titre) => ({ titre }));

      const response = await fetch(`/api/cours?formationId=${formationId}&blocId=${blocId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: moduleData.titre || '',
          chapitres,
          description: '',
          type_module: 'cours',
          coursId: moduleData.moduleId,
        }),
      });
      if (response.ok) {
        await loadModules();
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du module:', error);
    }
  };

  const handleEditModule = (_moduleId: string) => {};
  const handleAddQuiz = (_moduleId: string) => {};
  const handleAssignModule = (_moduleId: string) => {};

  const handleVisualizeModule = (coursId: string) => {
    router.push(`${BASE_PATH}/${formationId}/${blocId}/cours/${coursId}/preview`);
  };

  const handleEditCours = (coursId: string, chapitreId?: string) => {
    if (chapitreId) {
      router.push(`${BASE_PATH}/${formationId}/${blocId}/cours/${coursId}/chapitre/${chapitreId}`);
    } else {
      router.push(`${BASE_PATH}/${formationId}/${blocId}/cours/${coursId}/chapitre`);
    }
  };

  const handleBackToBlocs = () => {
    router.push(`${BASE_PATH}/${formationId}`);
  };

  const handleDeleteModule = async (coursId: string, scope: 'module' | 'cours', chapitreId?: string) => {
    try {
      if (scope === 'cours' && !chapitreId) {
        throw new Error('Chapitre non précisé pour la suppression');
      }
      const url =
        scope === 'module'
          ? `/api/cours?coursId=${coursId}&scope=cours`
          : `/api/chapitres?chapitreId=${chapitreId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Erreur HTTP ${response.status}`);
      }
      await loadModules();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setErrorMessage(`Erreur lors de la suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setShowErrorModal(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-[#032622] mx-auto mb-3 sm:mb-4"></div>
          <p className="text-xs sm:text-sm text-[#032622]">Chargement des modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4] flex">
      <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10">
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={handleBackToBlocs}
              className="text-[#032622] hover:text-[#032622]/70 active:text-[#032622]/50 transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Retour aux blocs</span>
            </button>

            <ModuleManagement
              blocTitle={blocInfo?.titre || 'Chargement...'}
              blocNumber={`BLOC ${blocInfo?.numero_bloc || ''}`}
              formationTitle={formationInfo?.titre || ''}
              formationEcole={formationInfo?.ecole}
              modules={modules}
              formationId={formationId}
              blocId={blocId}
              basePath={BASE_PATH}
              currentUserId={currentUserId}
              onAddModule={handleAddModule}
              onEditModule={handleEditModule}
              onAddQuiz={handleAddQuiz}
              onAssignModule={handleAssignModule}
              onVisualizeModule={handleVisualizeModule}
              onEditCours={handleEditCours}
              onDeleteModule={handleDeleteModule}
              onRefreshModules={loadModules}
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          setErrorMessage('');
        }}
        title="Erreur"
        message={errorMessage}
        type="error"
      />
    </div>
  );
}
