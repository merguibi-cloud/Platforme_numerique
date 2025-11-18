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
    <div className="space-y-4">
      {/* Titre du bloc */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-[#032622] uppercase mb-1" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            {blocNumber}
          </div>
          <div className="text-2xl font-bold text-[#032622] uppercase" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            {blocTitle}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Barre de progression */}
          <div className="flex items-center gap-3">
            <div className="w-40 h-3 bg-[#032622]/20 rounded-full overflow-hidden border border-[#032622]/30">
              <div
                className="h-full bg-[#032622] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-base font-bold text-[#032622] min-w-[3rem]">{progress}%</span>
          </div>
          <Bookmark className="w-6 h-6 text-[#032622]" />
        </div>
      </div>

      {/* Titre du module */}
      <div className="text-lg font-bold text-[#032622] uppercase pt-2 border-t border-[#032622]/20" style={{ fontFamily: 'var(--font-termina-bold)' }}>
        {moduleTitle}
      </div>
    </div>
  );
};

