'use client';

import { useRouter } from 'next/navigation';

interface FormationConfig {
  id: string;
  level: string;
  levelCode: string;
  title: string;
  isSelected: boolean;
}

interface FormationSelectionProps {
  formations: FormationConfig[];
  onFormationSelect: (formationId: string) => void;
}

export const FormationSelection = ({ formations, onFormationSelect }: FormationSelectionProps) => {
  const router = useRouter();

  const handleViewBlocks = (formationId: string) => {
    router.push(`/espace-admin/gestion-formations/${formationId}`);
  };

  return (
    <section className="space-y-4 sm:space-y-5 md:space-y-6">
      <h2 
        className="text-xl sm:text-2xl md:text-3xl font-bold text-[#032622] uppercase break-words"
        style={{ fontFamily: 'var(--font-termina-bold)' }}
      >
        CHOISIS LA FORMATION
      </h2>
      
      <div className="space-y-3 sm:space-y-4">
        {formations.map((formation) => (
          <div
            key={formation.id}
            onClick={() => onFormationSelect(formation.id)}
            className={`
              border-2 cursor-pointer transition-all hover:shadow-lg active:scale-[0.98] p-3 sm:p-4 md:p-6
              ${formation.isSelected 
                ? 'bg-[#F8F5E4] text-[#032622] border-[#032622] shadow-lg shadow-[#032622]/20' 
                : 'bg-[#F8F5E4] text-[#032622] border-[#032622]'
              }
            `}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onFormationSelect(formation.id);
              }
            }}
            aria-label={`Sélectionner ${formation.title}`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex flex-col flex-1 min-w-0">
                <p 
                  className="text-sm sm:text-base md:text-lg font-bold uppercase break-words"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {formation.level}
                </p>
                <p className="text-xs sm:text-sm uppercase tracking-[0.2em] opacity-70 break-words">
                  {formation.levelCode}
                </p>
              </div>
              <div className="flex-1 w-full sm:w-auto sm:ml-4 md:ml-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                <p 
                  className="text-sm sm:text-base md:text-lg font-bold uppercase break-words flex-1 min-w-0"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {formation.title}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewBlocks(formation.id);
                  }}
                  className="bg-[#032622] text-[#F8F5E4] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold uppercase tracking-wider hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors w-full sm:w-auto whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                  aria-label={`Voir les blocs de ${formation.title}`}
                >
                  VOIR LE BLOC
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
