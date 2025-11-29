'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Upload, X, Check } from 'lucide-react';
import { EtudeCas } from '@/types/formation-detailed';

// Type pour les questions d'étude de cas (basé sur la structure de l'API)
interface QuestionEtudeCas {
  id: number;
  etude_cas_id: number;
  question: string;
  type_question: 'ouverte' | 'choix_unique' | 'choix_multiple' | 'vrai_faux' | 'piece_jointe';
  contenu_question?: string;
  image_url?: string;
  video_url?: string;
  fichier_question?: string;
  supports_annexes?: string[];
  points: number;
  ordre_affichage: number;
  actif: boolean;
  reponses_possibles?: {
    id: number;
    question_id: number;
    reponse: string;
    est_correcte: boolean;
    ordre_affichage: number;
  }[];
}

interface EtudeCasViewerProps {
  etudeCas: EtudeCas;
  questions: QuestionEtudeCas[];
  isPreview?: boolean;
  readOnly?: boolean;
  userSubmission?: any;
  onSubmit?: (reponses: any, fichiers: { [questionId: number]: File[] }, commentaire: string) => void;
  onGetAnswers?: (getAnswers: () => { answers: any; uploadedFiles: { [questionId: number]: File[] }; commentaire: string; allQuestionsAnswered: boolean }) => void;
}

