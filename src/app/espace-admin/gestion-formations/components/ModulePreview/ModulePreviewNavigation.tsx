'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ModulePreviewNavigationProps {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  currentType?: 'cours' | 'quiz' | 'etude-cas';
  quizCompleted?: boolean;
  showEtudeCasButton?: boolean;
}

export const ModulePreviewNavigation = ({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  currentType = 'cours',
  quizCompleted = false,
  showEtudeCasButton = false
}: ModulePreviewNavigationProps) => {
  return (
    <div className="bg-[#032622] px-6 py-4 flex items-center justify-between w-full">
      {/* Navigation précédente */}
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className={`flex items-center gap-2 px-4 py-2 font-bold uppercase transition-colors ${
          hasPrevious
            ? 'bg-[#F8F5E4] text-[#032622] hover:bg-[#F8F5E4]/90'
            : 'bg-[#032622]/50 text-[#F8F5E4]/50 cursor-not-allowed'
        }`}
        style={{ fontFamily: 'var(--font-termina-bold)' }}
      >
        <ArrowLeft className="w-5 h-5" />
        {currentType === 'quiz' 
          ? 'RETOUR AU COURS' 
          : currentType === 'etude-cas'
          ? 'RETOUR AU COURS'
          : 'PRÉCÉDENT'}
      </button>

      {/* Navigation suivante */}
      {(currentType !== 'quiz' || quizCompleted) && (
        <button
          onClick={onNext}
          disabled={!hasNext}
          className={`flex items-center gap-2 px-4 py-2 font-bold uppercase transition-colors ${
            hasNext
              ? 'bg-[#F8F5E4] text-[#032622] hover:bg-[#F8F5E4]/90'
              : 'bg-[#032622]/50 text-[#F8F5E4]/50 cursor-not-allowed'
          }`}
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          {currentType === 'etude-cas' 
            ? 'TERMINER' 
            : showEtudeCasButton
            ? 'ÉTUDE DE CAS'
            : currentType === 'quiz' && quizCompleted
            ? 'SUIVANT'
            : 'SUIVANT'}
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

