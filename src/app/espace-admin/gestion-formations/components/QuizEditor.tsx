'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Check, ChevronDown } from 'lucide-react';
import { QuestionQuiz, ReponsePossible, QuizEvaluation } from '@/types/formation-detailed';
import { Modal } from '@/app/Modal';

interface QuizEditorProps {
  coursId: number;
  moduleId: number;
  existingQuizId?: number | null;
  onClose: () => void;
  onSave: () => void;
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

export const QuizEditor = ({ coursId, moduleId, existingQuizId, onClose, onSave }: QuizEditorProps) => {
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [quizId, setQuizId] = useState<number | null>(existingQuizId || null);
  const [coursTitre, setCoursTitre] = useState<string>('');

  // Charger le cours pour obtenir son titre
  useEffect(() => {
    const loadCours = async () => {
      try {
        const response = await fetch(`/api/chapitres?chapitreId=${coursId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.cours) {
            setCoursTitre(data.cours.titre || '');
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du cours:', error);
      }
    };
    loadCours();
  }, [coursId]);

  // Charger le quiz existant si on est en mode édition
  useEffect(() => {
    const loadQuiz = async () => {
      if (existingQuizId) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/quiz?quizId=${existingQuizId}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          if (response.ok) {
            const data = await response.json();
            setQuizId(data.quiz.id);
            // Convertir les questions en format formulaire
            const formattedQuestions: QuestionForm[] = (data.questions || []).map((q: QuestionQuiz) => ({
              id: q.id,
              question: q.question,
              type_question: q.type_question as 'choix_unique' | 'choix_multiple' | 'vrai_faux',
              reponses: (q.reponses_possibles || []).map((r: ReponsePossible) => ({
                id: r.id,
                reponse: r.reponse,
                est_correcte: r.est_correcte,
              })),
              justification: q.justification,
              hasJustification: !!q.justification,
            }));
            setQuestions(formattedQuestions);
          }
        } catch (error) {
          console.error('Erreur lors du chargement du quiz:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadQuiz();
  }, [existingQuizId]);

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
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setQuestions(updated);
  };

  const addReponse = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].reponses.push({ reponse: '', est_correcte: false });
    setQuestions(updated);
  };

  const removeReponse = (questionIndex: number, reponseIndex: number) => {
    const updated = [...questions];
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

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      // Créer ou mettre à jour le quiz
      let currentQuizId = quizId;
      if (!currentQuizId) {
        // Charger le titre du cours si pas encore chargé
        let titreCours = coursTitre;
        if (!titreCours) {
          try {
            const coursResponse = await fetch(`/api/cours?coursId=${coursId}`, {
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            });
            if (coursResponse.ok) {
              const coursData = await coursResponse.json();
              titreCours = coursData.cours?.titre || '';
            }
          } catch (error) {
            console.error('Erreur lors du chargement du cours:', error);
          }
        }
        
        const quizResponse = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module_id: moduleId,
            cours_id: coursId,
            titre: `Quiz - ${titreCours || `Partie ${coursId}`}`,
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

        const reponsesData = q.reponses
          .filter(r => r.reponse.trim())
          .map((r, index) => ({
            reponse: r.reponse,
            est_correcte: r.est_correcte,
            ordre_affichage: index + 1,
          }));

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
            // Mettre à jour les IDs des réponses dans le state
            if (updateData.question && updateData.question.reponses_possibles) {
              updatedQuestions[i] = {
                ...updatedQuestions[i],
                id: updateData.question.id,
                reponses: reponsesData.map((r: any, idx: number) => ({
                  id: updateData.question.reponses_possibles[idx]?.id,
                  reponse: r.reponse,
                  est_correcte: r.est_correcte,
                })),
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
              updatedQuestions[i] = {
                ...updatedQuestions[i],
                id: createData.question.id,
                // Mettre à jour les IDs des réponses
                reponses: reponsesData.map((r: any, idx: number) => ({
                  id: createData.question.reponses_possibles?.[idx]?.id,
                  reponse: r.reponse,
                  est_correcte: r.est_correcte,
                })),
              };
            }
          }
        }
      }

      // Mettre à jour le state avec les IDs récupérés
      setQuestions(updatedQuestions);

      onSave();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du quiz:', error);
      setErrorMessage('Erreur lors de la sauvegarde du quiz');
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
        <div className="bg-[#F8F5E4] p-4 sm:p-6 md:p-8 rounded-lg max-w-md w-full">
          <p className="text-xs sm:text-sm md:text-base text-[#032622] break-words text-center">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-0 sm:p-3 md:p-4">
      <div className="bg-[#F8F5E4] w-full max-w-4xl m-0 sm:m-4 border-2 border-[#032622] relative min-h-screen sm:min-h-0">
        {/* Header */}
        <div className="bg-[#032622] text-[#F8F5E4] p-3 sm:p-4 flex items-center justify-between gap-2">
          <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold uppercase break-words pr-2" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            CRÉATION DE QUIZ DE LA PARTIE
          </h2>
          <button
            onClick={onClose}
            className="text-[#F8F5E4] hover:text-[#032622] active:text-[#F8F5E4]/80 transition-colors flex-shrink-0"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-4 sm:space-y-5 md:space-y-6 max-h-[calc(100vh-180px)] sm:max-h-[80vh] overflow-y-auto">
          {/* Bouton Ajouter une question */}
          <button
            onClick={addQuestion}
            className="w-full bg-[#032622] text-[#F8F5E4] py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm md:text-base font-bold uppercase flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            AJOUTER UNE QUESTION
          </button>

          {/* Questions */}
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="border-2 border-[#032622] p-3 sm:p-4 bg-[#F8F5E4] space-y-3 sm:space-y-4">
              {/* En-tête de la question */}
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-[#032622] uppercase break-words" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                  QUESTION {qIndex + 1}
                </h3>
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-600 hover:text-red-800 active:text-red-900 transition-colors flex-shrink-0"
                  aria-label={`Supprimer la question ${qIndex + 1}`}
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Question et type */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  placeholder="ECRIS LA QUESTION ICI..."
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border-2 border-[#032622] bg-[#F8F5E4] text-xs sm:text-sm md:text-base text-[#032622] font-bold min-w-0"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                />
                <div className="relative flex-shrink-0">
                  <select
                    value={question.type_question}
                    onChange={(e) => updateQuestion(qIndex, 'type_question', e.target.value)}
                    className="bg-[#032622] text-[#F8F5E4] px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pr-8 sm:pr-10 text-xs sm:text-sm md:text-base font-bold uppercase appearance-none cursor-pointer w-full sm:w-auto"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    <option value="choix_unique">CHOIX UNIQUE</option>
                    <option value="choix_multiple">CHOIX MULTIPLE</option>
                    <option value="vrai_faux">VRAI/FAUX</option>
                  </select>
                  <ChevronDown className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#F8F5E4] pointer-events-none" />
                </div>
              </div>

              {/* Réponses */}
              <div className="space-y-2 sm:space-y-3">
                {question.reponses.map((reponse, rIndex) => (
                  <div key={rIndex} className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => updateReponse(qIndex, rIndex, 'est_correcte', !reponse.est_correcte)}
                      className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center border-2 border-[#032622] flex-shrink-0 transition-colors ${
                        reponse.est_correcte
                          ? 'bg-[#032622] text-[#F8F5E4]'
                          : 'bg-[#F8F5E4] text-[#032622]'
                      }`}
                      aria-label={reponse.est_correcte ? "Réponse correcte" : "Réponse incorrecte"}
                    >
                      {reponse.est_correcte ? (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={reponse.reponse}
                      onChange={(e) => updateReponse(qIndex, rIndex, 'reponse', e.target.value)}
                      placeholder={
                        reponse.est_correcte
                          ? 'Ecris une bonne réponse'
                          : 'Ecris une mauvaise réponse'
                      }
                      className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border-2 border-[#032622] text-xs sm:text-sm md:text-base min-w-0 ${
                        reponse.est_correcte
                          ? 'bg-[#032622] text-[#F8F5E4] placeholder-[#F8F5E4]/70'
                          : 'bg-[#F8F5E4] text-[#032622]'
                      } font-bold`}
                      style={{ fontFamily: 'var(--font-termina-bold)' }}
                    />
                    {question.reponses.length > 2 && (
                      <button
                        onClick={() => removeReponse(qIndex, rIndex)}
                        className="text-red-600 hover:text-red-800 active:text-red-900 transition-colors flex-shrink-0"
                        aria-label="Supprimer cette réponse"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addReponse(qIndex)}
                  className="text-[#032622] hover:text-[#032622]/70 active:text-[#032622]/50 font-bold text-xs sm:text-sm uppercase transition-colors"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  + Ajouter une réponse
                </button>
              </div>

              {/* Justification */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={question.hasJustification}
                    onChange={(e) => updateQuestion(qIndex, 'hasJustification', e.target.checked)}
                    className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-bold text-[#032622] uppercase break-words" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                    JUSTIFICATION
                  </span>
                </label>
                {question.hasJustification && (
                  <textarea
                    value={question.justification || ''}
                    onChange={(e) => updateQuestion(qIndex, 'justification', e.target.value)}
                    placeholder="Ecris la justification ici..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#032622] bg-[#032622] text-xs sm:text-sm md:text-base text-[#F8F5E4] min-h-[80px] sm:min-h-[100px] font-bold resize-none focus:outline-none focus:ring-2 focus:ring-[#F8F5E4]"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-[#032622] p-3 sm:p-4 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 md:gap-4">
          <button
            onClick={onClose}
            className="bg-[#F8F5E4] text-[#032622] px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-bold uppercase hover:bg-[#F8F5E4]/90 active:bg-[#F8F5E4]/80 transition-colors w-full sm:w-auto"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            ANNULER
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-[#F8F5E4] text-[#032622] px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-bold uppercase hover:bg-[#F8F5E4]/90 active:bg-[#F8F5E4]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            {isSaving ? 'SAUVEGARDE...' : 'SOUMETTRE MON QUIZ'}
          </button>
        </div>
      </div>

      {/* Modal d'erreur */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          setErrorMessage('');
        }}
        title="Erreur"
        message={errorMessage}
        type="error"
      />
    </div>
  );
};

