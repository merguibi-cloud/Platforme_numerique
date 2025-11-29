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
  const [quizzesByChapitre, setQuizzesByChapitre] = useState<Map<number, QuizData>>(new Map());
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizReponses, setQuizReponses] = useState<any>(null); // Réponses du quiz déjà fait
  const [etudeCasReponses, setEtudeCasReponses] = useState<any>(null); // Réponses de l'étude de cas déjà soumise
  const [showEtudeCasConfirmModal, setShowEtudeCasConfirmModal] = useState(false); // Modal de confirmation pour soumettre l'étude de cas
  const [getEtudeCasAnswers, setGetEtudeCasAnswers] = useState<(() => { answers: any; uploadedFiles: { [questionId: number]: File[] }; commentaire: string; allQuestionsAnswered: boolean }) | null>(null);
  
  // États pour les modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showNextCourseModal, setShowNextCourseModal] = useState(false);
  const [nextCourse, setNextCourse] = useState<{ id: number; titre: string } | null>(null);
  const [blocCompleted, setBlocCompleted] = useState(false);
  
  // États pour stocker les quiz et études de cas déjà complétés
  const [quizAvecNote, setQuizAvecNote] = useState<Set<number>>(new Set()); // Set des quiz_id qui ont une note
  const [etudeCasSoumis, setEtudeCasSoumis] = useState<Set<number>>(new Set()); // Set des etude_cas_id déjà soumis
  const [blocIsCompleted, setBlocIsCompleted] = useState(false); // Indique si le bloc est complété (tous quiz notés et toutes études de cas soumises)
  
  // État pour suivre si on vient de soumettre un quiz (pour éviter d'afficher le message immédiatement)
  const [justSubmittedQuiz, setJustSubmittedQuiz] = useState<number | null>(null);
  
  // État pour la progression réelle
  const [realProgress, setRealProgress] = useState<{
    progressionPourcentage: number;
    chapitresLus: number[];
    chapitresSautes: number[];
    quizCompletes: number[];
    etudeCasSoumise: boolean;
    totalChapitres: number;
  } | null>(null);
  
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
      // Vérifier que les données nécessaires sont disponibles
      if (!blocId || !coursId) {
        console.warn('Impossible d\'enregistrer la progression : blocId ou coursId manquant');
        return;
      }

      const currentChapitre = data.chapitres[currentChapitreIndex];
      const bodyData = {
        bloc_id: parseInt(blocId),
        cours_id: coursId,
        chapitre_id: currentChapitre?.id || null,
        action: action,
        temps_passe_minutes: tempsPasse !== undefined ? tempsPasse : tempsPasseMinutes,
        date_jour: new Date().toISOString().split('T')[0]
      };

      const response = await fetch('/api/espace-etudiant/progression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bodyData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur lors de l\'enregistrement de la progression:', errorText);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la progression:', error);
    }
  };

  // Fonction centralisée pour charger la dernière position de lecture
  const loadLastPosition = async (chapitres: ChapitreCours[]): Promise<number | null> => {
    try {
      const response = await fetch(`/api/espace-etudiant/progression/last-position?coursId=${coursId}&blocId=${blocId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.chapitre_id) {
          // Trouver l'index du chapitre dans la liste triée
          const chapitreIndex = chapitres.findIndex(ch => ch.id === result.chapitre_id);
          if (chapitreIndex !== -1) {
            return chapitreIndex;
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la dernière position:', error);
    }
    return null;
  };

  // Fonction pour charger la progression réelle
  const loadRealProgress = async () => {
    try {
      const response = await fetch(`/api/espace-etudiant/progression/real-progress?coursId=${coursId}&blocId=${blocId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRealProgress({
            progressionPourcentage: result.progressionPourcentage || 0,
            chapitresLus: result.chapitresLus?.map((c: any) => c.id) || [],
            chapitresSautes: result.chapitresSautes || [],
            quizCompletes: result.quizCompletes?.map((q: any) => q.id) || [],
            etudeCasSoumise: result.etudeCasSoumise || false,
            totalChapitres: result.totalChapitres || 0
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la progression réelle:', error);
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
          
          // Charger la dernière position de lecture
          if (sortedChapitres.length > 0) {
            const lastPosition = await loadLastPosition(sortedChapitres);
            setCurrentChapitreIndex(lastPosition !== null ? lastPosition : 0);
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
          
          // Charger la dernière position de lecture
          if (sortedChapitres.length > 0) {
            const lastPosition = await loadLastPosition(sortedChapitres);
            setCurrentChapitreIndex(lastPosition !== null ? lastPosition : 0);
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

  // Charger les quiz avec note et les études de cas soumises
  useEffect(() => {
    const loadCompletedEvaluations = async () => {
      try {
        // Récupérer les IDs des quiz
        const quizIds = Array.from(quizzesByChapitre.values()).map(q => q.quiz.id);
        const etudeCasId = data.etudeCas?.id;

        if (quizIds.length === 0 && !etudeCasId) return;

        // Construire l'URL avec les paramètres
        const params = new URLSearchParams();
        if (quizIds.length > 0) {
          params.append('quizIds', quizIds.join(','));
        }
        if (etudeCasId) {
          params.append('etudeCasId', etudeCasId.toString());
        }

        const response = await fetch(`/api/espace-etudiant/evaluations/check?${params.toString()}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setQuizAvecNote(new Set(result.quizAvecNote || []));
            if (result.etudeCasSoumis && etudeCasId) {
              setEtudeCasSoumis(new Set([etudeCasId]));
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des évaluations complétées:', error);
      }
    };

    if (quizzesByChapitre.size > 0 || data.etudeCas) {
      loadCompletedEvaluations();
    }
  }, [quizzesByChapitre, data.etudeCas]);

  // Charger la progression réelle au chargement initial et après soumission de quiz/étude de cas
  useEffect(() => {
    if (!isLoading && data.cours && data.chapitres.length > 0) {
      loadRealProgress();
    }
  }, [isLoading, data.cours, data.chapitres.length]);

  // Recharger la progression réelle après soumission de quiz
  useEffect(() => {
    if (quizCompleted) {
      setTimeout(() => {
        loadRealProgress();
      }, 1000);
    }
  }, [quizCompleted]);

  // Recharger la progression réelle après soumission d'étude de cas
  useEffect(() => {
    if (etudeCasSoumis.size > 0) {
      setTimeout(() => {
        loadRealProgress();
      }, 1000);
    }
  }, [etudeCasSoumis.size]);

  const currentChapitre = data.chapitres[currentChapitreIndex];
  const hasPreviousChapitre = currentChapitreIndex > 0;
  const hasNextChapitre = currentChapitreIndex < data.chapitres.length - 1;
  const hasQuizForCurrentChapitre = currentChapitre ? quizzesByChapitre.has(currentChapitre.id) : false;
  const hasEtudeCas = data.etudeCas !== null;

  // Enregistrer quand on change de chapitre et recharger la progression réelle
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
      
      // Recharger la progression réelle après un court délai pour laisser le temps à l'API de s'enregistrer
      setTimeout(() => {
        loadRealProgress();
      }, 500);
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

  const handleNext = async () => {
    if (currentView === 'cours') {
      // Vérifier si le quiz du chapitre actuel a déjà une note
      const currentChapitre = data.chapitres[currentChapitreIndex];
      const quizData = currentChapitre ? quizzesByChapitre.get(currentChapitre.id) : null;
      const currentQuizId = quizData?.quiz.id;
      const quizDejaNote = currentQuizId && quizAvecNote.has(currentQuizId);
      
      if (hasQuizForCurrentChapitre) {
        // Le quiz existe, naviguer vers le quiz (en mode lecture seule si déjà fait)
        if (currentChapitre) {
          navigateToQuiz(currentChapitre.id);
        }
      } else if (hasNextChapitre) {
        // Passer au chapitre suivant
        navigateToChapitre(currentChapitreIndex + 1);
      } else if (hasEtudeCas) {
        // Pas de chapitre suivant, naviguer vers l'étude de cas (toujours accessible)
        navigateToEtudeCas();
      }
    } else if (currentView === 'quiz') {
      // Après avoir consulté le quiz (en mode lecture seule ou après soumission)
      // Toujours permettre la navigation
      if (hasNextChapitre) {
        setQuizCompleted(false);
        navigateToChapitre(currentChapitreIndex + 1);
      } else if (hasEtudeCas) {
        // Toujours permettre d'accéder à l'étude de cas
        navigateToEtudeCas();
        setQuizCompleted(false);
      } else {
        setCurrentView('cours');
        setQuizCompleted(false);
      }
    } else if (currentView === 'etude-cas') {
      // Si l'étude de cas est déjà soumise, retourner aux formations
      if (data.etudeCas?.id && etudeCasSoumis.has(data.etudeCas.id)) {
        router.push('/espace-etudiant/mes-formations');
      } else {
        // Si l'étude de cas n'est pas encore soumise, afficher la popup de confirmation
        if (getEtudeCasAnswers) {
          const answersData = getEtudeCasAnswers();
          if (answersData.allQuestionsAnswered) {
            // Toutes les questions sont répondues, afficher la popup de confirmation
            setShowEtudeCasConfirmModal(true);
          } else {
            // Certaines questions ne sont pas répondues, afficher un avertissement
            setErrorMessage('Vous n\'avez pas répondu à toutes les questions. Voulez-vous vraiment soumettre votre étude de cas ?');
            setShowEtudeCasConfirmModal(true);
          }
        } else {
          // Si on ne peut pas récupérer les réponses, essayer de soumettre quand même
          setShowEtudeCasConfirmModal(true);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentView === 'etude-cas' && hasEtudeCas) {
      const lastChapitre = data.chapitres[data.chapitres.length - 1];
      if (lastChapitre && quizzesByChapitre.has(lastChapitre.id)) {
        navigateToQuiz(lastChapitre.id);
      } else {
        navigateToChapitre(data.chapitres.length - 1);
      }
    } else if (currentView === 'quiz' && currentChapitre) {
      setCurrentView('cours');
      trackProgression('change_page', tempsPasseMinutes);
    } else if (currentView === 'cours' && hasPreviousChapitre) {
      navigateToChapitre(currentChapitreIndex - 1);
    }
  };

  // Handlers centralisés pour les clics dans la sidebar
  const handleChapitreClick = (chapitreId: number) => {
    const targetIndex = data.chapitres.findIndex((ch: ChapitreCours) => ch.id === chapitreId);
    if (targetIndex !== -1) {
      navigateToChapitre(targetIndex);
    }
  };

  const handleQuizClick = (chapitreId: number) => {
    navigateToQuiz(chapitreId);
  };

  const handleEtudeCasClick = (coursIdOrChapitreId: number, etudeCasId?: number) => {
    if (coursIdOrChapitreId === coursId) {
      navigateToEtudeCas();
    }
  };

  const handleCoursClick = (clickedCoursId: number) => {
    // Ne rien faire - le clic sur le cours ne fait que dérouler les chapitres
  };

  // Fonction centralisée pour naviguer vers un chapitre
  const navigateToChapitre = (chapitreIndex: number) => {
    setCurrentChapitreIndex(chapitreIndex);
    setCurrentView('cours');
    // Utiliser 'view_chapitre' pour enregistrer la progression et permettre la reprise automatique
    trackProgression('view_chapitre', tempsPasseMinutes);
  };

  // Fonction centralisée pour naviguer vers un quiz
  const navigateToQuiz = async (chapitreId: number) => {
    const targetIndex = data.chapitres.findIndex((ch: ChapitreCours) => ch.id === chapitreId);
    if (targetIndex !== -1) {
      setCurrentChapitreIndex(targetIndex);
      const quizData = quizzesByChapitre.get(chapitreId);
      if (quizData) {
        // Si le quiz est déjà fait, charger les réponses
        if (quizAvecNote.has(quizData.quiz.id) && justSubmittedQuiz !== quizData.quiz.id) {
          try {
            const response = await fetch(`/api/espace-etudiant/quiz/${quizData.quiz.id}/reponses`, {
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
              const result = await response.json();
              if (result.success) {
                setQuizReponses(result);
              }
            }
          } catch (error) {
            console.error('Erreur lors du chargement des réponses:', error);
          }
        } else {
          setQuizReponses(null); // Pas de réponses si le quiz n'est pas encore fait
        }
        setCurrentQuiz(quizData);
        setCurrentView('quiz');
        // Si le quiz est déjà fait, on est en mode lecture seule, donc quizCompleted = true pour permettre la navigation
        const isQuizDone = quizAvecNote.has(quizData.quiz.id) && justSubmittedQuiz !== quizData.quiz.id;
        setQuizCompleted(isQuizDone);
        trackProgression('change_page', tempsPasseMinutes);
      }
    }
  };

  // Fonction centralisée pour naviguer vers une étude de cas
  const navigateToEtudeCas = async () => {
    if (data.etudeCas?.id && etudeCasSoumis.has(data.etudeCas.id)) {
      // Charger les réponses de l'étude de cas déjà soumise
      try {
        const response = await fetch(`/api/espace-etudiant/etude-cas/${data.etudeCas.id}/reponses`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setEtudeCasReponses(result);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des réponses de l\'étude de cas:', error);
      }
    } else {
      setEtudeCasReponses(null);
    }
    setCurrentView('etude-cas');
    trackProgression('change_page', tempsPasseMinutes);
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
        // Marquer ce quiz comme venant d'être soumis pour éviter le message immédiat
        if (currentQuiz?.quiz.id) {
          setJustSubmittedQuiz(currentQuiz.quiz.id);
          // Ajouter le quiz à la liste des quiz avec note après un court délai
          setTimeout(() => {
            setQuizAvecNote(prev => new Set(prev).add(currentQuiz.quiz.id));
            // Réinitialiser le flag après 2 secondes
            setTimeout(() => {
              setJustSubmittedQuiz(null);
            }, 2000);
          }, 100);
        }
        // Vérifier si le bloc est maintenant complété
        await checkBlocCompletion();
        // Recharger la progression réelle
        setTimeout(() => {
          loadRealProgress();
        }, 500);
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

  // Fonction pour confirmer et soumettre l'étude de cas
  const handleConfirmEtudeCasSubmit = async () => {
    if (!getEtudeCasAnswers || !data.etudeCas) return;
    
    const answersData = getEtudeCasAnswers();
    await handleEtudeCasSubmit(answersData.answers, answersData.uploadedFiles, answersData.commentaire);
    setShowEtudeCasConfirmModal(false);
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
        
        // Ajouter l'étude de cas à la liste des études de cas soumises
        if (data.etudeCas?.id) {
          setEtudeCasSoumis(prev => new Set(prev).add(data.etudeCas!.id));
        }
        
        // Attendre un peu pour que la progression soit mise à jour dans la base de données
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Vérifier si le bloc est maintenant complété
        await checkBlocCompletion();
        
        // Recharger la progression réelle
        setTimeout(() => {
          loadRealProgress();
        }, 500);
        
        // Vérifier s'il y a un prochain cours dans le bloc actuel
        const nextCours = findNextCourse();
        
        if (nextCours) {
          // Il y a un autre cours dans le bloc → proposer de continuer
          setNextCourse(nextCours);
          setBlocCompleted(false);
          setShowNextCourseModal(true);
        } else {
          // Pas de prochain cours dans le bloc → vérifier si le bloc est complété
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

  // État pour stocker s'il y a un bloc suivant
  const [hasNextBlocState, setHasNextBlocState] = useState(false);

  // Vérifier s'il y a un bloc suivant au chargement
  useEffect(() => {
    const checkNextBloc = async () => {
      try {
        const response = await fetch(`/api/espace-etudiant/blocs`, {
          credentials: 'include'
        });
        if (response.ok) {
          const result = await response.json();
          const currentBlocIndex = result.blocs?.findIndex((b: any) => b.id.toString() === blocId) ?? -1;
          if (currentBlocIndex !== -1 && currentBlocIndex < (result.blocs?.length || 0) - 1) {
            setHasNextBlocState(true);
          } else {
            setHasNextBlocState(false);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du bloc suivant:', error);
        setHasNextBlocState(false);
      }
    };
    checkNextBloc();
  }, [blocId]);

  // Fonction pour vérifier si le bloc est complété
  const checkBlocCompletion = async () => {
    try {
      const response = await fetch(`/api/espace-etudiant/blocs/${blocId}/completion`, {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setBlocIsCompleted(result.isCompleted);
          return result.isCompleted;
        }
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification de la complétion du bloc:', error);
      return false;
    }
  };

  // Vérifier la complétion du bloc périodiquement et après soumission
  useEffect(() => {
    if (!isLoading && blocId) {
      checkBlocCompletion();
    }
  }, [blocId, isLoading, quizAvecNote, etudeCasSoumis]);

  // Fonction pour calculer le label du bouton suivant
  const getNextButtonLabel = () => {
    if (currentView === 'etude-cas') {
      // Si l'étude de cas est déjà soumise, afficher "RETOUR AUX FORMATIONS"
      if (data.etudeCas?.id && etudeCasSoumis.has(data.etudeCas.id)) {
        return 'RETOUR AUX FORMATIONS';
      }
      return 'TERMINER';
    }

    if (currentView === 'quiz') {
      // Dans un quiz (en mode lecture seule ou après soumission)
      // Toujours permettre la navigation
      if (hasNextChapitre) {
        return 'PASSER AU CHAPITRE SUIVANT';
      } else if (hasEtudeCas) {
        return 'PASSER À L\'ÉTUDE DE CAS';
      } else {
        // Fin du cours, vérifier s'il y a un cours suivant
        const nextCours = findNextCourse();
        if (nextCours) {
          return 'PASSER AU COURS SUIVANT';
        } else if (hasNextBlocState) {
          return 'PASSER AU BLOC SUIVANT';
        } else {
          // Plus de blocs, quiz final (pas encore défini)
          return 'PASSER AU QUIZ FINAL';
        }
      }
    }

    if (currentView === 'cours') {
      // Dans un cours
      if (hasQuizForCurrentChapitre) {
        return 'PASSER AU QUIZ';
      } else if (hasNextChapitre) {
        return 'PASSER AU CHAPITRE SUIVANT';
      } else if (hasEtudeCas) {
        return 'PASSER À L\'ÉTUDE DE CAS';
      } else {
        // Fin du cours, vérifier s'il y a un cours suivant
        const nextCours = findNextCourse();
        if (nextCours) {
          return 'PASSER AU COURS SUIVANT';
        } else if (hasNextBlocState) {
          return 'PASSER AU BLOC SUIVANT';
        } else {
          // Plus de blocs, quiz final (pas encore défini)
          return 'PASSER AU QUIZ FINAL';
        }
      }
    }

    return 'SUIVANT';
  };

  // Fonction pour calculer le label du bouton précédent
  const getPreviousButtonLabel = () => {
    if (currentView === 'quiz') {
      return 'RETOUR AU COURS';
    }
    if (currentView === 'etude-cas') {
      return 'RETOUR AU COURS';
    }
    if (currentView === 'cours' && hasPreviousChapitre) {
      return 'CHAPITRE PRÉCÉDENT';
    }
    return 'PRÉCÉDENT';
  };

  // Calcul de la progression : utiliser la progression réelle si disponible, sinon fallback sur la position
  const progress = realProgress?.progressionPourcentage !== undefined
    ? realProgress.progressionPourcentage
    : (data.chapitres.length > 0
        ? Math.round(((currentChapitreIndex + 1) / data.chapitres.length) * 100)
        : 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-[#032622] mx-auto mb-3 sm:mb-4"></div>
          <p className="text-xs sm:text-sm md:text-base text-[#032622]">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  if (!data.cours) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#032622] mb-3 sm:mb-4">Cours non trouvé</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-[#032622] text-[#F8F5E4] rounded-lg font-bold uppercase hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors text-xs sm:text-sm"
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
          <div className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 sm:gap-2 text-[#032622] hover:text-[#032622]/70 active:text-[#032622]/50 transition-colors mb-3 sm:mb-4 text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-bold uppercase text-xs sm:text-sm" style={{ fontFamily: 'var(--font-termina-bold)' }}>
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
            className={`hidden lg:block absolute top-3 sm:top-4 z-20 p-1.5 sm:p-2 text-[#032622] border-2 border-[#032622] hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-all duration-300 bg-[#F8F5E4] ${
              isSidebarRightCollapsed ? 'right-3 sm:right-4' : 'right-[320px] xl:right-[400px]'
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

          <div className="flex-1 flex flex-col overflow-hidden bg-[#F8F5E4]">
            <div className="flex-1 overflow-y-auto">
              <div className={`mx-auto px-3 sm:px-4 md:px-5 lg:px-6 py-4 sm:py-6 md:py-8 min-h-full transition-all duration-300 w-full ${
                isSidebarRightCollapsed ? 'max-w-full' : 'max-w-6xl'
              }`}>
                {currentView === 'cours' && (
                  <div className="relative min-h-[300px] sm:min-h-[400px]">
                    {currentChapitre ? (
                      <CourseContentViewer cours={currentChapitre} isPreview={false} />
                    ) : (
                      <div className="text-center text-[#032622] py-8 sm:py-10 md:py-12">
                        <p className="text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Aucun chapitre disponible dans ce cours</p>
                      </div>
                    )}
                  </div>
                )}

                {currentView === 'quiz' && currentQuiz && (
                  <QuizViewer
                    quiz={currentQuiz.quiz}
                    questions={currentQuiz.questions}
                    isPreview={false}
                    readOnly={quizAvecNote.has(currentQuiz.quiz.id) && justSubmittedQuiz !== currentQuiz.quiz.id}
                    userAnswers={quizReponses?.reponses || null}
                    quizResult={quizReponses?.tentative || null}
                    onQuizComplete={quizAvecNote.has(currentQuiz.quiz.id) && justSubmittedQuiz !== currentQuiz.quiz.id ? undefined : (reponses, tempsPasse) => {
                      if (reponses && tempsPasse !== undefined) {
                        handleQuizSubmit(reponses, tempsPasse);
                        setQuizCompleted(true);
                      }
                    }}
                  />
                )}

                {currentView === 'etude-cas' && data.etudeCas && (
                  <EtudeCasViewer
                    etudeCas={data.etudeCas}
                    questions={data.etudeCasQuestions}
                    isPreview={false}
                    readOnly={etudeCasSoumis.has(data.etudeCas.id)}
                    userSubmission={etudeCasReponses}
                    onGetAnswers={etudeCasSoumis.has(data.etudeCas.id) ? undefined : (getAnswers) => {
                      setGetEtudeCasAnswers(() => getAnswers);
                    }}
                  />
                )}
              </div>
            </div>
            
            <ModulePreviewNavigation
              hasPrevious={currentView === 'cours' ? hasPreviousChapitre : currentView === 'quiz' ? true : currentView === 'etude-cas' ? true : false}
              hasNext={currentView === 'cours' ? (() => {
                // Toujours permettre la navigation vers le quiz ou l'étude de cas, même s'ils sont déjà faits
                return hasNextChapitre || 
                       hasQuizForCurrentChapitre || 
                       (hasEtudeCas && !hasNextChapitre && !hasQuizForCurrentChapitre);
              })() : currentView === 'quiz' ? true : currentView === 'etude-cas' ? true : false}
              onPrevious={handlePrevious}
              onNext={handleNext}
              currentType={currentView}
              quizCompleted={quizCompleted}
              showEtudeCasButton={currentView === 'cours' && !hasNextChapitre && !hasQuizForCurrentChapitre && hasEtudeCas && !etudeCasSoumis.has(data.etudeCas?.id || 0)}
              nextLabel={getNextButtonLabel()}
              previousLabel={getPreviousButtonLabel()}
            />
          </div>

          <div className={`hidden lg:block flex-shrink-0 overflow-hidden bg-[#F8F5E4] border-l border-[#032622]/20 transition-all duration-300 ${
            isSidebarRightCollapsed ? 'w-0' : 'w-80 xl:w-96'
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

      {/* Modal de confirmation pour soumettre l'étude de cas */}
      {showEtudeCasConfirmModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEtudeCasConfirmModal(false);
            }
          }}
        >
          <div 
            className="bg-[#F8F5E4] border-4 border-[#032622] p-4 sm:p-6 md:p-8 max-w-3xl w-full mx-2 sm:mx-4 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 
              className="text-lg sm:text-xl md:text-2xl font-bold text-[#032622] mb-3 sm:mb-4 text-center uppercase"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              PRÊT À VALIDER TON ÉTUDE DE CAS ?
            </h3>
            <p className="text-xs sm:text-sm text-[#032622] mb-4 sm:mb-5 md:mb-6 text-center">
              Assure-toi d'avoir bien relu ton travail avant de l'envoyer. Une fois validé, tu ne pourras plus revenir en arrière.
            </p>
            {getEtudeCasAnswers && !getEtudeCasAnswers().allQuestionsAnswered && (
              <div className="mb-4 sm:mb-5 md:mb-6 p-3 sm:p-4 bg-yellow-100 border-2 border-yellow-500 rounded">
                <p className="text-xs sm:text-sm text-[#032622] font-bold text-center">
                  ⚠️ ATTENTION : Tu n'as pas répondu à toutes les questions.
                </p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => setShowEtudeCasConfirmModal(false)}
                className="flex-1 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-[#032622] text-[#F8F5E4] font-bold uppercase hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors text-xs sm:text-sm"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                RETOURNER AUX QUESTIONS
              </button>
              <button
                onClick={handleConfirmEtudeCasSubmit}
                className="flex-1 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-[#F8F5E4] border-2 border-[#032622] text-[#032622] font-bold uppercase hover:bg-[#F8F5E4]/90 active:bg-[#F8F5E4]/80 transition-colors text-xs sm:text-sm"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                CONFIRMER L'ENVOI
              </button>
            </div>
          </div>
        </div>
      )}

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
            className="bg-[#F8F5E4] border-4 border-[#032622] p-4 sm:p-6 md:p-8 max-w-3xl w-full mx-2 sm:mx-4 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 
              className="text-lg sm:text-xl md:text-2xl font-bold text-[#032622] mb-3 sm:mb-4 text-center uppercase"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              {blocCompleted ? 'FÉLICITATIONS !' : 'ÉTUDE DE CAS SOUMISE'}
            </h3>
            <p className="text-xs sm:text-sm text-[#032622] mb-2 sm:mb-3 text-center font-bold break-words">
              {blocCompleted 
                ? 'Félicitations ! Vous avez terminé ce bloc. Le bloc suivant est maintenant débloqué.'
                : nextCourse
                  ? `Vous pouvez maintenant continuer vers le cours suivant : "${nextCourse.titre}"`
                  : 'Votre étude de cas a été soumise avec succès !'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-5 md:mt-6">
              {nextCourse ? (
                <>
                  <button
                    onClick={handleContinueLater}
                    className="flex-1 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-[#F8F5E4] border-2 border-[#032622] text-[#032622] font-bold uppercase hover:bg-[#F8F5E4]/90 active:bg-[#F8F5E4]/80 transition-colors text-xs sm:text-sm"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    CONTINUER PLUS TARD
                  </button>
                  <button
                    onClick={handleContinueToNextCourse}
                    className="flex-1 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-[#032622] text-[#F8F5E4] font-bold uppercase hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors text-xs sm:text-sm"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    CONTINUER VERS LE COURS
                  </button>
                </>
              ) : (
                <button
                  onClick={handleContinueLater}
                  className="w-full px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-[#032622] text-[#F8F5E4] font-bold uppercase hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors text-xs sm:text-sm"
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

