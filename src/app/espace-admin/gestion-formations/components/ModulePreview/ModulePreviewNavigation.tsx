'use client';

import { ArrowLeft, ArrowRight, Edit, FileText, Search } from 'lucide-react';

interface ModulePreviewNavigationProps {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  currentType?: 'cours' | 'quiz' | 'etude-cas';
}

export const ModulePreviewNavigation = ({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  currentType = 'cours'
}: ModulePreviewNavigationProps) => {
  return (
    <div className="bg-[#032622] px-6 py-4 flex items-center justify-between">
      {/* Navigation précédente */}
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold uppercase transition-colors ${
          hasPrevious
            ? 'bg-[#F8F5E4] text-[#032622] hover:bg-[#F8F5E4]/90'
            : 'bg-[#032622]/50 text-[#F8F5E4]/50 cursor-not-allowed'
        }`}
        style={{ fontFamily: 'var(--font-termina-bold)' }}
      >
        <ArrowLeft className="w-5 h-5" />
        MODULE SUIVANT
      </button>

      {/* Icônes centrales */}
      <div className="flex items-center gap-4">
        <button className="p-2 bg-[#F8F5E4] text-[#032622] rounded-lg hover:bg-[#F8F5E4]/90 transition-colors">
          <Edit className="w-5 h-5" />
        </button>
        <button className="p-2 bg-[#F8F5E4] text-[#032622] rounded-lg hover:bg-[#F8F5E4]/90 transition-colors">
          <FileText className="w-5 h-5" />
        </button>
        <button className="p-2 bg-[#F8F5E4] text-[#032622] rounded-lg hover:bg-[#F8F5E4]/90 transition-colors">
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation suivante */}
      <button
        onClick={onNext}
        disabled={!hasNext}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold uppercase transition-colors ${
          hasNext
            ? 'bg-[#F8F5E4] text-[#032622] hover:bg-[#F8F5E4]/90'
            : 'bg-[#032622]/50 text-[#F8F5E4]/50 cursor-not-allowed'
        }`}
        style={{ fontFamily: 'var(--font-termina-bold)' }}
      >
        {currentType === 'quiz' ? 'QUIZ DE FIN DE MODULE' : currentType === 'etude-cas' ? 'ÉTUDE DE CAS' : 'CHAPITRE SUIVANT'}
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