export const EtudeCasViewer = ({ etudeCas, questions, isPreview = true, readOnly = false, userSubmission = null, onSubmit, onGetAnswers }: EtudeCasViewerProps) => {
  // Charger les réponses depuis userSubmission si en mode readOnly
  const initialAnswers = readOnly && userSubmission?.questions ? 
    userSubmission.questions.reduce((acc: any, q: any) => {
      if (q.reponse_etudiant) {
        if (q.type_question === 'ouverte') {
          acc[q.id] = q.reponse_etudiant.reponse_texte || '';
        } else if (q.type_question === 'piece_jointe') {
          acc[q.id] = q.reponse_etudiant.fichier_reponse || null;
        } else if (q.type_question === 'choix_unique' || q.type_question === 'vrai_faux') {
          acc[q.id] = q.reponse_etudiant.reponse_choix_id || null;
        } else if (q.type_question === 'choix_multiple') {
          acc[q.id] = q.reponse_etudiant.reponse_choix_ids || [];
        }
      }
      return acc;
    }, {}) : {};
  
  const [answers, setAnswers] = useState<{ [questionId: number]: any }>(initialAnswers);
  const [uploadedFiles, setUploadedFiles] = useState<{ [questionId: number]: File[] }>({});
  const [commentaire, setCommentaire] = useState<string>(readOnly && userSubmission ? (userSubmission.commentaire_etudiant || '') : '');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const handleTextAnswer = (questionId: number, value: string) => {
    if (readOnly) return; // Ne pas permettre la modification en mode lecture seule
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleChoiceAnswer = (questionId: number, reponseId: number, isMultiple: boolean) => {
    if (readOnly) return; // Ne pas permettre la modification en mode lecture seule
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        const currentArray = Array.isArray(current) ? current : [];
        if (currentArray.includes(reponseId)) {
          return { ...prev, [questionId]: currentArray.filter(id => id !== reponseId) };
        } else {
          return { ...prev, [questionId]: [...currentArray, reponseId] };
        }
      } else {
        return { ...prev, [questionId]: reponseId };
      }
    });
  };

  const handleFileUpload = (questionId: number, files: FileList | null) => {
    if (readOnly || !files) return; // Ne pas permettre l'upload en mode lecture seule
    setUploadedFiles(prev => ({
      ...prev,
      [questionId]: Array.from(files)
    }));
  };

  const handleRemoveFile = (questionId: number, fileIndex: number) => {
    setUploadedFiles(prev => {
      const current = prev[questionId] || [];
      return {
        ...prev,
        [questionId]: current.filter((_, i) => i !== fileIndex)
      };
    });
  };

  const allQuestionsAnswered = questions.every(q => {
    if (q.type_question === 'ouverte' || q.type_question === 'piece_jointe') {
      return answers[q.id] || (uploadedFiles[q.id] && uploadedFiles[q.id].length > 0);
    } else {
      return answers[q.id] !== undefined && answers[q.id] !== null;
    }
  });

  // Exposer une fonction pour récupérer les réponses (pour le bouton Terminé du parent)
  const getAnswers = () => ({
    answers,
    uploadedFiles,
    commentaire,
    allQuestionsAnswered
  });

  // Exposer la fonction au parent via le callback
  useEffect(() => {
    if (onGetAnswers && !readOnly) {
      onGetAnswers(getAnswers);
    }
  }, [answers, uploadedFiles, commentaire, allQuestionsAnswered, onGetAnswers, readOnly]);

  const handleConfirmClick = () => {
    if (allQuestionsAnswered) {
      setShowConfirmModal(true);
    } else {
      setShowWarningModal(true);
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    
    // Appeler le callback avec les réponses et fichiers organisés par questionId
    if (onSubmit) {
      onSubmit(answers, uploadedFiles, commentaire);
    } else {
      console.log('Réponses soumises:', { answers, uploadedFiles, commentaire });
    }
  };

  const handleReturnToQuestions = () => {
    setShowConfirmModal(false);
  };

  const handleCompleteAnswers = () => {
    setShowWarningModal(false);
  };

  const handleSendAnyway = () => {
    setShowWarningModal(false);
    
    // Appeler le callback avec les réponses et fichiers organisés par questionId
    if (onSubmit) {
      onSubmit(answers, uploadedFiles, commentaire);
    } else {
      console.log('Réponses soumises (incomplètes):', { answers, uploadedFiles, commentaire });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7 md:space-y-8">
      {/* En-tête */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#032622] uppercase mb-1.5 sm:mb-2 break-words" style={{ fontFamily: 'var(--font-termina-bold)' }}>
          {etudeCas.titre || 'ÉTUDE DE CAS FINALE'}
        </h2>
        {etudeCas.description && (
          <p className="text-sm sm:text-base text-[#032622]/70 mb-3 sm:mb-4 break-words">{etudeCas.description}</p>
        )}
      </div>

      {/* Consigne/Contexte */}
      <div className="bg-[#F8F5E4] border-2 border-[#032622] p-4 sm:p-5 md:p-6">
        <h3 className="text-base sm:text-lg font-bold text-[#032622] uppercase mb-3 sm:mb-4 break-words" style={{ fontFamily: 'var(--font-termina-bold)' }}>
          CONTEXTE
        </h3>
        {etudeCas.fichier_consigne ? (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 bg-white border-2 border-[#032622] rounded hover:bg-[#032622]/5 active:bg-[#032622]/10 transition-colors">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#032622] flex-shrink-0" />
                <span className="text-xs sm:text-sm text-[#032622] font-bold break-words">
                  {(etudeCas as any).nom_fichier_consigne || (() => {
                    try {
                      const url = new URL(etudeCas.fichier_consigne);
                      const pathParts = url.pathname.split('/');
                      return pathParts[pathParts.length - 1]?.split('?')[0] || 'Fichier consigne';
                    } catch {
                      return etudeCas.fichier_consigne.split('/').pop()?.split('?')[0] || 'Fichier consigne';
                    }
                  })()}
                </span>
              </div>
              <a
                href={etudeCas.fichier_consigne}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#032622] text-[#F8F5E4] hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors font-bold text-xs sm:text-sm uppercase w-full sm:w-auto whitespace-nowrap"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                Télécharger
              </a>
            </div>
            {etudeCas.consigne && (
              <div className="text-xs sm:text-sm md:text-base text-[#032622] whitespace-pre-wrap break-words">{etudeCas.consigne}</div>
            )}
          </div>
        ) : (
          <div className="text-xs sm:text-sm md:text-base text-[#032622] whitespace-pre-wrap break-words">{etudeCas.consigne}</div>
        )}
      </div>

      {/* Annexes du module */}
      {(etudeCas as any).supports_annexes && (etudeCas as any).supports_annexes.length > 0 && (
        <div className="bg-[#F8F5E4] border-2 border-[#032622] p-4 sm:p-5 md:p-6">
          <h3 className="text-base sm:text-lg font-bold text-[#032622] uppercase mb-3 sm:mb-4 break-words" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            ANNEXES
          </h3>
          <div className="space-y-2">
            {(etudeCas as any).supports_annexes.map((annexe: string, aIndex: number) => (
              <a
                key={aIndex}
                href={annexe}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 p-2 sm:p-3 bg-white border-2 border-[#032622] rounded hover:bg-[#032622]/5 active:bg-[#032622]/10 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#032622] flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-[#032622] font-bold break-words">
                    {(() => {
                      try {
                        const url = new URL(annexe);
                        const pathParts = url.pathname.split('/');
                        return pathParts[pathParts.length - 1]?.split('?')[0] || `Annexe ${aIndex + 1}`;
                      } catch {
                        return annexe.split('/').pop()?.split('?')[0] || `Annexe ${aIndex + 1}`;
                      }
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end">
                  <span className="text-[#032622] font-bold text-[10px] sm:text-xs uppercase whitespace-nowrap" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                    Télécharger
                  </span>
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#032622] flex-shrink-0" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-[#F8F5E4] border-2 border-[#032622] p-4 sm:p-5 md:p-6">
            <h3 className="text-base sm:text-lg font-bold text-[#032622] mb-3 sm:mb-4 break-words" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              QUESTION {index + 1} / {question.question}
            </h3>

            {/* Question ouverte */}
            {question.type_question === 'ouverte' && (
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                placeholder="Écrivez votre réponse ici..."
                disabled={readOnly}
                className={`w-full min-h-[150px] sm:min-h-[180px] md:min-h-[200px] px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#032622] bg-[#F8F5E4] text-xs sm:text-sm md:text-base text-[#032622] font-bold resize-none focus:outline-none focus:ring-2 focus:ring-[#032622] ${readOnly ? 'opacity-75 cursor-not-allowed' : ''}`}
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              />
            )}

            {/* Question avec pièce jointe */}
            {question.type_question === 'piece_jointe' && (
              <div className="space-y-3 sm:space-y-4">
                {question.contenu_question && (
                  <div className="text-xs sm:text-sm md:text-base text-[#032622] mb-3 sm:mb-4 break-words">{question.contenu_question}</div>
                )}
                <div className="border-2 border-dashed border-[#032622] p-4 sm:p-5 md:p-6 text-center">
                  {uploadedFiles[question.id] && uploadedFiles[question.id].length > 0 ? (
                    <div className="space-y-2">
                      {uploadedFiles[question.id].map((file, fileIndex) => (
                        <div key={fileIndex} className="flex items-center justify-between gap-2 p-2 sm:p-3 bg-[#F8F5E4] border-2 border-[#032622]">
                          <span className="text-xs sm:text-sm text-[#032622] font-bold break-words flex-1 min-w-0">{file.name}</span>
                          <button
                            onClick={() => handleRemoveFile(question.id, fileIndex)}
                            className="text-[#D96B6B] hover:text-[#D96B6B]/80 active:text-[#D96B6B]/60 transition-colors flex-shrink-0"
                            aria-label="Supprimer le fichier"
                          >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs sm:text-sm text-[#032622] mb-3 sm:mb-4 break-words">Déposez les fichiers ici ou</p>
                      <label className="bg-[#032622] text-[#F8F5E4] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold cursor-pointer inline-block hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.docx,.pptx"
                          onChange={(e) => handleFileUpload(question.id, e.target.files)}
                          className="hidden"
                        />
                        Sélectionnez des fichiers
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Questions à choix unique, multiple ou vrai/faux */}
            {(question.type_question === 'choix_unique' || 
              question.type_question === 'choix_multiple' || 
              question.type_question === 'vrai_faux') && (
              <div className="space-y-2 sm:space-y-3">
                {question.type_question === 'vrai_faux' ? (
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                    {question.reponses_possibles?.map((reponse) => {
                      const isSelected = answers[question.id] === reponse.id;
                      return (
                        <button
                          key={reponse.id}
                          onClick={() => handleChoiceAnswer(question.id, reponse.id, false)}
                          disabled={readOnly}
                          className={`px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border-2 text-xs sm:text-sm md:text-base font-bold transition-colors ${
                            isSelected
                              ? 'bg-[#032622] text-[#F8F5E4] border-[#032622]'
                              : 'bg-[#F8F5E4] text-[#032622] border-[#032622] hover:bg-[#032622] hover:text-[#F8F5E4] active:bg-[#032622]/80'
                          } ${readOnly ? 'opacity-75 cursor-not-allowed' : ''}`}
                          style={{ fontFamily: 'var(--font-termina-bold)' }}
                        >
                          {reponse.reponse.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  question.reponses_possibles?.map((reponse) => {
                    const isMultiple = question.type_question === 'choix_multiple';
                    const currentAnswer = answers[question.id];
                    const isSelected = isMultiple
                      ? Array.isArray(currentAnswer) && currentAnswer.includes(reponse.id)
                      : currentAnswer === reponse.id;

                    return (
                      <button
                        key={reponse.id}
                        onClick={() => handleChoiceAnswer(question.id, reponse.id, isMultiple)}
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
            )}

            {/* Supports annexes */}
            {question.supports_annexes && question.supports_annexes.length > 0 && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-[#032622]">
                <h4 className="font-bold text-[#032622] uppercase text-xs sm:text-sm mb-2 sm:mb-3 break-words" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                  SUPPORTS ANNEXES
                </h4>
                <div className="space-y-2">
                  {question.supports_annexes.map((annexe, aIndex) => (
                    <a
                      key={aIndex}
                      href={annexe}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 p-2 sm:p-3 bg-white border-2 border-[#032622] rounded hover:bg-[#032622]/5 active:bg-[#032622]/10 transition-colors"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#032622] flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-[#032622] font-bold break-words">
                          {(() => {
                            try {
                              const url = new URL(annexe);
                              const pathParts = url.pathname.split('/');
                              return pathParts[pathParts.length - 1]?.split('?')[0] || `Support ${aIndex + 1}`;
                            } catch {
                              return annexe.split('/').pop()?.split('?')[0] || `Support ${aIndex + 1}`;
                            }
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end">
                        <span className="text-[#032622] font-bold text-[10px] sm:text-xs uppercase whitespace-nowrap" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                          Télécharger
                        </span>
                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#032622] flex-shrink-0" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bouton de soumission - seulement en mode preview (admin) */}
      {isPreview && !readOnly && (
        <div className="w-full">
          <button
            onClick={handleConfirmClick}
            className="w-full px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-[#032622] text-xs sm:text-sm md:text-base text-[#F8F5E4] font-bold uppercase hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            CONFIRMER LES RÉPONSES
          </button>
        </div>
      )}

      {/* Modal de confirmation - seulement en mode preview (admin) */}
      {isPreview && showConfirmModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowConfirmModal(false);
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
              PRÊT À VALIDER TON ÉTUDE DE CAS ?
            </h3>
            <p className="text-sm sm:text-base text-[#032622] mb-4 sm:mb-5 md:mb-6 text-center break-words">
              Assure-toi d'avoir bien relu ton travail avant de l'envoyer. Une fois validé, tu ne pourras plus revenir en arrière.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
              <button
                onClick={handleReturnToQuestions}
                className="flex-1 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-[#032622] text-xs sm:text-sm md:text-base text-[#F8F5E4] font-bold uppercase hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                RETOURNER AUX QUESTIONS
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="flex-1 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-[#F8F5E4] border-2 border-[#032622] text-xs sm:text-sm md:text-base text-[#032622] font-bold uppercase hover:bg-[#F8F5E4]/90 active:bg-[#F8F5E4]/80 transition-colors"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                CONFIRMER L'ENVOI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'avertissement - seulement en mode preview (admin) */}
      {isPreview && showWarningModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowWarningModal(false);
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
              ATTENTION
            </h3>
            <p className="text-sm sm:text-base text-[#032622] mb-1.5 sm:mb-2 text-center font-bold uppercase break-words">
              TU N'AS PAS RÉPONDU À TOUTES LES QUESTIONS
            </p>
            <p className="text-sm sm:text-base text-[#032622] mb-4 sm:mb-5 md:mb-6 text-center break-words">
              Veux-tu vraiment envoyer ton étude de cas, ou préfères-tu la compléter avant validation ?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
              <button
                onClick={handleCompleteAnswers}
                className="flex-1 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-[#032622] text-xs sm:text-sm md:text-base text-[#F8F5E4] font-bold uppercase hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                COMPLÉTER MES RÉPONSES
              </button>
              <button
                onClick={handleSendAnyway}
                className="flex-1 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-[#F8F5E4] border-2 border-[#032622] text-xs sm:text-sm md:text-base text-[#032622] font-bold uppercase hover:bg-[#F8F5E4]/90 active:bg-[#F8F5E4]/80 transition-colors"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                ENVOYER MALGRÉ TOUT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

