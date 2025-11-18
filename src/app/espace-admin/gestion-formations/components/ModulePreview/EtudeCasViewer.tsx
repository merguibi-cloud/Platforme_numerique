'use client';

import { useState } from 'react';
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
}

export const EtudeCasViewer = ({ etudeCas, questions, isPreview = true }: EtudeCasViewerProps) => {
  const [answers, setAnswers] = useState<{ [questionId: number]: any }>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ [questionId: number]: File[] }>({});

  const handleTextAnswer = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleChoiceAnswer = (questionId: number, reponseId: number, isMultiple: boolean) => {
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
    if (!files) return;
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

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold text-[#032622] uppercase mb-2" style={{ fontFamily: 'var(--font-termina-bold)' }}>
          {etudeCas.titre || 'ÉTUDE DE CAS FINALE'}
        </h2>
        {etudeCas.description && (
          <p className="text-[#032622]/70 mb-4">{etudeCas.description}</p>
        )}
      </div>

      {/* Consigne */}
      <div className="bg-[#F8F5E4] border-2 border-[#032622] rounded-lg p-6">
        <h3 className="text-lg font-bold text-[#032622] uppercase mb-4" style={{ fontFamily: 'var(--font-termina-bold)' }}>
          CONTEXTE
        </h3>
        {etudeCas.fichier_consigne ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-white border-2 border-[#032622] rounded-lg">
              <FileText className="w-6 h-6 text-[#032622]" />
              <span className="text-[#032622] font-bold flex-1">
                {etudeCas.fichier_consigne.split('/').pop() || 'Fichier consigne'}
              </span>
              <a
                href={etudeCas.fichier_consigne}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#032622] text-[#F8F5E4] rounded hover:bg-[#032622]/90 transition-colors"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
            {etudeCas.consigne && (
              <div className="text-[#032622] whitespace-pre-wrap">{etudeCas.consigne}</div>
            )}
          </div>
        ) : (
          <div className="text-[#032622] whitespace-pre-wrap">{etudeCas.consigne}</div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-[#F8F5E4] border-2 border-[#032622] rounded-lg p-6">
            <h3 className="text-lg font-bold text-[#032622] mb-4" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              QUESTION {index + 1} / {question.question}
            </h3>

            {/* Question ouverte */}
            {question.type_question === 'ouverte' && (
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                placeholder="Écrivez votre réponse ici..."
                className="w-full min-h-[200px] px-4 py-3 border-2 border-[#032622] bg-white text-[#032622] rounded-lg font-bold"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
                disabled={isPreview}
              />
            )}

            {/* Question avec pièce jointe */}
            {question.type_question === 'piece_jointe' && (
              <div className="space-y-4">
                {question.contenu_question && (
                  <div className="text-[#032622] mb-4">{question.contenu_question}</div>
                )}
                <div className="border-2 border-dashed border-[#032622] p-6 text-center rounded-lg">
                  {uploadedFiles[question.id] && uploadedFiles[question.id].length > 0 ? (
                    <div className="space-y-2">
                      {uploadedFiles[question.id].map((file, fileIndex) => (
                        <div key={fileIndex} className="flex items-center justify-between p-3 bg-white border-2 border-[#032622] rounded">
                          <span className="text-[#032622] font-bold text-sm">{file.name}</span>
                          <button
                            onClick={() => handleRemoveFile(question.id, fileIndex)}
                            className="text-red-600 hover:text-red-800"
                            disabled={isPreview}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <p className="text-[#032622] mb-4">Déposez les fichiers ici ou</p>
                      <label className="bg-[#032622] text-[#F8F5E4] px-4 py-2 cursor-pointer inline-block rounded">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.docx,.pptx"
                          onChange={(e) => handleFileUpload(question.id, e.target.files)}
                          className="hidden"
                          disabled={isPreview}
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
              <div className="space-y-3">
                {question.type_question === 'vrai_faux' ? (
                  <div className="grid grid-cols-2 gap-4">
                    {question.reponses_possibles?.map((reponse) => {
                      const isSelected = answers[question.id] === reponse.id;
                      return (
                        <button
                          key={reponse.id}
                          onClick={() => handleChoiceAnswer(question.id, reponse.id, false)}
                          disabled={isPreview}
                          className={`px-6 py-4 border-2 rounded-lg font-bold transition-colors ${
                            isSelected
                              ? 'bg-[#032622] text-[#F8F5E4] border-[#032622]'
                              : 'bg-white text-[#032622] border-[#032622] hover:bg-[#032622] hover:text-[#F8F5E4]'
                          }`}
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
                        disabled={isPreview}
                        className={`w-full text-left px-6 py-4 border-2 rounded-lg font-bold transition-colors ${
                          isSelected
                            ? 'bg-[#032622] text-[#F8F5E4] border-[#032622]'
                            : 'bg-white text-[#032622] border-[#032622] hover:bg-[#032622] hover:text-[#F8F5E4]'
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
              <div className="mt-4 pt-4 border-t-2 border-[#032622]">
                <h4 className="font-bold text-[#032622] uppercase text-sm mb-3" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                  SUPPORTS ANNEXES
                </h4>
                <div className="space-y-2">
                  {question.supports_annexes.map((annexe, aIndex) => (
                    <a
                      key={aIndex}
                      href={annexe}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white border-2 border-[#032622] rounded hover:bg-[#032622]/5 transition-colors"
                    >
                      <span className="text-[#032622] font-bold text-sm">
                        {annexe.split('/').pop() || `Support ${aIndex + 1}`}
                      </span>
                      <Download className="w-4 h-4 text-[#032622]" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bouton de soumission (désactivé en mode preview) */}
      {!isPreview && (
        <div className="flex justify-center">
          <button
            disabled={!allQuestionsAnswered}
            className={`px-8 py-4 rounded-lg font-bold uppercase transition-colors ${
              allQuestionsAnswered
                ? 'bg-[#032622] text-[#F8F5E4] hover:bg-[#032622]/90'
                : 'bg-[#032622]/50 text-[#F8F5E4]/50 cursor-not-allowed'
            }`}
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            CONFIRMER LES RÉPONSES
          </button>
        </div>
      )}
    </div>
  );
};

