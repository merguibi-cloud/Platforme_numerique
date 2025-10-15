"use client";
import { User } from 'lucide-react';

type Step = 'INFORMATIONS' | 'DOCUMENTS' | 'RÉCAPITULATIF' | 'VALIDATION';

interface ProgressHeaderProps {
  currentStep: Step;
  onClose?: () => void;
}

export const ProgressHeader = ({ currentStep, onClose }: ProgressHeaderProps) => {
  const steps: Step[] = ['INFORMATIONS', 'DOCUMENTS', 'RÉCAPITULATIF', 'VALIDATION'];
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <>
        {/* Header avec titre et progression */}
        <div className="w-full mb-6 border border-[#032622] p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#032622]">CANDIDATURE</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-[#032622] hover:text-gray-600 transition-colors text-lg"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-[#032622] font-medium">ÉTAPE {currentStepIndex + 1} SUR 4</span>
          </div>
          
          {/* Barre de progression continue avec labels */}
          <div className="mb-0">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-[#032622] transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / 4) * 100}%` }}
              />
            </div>
            
            {/* Labels des étapes */}
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <span
                  key={step}
                  className={`text-sm font-bold uppercase ${
                    index <= currentStepIndex ? 'text-[#032622]' : 'text-gray-400'
                  }`}
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
