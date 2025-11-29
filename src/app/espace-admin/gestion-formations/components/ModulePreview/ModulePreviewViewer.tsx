'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CoursApprentissage, ChapitreCours, QuizEvaluation, EtudeCas } from '@/types/formation-detailed';
import { CourseContentViewer } from './CourseContentViewer';
import { QuizViewer } from './QuizViewer';
import { EtudeCasViewer } from './EtudeCasViewer';
import { ModulePreviewHeader } from './ModulePreviewHeader';
import { ModulePreviewSidebar } from './ModulePreviewSidebar';
import { ModulePreviewNavigation } from './ModulePreviewNavigation';

interface CoursPreviewViewerProps {
  coursId: number;
  formationId: string;
  blocId: string;
  onBack?: () => void;
}

type ViewType = 'cours' | 'quiz' | 'etude-cas';

interface CoursData {
  cours: CoursApprentissage | null;
  chapitres: ChapitreCours[];
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
  coursId,
  formationId,
  blocId,
  onBack
}: CoursPreviewViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<CoursData>({
    cours: null,
    chapitres: [],
    quiz: null,
    quizQuestions: [],
    etudeCas: null,
    etudeCasQuestions: [],
    bloc: null
  });
  const [currentView, setCurrentView] = useState<ViewType>('cours');
  const [currentChapitreIndex, setCurrentChapitreIndex] = useState(0);
  const [allCours, setAllCours] = useState<CoursApprentissage[]>([]);
  const [isSidebarRightCollapsed, setIsSidebarRightCollapsed] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showEtudeCasModal, setShowEtudeCasModal] = useState(false);
  const [quizzesByChapitre, setQuizzesByChapitre] = useState<Map<number, QuizData>>(new Map());
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Charger les données du cours - OPTIMISÉ : Une seule requête au lieu de 5 + 2N + M
  useEffect(() => {
    const loadCoursData = async () => {
      setIsLoading(true);
      try {
        // OPTIMISATION : Utiliser l'endpoint batch qui charge tout en une seule requête (avec fallback)
        let completeData;
        
        try {
          const completeResponse = await fetch(`/api/cours/${coursId}/complete`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });

          // Vérifier que la réponse est bien du JSON et non une page HTML
          const contentType = completeResponse.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Endpoint non disponible, utilisation du système de fallback');
          }

          if (!completeResponse.ok) {
            throw new Error('Endpoint retourne une erreur');
          }

          completeData = await completeResponse.json();
        } catch (error) {
          console.warn('[CoursPreviewViewer] Endpoint /complete non disponible, utilisation du système de fallback:', error);
          
          // FALLBACK : Utiliser l'ancien système avec plusieurs requêtes
          const coursResponse = await fetch(`/api/cours/${coursId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
          const coursData = coursResponse.ok ? await coursResponse.json() : null;

        const blocResponse = await fetch(`/api/blocs?formationId=${formationId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        const blocData = blocResponse.ok ? await blocResponse.json() : null;
        const bloc = blocData?.blocs?.find((b: any) => b.id === parseInt(blocId)) || null;

          const chapitresResponse = await fetch(`/api/chapitres?coursId=${coursId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
          const chapitresData = chapitresResponse.ok ? await chapitresResponse.json() : null;
          let chapitres = chapitresData?.chapitres || [];

        const quizzesMap = new Map<number, QuizData>();
        await Promise.all(
            chapitres.map(async (ch: ChapitreCours) => {
            try {
                const quizResponse = await fetch(`/api/quiz?chapitreId=${ch.id}`, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
              });
              if (quizResponse.ok) {
                const quizData = await quizResponse.json();
                if (quizData.quiz) {
                    quizzesMap.set(ch.id, {
                    quiz: quizData.quiz,
                    questions: quizData.questions || []
                  });
                }
              }
            } catch (error) {
                console.error(`Erreur lors du chargement du quiz pour le chapitre ${ch.id}:`, error);
            }
          })
        );
          setQuizzesByChapitre(quizzesMap);

          // Charger l'étude de cas au niveau cours (chapitreId = 0 signifie chapitre_id IS NULL)
          let etudeCas = null;
          let etudeCasQuestions = [];
          const etudeCasResponse = await fetch(`/api/etude-cas?chapitreId=0`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });
          if (etudeCasResponse.ok) {
            const etudeCasData = await etudeCasResponse.json();
            etudeCas = etudeCasData.etudeCas;
            etudeCasQuestions = etudeCasData.questions || [];
          }

          const sortedChapitres = chapitres.sort((a: ChapitreCours, b: ChapitreCours) => a.ordre_affichage - b.ordre_affichage);
          
        let quiz = null;
        let quizQuestions = [];
          if (chapitres.length > 0 && quizzesMap.has(chapitres[0].id)) {
            const firstQuizData = quizzesMap.get(chapitres[0].id)!;
          quiz = firstQuizData.quiz;
          quizQuestions = firstQuizData.questions;
          setCurrentQuiz(firstQuizData);
        } else {
          setCurrentQuiz(null);
        }

          setData({
            cours: coursData?.cours || null,
            chapitres: sortedChapitres,
            quiz,
            quizQuestions,
            etudeCas,
            etudeCasQuestions,
            bloc
          });
          
          if (sortedChapitres.length > 0) {
            setCurrentChapitreIndex(0);
            setCurrentView('cours');
          }
          
          setIsLoading(false);
          return;
        }
        
        if (completeData && completeData.cours) {
        
        console.log('[CoursPreviewViewer] Données reçues:', {
          chapitresCount: completeData.cours.chapitres?.length || 0,
          hasEtudeCas: !!completeData.cours.etude_cas
        });
        
        // Extraire les données de la réponse
        const cours = completeData.cours;
        const chapitres = cours.chapitres || [];
        const etudeCas = cours.etude_cas;
        const etudeCasQuestions = cours.etude_cas_questions || [];

        // Convertir les quiz des chapitres en Map pour faciliter l'accès
        const quizzesMap = new Map<number, QuizData>();
        chapitres.forEach((chapitre: any) => {
          if (chapitre.quizzes && chapitre.quizzes.length > 0) {
            const quizData = chapitre.quizzes[0];
            quizzesMap.set(chapitre.id, {
              quiz: quizData.quiz || quizData,
              questions: quizData.questions || []
            });
            console.log(`[CoursPreviewViewer] Quiz chargé pour chapitre ${chapitre.id}:`, quizData.quiz?.titre || quizData.titre);
          }
        });
        console.log(`[CoursPreviewViewer] Total quiz chargés: ${quizzesMap.size}`);
        setQuizzesByChapitre(quizzesMap);

        // Charger le quiz du premier chapitre pour l'affichage initial
        let quiz = null;
        let quizQuestions = [];
        if (chapitres.length > 0 && quizzesMap.has(chapitres[0].id)) {
          const firstQuizData = quizzesMap.get(chapitres[0].id)!;
          quiz = firstQuizData.quiz;
          quizQuestions = firstQuizData.questions;
          setCurrentQuiz(firstQuizData);
        } else {
          setCurrentQuiz(null);
        }

        // Extraire le bloc depuis les données du cours
        const bloc = cours.blocs_competences ? {
          numero_bloc: cours.blocs_competences.numero_bloc,
          titre: cours.blocs_competences.titre
        } : null;

        const sortedChapitres = chapitres.sort((a: ChapitreCours, b: ChapitreCours) => a.ordre_affichage - b.ordre_affichage);
        
        setData({
          cours: cours || null,
          chapitres: sortedChapitres,
          quiz,
          quizQuestions,
          etudeCas,
          etudeCasQuestions,
          bloc
        });
        
        // Afficher le premier chapitre par défaut
        if (sortedChapitres.length > 0) {
          setCurrentChapitreIndex(0);
          setCurrentView('cours');
        }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCoursData();
  }, [coursId, blocId, formationId]);

  // Charger tous les cours du bloc pour la sidebar - OPTIMISÉ : Une seule requête au lieu de M + M×N
  useEffect(() => {
    const loadAllCours = async () => {
      try {
        // OPTIMISATION : Utiliser l'endpoint batch qui charge tous les cours avec leurs chapitres en une seule requête
        const response = await fetch(`/api/blocs/${blocId}/cours-complete?preview=true`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          const coursList = data.cours || [];
          
          // Les cours sont déjà chargés avec leurs chapitres, quiz et études de cas
          // Il suffit de formater les données pour la sidebar
          const coursWithChapitres = coursList.map((c: any) => ({
            ...c,
            chapitres: (c.chapitres || []).sort((a: ChapitreCours, b: ChapitreCours) => 
                      a.ordre_affichage - b.ordre_affichage
                    )
          }));
          
          setAllCours(coursWithChapitres);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des cours:', error);
      }
    };
    loadAllCours();
  }, [blocId]);

  const currentChapitre = data.chapitres[currentChapitreIndex];
  const hasPreviousChapitre = currentChapitreIndex > 0;
  const hasNextChapitre = currentChapitreIndex < data.chapitres.length - 1;
  const hasQuizForCurrentChapitre = currentChapitre ? quizzesByChapitre.has(currentChapitre.id) : false;
  const hasEtudeCas = data.etudeCas !== null;

  // Charger le quiz du chapitre actuel quand on change de chapitre
  useEffect(() => {
    if (currentChapitre && currentView === 'cours') {
      const quizData = quizzesByChapitre.get(currentChapitre.id);
      if (quizData) {
        setCurrentQuiz(quizData);
      } else {
        setCurrentQuiz(null);
      }
      // Réinitialiser quizCompleted quand on change de chapitre
      setQuizCompleted(false);
    }
  }, [currentChapitreIndex, currentChapitre, quizzesByChapitre, currentView]);

  const handleNext = () => {
    if (currentView === 'cours') {
      // Si le chapitre actuel a un quiz, afficher le modal avant de passer au chapitre suivant
      if (hasQuizForCurrentChapitre) {
        setShowQuizModal(true);
      } else if (hasNextChapitre) {
        // Pas de quiz pour ce chapitre, passer directement au chapitre suivant
        setCurrentChapitreIndex(prev => prev + 1);
      } else if (hasEtudeCas) {
        // Plus de chapitres, afficher le modal avant de passer à l'étude de cas
        setShowEtudeCasModal(true);
      }
    } else if (currentView === 'quiz') {
      // Si le quiz est terminé (showResults), passer au chapitre suivant ou à l'étude de cas
      if (quizCompleted) {
        if (hasNextChapitre) {
          setCurrentView('cours');
          setCurrentChapitreIndex(prev => prev + 1);
          setQuizCompleted(false);
        } else if (hasEtudeCas) {
          setShowEtudeCasModal(true);
          setQuizCompleted(false);
        } else {
          // Plus rien après, revenir au chapitre
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
    // L'utilisateur reste sur le chapitre actuel
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
      // Retourner au dernier quiz ou au dernier chapitre
      const lastChapitre = data.chapitres[data.chapitres.length - 1];
      if (lastChapitre && quizzesByChapitre.has(lastChapitre.id)) {
        setCurrentView('quiz');
        setCurrentChapitreIndex(data.chapitres.length - 1);
      } else {
        setCurrentView('cours');
        setCurrentChapitreIndex(data.chapitres.length - 1);
      }
    } else if (currentView === 'quiz' && currentChapitre) {
      // Retourner au chapitre actuel
      setCurrentView('cours');
    } else if (currentView === 'cours' && hasPreviousChapitre) {
      setCurrentChapitreIndex(prev => prev - 1);
    }
  };

  const handleChapitreClick = (chapitreId: number) => {
    // Trouver le chapitre dans les chapitres du cours actuel
    const targetIndex = data.chapitres.findIndex((ch: ChapitreCours) => ch.id === chapitreId);
    
    if (targetIndex !== -1) {
      // Si le chapitre est dans le cours actuel, mettre à jour l'index directement
      setCurrentChapitreIndex(targetIndex);
      setCurrentView('cours');
    }
  };

  const handleQuizClick = (chapitreId: number) => {
    // Trouver le chapitre dans les chapitres du cours actuel
    const targetIndex = data.chapitres.findIndex((ch: ChapitreCours) => ch.id === chapitreId);
    
    if (targetIndex !== -1) {
      // Aller au chapitre associé
      setCurrentChapitreIndex(targetIndex);
      setCurrentView('cours');
      
      // Vérifier si ce chapitre a un quiz et afficher le modal de prévention
      const quizData = quizzesByChapitre.get(chapitreId);
      if (quizData) {
        setCurrentQuiz(quizData);
        setShowQuizModal(true);
      }
    }
  };

  const handleEtudeCasClick = (coursIdOrChapitreId: number, etudeCasId?: number) => {
    // Si c'est le cours actuel (même ID que coursId), afficher le modal ou aller directement à l'étude de cas
    // L'étude de cas est maintenant au niveau cours, pas au niveau chapitre
    if (coursIdOrChapitreId === coursId) {
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
    // L'utilisateur reste sur le chapitre actuel
  };

  const handleCoursClick = (clickedCoursId: number) => {
    // Ne rien faire - le clic sur le cours ne fait que dérouler les chapitres
    // La navigation se fait uniquement via les chapitres
  };

  // Calculer la progression (simulation)
  const progress = data.chapitres.length > 0
    ? Math.round(((currentChapitreIndex + 1) / data.chapitres.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#032622] mx-auto mb-3 sm:mb-4"></div>
          <p className="text-xs sm:text-sm md:text-base text-[#032622] break-words">Chargement de la visualisation...</p>
        </div>
      </div>
    );
  }

  if (!data.cours) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <p className="text-sm sm:text-base md:text-lg text-[#032622] mb-3 sm:mb-4 break-words">Cours non trouvé</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-[#032622] text-[#F8F5E4] text-xs sm:text-sm md:text-base rounded-lg font-bold uppercase hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors"
            >
              Retour
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4] flex flex-col lg:flex-row">
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-[#F8F5E4] border-b border-[#032622]/20">
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            {/* Bouton retour en haut */}
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 sm:gap-2 text-[#032622] hover:text-[#032622]/70 active:text-[#032622]/50 transition-colors mb-3 sm:mb-4"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-bold uppercase text-xs sm:text-sm break-words" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                Retour à la gestion
              </span>
            </button>

            {/* Header principal */}
            <ModulePreviewHeader
              blocNumber={data.bloc ? `BLOC ${data.bloc.numero_bloc}` : 'BLOC'}
              blocTitle={data.bloc?.titre || ''}
              moduleTitle={`COURS ${data.cours.numero_cours || data.cours.ordre_affichage} - ${data.cours.titre}`}
              progress={progress}
            />
          </div>
        </div>

        {/* Contenu principal avec sidebar droite */}
        <div className="flex-1 flex overflow-hidden relative">
           {/* Bouton toggle sidebar droite - visible même quand la sidebar est cachée */}
           <button
             onClick={() => setIsSidebarRightCollapsed(prev => !prev)}
             className={`absolute top-2 sm:top-4 z-20 p-1.5 sm:p-2 bg-[#F8F5E4] text-[#032622] border-2 border-[#032622] hover:bg-[#032622] hover:text-[#F8F5E4] active:bg-[#032622]/80 transition-all duration-300 ${
               isSidebarRightCollapsed ? 'right-2 sm:right-4' : 'right-[calc(100%-16px)] sm:right-[400px]'
             }`}
             aria-label={isSidebarRightCollapsed ? 'Ouvrir la sidebar' : 'Fermer la sidebar'}
           >
            {isSidebarRightCollapsed ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            )}
          </button>

          {/* Zone de contenu avec navigation */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#F8F5E4]">
            <div className="flex-1 overflow-y-auto">
              <div className={`mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 min-h-full transition-all duration-300 w-full ${
                isSidebarRightCollapsed ? 'max-w-full' : 'max-w-6xl'
              }`}>
                {currentView === 'cours' && (
                  <div className="relative min-h-[300px] sm:min-h-[400px]">
                    {currentChapitre ? (
                      <CourseContentViewer cours={currentChapitre} isPreview={true} />
                    ) : (
                      <div className="text-center text-[#032622] py-8 sm:py-10 md:py-12">
                        <p className="text-sm sm:text-base md:text-lg mb-3 sm:mb-4 break-words">Aucun chapitre disponible dans ce cours</p>
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

                {currentView === 'cours' && !currentChapitre && (
                  <div className="text-center text-[#032622] py-8 sm:py-10 md:py-12">
                    <p className="text-sm sm:text-base md:text-lg mb-3 sm:mb-4 break-words">Aucun chapitre disponible dans ce cours</p>
                  </div>
                )}
              </div>
            </div>
            
        {/* Navigation footer */}
        <ModulePreviewNavigation
          hasPrevious={currentView === 'cours' ? hasPreviousChapitre : currentView === 'quiz' ? true : currentView === 'etude-cas' ? true : false}
          hasNext={currentView === 'cours' ? (hasNextChapitre || hasQuizForCurrentChapitre || (hasEtudeCas && !hasNextChapitre && !hasQuizForCurrentChapitre)) : currentView === 'quiz' ? quizCompleted : currentView === 'etude-cas' ? false : false}
          onPrevious={handlePrevious}
          onNext={handleNext}
          currentType={currentView}
          quizCompleted={quizCompleted}
          showEtudeCasButton={currentView === 'cours' && !hasNextChapitre && !hasQuizForCurrentChapitre && hasEtudeCas}
        />
          </div>

          {/* Sidebar droite */}
          <div className={`hidden lg:flex flex-shrink-0 overflow-hidden bg-[#F8F5E4] border-l border-[#032622]/20 transition-all duration-300 ${
            isSidebarRightCollapsed ? 'w-0' : 'w-full lg:w-80 xl:w-96'
          }`}>
            {!isSidebarRightCollapsed && (
              <div className="h-full overflow-y-auto w-full">
                <ModulePreviewSidebar
                  cours={allCours}
                  currentCoursId={coursId}
                  currentChapitreId={currentChapitre?.id}
                  onCoursClick={handleCoursClick}
                  onChapitreClick={handleChapitreClick}
                  onQuizClick={handleQuizClick}
                  onEtudeCasClick={handleEtudeCasClick}
                  fichiersComplementaires={currentChapitre?.fichiers_complementaires || []}
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={(e) => {
            // Fermer le modal si on clique sur le fond (pas sur le contenu)
            if (e.target === e.currentTarget) {
              setShowQuizModal(false);
            }
          }}
        >
          <div 
            className="bg-[#F8F5E4] border-2 sm:border-4 border-[#032622] p-4 sm:p-6 md:p-8 max-w-3xl w-full mx-0 sm:mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 
              className="text-lg sm:text-xl md:text-2xl font-bold text-[#032622] mb-3 sm:mb-4 text-center uppercase break-words"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              TU ARRIVES AU QUIZ
            </h3>
            <p className="text-sm sm:text-base text-[#032622] mb-4 sm:mb-5 md:mb-6 text-center break-words">
              Prêt à tester tes connaissances ?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
              <button
                onClick={handleContinueReading}
                className="flex-1 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-[#F8F5E4] border-2 border-[#032622] text-xs sm:text-sm md:text-base text-[#032622] font-bold uppercase hover:bg-[#F8F5E4]/90 active:bg-[#F8F5E4]/80 transition-colors"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                RÉVISER ENCORE
              </button>
              <button
                onClick={handleGoToQuiz}
                className="flex-1 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-[#032622] text-xs sm:text-sm md:text-base text-[#F8F5E4] font-bold uppercase hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors"
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={(e) => {
            // Fermer le modal si on clique sur le fond (pas sur le contenu)
            if (e.target === e.currentTarget) {
              setShowEtudeCasModal(false);
            }
          }}
        >
          <div 
            className="bg-[#F8F5E4] border-2 sm:border-4 border-[#032622] p-4 sm:p-6 md:p-8 max-w-3xl w-full mx-0 sm:mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 
              className="text-lg sm:text-xl md:text-2xl font-bold text-[#032622] mb-3 sm:mb-4 text-center uppercase break-words"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              TU ARRIVES À L'ÉTUDE DE CAS
            </h3>
            <p className="text-sm sm:text-base text-[#032622] mb-4 sm:mb-5 md:mb-6 text-center break-words">
              Prêt à commencer l'étude de cas du module ?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
              <button
                onClick={handleContinueToEtudeCas}
                className="flex-1 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-[#F8F5E4] border-2 border-[#032622] text-xs sm:text-sm md:text-base text-[#032622] font-bold uppercase hover:bg-[#F8F5E4]/90 active:bg-[#F8F5E4]/80 transition-colors"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                CONTINUER À RÉVISER
              </button>
              <button
                onClick={handleGoToEtudeCas}
                className="flex-1 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-[#032622] text-xs sm:text-sm md:text-base text-[#F8F5E4] font-bold uppercase hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors"
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

