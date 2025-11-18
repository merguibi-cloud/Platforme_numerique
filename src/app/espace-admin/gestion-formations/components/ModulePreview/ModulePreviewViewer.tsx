'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ModuleApprentissage, CoursContenu, QuizEvaluation, EtudeCas } from '@/types/formation-detailed';
import { CourseContentViewer } from './CourseContentViewer';
import { QuizViewer } from './QuizViewer';
import { EtudeCasViewer } from './EtudeCasViewer';
import { ModulePreviewHeader } from './ModulePreviewHeader';
import { ModulePreviewSidebar } from './ModulePreviewSidebar';
import { ModulePreviewNavigation } from './ModulePreviewNavigation';

interface ModulePreviewViewerProps {
  moduleId: number;
  formationId: string;
  blocId: string;
  onBack?: () => void;
}

type ViewType = 'cours' | 'quiz' | 'etude-cas';

interface ModuleData {
  module: ModuleApprentissage | null;
  cours: CoursContenu[];
  quiz: QuizEvaluation | null;
  quizQuestions: any[];
  etudeCas: EtudeCas | null;
  etudeCasQuestions: any[];
  bloc: { numero_bloc: number; titre: string } | null;
}

export const ModulePreviewViewer = ({
  moduleId,
  formationId,
  blocId,
  onBack
}: ModulePreviewViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ModuleData>({
    module: null,
    cours: [],
    quiz: null,
    quizQuestions: [],
    etudeCas: null,
    etudeCasQuestions: [],
    bloc: null
  });
  const [currentView, setCurrentView] = useState<ViewType>('cours');
  const [currentCoursIndex, setCurrentCoursIndex] = useState(0);
  const [allModules, setAllModules] = useState<ModuleApprentissage[]>([]);
  const [isSidebarRightCollapsed, setIsSidebarRightCollapsed] = useState(false);

  // Charger les données du module
  useEffect(() => {
    const loadModuleData = async () => {
      setIsLoading(true);
      try {
        // Charger le module
        const moduleResponse = await fetch(`/api/modules/${moduleId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        const moduleData = moduleResponse.ok ? await moduleResponse.json() : null;

        // Charger le bloc via formationId
        const blocResponse = await fetch(`/api/blocs?formationId=${formationId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        const blocData = blocResponse.ok ? await blocResponse.json() : null;
        const bloc = blocData?.blocs?.find((b: any) => b.id === parseInt(blocId)) || null;

        // Charger les cours du module
        const coursResponse = await fetch(`/api/cours?moduleId=${moduleId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        const coursData = coursResponse.ok ? await coursResponse.json() : null;
        let cours = coursData?.cours || [];
        
        // Charger les détails complets de chaque cours (fichiers complémentaires, etc.)
        const coursWithDetails = await Promise.all(
          cours.map(async (c: CoursContenu) => {
            try {
              const detailResponse = await fetch(`/api/cours?coursId=${c.id}`, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
              });
              if (detailResponse.ok) {
                const detailData = await detailResponse.json();
                return detailData.cours || c;
              }
              return c;
            } catch (error) {
              console.error(`Erreur lors du chargement des détails du cours ${c.id}:`, error);
              return c;
            }
          })
        );
        cours = coursWithDetails;

        // Charger le quiz du premier cours (s'il existe)
        let quiz = null;
        let quizQuestions = [];
        if (cours.length > 0) {
          const quizResponse = await fetch(`/api/quiz?coursId=${cours[0].id}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });
          if (quizResponse.ok) {
            const quizData = await quizResponse.json();
            quiz = quizData.quiz;
            quizQuestions = quizData.questions || [];
          }
        }

        // Charger l'étude de cas du module
        const etudeCasResponse = await fetch(`/api/etude-cas?moduleId=${moduleId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        let etudeCas = null;
        let etudeCasQuestions = [];
        if (etudeCasResponse.ok) {
          const etudeCasData = await etudeCasResponse.json();
          etudeCas = etudeCasData.etudeCas;
          etudeCasQuestions = etudeCasData.questions || [];
        }

        const sortedCours = cours.sort((a: CoursContenu, b: CoursContenu) => a.ordre_affichage - b.ordre_affichage);
        
        setData({
          module: moduleData?.module || null,
          cours: sortedCours,
          quiz,
          quizQuestions,
          etudeCas,
          etudeCasQuestions,
          bloc
        });
        
        // Afficher le premier cours par défaut
        if (sortedCours.length > 0) {
          setCurrentCoursIndex(0);
          setCurrentView('cours');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadModuleData();
  }, [moduleId, blocId, formationId]);

  // Charger tous les modules du bloc pour la sidebar avec leurs cours
  useEffect(() => {
    const loadAllModules = async () => {
      try {
        const response = await fetch(`/api/modules?blocId=${blocId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const modulesData = await response.json();
          const modulesList = modulesData.modules || [];
          
          // Charger les cours pour chaque module
          const modulesWithCours = await Promise.all(
            modulesList.map(async (mod: ModuleApprentissage) => {
              try {
                const coursResponse = await fetch(`/api/cours?moduleId=${mod.id}`, {
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' }
                });
                if (coursResponse.ok) {
                  const coursData = await coursResponse.json();
                  return {
                    ...mod,
                    cours: (coursData.cours || []).sort((a: CoursContenu, b: CoursContenu) => 
                      a.ordre_affichage - b.ordre_affichage
                    )
                  };
                }
                return { ...mod, cours: [] };
              } catch (error) {
                console.error(`Erreur lors du chargement des cours pour le module ${mod.id}:`, error);
                return { ...mod, cours: [] };
              }
            })
          );
          
          setAllModules(modulesWithCours);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des modules:', error);
      }
    };
    loadAllModules();
  }, [blocId]);

  const currentCours = data.cours[currentCoursIndex];
  const hasPreviousCours = currentCoursIndex > 0;
  const hasNextCours = currentCoursIndex < data.cours.length - 1;
  const hasQuiz = data.quiz !== null;
  const hasEtudeCas = data.etudeCas !== null;

  const handleNext = () => {
    if (currentView === 'cours' && hasNextCours) {
      setCurrentCoursIndex(prev => prev + 1);
    } else if (currentView === 'cours' && hasQuiz) {
      setCurrentView('quiz');
    } else if (currentView === 'quiz' && hasEtudeCas) {
      setCurrentView('etude-cas');
    }
  };

  const handlePrevious = () => {
    if (currentView === 'etude-cas' && hasQuiz) {
      setCurrentView('quiz');
    } else if (currentView === 'quiz' && data.cours.length > 0) {
      setCurrentView('cours');
      setCurrentCoursIndex(data.cours.length - 1);
    } else if (currentView === 'cours' && hasPreviousCours) {
      setCurrentCoursIndex(prev => prev - 1);
    }
  };

  const handleCoursClick = (coursId: number) => {
    // Trouver le cours dans les cours du module actuel
    const targetIndex = data.cours.findIndex((c: CoursContenu) => c.id === coursId);
    
    if (targetIndex !== -1) {
      // Si le cours est dans le module actuel, mettre à jour l'index directement
      setCurrentCoursIndex(targetIndex);
      setCurrentView('cours');
    }
  };


  const handleModuleClick = (clickedModuleId: number) => {
    // Ne rien faire - le clic sur le module ne fait que dérouler les cours
    // La navigation se fait uniquement via les cours
  };

  // Calculer la progression (simulation)
  const progress = data.cours.length > 0
    ? Math.round(((currentCoursIndex + 1) / data.cours.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
          <p className="text-[#032622]">Chargement de la visualisation...</p>
        </div>
      </div>
    );
  }

  if (!data.module) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#032622] text-lg mb-4">Module non trouvé</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 bg-[#032622] text-[#F8F5E4] rounded-lg font-bold uppercase hover:bg-[#032622]/90 transition-colors"
            >
              Retour
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4] flex">
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-[#F8F5E4] border-b border-[#032622]/20">
          <div className="px-6 py-4">
            {/* Bouton retour en haut */}
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[#032622] hover:text-[#032622]/70 transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold uppercase text-sm" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                Retour à la gestion
              </span>
            </button>

            {/* Header principal */}
            <ModulePreviewHeader
              blocNumber={data.bloc ? `BLOC ${data.bloc.numero_bloc}` : 'BLOC'}
              blocTitle={data.bloc?.titre || ''}
              moduleTitle={`MODULE ${data.module.numero_module || data.module.ordre_affichage} - ${data.module.titre}`}
              progress={progress}
            />
          </div>
        </div>

        {/* Contenu principal avec sidebar droite */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Bouton toggle sidebar droite - visible même quand la sidebar est cachée */}
          <button
            onClick={() => setIsSidebarRightCollapsed(prev => !prev)}
            className={`absolute top-4 z-20 p-2  text-[#032622] border-2 border-[#032622] rounded-lg hover:bg-[#032622]/90 transition-all duration-300 ${
              isSidebarRightCollapsed ? 'right-4' : 'right-[340px]'
            }`}
            aria-label={isSidebarRightCollapsed ? 'Ouvrir la sidebar' : 'Fermer la sidebar'}
          >
            {isSidebarRightCollapsed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            )}
          </button>

          {/* Zone de contenu */}
          <div className="flex-1 overflow-y-auto bg-[#F8F5E4]">
            <div className={`mx-auto px-6 py-8 min-h-full transition-all duration-300 w-full ${
              isSidebarRightCollapsed ? 'max-w-full' : 'max-w-6xl'
            }`}>
              {currentView === 'cours' && (
                <div className="relative min-h-[400px]">
                  {currentCours ? (
                    <CourseContentViewer cours={currentCours} isPreview={true} />
                  ) : (
                    <div className="text-center text-[#032622] py-12">
                      <p className="text-lg mb-4">Aucun cours disponible dans ce module</p>
                    </div>
                  )}
                </div>
              )}

              {currentView === 'quiz' && data.quiz && (
                <QuizViewer
                  quiz={data.quiz}
                  questions={data.quizQuestions}
                  isPreview={true}
                />
              )}

              {currentView === 'etude-cas' && data.etudeCas && (
                <EtudeCasViewer
                  etudeCas={data.etudeCas}
                  questions={data.etudeCasQuestions}
                  isPreview={true}
                />
              )}

              {currentView === 'cours' && !currentCours && (
                <div className="text-center text-[#032622] py-12">
                  <p className="text-lg mb-4">Aucun cours disponible dans ce module</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar droite */}
          <div className={`flex-shrink-0 overflow-hidden bg-[#F8F5E4] border-l border-[#032622]/20 transition-all duration-300 ${
            isSidebarRightCollapsed ? 'w-0' : 'w-80'
          }`}>
            {!isSidebarRightCollapsed && (
              <div className="h-full overflow-y-auto">
                <ModulePreviewSidebar
                  modules={allModules}
                  currentModuleId={moduleId}
                  currentCoursId={currentCours?.id}
                  onModuleClick={handleModuleClick}
                  onCoursClick={handleCoursClick}
                  fichiersComplementaires={currentCours?.fichiers_complementaires || []}
                  isCollapsed={isSidebarRightCollapsed}
                  onToggle={() => setIsSidebarRightCollapsed(prev => !prev)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Navigation footer */}
        <ModulePreviewNavigation
          hasPrevious={currentView === 'cours' ? hasPreviousCours : currentView === 'quiz' ? true : hasQuiz}
          hasNext={currentView === 'cours' ? (hasNextCours || hasQuiz) : currentView === 'quiz' ? hasEtudeCas : false}
          onPrevious={handlePrevious}
          onNext={handleNext}
          currentType={currentView}
        />
      </div>
    </div>
  );
};

