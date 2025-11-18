'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ModuleManagement } from '../../components/ModuleManagement';
import AdminTopBar from '../../../components/AdminTopBar';

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

export default function ModuleManagementPage({ params }: ModuleManagementPageProps) {
  const router = useRouter();
  const { formationId, blocId } = use(params);
  
  const [isLoading, setIsLoading] = useState(true);
  const [modules, setModules] = useState<ModuleWithStatus[]>([]);
  const [blocInfo, setBlocInfo] = useState<{ titre: string; numero_bloc: number } | null>(null);

  const loadBlocInfo = async () => {
    try {
      const response = await fetch(`/api/blocs?formationId=${formationId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const bloc = data.blocs?.find((b: any) => b.id.toString() === blocId);
        if (bloc) {
          setBlocInfo({
            titre: bloc.titre,
            numero_bloc: bloc.numero_bloc
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des informations du bloc:', error);
    }
  };

  const loadModules = async () => {
    try {
      const response = await fetch(`/api/modules?formationId=${formationId}&blocId=${blocId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const formattedModules = (data.modules || []).map((module: any) => ({
          ...module,
          coursDetails: module.coursDetails ?? [],
        }));
        setModules(formattedModules);
      } else {
        setModules([]);
      }
    } catch (error) {
      setModules([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadBlocInfo(),
        loadModules()
      ]);
      setIsLoading(false);
    };
    
    loadData();
  }, [formationId, blocId]);

  const handleAddModule = async (moduleData: { titre: string; cours: string[]; moduleId?: string }) => {
    try {
      const response = await fetch(`/api/modules?formationId=${formationId}&blocId=${blocId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titre: moduleData.titre,
          cours: moduleData.cours,
          description: '',
          type_module: 'cours',
          moduleId: moduleData.moduleId,
        }),
      });

      if (response.ok) {
        await loadModules();
      }
    } catch (error) {
      // Erreur silencieuse
    }
  };

  const handleEditModule = (moduleId: string) => {
    // TODO: Implémenter l'édition du module
  };

  const handleAddQuiz = (moduleId: string) => {
    // TODO: Implémenter l'ajout de quiz
  };

  const handleVisualizeModule = (moduleId: string) => {
    router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/module/${moduleId}/preview`);
  };

  const handleAssignModule = (moduleId: string) => {
    // TODO: Implémenter l'attribution du module
  };

  const handleEditCours = (moduleId: string, coursId?: string) => {
    // Trouver le module pour récupérer son ordre d'affichage
    const module = modules.find(m => m.id === moduleId);
    const moduleOrder = module?.ordre_affichage || module?.numero_module || 1;
    
    if (coursId) {
      router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/module/${moduleId}/cours/${coursId}`);
    } else {
      router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/module/${moduleId}/cours`);
    }
  };

  const handleBackToBlocs = () => {
    router.push(`/espace-admin/gestion-formations/${formationId}`);
  };

  const handleDeleteModule = async (moduleId: string, scope: 'module' | 'cours', coursId?: string) => {
    try {
      if (scope === 'cours') {
        if (!coursId) {
          throw new Error('Cours non précisé pour la suppression');
        }
      }

      const url =
        scope === 'module'
          ? `/api/modules?moduleId=${moduleId}&scope=module`
          : `/api/cours?coursId=${coursId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Erreur HTTP ${response.status}`);
      }

      await loadModules();
    } catch (error) {
      console.error('Erreur lors de la suppression du module:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
          <p className="text-[#032622]">Chargement des modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4] flex">
      <div className="flex-1 p-6">
        <div className="space-y-8">
          <AdminTopBar notificationCount={0} className="mb-6" />
          
          <div className="space-y-4">
            <button
              onClick={handleBackToBlocs}
              className="text-[#032622] hover:text-[#032622]/70 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour aux blocs
            </button>
            
            <ModuleManagement
              blocTitle={blocInfo?.titre || "Chargement..."}
              blocNumber={`BLOC ${blocInfo?.numero_bloc || ""}`}
              modules={modules}
              formationId={formationId}
              blocId={blocId}
              onAddModule={handleAddModule}
              onEditModule={handleEditModule}
              onAddQuiz={handleAddQuiz}
              onAssignModule={handleAssignModule}
              onVisualizeModule={handleVisualizeModule}
              onEditCours={handleEditCours}
              onDeleteModule={handleDeleteModule}
            />
          </div>
        </div>
      </div>
    </div>
  );
}