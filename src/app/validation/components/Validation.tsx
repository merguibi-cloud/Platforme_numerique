"use client";
import { CheckCircle, ChevronLeft } from 'lucide-react';
import { ProgressHeader } from './ProgressHeader';

interface ValidationProps {
  onClose: () => void;
  onPrev: () => void;
}

export const Validation = ({ onClose, onPrev }: ValidationProps) => {
  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      {/* Contenu principal */}
      <main className="px-2 sm:px-4 py-4 sm:py-8">
        <ProgressHeader currentStep="VALIDATION" onClose={onClose} />

        {/* Content */}
        <div className="p-6 mb-6">
          <div className="space-y-6">
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#032622] mb-2">VALIDATION</h3>
              <p className="text-[#032622]">Votre candidature a été soumise avec succès</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border border-[#032622]">
          <div className="flex justify-between">
            <button
              onClick={onPrev}
              className="px-6 py-3 border border-[#032622] text-[#032622] hover:bg-[#032622] hover:text-white transition-colors"
            >
              RETOUR
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#032622] text-white hover:bg-[#032622]/90 transition-colors"
            >
              TERMINER
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
