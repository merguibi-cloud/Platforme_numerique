'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { QuizEvaluation, QuestionQuiz, ReponsePossible } from '@/types/formation-detailed';

interface QuizViewerProps {
  quiz: QuizEvaluation;
  questions: QuestionQuiz[];
  isPreview?: boolean;
  readOnly?: boolean;
  userAnswers?: any[] | null;
  quizResult?: { score: number; noteSur20: number; reponsesCorrectes: number; totalQuestions: number } | null;
  onQuizComplete?: (reponses?: { [questionId: number]: number[] }, tempsPasse?: number) => void;
}

export const QuizViewer = ({ quiz, questions, isPreview = true, readOnly = false, userAnswers: propUserAnswers = null, quizResult = null, onQuizComplete }: QuizViewerProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: number]: number[] }>({});
  const [showResults, setShowResults] = useState(readOnly); // Afficher directement les résultats si readOnly
  const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: number[] }>({});
  const startTimeRef = useRef<Date | null>(null);
  const [tempsPasseMinutes, setTempsPasseMinutes] = useState(0);

  // Si readOnly, charger les réponses depuis les props
  useEffect(() => {
    if (readOnly && propUserAnswers) {
      const answersMap: { [questionId: number]: number[] } = {};
      propUserAnswers.forEach((r: any) => {
        let reponseDonnee = r.reponse_donnee;
        try {
          reponseDonnee = JSON.parse(reponseDonnee);
        } catch {}
        answersMap[r.question_id] = Array.isArray(reponseDonnee) ? reponseDonnee : [reponseDonnee];
      });
      setUserAnswers(answersMap);
      setShowResults(true);
    }
  }, [readOnly, propUserAnswers]);

  // Démarrer le timer au chargement (seulement si pas readOnly)
  useEffect(() => {
    if (readOnly) return;
    startTimeRef.current = new Date();
    
    const interval = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000 / 60);
        setTempsPasseMinutes(elapsed);
      }
    }, 60000); // Mise à jour toutes les minutes

    return () => clearInterval(interval);
  }, [readOnly]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (questionId: number, reponseId: number, isMultiple: boolean) => {
    if (readOnly) return; // Ne pas permettre la sélection en mode lecture seule
    if (isMultiple) {
      setSelectedAnswers(prev => {
        const current = prev[questionId] || [];
        if (current.includes(reponseId)) {
          return { ...prev, [questionId]: current.filter(id => id !== reponseId) };
        } else {
          return { ...prev, [questionId]: [...current, reponseId] };
        }
      });
    } else {
      setSelectedAnswers(prev => ({ ...prev, [questionId]: [reponseId] }));
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Fin du quiz - afficher les résultats
      setUserAnswers(selectedAnswers);
      setShowResults(true);
      // Calculer le temps final
      const tempsFinal = startTimeRef.current 
        ? Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000 / 60)
        : tempsPasseMinutes;
      // Appeler le callback avec les réponses et le temps passé
      onQuizComplete?.(selectedAnswers, tempsFinal);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      const userAnswerIds = userAnswers[question.id] || [];
      const correctAnswerIds = question.reponses_possibles
        ?.filter(r => r.est_correcte)
        .map(r => r.id) || [];
      
      if (question.type_question === 'choix_multiple') {
        // Pour choix multiple, toutes les bonnes réponses doivent être sélectionnées
        if (userAnswerIds.length === correctAnswerIds.length &&
            correctAnswerIds.every(id => userAnswerIds.includes(id))) {
          correct++;
        }
      } else {
        // Pour choix unique ou vrai_faux
        if (userAnswerIds.length === 1 && correctAnswerIds.includes(userAnswerIds[0])) {
          correct++;
        }
      }
    });
    return { correct, total: questions.length, score: Math.round((correct / questions.length) * 20) };
  };

  if (showResults) {
    // Utiliser quizResult si fourni (mode readOnly), sinon calculer
    const result = quizResult ? {
      correct: quizResult.reponsesCorrectes,
      total: quizResult.totalQuestions,
      score: quizResult.noteSur20
    } : calculateScore();
    
    return (
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {/* Résultat */}
        <div className="text-center">
          <div className="inline-block bg-[#032622] p-4 sm:p-6 md:p-8 mb-3 sm:mb-4">
            <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#F8F5E4] mb-1 sm:mb-2">{result.score}/20</div>
            <div className="text-sm sm:text-base md:text-lg text-[#F8F5E4]/80 break-words">
              {result.correct} / {result.total} questions correctes
            </div>
            {readOnly && (
              <div className="text-xs sm:text-sm text-[#F8F5E4]/60 mt-1.5 sm:mt-2 break-words">
                Vous avez déjà complété ce quiz
              </div>
            )}
          </div>
        </div>

        {/* Détail des réponses */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {questions.map((question, qIndex) => {
            const userAnswerIds = userAnswers[question.id] || [];
            const correctAnswerIds = question.reponses_possibles?.filter(r => r.est_correcte).map(r => r.id) || [];
            const isCorrect = question.type_question === 'choix_multiple'
              ? userAnswerIds.length === correctAnswerIds.length &&
                correctAnswerIds.every(id => userAnswerIds.includes(id))
              : userAnswerIds.length === 1 && correctAnswerIds.includes(userAnswerIds[0]);

            return (
              <div key={question.id} className="bg-[#F8F5E4] border-2 border-[#032622] p-4 sm:p-5 md:p-6">
                <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                  {isCorrect ? (
                    <Check className="w-5 h-5 sm:w-6 sm:h-6 text-[#5AA469] flex-shrink-0 mt-0.5 sm:mt-1" />
                  ) : (
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#D96B6B] flex-shrink-0 mt-0.5 sm:mt-1" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-[#032622] mb-1.5 sm:mb-2 break-words">
                      QUESTION {qIndex + 1} / {question.question}
                    </h3>
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                  {question.reponses_possibles?.map((reponse) => {
                    const isUserAnswer = userAnswerIds.includes(reponse.id);
                    const isCorrectAnswer = reponse.est_correcte;
                    const isSelected = isUserAnswer;
                    
                    let bgColor = 'bg-[#F8F5E4]';
                    let borderColor = 'border-[#032622]';
                    let textColor = 'text-[#032622]';
                    
                    if (isSelected && isCorrectAnswer) {
                      bgColor = 'bg-[#5AA469]';
                      borderColor = 'border-[#5AA469]';
                      textColor = 'text-[#F8F5E4]';
                    } else if (isSelected && !isCorrectAnswer) {
                      bgColor = 'bg-[#D96B6B]';
                      borderColor = 'border-[#D96B6B]';
                      textColor = 'text-[#F8F5E4]';
                    } else if (!isSelected && isCorrectAnswer) {
                      bgColor = 'bg-[#F8F5E4]';
                      borderColor = 'border-[#5AA469]';
                      textColor = 'text-[#032622]';
                    }

                    return (
                      <div
                        key={reponse.id}
                        className={`${bgColor} ${borderColor} border-2 p-3 sm:p-4 flex items-center gap-2 sm:gap-3`}
                      >
                  {isSelected && isCorrectAnswer && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#F8F5E4] flex-shrink-0" />}
                  {isSelected && !isCorrectAnswer && <X className="w-4 h-4 sm:w-5 sm:h-5 text-[#F8F5E4] flex-shrink-0" />}
                  {!isSelected && isCorrectAnswer && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#5AA469] flex-shrink-0" />}
                        <span className={`${textColor} text-sm sm:text-base font-semibold flex-1 break-words`}>{reponse.reponse}</span>
                      </div>
                    );
                  })}
                </div>

                {question.justification && (
                  <div className="bg-[#032622] text-[#F8F5E4] p-3 sm:p-4">
                    <h4 className="text-sm sm:text-base font-bold mb-1.5 sm:mb-2 break-words">Pourquoi cette réponse ?</h4>
                    <p className="text-xs sm:text-sm break-words">{question.justification}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Bouton pour continuer - sera géré par la navigation du parent */}
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="text-center text-xs sm:text-sm md:text-base text-[#032622] break-words p-4">Aucune question disponible</div>;
  }

  const isMultiple = currentQuestion.type_question === 'choix_multiple';
  const selectedForCurrent = selectedAnswers[currentQuestion.id] || [];

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* En-tête du quiz */}
      <div className="text-center mb-6 sm:mb-7 md:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#032622] uppercase mb-1.5 sm:mb-2 break-words" style={{ fontFamily: 'var(--font-termina-bold)' }}>
          {quiz.titre || 'Quiz de fin de module'}
        </h2>
        {quiz.description && (
          <p className="text-sm sm:text-base text-[#032622]/70 break-words">{quiz.description}</p>
        )}
      </div>

      {/* Question actuelle */}
      <div className="bg-[#F8F5E4] border-2 border-[#032622] p-4 sm:p-5 md:p-6 lg:p-8">
        <div className="mb-4 sm:mb-5 md:mb-6">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#032622] mb-3 sm:mb-4 break-words">
            QUESTION {currentQuestionIndex + 1} / {questions.length} / {currentQuestion.question}
          </h3>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {currentQuestion.type_question === 'vrai_faux' ? (
            // Questions Vrai/Faux
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              {currentQuestion.reponses_possibles?.map((reponse) => {
                const isSelected = selectedForCurrent.includes(reponse.id);
                return (
                  <button
                    key={reponse.id}
                    onClick={() => handleAnswerSelect(currentQuestion.id, reponse.id, false)}
                    className={`px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border-2 text-xs sm:text-sm md:text-base font-bold transition-colors ${
                      isSelected
                        ? 'bg-[#032622] text-[#F8F5E4] border-[#032622]'
                        : 'bg-[#F8F5E4] text-[#032622] border-[#032622] hover:bg-[#032622] hover:text-[#F8F5E4] active:bg-[#032622]/80'
                    }`}
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    {reponse.reponse.toUpperCase()}
                  </button>
                );
              })}
            </div>
          ) : (
            // Questions à choix unique ou multiple
            currentQuestion.reponses_possibles?.map((reponse) => {
              const isSelected = selectedForCurrent.includes(reponse.id);
              return (
                <button
                  key={reponse.id}
                  onClick={() => handleAnswerSelect(currentQuestion.id, reponse.id, isMultiple)}
                  className={`w-full text-left px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 border-2 text-xs sm:text-sm md:text-base font-bold transition-colors break-words ${
                    isSelected
                      ? 'bg-[#032622] text-[#F8F5E4] border-[#032622]'
                      : 'bg-[#F8F5E4] text-[#032622] border-[#032622] hover:bg-[#032622] hover:text-[#F8F5E4] active:bg-[#032622]/80'
                  }`}
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {reponse.reponse}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-bold uppercase transition-colors ${
            currentQuestionIndex === 0
              ? 'bg-[#F8F5E4] text-[#032622]/50 border-2 border-[#032622]/30 cursor-not-allowed'
              : 'bg-[#F8F5E4] text-[#032622] border-2 border-[#032622] hover:bg-[#032622] hover:text-[#F8F5E4] active:bg-[#032622]/80'
          }`}
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          PRÉCÉDENTE
        </button>

        <button
          onClick={handleNext}
          className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-[#032622] text-xs sm:text-sm md:text-base text-[#F8F5E4] font-bold uppercase hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          <span className="break-words">{currentQuestionIndex === questions.length - 1 ? 'TERMINER' : 'SUIVANTE'}</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        </button>
      </div>
    </div>
  );
};

