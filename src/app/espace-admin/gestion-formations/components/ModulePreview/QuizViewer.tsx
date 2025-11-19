'use client';

import { useState } from 'react';
import { Check, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { QuizEvaluation, QuestionQuiz, ReponsePossible } from '@/types/formation-detailed';

interface QuizViewerProps {
  quiz: QuizEvaluation;
  questions: QuestionQuiz[];
  isPreview?: boolean;
  onQuizComplete?: () => void;
}

export const QuizViewer = ({ quiz, questions, isPreview = true, onQuizComplete }: QuizViewerProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: number]: number[] }>({});
  const [showResults, setShowResults] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: number[] }>({});

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (questionId: number, reponseId: number, isMultiple: boolean) => {
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
      // Appeler le callback pour indiquer que le quiz est terminé
      onQuizComplete?.();
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
    const { correct, total, score } = calculateScore();
    
    return (
      <div className="space-y-6">
        {/* Résultat */}
        <div className="text-center">
          <div className="inline-block bg-[#032622] p-8 mb-4">
            <div className="text-6xl font-bold text-[#F8F5E4] mb-2">{score}/20</div>
            <div className="text-lg text-[#F8F5E4]/80">
              {correct} / {total} questions correctes
            </div>
          </div>
        </div>

        {/* Détail des réponses */}
        <div className="space-y-6">
          {questions.map((question, qIndex) => {
            const userAnswerIds = userAnswers[question.id] || [];
            const correctAnswerIds = question.reponses_possibles?.filter(r => r.est_correcte).map(r => r.id) || [];
            const isCorrect = question.type_question === 'choix_multiple'
              ? userAnswerIds.length === correctAnswerIds.length &&
                correctAnswerIds.every(id => userAnswerIds.includes(id))
              : userAnswerIds.length === 1 && correctAnswerIds.includes(userAnswerIds[0]);

            return (
              <div key={question.id} className="bg-[#F8F5E4] border-2 border-[#032622] p-6">
                <div className="flex items-start gap-3 mb-4">
                  {isCorrect ? (
                    <Check className="w-6 h-6 text-[#5AA469] flex-shrink-0 mt-1" />
                  ) : (
                    <X className="w-6 h-6 text-[#D96B6B] flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#032622] mb-2">
                      QUESTION {qIndex + 1} / {question.question}
                    </h3>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
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
                        className={`${bgColor} ${borderColor} border-2 p-4 flex items-center gap-3`}
                      >
                  {isSelected && isCorrectAnswer && <Check className="w-5 h-5 text-[#F8F5E4]" />}
                  {isSelected && !isCorrectAnswer && <X className="w-5 h-5 text-[#F8F5E4]" />}
                  {!isSelected && isCorrectAnswer && <Check className="w-5 h-5 text-[#5AA469]" />}
                        <span className={`${textColor} font-semibold flex-1`}>{reponse.reponse}</span>
                      </div>
                    );
                  })}
                </div>

                {question.justification && (
                  <div className="bg-[#032622] text-[#F8F5E4] p-4">
                    <h4 className="font-bold mb-2">Pourquoi cette réponse ?</h4>
                    <p className="text-sm">{question.justification}</p>
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
    return <div className="text-center text-[#032622]">Aucune question disponible</div>;
  }

  const isMultiple = currentQuestion.type_question === 'choix_multiple';
  const selectedForCurrent = selectedAnswers[currentQuestion.id] || [];

  return (
    <div className="space-y-6">
      {/* En-tête du quiz */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#032622] uppercase mb-2" style={{ fontFamily: 'var(--font-termina-bold)' }}>
          {quiz.titre || 'Quiz de fin de module'}
        </h2>
        {quiz.description && (
          <p className="text-[#032622]/70">{quiz.description}</p>
        )}
      </div>

      {/* Question actuelle */}
      <div className="bg-[#F8F5E4] border-2 border-[#032622] p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-[#032622] mb-4">
            QUESTION {currentQuestionIndex + 1} / {questions.length} / {currentQuestion.question}
          </h3>
        </div>

        <div className="space-y-3">
          {currentQuestion.type_question === 'vrai_faux' ? (
            // Questions Vrai/Faux
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.reponses_possibles?.map((reponse) => {
                const isSelected = selectedForCurrent.includes(reponse.id);
                return (
                  <button
                    key={reponse.id}
                    onClick={() => handleAnswerSelect(currentQuestion.id, reponse.id, false)}
                    className={`px-6 py-4 border-2 font-bold transition-colors ${
                      isSelected
                        ? 'bg-[#032622] text-[#F8F5E4] border-[#032622]'
                        : 'bg-[#F8F5E4] text-[#032622] border-[#032622] hover:bg-[#032622] hover:text-[#F8F5E4]'
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
                  className={`w-full text-left px-6 py-4 border-2 font-bold transition-colors ${
                    isSelected
                      ? 'bg-[#032622] text-[#F8F5E4] border-[#032622]'
                      : 'bg-[#F8F5E4] text-[#032622] border-[#032622] hover:bg-[#032622] hover:text-[#F8F5E4]'
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
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`flex items-center gap-2 px-6 py-3 font-bold uppercase transition-colors ${
            currentQuestionIndex === 0
              ? 'bg-[#F8F5E4] text-[#032622]/50 border-2 border-[#032622]/30 cursor-not-allowed'
              : 'bg-[#F8F5E4] text-[#032622] border-2 border-[#032622] hover:bg-[#032622] hover:text-[#F8F5E4]'
          }`}
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          <ArrowLeft className="w-5 h-5" />
          PRÉCÉDENTE
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 bg-[#032622] text-[#F8F5E4] font-bold uppercase hover:bg-[#032622]/90 transition-colors"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          {currentQuestionIndex === questions.length - 1 ? 'TERMINER' : 'SUIVANTE'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

