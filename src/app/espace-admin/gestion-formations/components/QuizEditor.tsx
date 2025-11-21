'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Check, ChevronDown } from 'lucide-react';
import { QuestionQuiz, ReponsePossible, QuizEvaluation } from '@/types/formation-detailed';

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
      alert('Erreur lors de la sauvegarde du quiz');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[#F8F5E4] p-8 rounded-lg">
          <p className="text-[#032622]">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-[#F8F5E4] w-full max-w-4xl m-4 border-2 border-[#032622] relative">
        {/* Header */}
        <div className="bg-[#032622] text-[#F8F5E4] p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold uppercase" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            CRÉATION DE QUIZ DE LA PARTIE
          </h2>
          <button
            onClick={onClose}
            className="text-[#F8F5E4] hover:text-[#032622] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Bouton Ajouter une question */}
          <button
            onClick={addQuestion}
            className="w-full bg-[#032622] text-[#F8F5E4] py-3 px-4 font-bold uppercase flex items-center justify-center gap-2 hover:bg-[#032622]/90 transition-colors"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            <Plus className="w-5 h-5" />
            AJOUTER UNE QUESTION
          </button>

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
                  </div>
                ))}
                <button
                  onClick={() => addReponse(qIndex)}
                  className="text-[#032622] hover:text-[#032622]/70 font-bold text-sm uppercase"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  + Ajouter une réponse
                </button>
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

        {/* Footer */}
        <div className="bg-[#032622] p-4 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-[#F8F5E4] text-[#032622] px-6 py-3 font-bold uppercase hover:bg-[#F8F5E4]/90 transition-colors"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            ANNULER
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-[#032622] text-[#F8F5E4] px-6 py-3 font-bold uppercase hover:bg-[#032622]/90 transition-colors disabled:opacity-50"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            {isSaving ? 'SAUVEGARDE...' : 'SOUMETTRE MON QUIZ'}
          </button>
        </div>
      </div>
    </div>
  );
};

