'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ModuleManagement } from '../../components/ModuleManagement';
import { FormationHeader } from '../../components/FormationHeader';

interface ModuleManagementPageProps {
  params: Promise<{
    formationId: string;
    blocId: string;
  }>;
}

interface ModuleWithStatus {
  id: string;
  type: string;
  cours: string;
  creationModification?: string;
  creePar?: string;
  statut: 'en_ligne' | 'brouillon' | 'manquant';
}

export default function ModuleManagementPage({ params }: ModuleManagementPageProps) {
  const router = useRouter();
  const { formationId, blocId } = use(params);
  
  const [isLoading, setIsLoading] = useState(true);
  const [modules, setModules] = useState<ModuleWithStatus[]>([]);
  const [blocInfo, setBlocInfo] = useState<{ titre: string; numero_bloc: number } | null>(null);

  const loadBlocInfo = async () => {
    try {
      const response = await fetch(`/api/blocs?formationId=${formationId}`);
      
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
      const response = await fetch(`/api/modules?formationId=${formationId}&blocId=${blocId}`);
      
      if (response.ok) {
        const data = await response.json();
        setModules(data.modules || []);
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

  const handleAddModule = async (moduleData: { titre: string; cours: string[] }) => {
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
          type_module: 'cours'
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
    console.log('Éditer le module:', moduleId);
  };

  const handleAddQuiz = (moduleId: string) => {
    console.log('Ajouter quiz au module:', moduleId);
  };

  const handleVisualizeModule = (moduleId: string) => {
    console.log('Visualiser le module:', moduleId);
    // TODO: Implémenter la navigation vers la page de visualisation
    router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/module/${moduleId}`);
  };

  const handleAssignModule = (moduleId: string) => {
    console.log('Attribuer le module:', moduleId);
    // TODO: Implémenter l'attribution du module
  };

  const handleBackToBlocs = () => {
    router.push(`/espace-admin/gestion-formations/${formationId}`);
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
          <FormationHeader />
          
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
              onAddModule={handleAddModule}
              onEditModule={handleEditModule}
              onAddQuiz={handleAddQuiz}
              onAssignModule={handleAssignModule}
              onVisualizeModule={handleVisualizeModule}
            />
          </div>
        </div>
      </div>
    </div>
  );
}