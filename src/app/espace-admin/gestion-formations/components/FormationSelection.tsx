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
    console.log('Navigation vers formation ID:', formationId);
    router.push(`/espace-admin/gestion-formations/${formationId}`);
  };

  return (
    <section className="space-y-6">
      <h2 
        className="text-3xl font-bold text-[#032622] uppercase"
        style={{ fontFamily: 'var(--font-termina-bold)' }}
      >
        CHOISIS LA FORMATION
      </h2>
      
      <div className="space-y-4">
        {formations.map((formation) => (
          <div
            key={formation.id}
            onClick={() => onFormationSelect(formation.id)}
            className={`
              border-2 cursor-pointer transition-all hover:shadow-lg p-6
              ${formation.isSelected 
                ? 'bg-[#F8F5E4] text-[#032622] border-[#032622] shadow-lg shadow-[#032622]/20' 
                : 'bg-[#F8F5E4] text-[#032622] border-[#032622]'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p 
                  className="text-lg font-bold uppercase"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {formation.level}
                </p>
                <p className="text-sm uppercase tracking-[0.2em] opacity-70">
                  {formation.levelCode}
                </p>
              </div>
              <div className="flex-1 ml-8 flex items-center justify-between">
                <p 
                  className="text-lg font-bold uppercase"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {formation.title}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewBlocks(formation.id);
                  }}
                  className="bg-[#032622] text-[#F8F5E4] px-4 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-[#032622]/90 transition-colors"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
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
