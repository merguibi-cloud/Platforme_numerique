'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CoursApprentissage, ChapitreCours, QuizEvaluation, EtudeCas } from '@/types/formation-detailed';
import { CourseContentViewer } from '@/app/espace-admin/gestion-formations/components/ModulePreview/CourseContentViewer';
import { QuizViewer } from '@/app/espace-admin/gestion-formations/components/ModulePreview/QuizViewer';
import { EtudeCasViewer } from '@/app/espace-admin/gestion-formations/components/ModulePreview/EtudeCasViewer';
import { ModulePreviewHeader } from '@/app/espace-admin/gestion-formations/components/ModulePreview/ModulePreviewHeader';
import { ModulePreviewSidebar } from '@/app/espace-admin/gestion-formations/components/ModulePreview/ModulePreviewSidebar';
import { ModulePreviewNavigation } from '@/app/espace-admin/gestion-formations/components/ModulePreview/ModulePreviewNavigation';
import { Modal } from '@/app/Modal';

interface StudentCourseViewerProps {
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

export const StudentCourseViewer = ({
  coursId,
  formationId,
  blocId,
  onBack
}: StudentCourseViewerProps) => {
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
  
  // États pour les modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showNextCourseModal, setShowNextCourseModal] = useState(false);
  const [nextCourse, setNextCourse] = useState<{ id: number; titre: string } | null>(null);
  const [blocCompleted, setBlocCompleted] = useState(false);
  
  // Timer pour suivre le temps passé dans le bloc
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const [tempsPasseMinutes, setTempsPasseMinutes] = useState(0);
  
  const router = useRouter();

  // Démarrer le timer quand on entre dans le cours
  useEffect(() => {
    if (!isLoading && data.cours) {
      startTimeRef.current = new Date();
      
      // Envoyer un événement de démarrage
      trackProgression('start_cours', 0);
      
      // Mettre à jour le temps toutes les minutes
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000 / 60);
          setTempsPasseMinutes(elapsed);
          trackProgression('time_update', elapsed);
        }
      }, 60000); // Toutes les minutes
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isLoading, data.cours]);

  // Fonction pour enregistrer la progression
  const trackProgression = async (action: string, tempsPasse?: number) => {
    try {
      const currentChapitre = data.chapitres[currentChapitreIndex];
      const response = await fetch('/api/espace-etudiant/progression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bloc_id: parseInt(blocId),
          cours_id: coursId,
          chapitre_id: currentChapitre?.id,
          action: action,
          temps_passe_minutes: tempsPasse !== undefined ? tempsPasse : tempsPasseMinutes,
          date_jour: new Date().toISOString().split('T')[0]
        })
      });

      if (!response.ok) {
        console.error('Erreur lors de l\'enregistrement de la progression');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la progression:', error);
    }
  };

  // Charger les données du cours
  useEffect(() => {
    const loadCoursData = async () => {
      setIsLoading(true);
      try {
        let completeData;
        
        try {
          const completeResponse = await fetch(`/api/cours/${coursId}/complete`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });

          const contentType = completeResponse.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Endpoint non disponible');
          }

          if (!completeResponse.ok) {
            throw new Error('Endpoint retourne une erreur');
          }

          completeData = await completeResponse.json();
        } catch (error) {
          console.warn('[StudentCourseViewer] Endpoint /complete non disponible, utilisation du fallback:', error);
          
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
          const cours = completeData.cours;
          const chapitres = cours.chapitres || [];
          const etudeCas = cours.etude_cas;
          const etudeCasQuestions = cours.etude_cas_questions || [];

          const quizzesMap = new Map<number, QuizData>();
          chapitres.forEach((chapitre: any) => {
            if (chapitre.quizzes && chapitre.quizzes.length > 0) {
              const quizData = chapitre.quizzes[0];
              quizzesMap.set(chapitre.id, {
                quiz: quizData.quiz || quizData,
                questions: quizData.questions || []
              });
            }
          });
          setQuizzesByChapitre(quizzesMap);

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

  // Charger tous les cours du bloc
  useEffect(() => {
    const loadAllCours = async () => {
      try {
        const response = await fetch(`/api/blocs/${blocId}/cours-complete`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          const coursList = data.cours || [];
          
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

  // Enregistrer quand on change de chapitre
  useEffect(() => {
    if (currentChapitre && currentView === 'cours') {
      trackProgression('view_chapitre', tempsPasseMinutes);
      
      const quizData = quizzesByChapitre.get(currentChapitre.id);
      if (quizData) {
        setCurrentQuiz(quizData);
      } else {
        setCurrentQuiz(null);
      }
      setQuizCompleted(false);
    }
  }, [currentChapitreIndex, currentChapitre, quizzesByChapitre, currentView]);

  // Enregistrer quand on quitte la page
  useEffect(() => {
    const handleBeforeUnload = () => {
      trackProgression('change_page', tempsPasseMinutes);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Enregistrer le temps final
      trackProgression('change_page', tempsPasseMinutes);
    };
  }, [tempsPasseMinutes]);

  const handleNext = () => {
    if (currentView === 'cours') {
      if (hasQuizForCurrentChapitre) {
        setShowQuizModal(true);
      } else if (hasNextChapitre) {
        setCurrentChapitreIndex(prev => prev + 1);
        trackProgression('change_page', tempsPasseMinutes);
      } else if (hasEtudeCas) {
        setShowEtudeCasModal(true);
      }
    } else if (currentView === 'quiz') {
      if (quizCompleted) {
        if (hasNextChapitre) {
          setCurrentView('cours');
          setCurrentChapitreIndex(prev => prev + 1);
          setQuizCompleted(false);
          trackProgression('change_page', tempsPasseMinutes);
        } else if (hasEtudeCas) {
          setShowEtudeCasModal(true);
          setQuizCompleted(false);
        } else {
          setCurrentView('cours');
          setQuizCompleted(false);
        }
      }
    }
  };

  const handleContinueReading = () => {
    setShowQuizModal(false);
  };

  const handleGoToQuiz = () => {
    setShowQuizModal(false);
    setCurrentView('quiz');
    setQuizCompleted(false);
    trackProgression('change_page', tempsPasseMinutes);
  };

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
      const lastChapitre = data.chapitres[data.chapitres.length - 1];
      if (lastChapitre && quizzesByChapitre.has(lastChapitre.id)) {
        setCurrentView('quiz');
        setCurrentChapitreIndex(data.chapitres.length - 1);
      } else {
        setCurrentView('cours');
        setCurrentChapitreIndex(data.chapitres.length - 1);
      }
      trackProgression('change_page', tempsPasseMinutes);
    } else if (currentView === 'quiz' && currentChapitre) {
      setCurrentView('cours');
      trackProgression('change_page', tempsPasseMinutes);
    } else if (currentView === 'cours' && hasPreviousChapitre) {
      setCurrentChapitreIndex(prev => prev - 1);
      trackProgression('change_page', tempsPasseMinutes);
    }
  };

  const handleChapitreClick = (chapitreId: number) => {
    const targetIndex = data.chapitres.findIndex((ch: ChapitreCours) => ch.id === chapitreId);
    
    if (targetIndex !== -1) {
      setCurrentChapitreIndex(targetIndex);
      setCurrentView('cours');
      trackProgression('change_page', tempsPasseMinutes);
    }
  };

  const handleQuizClick = (chapitreId: number) => {
    const targetIndex = data.chapitres.findIndex((ch: ChapitreCours) => ch.id === chapitreId);
    
    if (targetIndex !== -1) {
      setCurrentChapitreIndex(targetIndex);
      setCurrentView('cours');
      
      const quizData = quizzesByChapitre.get(chapitreId);
      if (quizData) {
        setCurrentQuiz(quizData);
        setShowQuizModal(true);
      }
    }
  };

  const handleEtudeCasClick = (coursIdOrChapitreId: number, etudeCasId?: number) => {
    if (coursIdOrChapitreId === coursId) {
      const etudeCasInData = data.etudeCas;
      if (etudeCasInData || hasEtudeCas) {
        setShowEtudeCasModal(true);
      } else {
        setCurrentView('etude-cas');
        trackProgression('change_page', tempsPasseMinutes);
      }
    }
  };

  const handleGoToEtudeCas = () => {
    setShowEtudeCasModal(false);
    setCurrentView('etude-cas');
    trackProgression('change_page', tempsPasseMinutes);
  };

  const handleContinueToEtudeCas = () => {
    setShowEtudeCasModal(false);
  };

  const handleCoursClick = (clickedCoursId: number) => {
    // Ne rien faire - le clic sur le cours ne fait que dérouler les chapitres
  };

  // Fonction pour soumettre le quiz
  const handleQuizSubmit = async (reponses: { [questionId: number]: number[] }, tempsPasse: number) => {
    if (!currentQuiz) return;

    try {
      const response = await fetch('/api/espace-etudiant/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          quiz_id: currentQuiz.quiz.id,
          reponses: reponses,
          temps_passe_minutes: tempsPasse,
          date_debut: startTimeRef.current?.toISOString(),
          date_fin: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Quiz soumis avec succès:', result);
        setQuizCompleted(true);
      } else {
        console.error('Erreur lors de la soumission du quiz');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du quiz:', error);
    }
  };

  // Fonction pour trouver le prochain cours dans le bloc
  const findNextCourse = () => {
    const currentIndex = allCours.findIndex(c => c.id === coursId);
    if (currentIndex !== -1 && currentIndex < allCours.length - 1) {
      return allCours[currentIndex + 1];
    }
    return null;
  };

  // Fonction pour vérifier si le bloc est complété à 100%
  const checkBlocCompletion = async () => {
    try {
      const response = await fetch(`/api/espace-etudiant/blocs`, {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        const currentBloc = result.blocs?.find((b: any) => b.id.toString() === blocId);
        return currentBloc?.progression === 100;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification de la progression:', error);
      return false;
    }
  };

  // Fonction pour soumettre l'étude de cas
  const handleEtudeCasSubmit = async (reponses: any, fichiers: { [questionId: number]: File[] }, commentaire: string) => {
    if (!data.etudeCas) return;

    try {
      const formData = new FormData();
      formData.append('etude_cas_id', data.etudeCas.id.toString());
      formData.append('reponses', JSON.stringify(reponses));
      formData.append('commentaire_etudiant', commentaire || '');
      
      // Ajouter les fichiers avec leur questionId dans l'ordre
      // On envoie d'abord un JSON qui mappe l'index du fichier à sa questionId
      const fileQuestionMapping: { [index: number]: number } = {};
      let fileIndex = 0;
      Object.entries(fichiers).forEach(([questionId, files]) => {
        files.forEach(() => {
          fileQuestionMapping[fileIndex] = parseInt(questionId);
          fileIndex++;
        });
      });
      formData.append('file_question_mapping', JSON.stringify(fileQuestionMapping));
      
      // Ensuite, ajouter tous les fichiers dans le même ordre
      Object.entries(fichiers).forEach(([questionId, files]) => {
        files.forEach((file) => {
          formData.append('files', file);
        });
      });

      const response = await fetch('/api/espace-etudiant/etude-cas/submit', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Étude de cas soumise avec succès:', result);
        
        // Attendre un peu pour que la progression soit mise à jour dans la base de données
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Vérifier s'il y a un prochain cours dans le bloc actuel
        const nextCours = findNextCourse();
        
        if (nextCours) {
          // Il y a un autre cours dans le bloc → proposer de continuer
          setNextCourse(nextCours);
          setBlocCompleted(false);
          setShowNextCourseModal(true);
        } else {
          // Pas de prochain cours dans le bloc → vérifier si le bloc est complété à 100%
          const isBlocCompleted = await checkBlocCompletion();
          
          if (isBlocCompleted) {
            // Le bloc est complété → débloquer le bloc suivant
            setBlocCompleted(true);
            setNextCourse(null);
            setShowNextCourseModal(true);
          } else {
            // Bloc pas encore complété, juste afficher le succès
            setShowSuccessModal(true);
          }
        }
      } else {
        // Récupérer le message d'erreur de l'API
        try {
          const errorData = await response.json();
          const message = errorData.error || 'Erreur lors de la soumission de l\'étude de cas. Veuillez réessayer.';
          setErrorMessage(message);
          console.error('Erreur lors de la soumission de l\'étude de cas:', errorData);
        } catch (e) {
          setErrorMessage('Erreur lors de la soumission de l\'étude de cas. Veuillez réessayer.');
          console.error('Erreur lors de la récupération du message d\'erreur:', e);
        }
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'étude de cas:', error);
      setErrorMessage('Erreur réseau lors de la soumission. Veuillez vérifier votre connexion et réessayer.');
      setShowErrorModal(true);
    }
  };

  const handleContinueToNextCourse = () => {
    if (nextCourse) {
      router.push(`/espace-etudiant/cours/${formationId}/${blocId}/${nextCourse.id}`);
    }
    setShowNextCourseModal(false);
  };

  const handleContinueLater = () => {
    router.push('/espace-etudiant/mes-formations');
  };

  const progress = data.chapitres.length > 0
    ? Math.round(((currentChapitreIndex + 1) / data.chapitres.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
          <p className="text-[#032622]">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  if (!data.cours) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#032622] text-lg mb-4">Cours non trouvé</p>
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
      <div className="flex-1 flex flex-col">
        <div className="bg-[#F8F5E4] border-b border-[#032622]/20">
          <div className="px-6 py-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-[#032622] hover:text-[#032622]/70 transition-colors mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-bold uppercase text-sm" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                  Retour aux formations
                </span>
              </button>
            )}

            <ModulePreviewHeader
              blocNumber={data.bloc ? `BLOC ${data.bloc.numero_bloc}` : 'BLOC'}
              blocTitle={data.bloc?.titre || ''}
              moduleTitle={`COURS ${data.cours.numero_cours || data.cours.ordre_affichage} - ${data.cours.titre}`}
              progress={progress}
            />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          <button
            onClick={() => setIsSidebarRightCollapsed(prev => !prev)}
            className={`absolute top-4 z-20 p-2 text-[#032622] border-2 border-[#032622] hover:bg-[#032622]/90 transition-all duration-300 ${
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

          <div className="flex-1 flex flex-col overflow-hidden bg-[#F8F5E4]">
            <div className="flex-1 overflow-y-auto">
              <div className={`mx-auto px-6 py-8 min-h-full transition-all duration-300 w-full ${
                isSidebarRightCollapsed ? 'max-w-full' : 'max-w-6xl'
              }`}>
                {currentView === 'cours' && (
                  <div className="relative min-h-[400px]">
                    {currentChapitre ? (
                      <CourseContentViewer cours={currentChapitre} isPreview={false} />
                    ) : (
                      <div className="text-center text-[#032622] py-12">
                        <p className="text-lg mb-4">Aucun chapitre disponible dans ce cours</p>
                      </div>
                    )}
                  </div>
                )}

                {currentView === 'quiz' && currentQuiz && (
                  <QuizViewer
                    quiz={currentQuiz.quiz}
                    questions={currentQuiz.questions}
                    isPreview={false}
                    onQuizComplete={(reponses, tempsPasse) => {
                      handleQuizSubmit(reponses, tempsPasse);
                      setQuizCompleted(true);
                    }}
                  />
                )}

                {currentView === 'etude-cas' && data.etudeCas && (
                  <EtudeCasViewer
                    etudeCas={data.etudeCas}
                    questions={data.etudeCasQuestions}
                    isPreview={false}
                    onSubmit={(reponses, fichiers, commentaire) => {
                      handleEtudeCasSubmit(reponses, fichiers, commentaire);
                    }}
                  />
                )}
              </div>
            </div>
            
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

          <div className={`flex-shrink-0 overflow-hidden bg-[#F8F5E4] border-l border-[#032622]/20 transition-all duration-300 ${
            isSidebarRightCollapsed ? 'w-0' : 'w-96'
          }`}>
            {!isSidebarRightCollapsed && (
              <div className="h-full overflow-y-auto">
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

      {/* Modals - identiques à ModulePreviewViewer */}
      {showQuizModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
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

      {showEtudeCasModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
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

      {/* Modal de succès */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Succès"
        message="Votre étude de cas a été soumise avec succès !"
        type="success"
      />

      {/* Modal d'erreur */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Erreur"
        message={errorMessage || "Erreur lors de la soumission de l'étude de cas. Veuillez réessayer."}
        type="error"
      />

      {/* Modal après soumission - choix de navigation */}
      {showNextCourseModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowNextCourseModal(false);
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
              {blocCompleted ? 'FÉLICITATIONS !' : 'ÉTUDE DE CAS SOUMISE'}
            </h3>
            <p className="text-[#032622] mb-2 text-center font-bold">
              {blocCompleted 
                ? 'Félicitations ! Vous avez terminé ce bloc. Le bloc suivant est maintenant débloqué.'
                : nextCourse
                  ? `Vous pouvez maintenant continuer vers le cours suivant : "${nextCourse.titre}"`
                  : 'Votre étude de cas a été soumise avec succès !'
              }
            </p>
            <div className="flex gap-4 mt-6">
              {nextCourse ? (
                <>
                  <button
                    onClick={handleContinueLater}
                    className="flex-1 px-6 py-3 bg-[#F8F5E4] border-2 border-[#032622] text-[#032622] font-bold uppercase hover:bg-[#F8F5E4]/90 transition-colors"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    CONTINUER PLUS TARD
                  </button>
                  <button
                    onClick={handleContinueToNextCourse}
                    className="flex-1 px-6 py-3 bg-[#032622] text-[#F8F5E4] font-bold uppercase hover:bg-[#032622]/90 transition-colors"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    CONTINUER VERS LE COURS
                  </button>
                </>
              ) : (
                <button
                  onClick={handleContinueLater}
                  className="w-full px-6 py-3 bg-[#032622] text-[#F8F5E4] font-bold uppercase hover:bg-[#032622]/90 transition-colors"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  RETOUR AUX FORMATIONS
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

