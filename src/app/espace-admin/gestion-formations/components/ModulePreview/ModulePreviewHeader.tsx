'use client';

import { Bookmark } from 'lucide-react';

interface ModulePreviewHeaderProps {
  blocNumber: string;
  blocTitle: string;
  moduleTitle: string;
  progress?: number;
}

export const ModulePreviewHeader = ({
  blocNumber,
  blocTitle,
  moduleTitle,
  progress = 0
}: ModulePreviewHeaderProps) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Titre du bloc */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-xs sm:text-sm font-bold text-[#032622] uppercase mb-0.5 sm:mb-1 break-words" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            {blocNumber}
          </div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#032622] uppercase break-words" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            {blocTitle}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto justify-between sm:justify-end">
          {/* Barre de progression */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-initial">
            <div className="w-24 sm:w-32 md:w-40 h-2 sm:h-2.5 md:h-3 bg-[#032622]/20 rounded-full overflow-hidden border border-[#032622]/30 flex-1 sm:flex-initial">
              <div
                className="h-full bg-[#032622] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm sm:text-base font-bold text-[#032622] min-w-[2.5rem] sm:min-w-[3rem] flex-shrink-0">{progress}%</span>
          </div>
          <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-[#032622] flex-shrink-0" />
        </div>
      </div>

      {/* Titre du module */}
      <div className="text-base sm:text-lg font-bold text-[#032622] uppercase pt-1.5 sm:pt-2 border-t border-[#032622]/20 break-words" style={{ fontFamily: 'var(--font-termina-bold)' }}>
        {moduleTitle}
      </div>
    </div>
  );
};

