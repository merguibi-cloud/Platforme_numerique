"use client";
import { useEffect, useRef } from 'react';

const categories = {
  row1: [
    "COMPTABILITÉ",
    "FINANCE", 
    "CADRAGE",
    "ARCHITECTURE",
    "LEADERSHIP",
    "MANAGEMENT"
  ],
  row2: [
    "E-COMMERCE",
    "EFFETS SPÉCIAUX",
    "WORDPRESS",
    "BRANDING",
    "MONTAGE VIDEO",
    "DIGITALISATION"
  ],
  row3: [
    "MARKETING",
    "COMMUNICATION",
    "DESIGN",
    "DÉVELOPPEMENT",
    "PROJET",
    "ENTREPRENEURIAT"
  ]
};

export const CategoriesCards = () => {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const row3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollRow = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
      if (!ref.current) return;
      
      const row = ref.current;
      const scrollAmount = direction === 'right' ? 1 : -1;
      
      const scroll = () => {
        if (direction === 'right') {
          if (row.scrollLeft >= row.scrollWidth - row.clientWidth) {
            row.scrollLeft = 0;
          } else {
            row.scrollLeft += scrollAmount;
          }
        } else {
          if (row.scrollLeft <= 0) {
            row.scrollLeft = row.scrollWidth - row.clientWidth;
          } else {
            row.scrollLeft += scrollAmount;
          }
        }
      };

      const interval = setInterval(scroll, 20); // 50 FPS
      
      return () => clearInterval(interval);
    };

    // Démarrer les animations avec un délai
    const interval1 = setTimeout(() => scrollRow(row1Ref, 'right'), 0);
    const interval2 = setTimeout(() => scrollRow(row2Ref, 'left'), 500);
    const interval3 = setTimeout(() => scrollRow(row3Ref, 'right'), 1000);

    return () => {
      clearTimeout(interval1);
      clearTimeout(interval2);
      clearTimeout(interval3);
    };
  }, []);

  const renderCards = (rowCategories: string[], rowKey: string) => (
    <>
      {/* List originale */}
      {rowCategories.map((category, index) => (
        <div
          key={`${rowKey}-${index}`}
          className="category-card bg-[#F8F5E4] text-[#032622] px-4 sm:px-6 md:px-8 py-3 sm:py-4 font-bold flex-shrink-0 text-center min-w-[160px] sm:min-w-[180px] md:min-w-[200px] text-xs sm:text-sm md:text-base"
          style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
        >
          {category}
        </div>
      ))}
      {/* Liste dupliquée pour l'effet infini */}
      {rowCategories.map((category, index) => (
        <div
          key={`${rowKey}-dup-${index}`}
          className="category-card bg-[#F8F5E4] text-[#032622] px-4 sm:px-6 md:px-8 py-3 sm:py-4 font-bold flex-shrink-0 text-center min-w-[160px] sm:min-w-[180px] md:min-w-[200px] text-xs sm:text-sm md:text-base"
          style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
        >
          {category}
        </div>
      ))}
    </>
  );

  return (
    <div className="relative w-full py-8 sm:py-12 md:py-16 overflow-x-hidden" style={{ backgroundColor: '#032622', maxWidth: '100%' }}> 
      {/* Première rangée - défile vers la droite */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div 
          ref={row1Ref}
          className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide carousel-container"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            width: '100%',
            maxWidth: '100%',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {renderCards(categories.row1, 'row1')}
        </div>
      </div>

      {/* Deuxième rangée - défile vers la gauche */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div 
          ref={row2Ref}
          className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide carousel-container"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            width: '100%',
            maxWidth: '100%',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {renderCards(categories.row2, 'row2')}
        </div>
      </div>

      {/* Troisième rangée - défile vers la droite */}
      <div>
        <div 
          ref={row3Ref}
          className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide carousel-container"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            width: '100%',
            maxWidth: '100%',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {renderCards(categories.row3, 'row3')}
        </div>
      </div>
    </div>
  );
};
