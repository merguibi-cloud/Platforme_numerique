"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ChevronLeft, Send } from 'lucide-react';
import { ProgressHeader } from './ProgressHeader';
import { useCandidature } from '@/contexts/CandidatureContext';
import { Modal } from './Modal';
import { useModal } from './useModal';
import { validatePreviousSteps } from '../utils/stepValidation';

interface ValidationProps {
  onClose: () => void;
  onPrev: () => void;
}

export const Validation = ({ onClose, onPrev }: ValidationProps) => {
  const router = useRouter();
  const { candidatureData, refreshCandidature } = useCandidature();
  const { modalState, showSuccess, showError, showWarning, hideModal } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Vérifier les étapes précédentes au chargement
  useEffect(() => {
    if (!candidatureData) return;
    
    const validation = validatePreviousSteps('validation', candidatureData);
    if (!validation.isValid && validation.missingStep && validation.message) {
      // Utiliser setTimeout pour éviter la boucle infinie
      const timer = setTimeout(() => {
        showWarning(
          validation.message + '\n\nCliquez sur OK pour être redirigé vers l\'étape manquante.',
          'Étape manquante',
          () => {
            router.push(`/validation?step=${validation.missingStep}`);
          }
        );
      }, 100);
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidatureData?.id, candidatureData?.paid_at]); // Inclure paid_at pour détecter les changements

  // Vérifier si la candidature a déjà été soumise
  useEffect(() => {
    if (candidatureData?.status === 'submitted' || candidatureData?.status === 'pending' || candidatureData?.status === 'validated') {
      setIsSubmitted(true);
    }
  }, [candidatureData]);

  const handleSubmitCandidature = async () => {
    if (!candidatureData) {
      showError('Aucune candidature trouvée', 'Erreur');
      return;
    }

    // Vérifier que toutes les étapes sont complétées en utilisant la fonction de validation
    const validation = validatePreviousSteps('validation', candidatureData);
    if (!validation.isValid) {
      showWarning(
        validation.message || 'Veuillez compléter toutes les étapes avant de soumettre votre candidature.',
        'Étapes manquantes'
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/candidature/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        // Rafraîchir les données du Context
        await refreshCandidature();
        showSuccess('Votre candidature a été envoyée avec succès ! Un administrateur va étudier votre dossier.', 'Succès');
        // Rediriger vers la page d'accueil après 2 secondes
        setTimeout(() => {
          router.push('/validation');
        }, 2000);
      } else {
        showError(result.error || 'Erreur lors de l\'envoi de la candidature. Veuillez réessayer.', 'Erreur');
      }
    } catch (error) {
      showError('Erreur lors de l\'envoi de la candidature. Veuillez réessayer.', 'Erreur');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      {/* Contenu principal */}
      <main className="px-2 sm:px-4 py-4 sm:py-8">
        <ProgressHeader currentStep="VALIDATION" onClose={onClose} />

        {/* Content */}
        <div className="p-6 mb-6 border border-[#032622] bg-[#F8F5E4]">
          <div className="space-y-6">
            {isSubmitted ? (
              // Candidature déjà envoyée
              <div className="text-center py-12">
                <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-[#032622] mb-4 uppercase">Candidature envoyée !</h3>
                <p className="text-[#032622] mb-2">Votre candidature a été soumise avec succès.</p>
                <p className="text-[#032622]/70 text-sm">
                  Notre équipe pédagogique va examiner votre dossier et vous reviendra dans les plus brefs délais.
                </p>
                <div className="mt-8 p-4 bg-[#C2C6B6]/30 border border-[#032622]/20">
                  <p className="text-sm text-[#032622] font-bold">
                    📧 Un email de confirmation a été envoyé à : {candidatureData?.email}
                  </p>
                </div>
              </div>
            ) : (
              // Prêt à envoyer
              <div className="text-center py-12">
                <Send className="w-20 h-20 text-[#032622] mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-[#032622] mb-4 uppercase">Envoi de la candidature</h3>
                <p className="text-[#032622] mb-6">
                  Vous êtes sur le point d'envoyer votre candidature. Assurez-vous que toutes les informations sont correctes.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Important :</strong> Une fois envoyée, votre candidature sera examinée par notre équipe pédagogique. 
                    Vous pourrez ne pourriez plus modifier vos informations si nécessaire, mais le statut passera en "CANDIDATURE ENVOYÉE".
                  </p>
                </div>
                <button
                  onClick={handleSubmitCandidature}
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-[#032622] text-white font-bold hover:bg-[#032622]/90 transition-colors disabled:opacity-50 text-lg uppercase flex items-center gap-3 mx-auto"
                >
                  {isSubmitting ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>ENVOI EN COURS...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Envoyer ma candidature</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border border-[#032622]">
          <div className="flex justify-between">
            <button
              onClick={onPrev}
              disabled={isSubmitting}
              className="px-6 py-3 border border-[#032622] text-[#032622] hover:bg-[#032622] hover:text-white transition-colors disabled:opacity-50"
            >
              RETOUR
            </button>
            
            {isSubmitted && (
              <button
                onClick={onClose}
                className="px-6 py-3 bg-[#032622] text-white hover:bg-[#032622]/90 transition-colors"
              >
                RETOUR À L'ACCUEIL
              </button>
            )}
          </div>
        </div>
      </main>
      
      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
      />
    </div>
  );
};
