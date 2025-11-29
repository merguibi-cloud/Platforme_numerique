'use client';

interface SchoolConfig {
  id: string;
  name: string;
  logo: string;
  color: string;
  isSelected: boolean;
}

interface SchoolSelectionProps {
  schools: SchoolConfig[];
  onSchoolSelect: (schoolId: string) => void;
}

// Fonction pour obtenir la configuration d'une école (logo, couleur)
const getSchoolConfig = (schoolName: string) => {
  const schoolConfigs: Record<string, { logo: string; color: string }> = {
    '1001': { logo: '/logos/1001.png', color: '#8B4513' },
    'EDIFICE': { logo: '/logos/edifice.png', color: '#FF7400' },
    'LEADER SOCIETY': { logo: '/logos/leader.png', color: '#DC143C' },
    'DIGITAL LEGACY': { logo: '/logos/digital.png', color: '#9A83FF' },
    'KEOS': { logo: '/logos/keos.png', color: '#03B094' },
    'FINANCE SOCIETY': { logo: '/logos/finance.png', color: '#231BFA' },
    'AFRICAN BUSINESS SCHOOL': { logo: '/logos/leader.png', color: '#DC143C' },
    'CREATIVE NATION': { logo: '/logos/digital.png', color: '#9A83FF' },
    'CSAM': { logo: '/logos/leader.png', color: '#DC143C' },
    'STUDIO CAMPUS': { logo: '/logos/digital.png', color: '#9A83FF' },
    'TALENT BUSINESS SCHOOL': { logo: '/logos/talent.png', color: '#DC143C' },
    'ELITE SOCIETY ONLINE': { logo: '/logos/leader.png', color: '#DC143C' }
  };
  
  return schoolConfigs[schoolName] || { logo: '/logos/leader.png', color: '#032622' };
};

export const SchoolSelection = ({ schools, onSchoolSelect }: SchoolSelectionProps) => {
  return (
    <section className="space-y-4 sm:space-y-5 md:space-y-6">
      <h2 
        className="text-xl sm:text-2xl md:text-3xl font-bold text-[#032622] uppercase break-words"
        style={{ fontFamily: 'var(--font-termina-bold)' }}
      >
        CHOISIS L'ÉCOLE
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {schools.map((school) => (
          <div
            key={school.id}
            className={`
              relative h-24 sm:h-28 md:h-32 border-2 cursor-pointer transition-all hover:shadow-lg active:scale-[0.98]
              ${school.isSelected 
                ? 'bg-[#F8F5E4] text-[#032622] shadow-lg' 
                : 'bg-[#F8F5E4] text-[#032622] border-[#032622]'
              }
            `}
            onClick={() => onSchoolSelect(school.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSchoolSelect(school.id);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Sélectionner ${school.name}`}
            style={{
              borderColor: school.isSelected ? (school.color || '#032622') : '#032622',
              boxShadow: school.isSelected ? `0 4px 6px -1px ${school.color || '#032622'}20, 0 2px 4px -1px ${school.color || '#032622'}10` : 'none'
            }}
          >
            <div className="flex flex-col items-center justify-center h-full p-2 sm:p-3 md:p-4">
              <div className="mb-1 sm:mb-2">
                <img 
                  src={school.logo} 
                  alt={school.name}
                  className={`${school.id === '1001' ? 'h-12 sm:h-16 md:h-20 w-auto' : 'h-6 sm:h-8 md:h-10 w-auto'} object-contain max-w-full`}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export { getSchoolConfig };
