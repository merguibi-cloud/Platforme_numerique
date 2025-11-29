"use client";
import { User } from 'lucide-react';

type Step = 'INFORMATIONS' | 'CONTRAT' | 'INSCRIPTION' | 'DOCUMENTS' | 'DOSSIER' | 'VALIDATION';

interface ProgressHeaderProps {
  currentStep: Step;
  onClose?: () => void;
}

export const ProgressHeader = ({ currentStep, onClose }: ProgressHeaderProps) => {
  // Étapes sans CONTRAT (temporairement retiré)
  const steps: Step[] = ['INFORMATIONS', 'INSCRIPTION', 'DOCUMENTS', 'DOSSIER', 'VALIDATION'];
  // Si currentStep est CONTRAT, on le mappe vers INSCRIPTION pour l'affichage
  const displayStep = currentStep === 'CONTRAT' ? 'INSCRIPTION' : currentStep;
  const currentStepIndex = steps.indexOf(displayStep);

  return (
    <>
        {/* Header avec titre et progression */}
        <div className="w-full mb-6 sm:mb-8 md:mb-12 border border-[#032622] p-3 sm:p-4 md:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-5 md:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#032622]">CANDIDATURE</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-[#032622] hover:text-gray-600 active:text-gray-700 transition-colors text-xl sm:text-2xl md:text-lg p-2 -mr-2"
                aria-label="Fermer"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
            <span className="text-xs sm:text-sm md:text-base text-[#032622] font-medium">ÉTAPE {currentStepIndex + 1} SUR {steps.length}</span>
          </div>
          
          {/* Barre de progression continue avec labels */}
          <div className="mb-0">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3 sm:mb-4">
              <div 
                className="h-full bg-[#032622] transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
            
            {/* Labels des étapes */}
            <div className="flex flex-wrap sm:flex-nowrap justify-between gap-2 sm:gap-0">
              {steps.map((step, index) => (
                <span
                  key={step}
                  className={`text-[10px] xs:text-xs sm:text-xs md:text-sm font-bold uppercase truncate ${
                    index <= currentStepIndex ? 'text-[#032622]' : 'text-gray-400'
                  }`}
                  title={step}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>
        </div>

    </>
  );
};
