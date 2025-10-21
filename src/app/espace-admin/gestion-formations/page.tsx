'use client';

import { useState } from 'react';
import { Bell, User } from 'lucide-react';
import AdminFormationManager from '../components/AdminFormationManager';

const schools = [
  {
    id: '1001',
    name: '1001',
    logo: '/1001.png',
    isSelected: false,
    color: '#8B4513',
  },
  {
    id: 'edifice',
    name: 'Edifice',
    logo: '/logos/edifice.png',
    isSelected: false,
    color: '#FF7400',
  },
  {
    id: 'leader-society',
    name: 'Leader Society',
    logo: '/logos/leader.png',
    isSelected: true,
    color: '#DC143C',
  },
  {
    id: 'digital-legacy',
    name: 'Digital Legacy',
    logo: '/logos/digital.png',
    isSelected: false,
    color: '#9A83FF',
  },
  {
    id: 'keos',
    name: 'KEOS Business School',
    logo: '/logos/keos.png',
    isSelected: false,
    color: '#03B094',
  },
  {
    id: 'finance',
    name: 'Finance Society',
    logo: '/logos/finance.png',
    isSelected: false,
    color: '#231BFA',
  },
];

const formations = [
  {
    id: 'bachelor',
    level: 'BACHELOR',
    levelCode: 'TITRE NIVEAU 6',
    title: 'RESPONSABLE DU DÉVELOPPEMENT DES ACTIVITÉS',
    isSelected: true,
  },
  {
    id: 'mastere',
    level: 'MASTÈRE',
    levelCode: 'TITRE NIVEAU 7',
    title: 'MANAGER COMMERCIAL ET MARKETING',
    isSelected: false,
  },
];

export default function GestionFormations() {
  const [selectedSchool, setSelectedSchool] = useState('leader-society');
  const [selectedFormation, setSelectedFormation] = useState('bachelor');
  const [schoolsData, setSchoolsData] = useState(() => 
    schools.map(school => ({
      ...school,
      isSelected: school.id === 'leader-society', // Définir correctement l'état initial
      color: school.color || '#032622'
    }))
  );
  const [formationsData, setFormationsData] = useState(formations);
  const [showCourseManagement, setShowCourseManagement] = useState(false);

  const handleSchoolSelect = (schoolId: string) => {
    setSelectedSchool(schoolId);
    setSchoolsData(prev => prev.map(school => ({
      ...school,
      isSelected: school.id === schoolId,
      color: school.color // Conserver la couleur lors de la mise à jour
    })));
  };

  const handleFormationSelect = (formationId: string) => {
    setSelectedFormation(formationId);
    setFormationsData(prev => prev.map(formation => ({
      ...formation,
      isSelected: formation.id === formationId
    })));
  };

  const handleContinue = () => {
    const school = schoolsData.find(s => s.isSelected);
    const formation = formationsData.find(f => f.isSelected);
    console.log('École sélectionnée:', school?.name);
    console.log('Formation sélectionnée:', formation?.title);
    setShowCourseManagement(true);
  };

  const handleBackToSelection = () => {
    setShowCourseManagement(false);
  };

  // Si on affiche la gestion des cours
  if (showCourseManagement) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex">
        {/* Contenu principal */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header avec retour */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToSelection}
                className="flex items-center gap-2 text-[#032622] hover:text-[#032622]/70 transition-colors"
              >
                <span className="text-xl">←</span>
                <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                  Retour à la sélection
                </span>
              </button>
              
              <div className="flex items-center gap-4">
                <button className="relative p-2 border border-[#032622] bg-[#F8F5E4] hover:bg-[#eae5cf] transition-colors">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D96B6B] text-[10px] text-white">
                    2
                  </span>
                </button>
                <div className="flex items-center gap-3 border border-[#032622] bg-[#F8F5E4] px-4 py-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#032622]/10">
                    <User className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-xs uppercase font-semibold tracking-[0.2em]">Sophie Moreau</p>
                    <p className="text-[11px] text-[#032622]/70">Admin</p>
                  </div>
                </div>
              </div>
            </div>

            <h1 
              className="text-3xl font-bold text-[#032622]"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              GESTION DES FORMATIONS
            </h1>
            
            <AdminFormationManager />
          </div>
        </div>
      </div>
    );
  }

  // Page de sélection d'école et formation
  return (
    <div className="min-h-screen bg-[#F8F5E4] flex">
      {/* Contenu principal */}
      <div className="flex-1 p-6">
        <div className="space-y-8">
          {/* Header avec notifications et profil */}
          <header className="flex items-center justify-end gap-4">
            <button className="relative p-2 border border-[#032622] bg-[#F8F5E4] hover:bg-[#eae5cf] transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D96B6B] text-[10px] text-white">
                6
              </span>
            </button>
            <div className="flex items-center gap-3 border border-[#032622] bg-[#F8F5E4] px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-[#F8F5E4] border-2 border-[#032622] flex items-center justify-center text-[#032622] text-sm font-bold">
                SM
              </div>
              <div>
                <p className="text-xs uppercase font-semibold tracking-[0.2em]">Sophie Moreau</p>
                <p className="text-[11px] text-[#032622]/70">Coordinatrice pédagogique</p>
              </div>
            </div>
          </header>

          {/* Section CHOISIS L'ÉCOLE */}
          <section className="space-y-6">
            <h2 
              className="text-3xl font-bold text-[#032622] uppercase"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              CHOISIS L'ÉCOLE
            </h2>
            
            <div className="grid grid-cols-3 gap-6">
              {schoolsData.map((school) => (
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
                    console.log('Sélection école:', school.id, 'Couleur:', school.color, 'Sélectionné:', school.isSelected);
                    handleSchoolSelect(school.id);
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

          {/* Section CHOISIS LA FORMATION */}
          <section className="space-y-6">
            <h2 
              className="text-3xl font-bold text-[#032622] uppercase"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              CHOISIS LA FORMATION
            </h2>
            
            <div className="space-y-4">
              {formationsData.map((formation) => (
                <div
                  key={formation.id}
                  onClick={() => handleFormationSelect(formation.id)}
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
                    <div className="flex-1 ml-8">
                      <p 
                        className="text-lg font-bold uppercase text-right"
                        style={{ fontFamily: 'var(--font-termina-bold)' }}
                      >
                        {formation.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bouton pour continuer */}
          <div className="flex justify-center pt-8">
            <button
              onClick={handleContinue}
              className="bg-[#F8F5E4] text-[#032622] border border-[#032622] px-8 py-4 text-lg font-bold uppercase tracking-[0.2em] hover:bg-[#eae5cf] transition-colors"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              CONTINUER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
