"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export const StudentDashboard = () => {
  const [progress] = useState(10);
  const [activitiesProgress] = useState(10);
  const [competences] = useState({ current: 2, total: 19 });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-6 bg-[#F8F5E4] min-h-screen p-6">
      {/* En-tête avec notifications */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 
            className="text-4xl font-bold text-[#032622] mb-2"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            BONJOUR, EL ASSOWAD CHADI
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-[#032622] hover:bg-gray-100 rounded-full">
            <Image 
              src="/menue_etudiant/nonselectionner/Enregistrer.png" 
              alt="Enregistrer" 
              width={24} 
              height={24}
              className="w-6 h-6"
            />
          </button>
          
          <button className="p-2 text-[#032622] hover:bg-gray-100 rounded-full">
            <Image 
              src="/menue_etudiant/nonselectionner/Clocheverte.png" 
              alt="Notifications" 
              width={24} 
              height={24}
              className="w-6 h-6"
            />
          </button>
          
          <div className="flex items-center space-x-2 relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-[#032622] font-medium">El Assowad Chadi</span>
              <svg 
                className={`w-4 h-4 text-[#032622] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-2">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mes documents</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Paramètres</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Se déconnecter</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Carte de progression principale */}
      <div className="bg-[#032622] text-white p-6 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[#032622]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 
                className="text-xl font-bold mb-2"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                EXCELLENT PROGRÈS!
              </h2>
              <p className="text-sm opacity-90">
                Vous avez terminé {progress}% du Module 1
              </p>
            </div>
          </div>
          <button 
            className="bg-white text-[#032622] px-6 py-3 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            CONTINUER
          </button>
        </div>
        {/* Indicateurs de progression */}
        <div className="flex space-x-1 mt-4">
          <div className="w-8 h-1 bg-white rounded"></div>
          <div className="w-8 h-1 bg-white/30 rounded"></div>
          <div className="w-8 h-1 bg-white/30 rounded"></div>
        </div>
      </div>

      {/* Contenu principal en grille */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section gauche - Activités */}
        <div className="lg:col-span-2 space-y-6">
          {/* Carte d'activités */}
          <div className="bg-[#F8F5E4] border border-black">
            {/* En-tête avec titre et pourcentage */}
            <div className="flex justify-between items-center p-6">
              <h3 
                className="text-lg font-bold text-[#032622]"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                RESPONSABLE DU DÉVELOPPEMENT DES ACTIVITÉS
              </h3>
              <span className="text-2xl font-bold text-[#032622]">{activitiesProgress}%</span>
            </div>
            
            {/* Barre de progression */}
            <div className="px-6 pb-4">
              <div className="w-full bg-gray-300 h-2">
                <div 
                  className="bg-[#032622] h-2 transition-all duration-300"
                  style={{ width: `${activitiesProgress}%` }}
                ></div>
              </div>
            </div>
            
            {/* Section avec informations */}
            <div className="px-6 py-4 border-b border-black">
              {/* Informations en ligne */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-12">
                  <div>
                    <div className="text-4xl font-bold text-[#032622] mb-1">5H</div>
                    <div className="text-sm text-[#032622]">Temps total</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-[#032622] mb-1">{competences.current}/{competences.total}</div>
                    <div className="text-sm text-[#032622]">Blocs de compétences</div>
                  </div>
                </div>
                <button 
                  className="bg-[#032622] text-white px-6 py-3 font-bold hover:bg-[#044a3a] transition-colors"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  REPRENDRE
                </button>
              </div>
            </div>
            
            {/* Contenu principal - Graphiques côte à côte */}
            <div className="grid grid-cols-2 gap-0">
              {/* Section gauche - Légende et diagramme circulaire */}
              <div className="p-6 border-r border-black flex flex-col justify-between">
                {/* Légende */}
                <div className="flex justify-start mb-4">
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-[#032622]"></div>
                      <span className="text-[#032622]">Cours lus</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-[#6b7280]"></div>
                      <span className="text-[#032622]">Quiz complétés</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-[#d1d5db]"></div>
                      <span className="text-[#032622]">Vidéos vues</span>
                    </div>
                  </div>
                </div>
                
                {/* Diagramme circulaire */}
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      {/* Cercle de fond beige */}
                      <circle
                        cx="50"
                        cy="50"
                        r="30"
                        stroke="#F8F5E4"
                        strokeWidth="12"
                        fill="none"
                      />
                      {/* Cercle gris clair */}
                      <circle
                        cx="50"
                        cy="50"
                        r="30"
                        stroke="#d1d5db"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 30 * 0.25}`}
                        strokeDashoffset={`${2 * Math.PI * 30 * 0.75}`}
                      />
                      {/* Cercle gris moyen */}
                      <circle
                        cx="50"
                        cy="50"
                        r="30"
                        stroke="#6b7280"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 30 * 0.35}`}
                        strokeDashoffset={`${2 * Math.PI * 30 * 0.40}`}
                      />
                      {/* Cercle vert foncé */}
                      <circle
                        cx="50"
                        cy="50"
                        r="30"
                        stroke="#032622"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 30 * 0.40}`}
                        strokeDashoffset={`${2 * Math.PI * 30 * 0}`}
                      />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Section droite - Graphique en barres */}
              <div className="p-6 flex flex-col justify-between">
                <div className="text-sm text-[#032622]">Activité hebdomadaire</div>
                <div className="flex items-end justify-center h-16 space-x-2">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="bg-[#032622] w-6"
                        style={{ height: `${[40, 25, 45, 60, 65, 50, 20][index]}px` }}
                      ></div>
                      <span className="text-xs text-[#032622] mt-2 font-medium">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Carte Agenda */}
          <div className="bg-[#F8F5E4] p-6 border border-black">
            <div className="flex justify-between items-center mb-4">
              <h3 
                className="text-lg font-bold text-[#032622]"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                AGENDA
              </h3>
              <button className="text-[#032622] text-sm font-medium">TOUT VOIR</button>
            </div>
            <div className="border-t border-black my-4"></div>
            <div className="space-y-3">
              <div className="text-[#032622] font-medium">VISIO-CONFÉRENCE AVEC LE RÉFÉRENT</div>
              <div className="text-sm text-[#032622]">Lundi 22 Janvier - 14h00</div>
              <button 
                className="bg-[#032622] text-white px-4 py-2 font-bold rounded-lg hover:bg-[#044a3a] transition-colors text-sm"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                REJOINDRE
              </button>
            </div>
          </div>

          {/* Carte Vie Étudiante */}
          <div className="bg-[#F8F5E4] p-6 border border-black">
            <div className="flex justify-between items-center mb-4">
              <h3 
                className="text-lg font-bold text-[#032622]"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                VIE ÉTUDIANTE
              </h3>
              <button className="text-[#032622] text-sm font-medium">TOUT VOIR</button>
            </div>
            <div className="border-t border-black my-4"></div>
            <div className="space-y-3">
              <div className="text-[#032622] font-medium">RENTRÉE D'INTÉGRATION</div>
              <div className="text-sm text-[#032622]">Mercredi 16 Février - 16h30</div>
              <button 
                className="bg-[#032622] text-white px-4 py-2 font-bold rounded-lg hover:bg-[#044a3a] transition-colors text-sm"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                S'INSCRIRE
              </button>
            </div>
          </div>
        </div>

        {/* Section droite - Profil et notes */}
        <div className="space-y-6">
          {/* Carte de profil */}
          <div className="bg-[#F8F5E4] border border-black">
            <div className="p-8 text-center">
              <div className="w-40 h-40 border border-black mx-auto mb-6 flex items-center justify-center overflow-hidden bg-[#F8F5E4]">
                {/* Silhouette de profil - placeholder pour image */}
                <svg className="w-24 h-24 text-[#032622]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 bg-[#032622] flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#F8F5E4]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14l5-5 5 5z"/>
                  </svg>
                </div>
                <span className="text-[#032622] text-lg font-bold">Marathonien</span>
              </div>
            </div>
          </div>

          {/* Carte des notes */}
          <div className="bg-[#F8F5E4] border border-black">
            <div className="p-4 border-b border-black">
              <h3 
                className="text-lg font-bold text-[#032622]"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                MES DERNIERS RENDUS
              </h3>
            </div>
            
            <div className="bg-[#032622] border-b border-black">
              <div className="flex">
                <div className="flex-1 p-4 border-r border-[#F8F5E4]">
                  <div className="text-xs text-white mb-1">Bloc 1-Module 1</div>
                  <div className="text-sm font-bold text-white">Quizz</div>
                </div>
                <div className="w-20 p-4 flex items-center justify-center bg-[#F8F5E4]">
                  <span className="text-2xl font-bold text-[#032622]">9,5</span>
                </div>
              </div>
            </div>
            
            <div className="bg-[#032622]">
              <div className="flex">
                <div className="flex-1 p-4 border-r border-[#F8F5E4]">
                  <div className="text-xs text-white mb-1">Bloc 1</div>
                  <div className="text-sm font-bold text-white">Etude de cas</div>
                </div>
                <div className="w-20 p-4 flex items-center justify-center bg-[#F8F5E4]">
                  <span className="text-2xl font-bold text-[#032622]">13</span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <button className="text-[#032622] text-sm font-bold flex items-center">
                VOIR TOUTES LES NOTES
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Carte de contact */}
          <div className="bg-[#F8F5E4] border border-black">
            <div className="flex h-32">
              <div className="w-32 border-r border-black flex items-center justify-center bg-[#F8F5E4]">
                {/* Placeholder pour photo du référent */}
                <div className="w-24 h-24 bg-gray-300 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              </div>
              <div className="flex-1 bg-[#032622] p-4 flex flex-col justify-center">
                <div className="text-white text-xs font-bold mb-1">CONTACTER LE</div>
                <div className="text-white text-sm font-bold mb-4">RÉFÉRENT PÉDAGOGIQUE</div>
                <button 
                  className="bg-white text-[#032622] px-6 py-2 font-bold text-sm border border-black"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  CONTACTER
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


