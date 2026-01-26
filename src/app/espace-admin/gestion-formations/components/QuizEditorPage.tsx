'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Check, X, ChevronDown, RefreshCw, ArrowLeft } from 'lucide-react';
import { QuestionQuiz, ReponsePossible } from '@/types/formation-detailed';
import { Modal } from '@/app/Modal';

interface QuizEditorPageProps {
  chapitreId: number;
  coursId: number;
  formationId: string;
  blocId: string;
}

interface QuestionForm {
  id?: number;
  question: string;
  type_question: 'choix_unique' | 'choix_multiple' | 'vrai_faux';
  reponses: ReponseForm[];
  justification?: string;
  hasJustification: boolean;
}

interface ReponseForm {
  id?: number;
  reponse: string;
  est_correcte: boolean;
}

export const QuizEditorPage = ({ chapitreId, coursId, formationId, blocId }: QuizEditorPageProps) => {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [quizId, setQuizId] = useState<number | null>(null);
  const [lastSavedQuestions, setLastSavedQuestions] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<Date | null>(null);
  const [coursTitre, setCoursTitre] = useState<string>('');
  const [modal, setModal] = useState<{ isOpen: boolean; message: string; type: 'info' | 'success' | 'warning' | 'error'; title?: string }>({
    isOpen: false,
    message: '',
    type: 'info'
  });

  // Charger le chapitre pour obtenir son titre
  useEffect(() => {
    const loadChapitre = async () => {
      try {
        const response = await fetch(`/api/chapitres?chapitreId=${chapitreId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.chapitre) {
            setCoursTitre(data.chapitre.titre || '');
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du chapitre:', error);
      }
    };
    loadChapitre();
  }, [chapitreId]);

  // Charger le quiz existant pour ce chapitre
  useEffect(() => {
    const loadQuiz = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/quiz?chapitreId=${chapitreId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.quiz) {
            setQuizId(data.quiz.id);
            // Convertir les questions en format formulaire
            const formattedQuestions: QuestionForm[] = (data.questions || []).map((q: QuestionQuiz) => {
              const reponses = (q.reponses_possibles || []).map((r: ReponsePossible) => ({
                id: r.id,
                reponse: r.reponse,
                est_correcte: r.est_correcte,
              }));
              
              // Pour vrai/faux, s'assurer qu'il y a exactement 2 réponses (Vrai et Faux)
              if (q.type_question === 'vrai_faux') {
                const vraiReponse = reponses.find(r => r.reponse.toLowerCase() === 'vrai') || { reponse: 'Vrai', est_correcte: false };
                const fauxReponse = reponses.find(r => r.reponse.toLowerCase() === 'faux') || { reponse: 'Faux', est_correcte: false };
                return {
                  id: q.id,
                  question: q.question,
                  type_question: q.type_question as 'choix_unique' | 'choix_multiple' | 'vrai_faux',
                  reponses: [vraiReponse, fauxReponse],
                  justification: q.justification,
                  hasJustification: !!q.justification,
                };
              }
              
              return {
                id: q.id,
                question: q.question,
                type_question: q.type_question as 'choix_unique' | 'choix_multiple' | 'vrai_faux',
                reponses,
                justification: q.justification,
                hasJustification: !!q.justification,
              };
            });
            setQuestions(formattedQuestions);
            // Initialiser lastSavedQuestions avec les questions chargées
            setLastSavedQuestions(JSON.stringify(formattedQuestions));
            setHasUnsavedChanges(false);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du quiz:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadQuiz();
  }, [chapitreId]);

  // Détecter les changements dans les questions
  useEffect(() => {
    const currentQuestionsJson = JSON.stringify(questions);
    if (currentQuestionsJson !== lastSavedQuestions && questions.length > 0) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [questions, lastSavedQuestions]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        type_question: 'choix_unique',
        reponses: [
          { reponse: '', est_correcte: false },
          { reponse: '', est_correcte: false },
          { reponse: '', est_correcte: false },
          { reponse: '', est_correcte: false },
        ],
        hasJustification: false,
      },
    ]);
  };

  const removeQuestion = async (index: number) => {
    const questionToRemove = questions[index];
    
    // Si la question a un ID, la supprimer de la base de données
    if (questionToRemove?.id) {
      try {
        await fetch(`/api/quiz/questions?questionId=${questionToRemove.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Erreur lors de la suppression de la question:', error);
        // Continuer quand même à retirer de l'interface
      }
    }
    
    // Retirer la question du state
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuestionForm, value: any) => {
    const updated = [...questions];
    if (field === 'hasJustification') {
      updated[index] = { ...updated[index], hasJustification: value, justification: value ? updated[index].justification : '' };
    } else if (field === 'type_question') {
      const currentType = updated[index].type_question;
      const newType = value as 'choix_unique' | 'choix_multiple' | 'vrai_faux';
      
      // Si on change le type de question, réinitialiser les réponses selon le nouveau type
      if (currentType !== newType) {
        if (newType === 'vrai_faux') {
          // Passage vers vrai/faux : initialiser avec Vrai et Faux
        updated[index] = {
          ...updated[index],
            type_question: newType,
          reponses: [
            { reponse: 'Vrai', est_correcte: false },
            { reponse: 'Faux', est_correcte: false },
          ],
        };
        } else if (currentType === 'vrai_faux') {
          // Passage de vrai/faux vers choix_unique ou choix_multiple : réinitialiser avec des réponses vides
          updated[index] = {
            ...updated[index],
            type_question: newType,
            reponses: [
              { reponse: '', est_correcte: false },
              { reponse: '', est_correcte: false },
              { reponse: '', est_correcte: false },
              { reponse: '', est_correcte: false },
            ],
          };
        } else {
          // Passage entre choix_unique et choix_multiple : garder les réponses mais réinitialiser les états est_correcte
          updated[index] = {
            ...updated[index],
            type_question: newType,
            reponses: updated[index].reponses.map(r => ({
              ...r,
              est_correcte: false, // Réinitialiser les états corrects lors du changement de type
            })),
          };
        }
      } else {
        // Même type, pas de changement
        updated[index] = { ...updated[index], type_question: newType };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setQuestions(updated);
  };

  const addReponse = (questionIndex: number) => {
    const updated = [...questions];
    // Ne pas permettre d'ajouter des réponses pour vrai/faux
    if (updated[questionIndex].type_question === 'vrai_faux') {
      return;
    }
    updated[questionIndex].reponses.push({ reponse: '', est_correcte: false });
    setQuestions(updated);
  };

  const removeReponse = (questionIndex: number, reponseIndex: number) => {
    const updated = [...questions];
    // Ne pas permettre de supprimer des réponses pour vrai/faux
    if (updated[questionIndex].type_question === 'vrai_faux') {
      return;
    }
    updated[questionIndex].reponses = updated[questionIndex].reponses.filter((_, i) => i !== reponseIndex);
    setQuestions(updated);
  };

  const updateReponse = (questionIndex: number, reponseIndex: number, field: keyof ReponseForm, value: any) => {
    const updated = [...questions];
    updated[questionIndex].reponses[reponseIndex] = {
      ...updated[questionIndex].reponses[reponseIndex],
      [field]: value,
    };
    // Si c'est un choix unique et qu'on marque une réponse comme correcte, désactiver les autres
    if (field === 'est_correcte' && value && updated[questionIndex].type_question === 'choix_unique') {
      updated[questionIndex].reponses.forEach((r, i) => {
        if (i !== reponseIndex) r.est_correcte = false;
      });
    }
    setQuestions(updated);
  };

  // Fonction de sauvegarde automatique
  const handleAutoSave = useCallback(async () => {
    // Ne pas sauvegarder si on est déjà en train de sauvegarder
    if (isSaving || isAutoSaving) {
      return;
    }

    // Ne pas sauvegarder s'il n'y a pas de questions
    if (questions.length === 0) {
      return;
    }

    // Ne pas sauvegarder si rien n'a changé (comparaison directe avec la dernière sauvegarde)
    const currentQuestionsJson = JSON.stringify(questions);
    if (currentQuestionsJson === lastSavedQuestions) {
      return;
    }

    setIsAutoSaving(true);
    try {
      // Créer ou mettre à jour le quiz
      let currentQuizId = quizId;
      if (!currentQuizId) {
        // Charger le titre du cours si pas encore chargé
        let titreCours = coursTitre;
        if (!titreCours) {
          try {
            const chapitreResponse = await fetch(`/api/chapitres?chapitreId=${chapitreId}`, {
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            });
            if (chapitreResponse.ok) {
              const chapitreData = await chapitreResponse.json();
              titreCours = chapitreData.chapitre?.titre || '';
            }
          } catch (error) {
            console.error('Erreur lors du chargement du chapitre:', error);
          }
        }
        
        const quizResponse = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cours_id: coursId,
            chapitre_id: chapitreId,
            titre: `Quiz - ${titreCours || `Chapitre ${chapitreId}`}`,
            duree_minutes: 30,
            nombre_tentatives_max: 3,
            seuil_reussite: 50,
            questions_aleatoires: false,
          }),
        });
        if (quizResponse.ok) {
          const quizData = await quizResponse.json();
          currentQuizId = quizData.quiz.id;
          setQuizId(currentQuizId);
        } else {
          return; // Ne pas continuer si la création du quiz échoue
        }
      }

      // Sauvegarder chaque question (seulement celles qui ont du contenu)
      const updatedQuestions = [...questions];
      
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question.trim()) continue;

        const questionData: any = {
          quiz_id: currentQuizId,
          question: q.question,
          type_question: q.type_question,
          points: 1,
          justification: q.hasJustification ? q.justification : null,
        };

        let reponsesData;
        if (q.type_question === 'vrai_faux') {
          reponsesData = [
            { reponse: 'Vrai', est_correcte: q.reponses[0]?.est_correcte || false, ordre_affichage: 1 },
            { reponse: 'Faux', est_correcte: q.reponses[1]?.est_correcte || false, ordre_affichage: 2 },
          ];
        } else {
          // Filtrer seulement les réponses non vides et qui ne sont pas des placeholders
          const reponsesValides = q.reponses.filter(r => {
            const reponseTrim = r.reponse.trim();
            // Exclure les réponses vides et les placeholders
            return reponseTrim && 
                   reponseTrim !== 'Ecris une bonne réponse' && 
                   reponseTrim !== 'Ecris une mauvaise réponse' &&
                   reponseTrim !== 'Écris une bonne réponse' &&
                   reponseTrim !== 'Écris une mauvaise réponse';
          });
          
          // Ne pas sauvegarder la question si elle n'a pas au moins une réponse valide
          if (reponsesValides.length === 0) {
            console.log(`[AutoSave] Question "${q.question.substring(0, 30)}..." ignorée : aucune réponse valide`);
            // Garder la question avec toutes ses réponses (y compris vides) dans le state
            continue;
          }
          
          reponsesData = reponsesValides.map((r, index) => ({
              reponse: r.reponse,
              est_correcte: r.est_correcte,
              ordre_affichage: index + 1,
            }));
        }

        if (q.id) {
          // Mettre à jour la question existante
          const updateResponse = await fetch('/api/quiz/questions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questionId: q.id,
              ...questionData,
              reponses_possibles: reponsesData,
            }),
          });

          if (updateResponse.ok) {
            const updateData = await updateResponse.json();
            // Mettre à jour les IDs des réponses sauvegardées, mais garder les réponses vides dans le state
            if (updateData.question && updateData.question.reponses_possibles) {
              const reponsesSauvegardees = reponsesData.map((r: any, idx: number) => ({
                id: updateData.question.reponses_possibles[idx]?.id,
                reponse: r.reponse,
                est_correcte: r.est_correcte,
              }));
              
              // Garder les réponses vides qui n'ont pas été sauvegardées
              const reponsesVides = q.reponses.filter(r => !r.reponse.trim());
              
              updatedQuestions[i] = {
                ...updatedQuestions[i],
                id: updateData.question.id,
                // Combiner les réponses sauvegardées avec les réponses vides
                reponses: [...reponsesSauvegardees, ...reponsesVides],
              };
            }
          }
        } else {
          // Créer une nouvelle question
          const createResponse = await fetch('/api/quiz/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...questionData,
              reponses_possibles: reponsesData,
            }),
          });

          if (createResponse.ok) {
            const createData = await createResponse.json();
            // IMPORTANT : Mettre à jour l'ID de la question créée dans le state
            if (createData.question) {
              const reponsesSauvegardees = reponsesData.map((r: any, idx: number) => ({
                id: createData.question.reponses_possibles?.[idx]?.id,
                reponse: r.reponse,
                est_correcte: r.est_correcte,
              }));
              
              // Garder les réponses vides qui n'ont pas été sauvegardées
              const reponsesVides = q.reponses.filter(r => !r.reponse.trim());
              
              updatedQuestions[i] = {
                ...updatedQuestions[i],
                id: createData.question.id,
                // Combiner les réponses sauvegardées avec les réponses vides
                reponses: [...reponsesSauvegardees, ...reponsesVides],
              };
            }
          }
        }
      }

      // Mettre à jour le state avec les IDs récupérés
      setQuestions(updatedQuestions);

      // Mettre à jour lastSavedQuestions après sauvegarde réussie
      setLastSavedQuestions(JSON.stringify(updatedQuestions));
      setHasUnsavedChanges(false);
      const saveTime = new Date();
      setLastAutoSaveTime(saveTime);
      // L'heure de la dernière sauvegarde reste affichée
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [questions, quizId, coursId, chapitreId, isSaving, isAutoSaving, hasUnsavedChanges]);

  // Sauvegarde automatique après 5 secondes d'inactivité
  useEffect(() => {
    if (!hasUnsavedChanges || isSaving || isAutoSaving || questions.length === 0) {
      return;
    }

    // Timer de 5 secondes
    const autoSaveTimer = setTimeout(() => {
      handleAutoSave();
    }, 5000); // 5 secondes

    // Nettoyer le timer si les questions changent avant les 5 secondes
    return () => {
      clearTimeout(autoSaveTimer);
    };
  }, [questions, hasUnsavedChanges, isSaving, isAutoSaving, handleAutoSave]);

  const handleSubmit = async () => {
    // VALIDATION : Vérifier qu'il y a au moins une question
    const questionsValides = questions.filter(q => q.question.trim());
    if (questionsValides.length === 0) {
      setModal({
        isOpen: true,
        message: 'Veuillez ajouter au moins une question avant de soumettre le quiz',
        type: 'warning',
        title: 'Validation requise'
      });
      return;
    }
    
    // VALIDATION : Vérifier que toutes les questions ont au moins une bonne réponse
    const validationErrors: string[] = [];
    let questionNum = 0;
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) continue; // Ignorer les questions vides
      
      questionNum++; // Numéro de la question valide
      
      // Filtrer les réponses valides (non vides)
      const reponsesValides = q.reponses.filter(r => r.reponse.trim());
      
      if (reponsesValides.length === 0) {
        validationErrors.push(`Question ${questionNum}: Aucune réponse valide`);
        continue;
      }
      
      // Compter les bonnes réponses
      const bonnesReponses = reponsesValides.filter(r => r.est_correcte).length;
      
      if (q.type_question === 'vrai_faux') {
        // Pour vrai/faux, il faut qu'une des deux réponses soit correcte
        const vraiCorrect = q.reponses[0]?.est_correcte || false;
        const fauxCorrect = q.reponses[1]?.est_correcte || false;
        if (!vraiCorrect && !fauxCorrect) {
          validationErrors.push(`Question ${questionNum}: Vous devez sélectionner au moins une bonne réponse (Vrai ou Faux)`);
        }
      } else if (q.type_question === 'choix_multiple') {
        // Pour choix multiple, il faut au moins 2 bonnes réponses
        if (bonnesReponses === 0) {
          validationErrors.push(`Question ${questionNum}: Vous devez sélectionner au moins une bonne réponse`);
        } else if (bonnesReponses < 2) {
          validationErrors.push(`Question ${questionNum}: Pour les questions à choix multiple, vous devez sélectionner au moins 2 bonnes réponses (actuellement: ${bonnesReponses})`);
        }
      } else if (q.type_question === 'choix_unique') {
        // Pour choix unique, il faut exactement 1 bonne réponse
        if (bonnesReponses === 0) {
          validationErrors.push(`Question ${questionNum}: Vous devez sélectionner une bonne réponse`);
        } else if (bonnesReponses > 1) {
          validationErrors.push(`Question ${questionNum}: Pour les questions à choix unique, vous ne pouvez sélectionner qu'une seule bonne réponse`);
        }
      }
    }
    
    // Si des erreurs de validation sont trouvées, afficher un message et empêcher la soumission
    if (validationErrors.length > 0) {
      const errorMessage = `Impossible de soumettre le quiz. Veuillez corriger les erreurs suivantes :\n\n${validationErrors.join('\n')}`;
      setModal({
        isOpen: true,
        message: errorMessage,
        type: 'error',
        title: 'Erreurs de validation'
      });
      setIsSaving(false);
      return;
    }
    
    setIsSaving(true);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuizEditorPage.tsx:544',message:'handleSubmit - Entry',data:{hasQuizId:!!quizId,questionsCount:questions.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'ALL'})}).catch(()=>{});
    // #endregion
    try {
      // Créer ou mettre à jour le quiz
      let currentQuizId = quizId;
      if (!currentQuizId) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuizEditorPage.tsx:549',message:'Creating quiz',data:{coursId,chapitreId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        const quizResponse = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cours_id: coursId,
            chapitre_id: chapitreId,
            titre: `Quiz - Chapitre ${chapitreId}`,
            duree_minutes: 30,
            nombre_tentatives_max: 3,
            seuil_reussite: 50,
            questions_aleatoires: false,
          }),
        });
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuizEditorPage.tsx:566',message:'Quiz creation response',data:{ok:quizResponse.ok,status:quizResponse.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        if (quizResponse.ok) {
          const quizData = await quizResponse.json();
          currentQuizId = quizData.quiz.id;
          setQuizId(currentQuizId);
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuizEditorPage.tsx:572',message:'Quiz created successfully',data:{quizId:currentQuizId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
          // #endregion
        } else {
          const errorData = await quizResponse.json().catch(() => ({}));
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuizEditorPage.tsx:577',message:'Quiz creation failed',data:{error:errorData.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
          // #endregion
          throw new Error(errorData.error || 'Erreur lors de la création du quiz');
        }
      }

      // Sauvegarder chaque question
      const updatedQuestions = [...questions];
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuizEditorPage.tsx:577',message:'Starting to save questions',data:{questionsCount:questions.length,quizId:currentQuizId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question.trim()) continue;
        
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuizEditorPage.tsx:584',message:'Processing question',data:{questionIndex:i,hasQuestionId:!!q.id,typeQuestion:q.type_question,reponsesCount:q.reponses.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion

        const questionData: any = {
          quiz_id: currentQuizId,
          question: q.question,
          type_question: q.type_question,
          points: 1,
          justification: q.hasJustification ? q.justification : null,
        };

        // Pour vrai/faux, s'assurer que les réponses sont "Vrai" et "Faux"
        let reponsesData;
        if (q.type_question === 'vrai_faux') {
          reponsesData = [
            { reponse: 'Vrai', est_correcte: q.reponses[0]?.est_correcte || false, ordre_affichage: 1 },
            { reponse: 'Faux', est_correcte: q.reponses[1]?.est_correcte || false, ordre_affichage: 2 },
          ];
        } else {
          // Filtrer seulement les réponses non vides et qui ne sont pas des placeholders
          const reponsesValides = q.reponses.filter(r => {
            const reponseTrim = r.reponse.trim();
            // Exclure les réponses vides et les placeholders
            return reponseTrim && 
                   reponseTrim !== 'Ecris une bonne réponse' && 
                   reponseTrim !== 'Ecris une mauvaise réponse' &&
                   reponseTrim !== 'Écris une bonne réponse' &&
                   reponseTrim !== 'Écris une mauvaise réponse';
          });
          
          // Ne pas sauvegarder la question si elle n'a pas au moins une réponse valide
          if (reponsesValides.length === 0) {
            console.log(`[Submit] Question "${q.question.substring(0, 30)}..." ignorée : aucune réponse valide`);
            // Garder la question avec toutes ses réponses (y compris vides) dans le state
            continue;
          }
          
          reponsesData = reponsesValides.map((r, index) => ({
              reponse: r.reponse,
              est_correcte: r.est_correcte,
              ordre_affichage: index + 1,
            }));
        }

        if (q.id) {
          // Mettre à jour la question existante
          const updateResponse = await fetch('/api/quiz/questions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questionId: q.id,
              ...questionData,
              reponses_possibles: reponsesData,
            }),
          });

          if (updateResponse.ok) {
            const updateData = await updateResponse.json();
            // Mettre à jour les IDs des réponses sauvegardées, mais garder les réponses vides dans le state
            if (updateData.question && updateData.question.reponses_possibles) {
              const reponsesSauvegardees = reponsesData.map((r: any, idx: number) => ({
                id: updateData.question.reponses_possibles[idx]?.id,
                reponse: r.reponse,
                est_correcte: r.est_correcte,
              }));
              
              // Garder les réponses vides qui n'ont pas été sauvegardées
              const reponsesVides = q.reponses.filter(r => !r.reponse.trim());
              
              updatedQuestions[i] = {
                ...updatedQuestions[i],
                id: updateData.question.id,
                // Combiner les réponses sauvegardées avec les réponses vides
                reponses: [...reponsesSauvegardees, ...reponsesVides],
              };
            }
          }
        } else {
          // Créer une nouvelle question
          const createResponse = await fetch('/api/quiz/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...questionData,
              reponses_possibles: reponsesData,
            }),
          });

          if (createResponse.ok) {
            const createData = await createResponse.json();
            // IMPORTANT : Mettre à jour l'ID de la question créée dans le state
            if (createData.question) {
              const reponsesSauvegardees = reponsesData.map((r: any, idx: number) => ({
                id: createData.question.reponses_possibles?.[idx]?.id,
                reponse: r.reponse,
                est_correcte: r.est_correcte,
              }));
              
              // Garder les réponses vides qui n'ont pas été sauvegardées
              const reponsesVides = q.reponses.filter(r => !r.reponse.trim());
              
              updatedQuestions[i] = {
                ...updatedQuestions[i],
                id: createData.question.id,
                // Combiner les réponses sauvegardées avec les réponses vides
                reponses: [...reponsesSauvegardees, ...reponsesVides],
              };
            }
          }
        }
      }

      // Mettre à jour le state avec les IDs récupérés
      setQuestions(updatedQuestions);

      // Mettre à jour l'état de sauvegarde après sauvegarde réussie
      setLastSavedQuestions(JSON.stringify(updatedQuestions));
      setHasUnsavedChanges(false);
      const saveTime = new Date();
      setLastAutoSaveTime(saveTime);
      // L'heure de la dernière sauvegarde reste affichée

      // Rediriger vers le chapitre après sauvegarde
      router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/cours/${coursId}/chapitre/${chapitreId}`);
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuizEditorPage.tsx:707',message:'Error caught in handleSubmit',data:{errorMessage:error instanceof Error ? error.message : String(error),errorStack:error instanceof Error ? error.stack : undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'ALL'})}).catch(()=>{});
      // #endregion
      console.error('Erreur lors de la sauvegarde du quiz:', error);
      setModal({
        isOpen: true,
        message: 'Erreur lors de la sauvegarde du quiz',
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
          <p className="text-[#032622]">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Flèche retour et indicateur de sauvegarde automatique */}
      <div className="mb-4 space-y-2">
        {/* Flèche retour */}
        <button
          onClick={() => router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/cours/${coursId}/chapitre/${chapitreId}`)}
          className="flex items-center gap-2 text-[#032622] hover:text-[#032622]/70 transition-colors"
          title="Retour au chapitre"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold uppercase text-sm" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            Retour au chapitre
          </span>
        </button>
        
        {/* Indicateur de sauvegarde automatique - affiché seulement pendant et juste après la sauvegarde */}
        {isAutoSaving && (
          <div className="bg-[#F8F5E4] border-b border-[#032622]/20 px-4 py-2 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#032622] animate-spin" />
            <span className="text-xs text-[#032622]/70" style={{ fontFamily: 'var(--font-termina-medium)' }}>
              Enregistrement automatique en cours...
            </span>
          </div>
        )}
        {!isAutoSaving && lastAutoSaveTime && (
          <div className="bg-[#F8F5E4] border-b border-[#032622]/20 px-4 py-2 flex items-center gap-2">
            <span className="text-xs text-[#032622]/70" style={{ fontFamily: 'var(--font-termina-medium)' }}>
              Dernière sauvegarde automatique : {lastAutoSaveTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Questions */}
        {questions.map((question, qIndex) => (
          <div key={qIndex} className="border-2 border-[#032622] p-4 bg-[#F8F5E4] space-y-4">
            {/* En-tête de la question */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#032622] uppercase" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                QUESTION {qIndex + 1}
              </h3>
              <button
                onClick={() => removeQuestion(qIndex)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Question et type */}
            <div className="flex gap-4">
              <input
                type="text"
                value={question.question}
                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                placeholder="ECRIS LA QUESTION ICI..."
                className="flex-1 px-4 py-3 border-2 border-[#032622] bg-[#F8F5E4] text-[#032622] font-bold"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              />
              <div className="relative">
                <select
                  value={question.type_question}
                  onChange={(e) => updateQuestion(qIndex, 'type_question', e.target.value)}
                  className="bg-[#032622] border-2 border-[#032622] text-[#F8F5E4] px-4 py-3 pr-10 font-bold uppercase appearance-none cursor-pointer"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  <option value="choix_unique">CHOIX UNIQUE</option>
                  <option value="choix_multiple">CHOIX MULTIPLE</option>
                  <option value="vrai_faux">VRAI/FAUX</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#F8F5E4] pointer-events-none" />
              </div>
            </div>

            {/* Réponses */}
            <div className="space-y-3">
              {question.reponses.map((reponse, rIndex) => (
                <div key={rIndex} className="flex items-center gap-3">
                  {question.type_question !== 'vrai_faux' && (
                    <button
                      onClick={() => updateReponse(qIndex, rIndex, 'est_correcte', !reponse.est_correcte)}
                      className={`w-10 h-10 flex items-center justify-center border-2 border-[#032622] ${
                        reponse.est_correcte
                          ? 'bg-[#032622] text-[#F8F5E4]'
                          : 'bg-[#F8F5E4] text-[#032622]'
                      }`}
                    >
                      {reponse.est_correcte ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                    </button>
                  )}
                  {question.type_question === 'vrai_faux' ? (
                    <button
                      type="button"
                      onClick={() => {
                        // Pour vrai/faux, on toggle la réponse correcte et on désactive l'autre
                        const updated = [...questions];
                        updated[qIndex].reponses.forEach((r, i) => {
                          r.est_correcte = i === rIndex;
                        });
                        setQuestions(updated);
                      }}
                      className={`flex-1 px-4 py-3 border-2 border-[#032622] font-bold cursor-pointer ${
                        reponse.est_correcte
                          ? 'bg-[#032622] text-[#F8F5E4]'
                          : 'bg-[#F8F5E4] text-[#032622] hover:bg-[#032622] hover:text-[#F8F5E4]'
                      } transition-colors`}
                      style={{ fontFamily: 'var(--font-termina-bold)' }}
                    >
                      {rIndex === 0 ? 'VRAI' : 'FAUX'}
                    </button>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={reponse.reponse}
                        onChange={(e) => updateReponse(qIndex, rIndex, 'reponse', e.target.value)}
                        placeholder={
                          reponse.est_correcte
                            ? 'Ecris une bonne réponse'
                            : 'Ecris une mauvaise réponse'
                        }
                        className={`flex-1 px-4 py-3 border-2 border-[#032622] ${
                          reponse.est_correcte
                            ? 'bg-[#032622] text-[#F8F5E4] placeholder-[#F8F5E4]/70'
                            : 'bg-[#F8F5E4] text-[#032622]'
                        } font-bold`}
                        style={{ fontFamily: 'var(--font-termina-bold)' }}
                      />
                      {question.reponses.length > 2 && (
                        <button
                          onClick={() => removeReponse(qIndex, rIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
              {question.type_question !== 'vrai_faux' && (
                <button
                  onClick={() => addReponse(qIndex)}
                  className="text-[#032622] hover:text-[#032622]/70 font-bold text-sm uppercase"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  + Ajouter une réponse
                </button>
              )}
            </div>

            {/* Justification */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={question.hasJustification}
                  onChange={(e) => updateQuestion(qIndex, 'hasJustification', e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="font-bold text-[#032622] uppercase" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                  JUSTIFICATION
                </span>
              </label>
              {question.hasJustification && (
                <textarea
                  value={question.justification || ''}
                  onChange={(e) => updateQuestion(qIndex, 'justification', e.target.value)}
                  placeholder="Ecris la justification ici..."
                  className="w-full px-4 py-3 border-2 border-[#032622] bg-[#032622] text-[#F8F5E4] min-h-[100px] font-bold"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bouton Ajouter une question - En bas */}
      <div className="mt-6">
        <button
          onClick={addQuestion}
          className="w-full bg-[#032622] text-[#F8F5E4] py-3 px-4 font-bold uppercase flex items-center justify-center gap-2 hover:bg-[#032622]/90 transition-colors"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          <Plus className="w-5 h-5" />
          AJOUTER UNE QUESTION
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 p-4 flex justify-end border-t-2 border-[#032622]">
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-[#032622] text-[#F8F5E4] px-4 py-2 font-bold uppercase hover:bg-[#032622]/90 transition-colors disabled:opacity-50 text-sm"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          {isSaving ? 'SAUVEGARDE...' : 'SOUMETTRE MON QUIZ'}
        </button>
      </div>

      {/* Modal pour les alertes */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        message={modal.message}
        type={modal.type}
        title={modal.title}
      />
    </div>
  );
};

