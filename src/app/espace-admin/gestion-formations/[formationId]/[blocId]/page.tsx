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
      console.log(`[Page] Chargement des cours pour bloc ${blocId}...`);
      const response = await fetch(`/api/cours?formationId=${formationId}&blocId=${blocId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Page] Données reçues de l\'API:', { 
          hasModules: !!data.modules, 
          hasCours: !!data.cours,
          modulesCount: data.modules?.length || 0,
          coursCount: data.cours?.length || 0,
          rawData: data
        });
        
        // L'API retourne maintenant { cours: [...] } au lieu de { modules: [...] }
        const coursData = data.cours || data.modules || [];
        console.log('[Page] Cours data à formater:', coursData.length, coursData);
        
        if (coursData.length === 0) {
          console.warn('[Page] Aucun cours trouvé dans la réponse API');
        }
        
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
        }));
        
        console.log('[Page] Modules formatés:', formattedModules.length, formattedModules);
        setModules(formattedModules);
      } else {
        const errorText = await response.text();
        console.error('[Page] Erreur API:', response.status, errorText);
        setModules([]);
      }
    } catch (error) {
      console.error('[Page] Erreur lors du chargement:', error);
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

  const handleAddModule = async (moduleData: { titre: string; cours: Array<{ id?: number; titre: string }> | string[]; moduleId?: string }) => {
    try {
      // Convertir les chapitres en format attendu par l'API
      const chapitres = Array.isArray(moduleData.cours) && moduleData.cours.length > 0 && typeof moduleData.cours[0] === 'object'
        ? moduleData.cours
        : (moduleData.cours as string[]).map(titre => ({ titre }));

      const response = await fetch(`/api/cours?formationId=${formationId}&blocId=${blocId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titre: moduleData.titre,
          chapitres: chapitres,
          description: '',
          type_module: 'cours',
          coursId: moduleData.moduleId, // L'API attend coursId, pas moduleId
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

  const handleVisualizeModule = (coursId: string) => {
    router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/cours/${coursId}/preview`);
  };

  const handleAssignModule = (moduleId: string) => {
    // TODO: Implémenter l'attribution du module
  };

  const handleEditCours = (coursId: string, chapitreId?: string) => {
    // Trouver le cours pour récupérer son ordre d'affichage
    const cours = modules.find(m => m.id === coursId);
    const coursOrder = cours?.ordre_affichage || cours?.numero_module || 1;
    
    if (chapitreId) {
      router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/cours/${coursId}/chapitre/${chapitreId}`);
    } else {
      router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/cours/${coursId}/chapitre`);
    }
  };

  const handleBackToBlocs = () => {
    router.push(`/espace-admin/gestion-formations/${formationId}`);
  };

  const handleDeleteModule = async (coursId: string, scope: 'module' | 'cours', chapitreId?: string) => {
    try {
      console.log('[handleDeleteModule] Début de la suppression:', { coursId, scope, chapitreId });
      
      if (scope === 'cours') {
        if (!chapitreId) {
          throw new Error('Chapitre non précisé pour la suppression');
        }
      }

      const url =
        scope === 'module'
          ? `/api/cours?coursId=${coursId}&scope=cours`
          : `/api/chapitres?chapitreId=${chapitreId}`;

      console.log('[handleDeleteModule] URL de suppression:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[handleDeleteModule] Réponse reçue:', response.status, response.statusText);

      if (!response.ok) {
        const message = await response.text();
        console.error('[handleDeleteModule] Erreur de réponse:', message);
        throw new Error(message || `Erreur HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('[handleDeleteModule] Résultat de la suppression:', result);

      await loadModules();
      console.log('[handleDeleteModule] Modules rechargés après suppression');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert(`Erreur lors de la suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
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