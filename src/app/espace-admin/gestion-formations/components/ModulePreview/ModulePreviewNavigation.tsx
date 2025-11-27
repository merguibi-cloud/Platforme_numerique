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
  nextLabel?: string;
  previousLabel?: string;
}

export const ModulePreviewNavigation = ({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  currentType = 'cours',
  quizCompleted = false,
  showEtudeCasButton = false,
  nextLabel,
  previousLabel
}: ModulePreviewNavigationProps) => {
  // Déterminer le label précédent
  const getPreviousLabel = () => {
    if (previousLabel) return previousLabel;
    if (currentType === 'quiz') return 'RETOUR AU COURS';
    if (currentType === 'etude-cas') return 'RETOUR AU COURS';
    return 'PRÉCÉDENT';
  };

  // Déterminer le label suivant
  const getNextLabel = () => {
    if (nextLabel) return nextLabel;
    if (currentType === 'etude-cas') return 'TERMINER';
    if (showEtudeCasButton) return 'PASSER À L\'ÉTUDE DE CAS';
    if (currentType === 'quiz' && quizCompleted) return 'SUIVANT';
    return 'SUIVANT';
  };

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
        {getPreviousLabel()}
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
          {getNextLabel()}
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

