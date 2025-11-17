'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Check, X, ChevronDown, RefreshCw, ArrowLeft } from 'lucide-react';
import { QuestionQuiz, ReponsePossible } from '@/types/formation-detailed';

interface QuizEditorPageProps {
  coursId: number;
  moduleId: number;
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

export const QuizEditorPage = ({ coursId, moduleId, formationId, blocId }: QuizEditorPageProps) => {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [quizId, setQuizId] = useState<number | null>(null);
  const [lastSavedQuestions, setLastSavedQuestions] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<Date | null>(null);

  // Charger le quiz existant pour ce cours
  useEffect(() => {
    const loadQuiz = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/quiz?coursId=${coursId}`, {
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
  }, [coursId]);

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

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuestionForm, value: any) => {
    const updated = [...questions];
    if (field === 'hasJustification') {
      updated[index] = { ...updated[index], hasJustification: value, justification: value ? updated[index].justification : '' };
    } else if (field === 'type_question') {
      // Si on change vers vrai_faux, initialiser avec Vrai et Faux
      if (value === 'vrai_faux') {
        updated[index] = {
          ...updated[index],
          type_question: value,
          reponses: [
            { reponse: 'Vrai', est_correcte: false },
            { reponse: 'Faux', est_correcte: false },
          ],
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
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
    if (isSaving || isAutoSaving || !hasUnsavedChanges) {
      return;
    }

    // Ne pas sauvegarder s'il n'y a pas de questions
    if (questions.length === 0) {
      return;
    }

    setIsAutoSaving(true);
    try {
      // Créer ou mettre à jour le quiz
      let currentQuizId = quizId;
      if (!currentQuizId) {
        const quizResponse = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module_id: moduleId,
            cours_id: coursId,
            titre: `Quiz - Partie ${coursId}`,
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
          reponsesData = q.reponses
            .filter(r => r.reponse.trim())
            .map((r, index) => ({
              reponse: r.reponse,
              est_correcte: r.est_correcte,
              ordre_affichage: index + 1,
            }));
        }

        if (q.id) {
          // Mettre à jour la question existante
          await fetch('/api/quiz/questions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questionId: q.id,
              ...questionData,
              reponses_possibles: reponsesData,
            }),
          });
        } else {
          // Créer une nouvelle question
          await fetch('/api/quiz/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...questionData,
              reponses_possibles: reponsesData,
            }),
          });
        }
      }

      // Mettre à jour lastSavedQuestions après sauvegarde réussie
      setLastSavedQuestions(JSON.stringify(questions));
      setHasUnsavedChanges(false);
      setLastAutoSaveTime(new Date());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [questions, quizId, moduleId, coursId, isSaving, isAutoSaving, hasUnsavedChanges]);

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
    setIsSaving(true);
    try {
      // Créer ou mettre à jour le quiz
      let currentQuizId = quizId;
      if (!currentQuizId) {
        const quizResponse = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module_id: moduleId,
            cours_id: coursId,
            titre: `Quiz - Partie ${coursId}`,
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
          throw new Error('Erreur lors de la création du quiz');
        }
      }

      // Sauvegarder chaque question
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

        // Pour vrai/faux, s'assurer que les réponses sont "Vrai" et "Faux"
        let reponsesData;
        if (q.type_question === 'vrai_faux') {
          reponsesData = [
            { reponse: 'Vrai', est_correcte: q.reponses[0]?.est_correcte || false, ordre_affichage: 1 },
            { reponse: 'Faux', est_correcte: q.reponses[1]?.est_correcte || false, ordre_affichage: 2 },
          ];
        } else {
          reponsesData = q.reponses
            .filter(r => r.reponse.trim())
            .map((r, index) => ({
              reponse: r.reponse,
              est_correcte: r.est_correcte,
              ordre_affichage: index + 1,
            }));
        }

        if (q.id) {
          // Mettre à jour la question existante
          await fetch('/api/quiz/questions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questionId: q.id,
              ...questionData,
              reponses_possibles: reponsesData,
            }),
          });
        } else {
          // Créer une nouvelle question
          await fetch('/api/quiz/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...questionData,
              reponses_possibles: reponsesData,
            }),
          });
        }
      }

      // Mettre à jour l'état de sauvegarde après sauvegarde réussie
      setLastSavedQuestions(JSON.stringify(questions));
      setHasUnsavedChanges(false);
      setLastAutoSaveTime(new Date());

      // Rediriger vers le cours après sauvegarde
      router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/module/${moduleId}/cours/${coursId}`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du quiz:', error);
      alert('Erreur lors de la sauvegarde du quiz');
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
          onClick={() => router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/module/${moduleId}/cours/${coursId}`)}
          className="flex items-center gap-2 text-[#032622] hover:text-[#032622]/70 transition-colors"
          title="Retour au cours"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold uppercase text-sm" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            Retour au cours
          </span>
        </button>
        
        {/* Indicateur de sauvegarde automatique */}
        {(lastAutoSaveTime || isAutoSaving) && (
          <div className="bg-[#F8F5E4] border-b border-[#032622]/20 px-4 py-2 flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 text-[#032622] ${isAutoSaving ? 'animate-spin' : ''}`} />
            <span className="text-xs text-[#032622]/70" style={{ fontFamily: 'var(--font-termina-medium)' }}>
              {isAutoSaving ? (
                'Enregistrement automatique en cours...'
              ) : (
                `Enregistrement automatique - ${lastAutoSaveTime?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
              )}
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
                  className="bg-[#032622] text-[#F8F5E4] px-4 py-3 pr-10 font-bold uppercase appearance-none cursor-pointer"
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
          {isSaving ? 'SAUVEGARDE...' : 'SOUMETTRE MON MODULE'}
        </button>
      </div>
    </div>
  );
};

