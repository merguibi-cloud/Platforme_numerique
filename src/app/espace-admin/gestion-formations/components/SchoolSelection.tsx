'use client';

import { Formation } from '@/types/formations';

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
    <section className="space-y-6">
      <h2 
        className="text-3xl font-bold text-[#032622] uppercase"
        style={{ fontFamily: 'var(--font-termina-bold)' }}
      >
        CHOISIS L'ÉCOLE
      </h2>
      
      <div className="grid grid-cols-3 gap-6">
        {schools.map((school) => (
          <div
            key={school.id}
            className={`
              relative h-32 border-2 cursor-pointer transition-all hover:shadow-lg
              ${school.isSelected 
                ? 'bg-[#F8F5E4] text-[#032622] shadow-lg' 
                : 'bg-[#F8F5E4] text-[#032622] border-[#032622]'
              }
            `}
            style={{
              borderColor: school.isSelected ? (school.color || '#032622') : '#032622',
              boxShadow: school.isSelected ? `0 4px 6px -1px ${school.color || '#032622'}20, 0 2px 4px -1px ${school.color || '#032622'}10` : 'none'
            }}
              onClick={() => {
                // TODO: Implémenter la sélection d'école
              }}
          >
            <div className="flex flex-col items-center justify-center h-full p-4">
              <div className="mb-2">
                <img 
                  src={school.logo} 
                  alt={school.name}
                  className={`${school.id === '1001' ? 'h-20 w-auto' : 'h-10 w-auto'} object-contain`}
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
