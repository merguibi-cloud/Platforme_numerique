'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressHeader } from './ProgressHeader';
import { useCandidature } from '@/contexts/CandidatureContext';
import { validatePreviousSteps } from '../utils/stepValidation';
import { useModal } from './useModal';
import { Modal } from './Modal';

interface ContratStepProps {
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export default function ContratStep({ onNext, onPrev, onClose }: ContratStepProps) {
  const router = useRouter();
  const { candidatureData } = useCandidature();
  const { modalState, showWarning, hideModal } = useModal();
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  // Vérifier les étapes précédentes au chargement (une seule fois)
  useEffect(() => {
    if (!candidatureData) return;
    
    const validation = validatePreviousSteps('contrat', candidatureData);
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
  }, [candidatureData?.id]); // Utiliser seulement l'ID pour éviter les re-renders

  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      <main className="px-2 sm:px-4 md:px-8 lg:px-16 py-4 sm:py-6 md:py-8">
        <ProgressHeader currentStep="CONTRAT" onClose={onClose} />

        <div className="space-y-6 sm:space-y-8">
          {/* Titre */}
          <div className="text-left mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#032622] mb-4 sm:mb-5 md:mb-6" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              SIGNATURE DE TON CONTRAT DE FORMATION
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[#032622] max-w-2xl" style={{ fontFamily: 'var(--font-termina-medium)' }}>
              Ces documents nous permettent d'adopter ton accompagnement et de finaliser ton contrat. 
              Tu peux les ajouter dès maintenant ou plus tard depuis ton tableau de bord.
            </p>
          </div>

          {/* Zone de contrat PDF (boîte vide avec scrollbar) */}
          <div className="bg-gray-200 border border-[#032622] rounded-lg overflow-hidden min-h-[300px] sm:min-h-[400px] md:min-h-[500px] max-h-[400px] sm:max-h-[500px] md:max-h-[600px]">
            <div 
              className="w-full h-full overflow-y-auto p-6 contract-scrollbar"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#032622 #F8F5E4'
              }}
            >
              {/* Zone vide pour le PDF - sera intégré plus tard */}
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <p className="text-[#032622] text-center opacity-50">
                  Le contrat sera affiché ici
                </p>
              </div>
            </div>
          </div>

          {/* Style pour la scrollbar WebKit (Chrome, Safari, Edge) */}
          <style jsx global>{`
            .contract-scrollbar::-webkit-scrollbar {
              width: 12px;
            }
            .contract-scrollbar::-webkit-scrollbar-track {
              background: #F8F5E4;
            }
            .contract-scrollbar::-webkit-scrollbar-thumb {
              background-color: #032622;
              border-radius: 6px;
              border: 2px solid #F8F5E4;
            }
            .contract-scrollbar::-webkit-scrollbar-thumb:hover {
              background-color: #021a17;
            }
          `}</style>

          {/* Bouton Signer électroniquement */}
          <div className="flex justify-end">
            <button
              className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-[#032622] text-white hover:bg-[#021a17] active:bg-[#032622]/80 transition-colors font-bold text-xs sm:text-sm md:text-base"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              SIGNER ÉLECTRONIQUEMENT
            </button>
          </div>

          {/* Checkbox Conditions Générales */}
          <div className="flex items-start space-x-2 sm:space-x-3">
            <input
              type="checkbox"
              id="accept-terms"
              checked={hasAcceptedTerms}
              onChange={(e) => setHasAcceptedTerms(e.target.checked)}
              className="mt-1 w-4 h-4 sm:w-5 sm:h-5 border-[#032622] text-[#032622] focus:ring-[#032622] flex-shrink-0"
            />
            <label htmlFor="accept-terms" className="text-xs sm:text-sm text-[#032622]">
              J'ai pris connaissance et j'accepte les Conditions Générales de Vente et d'Utilisation, 
              ainsi que le Règlement intérieur du Campus Numérique Elite Society.
            </label>
          </div>

          {/* Boutons de navigation */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
            <button
              onClick={onPrev}
              className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 border border-[#032622] text-[#032622] bg-[#F8F5E4] hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors font-bold text-xs sm:text-sm md:text-base w-full sm:w-auto"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              RETOUR
            </button>
            
            <button
              onClick={onNext}
              disabled={!hasAcceptedTerms}
              className={`px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 font-bold transition-colors text-xs sm:text-sm md:text-base w-full sm:w-auto ${
                hasAcceptedTerms
                  ? 'bg-[#6B7280] text-white hover:bg-[#4B5563] active:bg-[#6B7280]/80'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              SUIVANT
            </button>
          </div>
        </div>
      </main>

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
}
