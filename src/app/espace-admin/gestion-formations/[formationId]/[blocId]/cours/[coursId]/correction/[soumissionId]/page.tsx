'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import AdminTopBar from '@/app/espace-admin/components/AdminTopBar';
import { Modal } from '@/app/Modal';

interface Question {
  id: number;
  question: string;
  type_question: 'ouverte' | 'choix_unique' | 'choix_multiple' | 'vrai_faux' | 'piece_jointe';
  contenu_question?: string;
  points: number;
  ordre_affichage: number;
  reponses_possibles_etude_cas?: {
    id: number;
    reponse: string;
    est_correcte: boolean;
  }[];
  reponse_etudiant: any;
  correction: {
    note_attribuee: number;
    note_max: number;
    commentaire_correction: string | null;
  } | null;
}

interface CorrectionData {
  soumission: {
    id: number;
    etudiant: {
      nom: string;
      prenom: string;
      email: string;
    };
    date_soumission: string;
    commentaire_etudiant: string | null;
    fichier_soumis: string | null;
    statut: string;
    note: number | null;
    commentaire_correcteur: string | null;
  };
  etude_cas: {
    id: number;
    titre: string;
    description?: string;
    consigne: string;
    fichier_consigne: string | null;
    nom_fichier_consigne?: string;
    date_limite?: string;
    points_max: number;
  };
  cours: {
    id: number;
    titre: string;
  };
  bloc: {
    id: number;
    numero_bloc: number;
    titre: string;
  };
  formation: {
    id: number;
    titre: string;
    ecole: string;
  };
  questions: Question[];
}

