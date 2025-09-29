/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Formation } from '@/types/formations';
import { getAllFormations } from '@/lib/formations';

export const OnlineHero = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Charger les formations depuis Supabase
  useEffect(() => {
    const loadFormations = async () => {
      try {
        setLoading(true);
        const data = await getAllFormations();
        setFormations(data);
      } catch (error) {
        console.error('Erreur lors du chargement des formations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFormations();
  }, []);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (selectedFormation) {
      // Rediriger vers la page spécifique de la formation
      router.push(selectedFormation.redirection);
    } else {
      // Rediriger vers la page formations générale
      router.push('/formations');
    }
  };

  const handleFormationSelect = (formation: Formation) => {
    setSelectedFormation(formation);
    setShowDropdown(false);
  };


  return (
    <div className="relative w-full h-screen overflow-hidden z-30">


      {/* Image de fond */}
      <div className="absolute inset-0">
        <Image 
          src="/img/accueil/hero.png" 
          alt="Elite Society Online" 
          fill 
          className="object-cover"
        /> 
      </div>

      {/* Contenu principal superposé */}
      <div className="relative z-10 flex flex-col justify-center h-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        {/* Texte principal */}
        <div className="mb-8 md:mb-12 mt-16 md:mt-20">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 md:mb-6" style={{ fontFamily: 'var(--font-termina-demi)', color: '#F5E6D3' }}>
            UNE FORMATION FLEXIBLE,<br />
            UN AVENIR STRUCTURÉ
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl leading-relaxed max-w-4xl" style={{ fontFamily: 'var(--font-rota-medium)', color: '#F5E6D3' }}>
            Formations 100% en ligne, certifiantes et conçues pour s'adapter à votre rythme.
          </p>
        </div>

        {/* Liste déroulante de formations */}
        <div className="flex flex-col sm:flex-row  max-w-4xl">
          {/* Liste déroulante des formations */}
          <div className="flex-1 relative search-dropdown">
            <div 
              className="bg-white/90 backdrop-blur-sm p-4 flex items-center justify-between cursor-pointer hover:bg-white transition-colors duration-200"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="flex-1 text-gray-700 font-medium" style={{ fontFamily: 'var(--font-rota-medium)' }}>
                {selectedFormation ? selectedFormation.titre : 'Sélectionnez une formation...'}
              </span>
              <ChevronDown 
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
              />
            </div>
            
            {/* Dropdown des formations */}
            {showDropdown && !loading && (
              <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-b-lg max-h-64 overflow-y-auto z-50">
                {formations.length > 0 ? (
                  formations.map((formation) => (
                    <div
                      key={formation.id}
                      className="p-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 cursor-pointer"
                      onClick={() => handleFormationSelect(formation)}
                    >
                      <div className="font-medium text-gray-800 text-sm" style={{ fontFamily: 'var(--font-rota-medium)' }}>
                        {formation.titre}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {formation.ecole} • {formation.theme}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-gray-500 text-sm">
                    Aucune formation disponible
                  </div>
                )}
              </div>
            )}
            
            {/* Indicateur de chargement */}
            {loading && (
              <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-b-lg p-3">
                <div className="text-gray-500 text-sm flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  Chargement des formations...
                </div>
              </div>
            )}
          </div>
          
          {/* Bouton de recherche */}
          <button 
            onClick={handleSearch}
            className="bg-[#032622] hover:bg-[#032622]/90 text-white px-8 py-4 font-bold uppercase tracking-wide transition-colors duration-200 flex items-center justify-center gap-2" 
            style={{ fontFamily: 'var(--font-rota-medium)' }}
          >
            <Search className="w-5 h-5" />
            RECHERCHE
          </button>
        </div>
      </div>
    </div>
  );
};
