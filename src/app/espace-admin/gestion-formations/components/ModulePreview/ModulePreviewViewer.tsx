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

interface QuizData {
  quiz: QuizEvaluation;
  questions: any[];
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
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showEtudeCasModal, setShowEtudeCasModal] = useState(false);
  const [quizzesByCours, setQuizzesByCours] = useState<Map<number, QuizData>>(new Map());
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

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

        // Charger les quiz pour tous les cours
        const quizzesMap = new Map<number, QuizData>();
        await Promise.all(
          cours.map(async (c: CoursContenu) => {
            try {
              const quizResponse = await fetch(`/api/quiz?coursId=${c.id}`, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
              });
              if (quizResponse.ok) {
                const quizData = await quizResponse.json();
                if (quizData.quiz) {
                  quizzesMap.set(c.id, {
                    quiz: quizData.quiz,
                    questions: quizData.questions || []
                  });
                }
              }
            } catch (error) {
              console.error(`Erreur lors du chargement du quiz pour le cours ${c.id}:`, error);
            }
          })
        );
        setQuizzesByCours(quizzesMap);

        // Charger le quiz du premier cours pour l'affichage initial
        let quiz = null;
        let quizQuestions = [];
        if (cours.length > 0 && quizzesMap.has(cours[0].id)) {
          const firstQuizData = quizzesMap.get(cours[0].id)!;
          quiz = firstQuizData.quiz;
          quizQuestions = firstQuizData.questions;
          setCurrentQuiz(firstQuizData);
        } else {
          setCurrentQuiz(null);
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
  const hasQuizForCurrentCours = currentCours ? quizzesByCours.has(currentCours.id) : false;
  const hasEtudeCas = data.etudeCas !== null;

  // Charger le quiz du cours actuel quand on change de cours
  useEffect(() => {
    if (currentCours && currentView === 'cours') {
      const quizData = quizzesByCours.get(currentCours.id);
      if (quizData) {
        setCurrentQuiz(quizData);
      } else {
        setCurrentQuiz(null);
      }
      // Réinitialiser quizCompleted quand on change de cours
      setQuizCompleted(false);
    }
  }, [currentCoursIndex, currentCours, quizzesByCours, currentView]);

  const handleNext = () => {
    if (currentView === 'cours') {
      // Si le cours actuel a un quiz, afficher le modal avant de passer au cours suivant
      if (hasQuizForCurrentCours) {
        setShowQuizModal(true);
      } else if (hasNextCours) {
        // Pas de quiz pour ce cours, passer directement au cours suivant
        setCurrentCoursIndex(prev => prev + 1);
      } else if (hasEtudeCas) {
        // Plus de cours, afficher le modal avant de passer à l'étude de cas
        setShowEtudeCasModal(true);
      }
    } else if (currentView === 'quiz') {
      // Si le quiz est terminé (showResults), passer au cours suivant ou à l'étude de cas
      if (quizCompleted) {
        if (hasNextCours) {
          setCurrentView('cours');
          setCurrentCoursIndex(prev => prev + 1);
          setQuizCompleted(false);
        } else if (hasEtudeCas) {
          setShowEtudeCasModal(true);
          setQuizCompleted(false);
        } else {
          // Plus rien après, revenir au cours
          setCurrentView('cours');
          setQuizCompleted(false);
        }
      } else {
        // Le quiz n'est pas encore terminé, la navigation sera gérée par QuizViewer
        // On reste sur le quiz
      }
    } else if (currentView === 'etude-cas' && hasEtudeCas) {
      // Fin de l'étude de cas
      // Ne rien faire ou gérer selon les besoins
    }
  };

  const handleContinueReading = () => {
    setShowQuizModal(false);
    // L'utilisateur reste sur le cours actuel
  };

  const handleGoToQuiz = () => {
    setShowQuizModal(false);
    setCurrentView('quiz');
    setQuizCompleted(false); // Réinitialiser l'état du quiz
  };


  // Gérer la fermeture des modals avec la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showQuizModal) {
          setShowQuizModal(false);
        }
        if (showEtudeCasModal) {
          setShowEtudeCasModal(false);
        }
      }
    };

    if (showQuizModal || showEtudeCasModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showQuizModal, showEtudeCasModal]);

  const handlePrevious = () => {
    if (currentView === 'etude-cas' && hasEtudeCas) {
      // Retourner au dernier quiz ou au dernier cours
      const lastCours = data.cours[data.cours.length - 1];
      if (lastCours && quizzesByCours.has(lastCours.id)) {
        setCurrentView('quiz');
        setCurrentCoursIndex(data.cours.length - 1);
      } else {
        setCurrentView('cours');
        setCurrentCoursIndex(data.cours.length - 1);
      }
    } else if (currentView === 'quiz' && currentCours) {
      // Retourner au cours actuel
      setCurrentView('cours');
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

  const handleQuizClick = (coursId: number) => {
    // Trouver le cours dans les cours du module actuel
    const targetIndex = data.cours.findIndex((c: CoursContenu) => c.id === coursId);
    
    if (targetIndex !== -1) {
      // Aller au cours associé
      setCurrentCoursIndex(targetIndex);
      setCurrentView('cours');
      
      // Vérifier si ce cours a un quiz et afficher le modal de prévention
      const quizData = quizzesByCours.get(coursId);
      if (quizData) {
        setCurrentQuiz(quizData);
        setShowQuizModal(true);
      }
    }
  };

  const handleEtudeCasClick = (moduleIdClicked: number) => {
    // Si c'est le module actuel, afficher le modal ou aller directement à l'étude de cas
    if (moduleIdClicked === moduleId) {
      // Vérifier si l'étude de cas existe dans les données
      const etudeCasInData = data.etudeCas;
      if (etudeCasInData || hasEtudeCas) {
        // Afficher le modal de confirmation
        setShowEtudeCasModal(true);
      } else {
        // Si l'étude de cas n'existe pas encore, aller quand même à la vue (elle sera chargée)
        setCurrentView('etude-cas');
      }
    }
  };

  const handleGoToEtudeCas = () => {
    setShowEtudeCasModal(false);
    setCurrentView('etude-cas');
  };

  const handleContinueToEtudeCas = () => {
    setShowEtudeCasModal(false);
    // L'utilisateur reste sur le cours actuel
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
             className={`absolute top-4 z-20 p-2  text-[#032622] border-2 border-[#032622] hover:bg-[#032622]/90 transition-all duration-300 ${
               isSidebarRightCollapsed ? 'right-4' : 'right-[400px]'
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

          {/* Zone de contenu avec navigation */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#F8F5E4]">
            <div className="flex-1 overflow-y-auto">
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

                {currentView === 'quiz' && currentQuiz && (
                  <QuizViewer
                    quiz={currentQuiz.quiz}
                    questions={currentQuiz.questions}
                    isPreview={true}
                    onQuizComplete={() => {
                      setQuizCompleted(true);
                    }}
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
            
        {/* Navigation footer */}
        <ModulePreviewNavigation
          hasPrevious={currentView === 'cours' ? hasPreviousCours : currentView === 'quiz' ? true : currentView === 'etude-cas' ? true : false}
          hasNext={currentView === 'cours' ? (hasNextCours || hasQuizForCurrentCours || (hasEtudeCas && !hasNextCours && !hasQuizForCurrentCours)) : currentView === 'quiz' ? quizCompleted : currentView === 'etude-cas' ? false : false}
          onPrevious={handlePrevious}
          onNext={handleNext}
          currentType={currentView}
          quizCompleted={quizCompleted}
          showEtudeCasButton={currentView === 'cours' && !hasNextCours && !hasQuizForCurrentCours && hasEtudeCas}
        />
          </div>

          {/* Sidebar droite */}
          <div className={`flex-shrink-0 overflow-hidden bg-[#F8F5E4] border-l border-[#032622]/20 transition-all duration-300 ${
            isSidebarRightCollapsed ? 'w-0' : 'w-96'
          }`}>
            {!isSidebarRightCollapsed && (
              <div className="h-full overflow-y-auto">
                <ModulePreviewSidebar
                  modules={allModules}
                  currentModuleId={moduleId}
                  currentCoursId={currentCours?.id}
                  onModuleClick={handleModuleClick}
                  onCoursClick={handleCoursClick}
                  onQuizClick={handleQuizClick}
                  onEtudeCasClick={handleEtudeCasClick}
                  fichiersComplementaires={currentCours?.fichiers_complementaires || []}
                  isCollapsed={isSidebarRightCollapsed}
                  onToggle={() => setIsSidebarRightCollapsed(prev => !prev)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation pour passer au quiz */}
      {showQuizModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            // Fermer le modal si on clique sur le fond (pas sur le contenu)
            if (e.target === e.currentTarget) {
              setShowQuizModal(false);
            }
          }}
        >
          <div 
            className="bg-[#F8F5E4] border-4 border-[#032622] p-8 max-w-3xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 
              className="text-2xl font-bold text-[#032622] mb-4 text-center uppercase"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              TU ARRIVES AU QUIZ
            </h3>
            <p className="text-[#032622] mb-6 text-center">
              Prêt à tester tes connaissances ?
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleContinueReading}
                className="flex-1 px-6 py-3 bg-[#F8F5E4] border-2 border-[#032622] text-[#032622] font-bold uppercase hover:bg-[#F8F5E4]/90 transition-colors"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                RÉVISER ENCORE
              </button>
              <button
                onClick={handleGoToQuiz}
                className="flex-1 px-6 py-3 bg-[#032622] text-[#F8F5E4] font-bold uppercase hover:bg-[#032622]/90 transition-colors"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                COMMENCER LE QUIZ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation pour passer à l'étude de cas */}
      {showEtudeCasModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            // Fermer le modal si on clique sur le fond (pas sur le contenu)
            if (e.target === e.currentTarget) {
              setShowEtudeCasModal(false);
            }
          }}
        >
          <div 
            className="bg-[#F8F5E4] border-4 border-[#032622] p-8 max-w-3xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 
              className="text-2xl font-bold text-[#032622] mb-4 text-center uppercase"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              TU ARRIVES À L'ÉTUDE DE CAS
            </h3>
            <p className="text-[#032622] mb-6 text-center">
              Prêt à commencer l'étude de cas du module ?
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleContinueToEtudeCas}
                className="flex-1 px-6 py-3 bg-[#F8F5E4] border-2 border-[#032622] text-[#032622] font-bold uppercase hover:bg-[#F8F5E4]/90 transition-colors"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                CONTINUER À RÉVISER
              </button>
              <button
                onClick={handleGoToEtudeCas}
                className="flex-1 px-6 py-3 bg-[#032622] text-[#F8F5E4] font-bold uppercase hover:bg-[#032622]/90 transition-colors"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                COMMENCER L'ÉTUDE DE CAS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