export default function CorrectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const formationId = params.formationId as string;
  const blocId = params.blocId as string;
  const coursId = params.coursId as string;
  const soumissionId = params.soumissionId as string;

  const [data, setData] = useState<CorrectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [corrections, setCorrections] = useState<{ [questionId: number]: { note: number; message: string } }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showJustificationModal, setShowJustificationModal] = useState(false);
  const [justification, setJustification] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [noteAvant, setNoteAvant] = useState<number | null>(null);
  const [noteApres, setNoteApres] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/espace-admin/corrections/soumission/${soumissionId}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json();
          setData(result);
          
          // Initialiser les corrections avec les valeurs existantes ou par défaut
          const initialCorrections: { [key: number]: { note: number; message: string } } = {};
          result.questions.forEach((q: Question) => {
            if (q.correction) {
              initialCorrections[q.id] = {
                note: q.correction.note_attribuee,
                message: q.correction.commentaire_correction || ''
              };
            } else {
              initialCorrections[q.id] = {
                note: 0,
                message: ''
              };
            }
          });
          setCorrections(initialCorrections);
        } else {
          console.error('Erreur lors du chargement des données');
          setShowErrorModal(true);
        }
      } catch (error) {
        console.error('Erreur:', error);
        setShowErrorModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (soumissionId) {
      loadData();
    }
  }, [soumissionId]);

  const handleNoteChange = (questionId: number, note: number) => {
    setCorrections(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        note: Math.max(0, Math.min(note, 20)) // Limiter entre 0 et 20
      }
    }));
  };

  const handleMessageChange = (questionId: number, message: string) => {
    setCorrections(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        message
      }
    }));
  };

  const handleSaveCorrections = async () => {
    if (!data) return;

    // Vérifier que toutes les questions ont une note
    const allHaveNotes = data.questions.every(q => {
      const correction = corrections[q.id];
      return correction && correction.note !== undefined && correction.note !== null;
    });

    if (!allHaveNotes) {
      setShowErrorModal(true);
      return;
    }

    // Si une note existe déjà, afficher le modal de justification
    if (data.soumission.note !== null && data.soumission.note !== undefined) {
      // Calculer la nouvelle note globale
      const nouvelleNoteGlobale = data.questions.reduce((sum, q) => {
        return sum + (corrections[q.id]?.note || 0);
      }, 0);
      
      // Vérifier si la note a changé
      const noteAvantValue = data.soumission.note;
      if (Math.abs(nouvelleNoteGlobale - noteAvantValue) > 0.01) {
        setNoteAvant(noteAvantValue);
        setNoteApres(nouvelleNoteGlobale);
        setShowJustificationModal(true);
        return;
      }
    }

    // Si pas de note existante, sauvegarder directement
    await saveCorrections();
  };

  const saveCorrections = async (justificationText?: string) => {
    if (!data) return;

    setIsSaving(true);
    try {
      const correctionsArray = data.questions.map(q => ({
        question_id: q.id,
        note_attribuee: corrections[q.id].note,
        note_max: 20,
        commentaire_correction: corrections[q.id].message || null
      }));

      const response = await fetch(`/api/espace-admin/corrections/soumission/${soumissionId}/corriger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          corrections: correctionsArray,
          justification: justificationText || null
        })
      });

      if (response.ok) {
        setShowJustificationModal(false);
        setJustification('');
        setShowSuccessModal(true);
        // Recharger les données après un court délai
        setTimeout(() => {
          router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/cours/${coursId}/correction`);
        }, 1500);
      } else {
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmJustification = () => {
    if (!justification.trim()) {
      setErrorMessage('Veuillez saisir une justification pour la modification de la note.');
      setShowErrorModal(true);
      return;
    }
    saveCorrections(justification);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getReponseText = (question: Question) => {
    if (!question.reponse_etudiant) return 'Aucune réponse';

    if (question.type_question === 'ouverte') {
      return question.reponse_etudiant || 'Aucune réponse';
    } else if (question.type_question === 'piece_jointe') {
      return question.reponse_etudiant ? 'Fichier joint' : 'Aucun fichier';
    } else if (question.type_question === 'choix_unique' || question.type_question === 'vrai_faux') {
      const reponseId = question.reponse_etudiant;
      const reponse = question.reponses_possibles_etude_cas?.find(r => r.id === reponseId);
      return reponse?.reponse || 'Aucune réponse';
    } else if (question.type_question === 'choix_multiple') {
      const reponseIds = Array.isArray(question.reponse_etudiant) ? question.reponse_etudiant : [];
      const reponses = question.reponses_possibles_etude_cas?.filter(r => reponseIds.includes(r.id));
      return reponses && reponses.length > 0 
        ? reponses.map(r => r.reponse).join(', ')
        : 'Aucune réponse';
    }

    return 'Aucune réponse';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4]">
        <AdminTopBar />
        <div className="flex items-center justify-center min-h-[80vh] p-4">
          <div className="text-center max-w-md mx-auto">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-[#032622] mx-auto mb-3 sm:mb-4"></div>
            <p className="text-xs sm:text-sm md:text-base text-[#032622] break-words">Chargement de la correction...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F8F5E4]">
        <AdminTopBar />
        <div className="flex items-center justify-center min-h-[80vh] p-4">
          <p className="text-sm sm:text-base md:text-lg text-[#032622] break-words text-center">Erreur lors du chargement des données</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      <AdminTopBar />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* En-tête avec bouton retour */}
        <div className="mb-4 sm:mb-5 md:mb-6">
          <button
            onClick={() => router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/cours/${coursId}/correction`)}
            className="flex items-center gap-1.5 sm:gap-2 text-[#032622] hover:text-[#032622]/70 active:text-[#032622]/50 transition-colors mb-3 sm:mb-4"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="font-bold uppercase text-xs sm:text-sm break-words" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              Retour aux rendus
            </span>
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <h1 
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#032622] uppercase mb-1 sm:mb-2 break-words"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                CORRECTION
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-[#032622] font-semibold uppercase break-words">
                BLOC {data.bloc.numero_bloc} - {data.bloc.titre}
              </p>
              <p className="text-xs sm:text-sm text-[#032622] uppercase mt-0.5 sm:mt-1 break-words">
                ETUDE DE CAS
              </p>
            </div>
            {data.etude_cas.date_limite && (
              <div className="bg-[#032622] text-[#F8F5E4] px-3 sm:px-4 py-1.5 sm:py-2 font-bold uppercase text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
                TEMPS {data.etude_cas.date_limite}
              </div>
            )}
          </div>
        </div>

        {/* CONTEXTE */}
        <div className="bg-[#F8F5E4] border-2 border-[#032622] p-4 sm:p-5 md:p-6 mb-6 sm:mb-7 md:mb-8">
          <h2 
            className="text-lg sm:text-xl font-bold text-[#032622] uppercase mb-3 sm:mb-4 break-words"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            CONTEXTE
          </h2>
          {data.etude_cas.fichier_consigne && (
            <div className="mb-3 sm:mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 bg-[#F8F5E4] border-2 border-[#032622] rounded">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#032622] flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-[#032622] font-bold break-words">
                    {data.etude_cas.nom_fichier_consigne || 'Fichier consigne'}
                  </span>
                </div>
                <a
                  href={data.etude_cas.fichier_consigne}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#032622] text-[#F8F5E4] hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors font-bold text-xs sm:text-sm uppercase w-full sm:w-auto whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Télécharger
                </a>
              </div>
            </div>
          )}
          <div className="text-xs sm:text-sm md:text-base text-[#032622] whitespace-pre-wrap break-words">
            {data.etude_cas.consigne}
          </div>
        </div>

        {/* QUESTIONS */}
        <div className="space-y-6 sm:space-y-7 md:space-y-8 mb-6 sm:mb-7 md:mb-8">
          {data.questions.map((question, index) => (
            <div key={question.id} className="bg-[#F8F5E4] border-2 border-[#032622] p-4 sm:p-5 md:p-6">
              <h3 
                className="text-lg sm:text-xl font-bold text-[#032622] uppercase mb-3 sm:mb-4 break-words"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                QUESTION {index + 1}
              </h3>
              
              <div className="mb-3 sm:mb-4">
                <p className="text-sm sm:text-base text-[#032622] font-semibold mb-1.5 sm:mb-2 break-words">{question.question}</p>
                {question.contenu_question && (
                  <div className="text-xs sm:text-sm md:text-base text-[#032622] mb-3 sm:mb-4 whitespace-pre-wrap break-words">
                    {question.contenu_question}
                  </div>
                )}
              </div>

              {/* Réponse de l'étudiant */}
              <div className="mb-4 sm:mb-5 md:mb-6 p-3 sm:p-4 bg-[#F8F5E4] border-2 border-[#032622] rounded">
                <p className="text-xs sm:text-sm font-bold text-[#032622] uppercase mb-1.5 sm:mb-2 break-words">Réponse de l'étudiant :</p>
                <div className="text-xs sm:text-sm md:text-base text-[#032622] break-words">
                  {question.type_question === 'piece_jointe' && question.reponse_etudiant ? (
                    <a
                      href={question.reponse_etudiant}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 sm:gap-2 text-[#032622] hover:text-[#032622]/70 active:text-[#032622]/50 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="font-bold break-words">Fichier joint</span>
                    </a>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{getReponseText(question)}</p>
                  )}
                </div>
              </div>

              {/* Correction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#032622] uppercase mb-1.5 sm:mb-2 break-words">
                    NOTE *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={corrections[question.id]?.note || 0}
                    onChange={(e) => handleNoteChange(question.id, parseFloat(e.target.value) || 0)}
                    className="w-full px-3 sm:px-4 py-2 border-2 border-[#032622] bg-[#F8F5E4] text-sm sm:text-base text-[#032622] font-bold focus:outline-none focus:ring-2 focus:ring-[#032622]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#032622] uppercase mb-1.5 sm:mb-2 break-words">
                    MESSAGE
                  </label>
                  <textarea
                    value={corrections[question.id]?.message || ''}
                    onChange={(e) => handleMessageChange(question.id, e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 border-2 border-[#032622] bg-[#F8F5E4] text-sm sm:text-base text-[#032622] font-bold min-h-[80px] sm:min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#032622] resize-none"
                    placeholder="Commentaire facultatif..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-center">
          <button
            onClick={handleSaveCorrections}
            disabled={isSaving}
            className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-[#032622] text-[#F8F5E4] text-xs sm:text-sm md:text-base font-bold uppercase hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            {isSaving ? 'ENREGISTREMENT...' : (data?.soumission.note !== null && data?.soumission.note !== undefined ? 'MODIFIER LA CORRECTION' : 'METTRE LA NOTE GLOBALE')}
          </button>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Succès"
        message="Les corrections ont été sauvegardées avec succès !"
        type="success"
      />

      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Erreur"
        message={errorMessage || "Une erreur est survenue. Veuillez vérifier que toutes les questions ont une note."}
        type="error"
      />

      {/* Modal de justification pour modification de note */}
      {showJustificationModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowJustificationModal(false);
              setJustification('');
            }
          }}
        >
          <div 
            className="bg-[#F8F5E4] border-4 border-[#032622] p-8 max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 
              className="text-2xl font-bold text-[#032622] mb-4 text-center uppercase"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              JUSTIFICATION DE LA MODIFICATION
            </h3>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[#032622] font-semibold">
                  Note actuelle : <span className="text-lg">{noteAvant?.toFixed(1).replace('.', ',') || '0'}/20</span>
                </p>
                <span className="text-[#032622] text-2xl mx-2">→</span>
                <p className="text-[#032622] font-semibold">
                  Nouvelle note : <span className="text-lg">{noteApres?.toFixed(1).replace('.', ',') || '0'}/20</span>
                </p>
              </div>
              <p className="text-[#032622] mb-4 text-sm opacity-80">
                Vous êtes sur le point de modifier une note déjà attribuée. Veuillez justifier cette modification.
              </p>
            </div>

            <div className="mb-6">
              <label 
                htmlFor="justification"
                className="block text-[#032622] font-bold mb-2 uppercase text-sm"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                JUSTIFICATION *
              </label>
              <textarea
                id="justification"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Expliquez la raison de cette modification de note..."
                className="w-full px-4 py-3 border-2 border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622] min-h-[120px] resize-y"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowJustificationModal(false);
                  setJustification('');
                }}
                className="flex-1 px-6 py-3 bg-[#032622] text-[#F8F5E4] font-bold uppercase hover:bg-[#032622]/90 transition-colors"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
                disabled={isSaving}
              >
                ANNULER
              </button>
              <button
                onClick={handleConfirmJustification}
                disabled={isSaving || !justification.trim()}
                className="flex-1 px-6 py-3 bg-[#F8F5E4] border-2 border-[#032622] text-[#032622] font-bold uppercase hover:bg-[#F8F5E4]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                {isSaving ? 'ENREGISTREMENT...' : 'CONFIRMER LA MODIFICATION'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

