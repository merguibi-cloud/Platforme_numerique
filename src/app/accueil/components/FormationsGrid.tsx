"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Formation } from '@/types/formations';
import { getAllFormations, getFormationsByTheme } from '@/lib/formations';
import { categories } from '@/types/formations';

export const FormationsGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUS');
  const [formations, setFormations] = useState<Formation[]>([]);
  const [filteredFormations, setFilteredFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les formations depuis Supabase
  useEffect(() => {
    const loadFormations = async () => {
      try {
        setLoading(true);
        const data = await getAllFormations();
        setFormations(data);
        setFilteredFormations(data);
      } catch (error) {
        console.error('Erreur lors du chargement des formations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFormations();
  }, []);

  // Filtrer les formations selon la catégorie sélectionnée
  useEffect(() => {
    const filterFormations = async () => {
      try {
        if (selectedCategory === 'TOUS') {
          setFilteredFormations(formations);
        } else {
          const data = await getFormationsByTheme(selectedCategory);
          setFilteredFormations(data);
        }
      } catch (error) {
        console.error('Erreur lors du filtrage des formations:', error);
        setFilteredFormations(formations);
      }
    };

    filterFormations();
  }, [selectedCategory, formations]);

  // Afficher seulement 8 formations maximum sur la page d'accueil
  const displayedFormations = filteredFormations.slice(0, 8);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8" style={{ backgroundColor: '#F8F5E4' }}>
      <div className="max-w-7xl mx-auto">
        {/* Titre principal */}
        <div className="text-left mb-6 sm:mb-8">
          <h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 md:mb-6"
            style={{ 
              color: '#032622',
              fontFamily: 'var(--font-termina-bold)',
              fontWeight: '700'
            }}
          >
            FORMATIONS
          </h2>
          <div className="w-full space-y-2 sm:space-y-3 md:space-y-4">
            <p className="text-sm sm:text-base md:text-lg text-gray-700">
              Elite Society s'engage pour une éducation responsable, inclusive et tournée vers l'avenir.
            </p>
            <p className="text-sm sm:text-base md:text-lg text-gray-700">
              Nos programmes intègrent les enjeux sociaux et environnementaux, et encouragent les projets à impact positif, à toutes les échelles.
            </p>
          </div>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-10 md:mb-12 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => handleCategoryClick('TOUS')}
            className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 font-bold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${
              selectedCategory === 'TOUS'
                ? 'bg-[#032622] text-white'
                : 'bg-white text-[#032622] hover:bg-gray-100 border border-gray-200'
            }`}
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            TOUS
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 font-bold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-[#032622] text-white'
                  : 'bg-white text-[#032622] hover:bg-gray-100 border border-gray-200'
              }`}
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Indicateur de chargement */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#032622]"></div>
            <p className="mt-4 text-[#032622]">Chargement des formations...</p>
          </div>
        )}

        {/* Grille des formations - 4 par ligne */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mb-6">
            {displayedFormations.map((formation) => (
            <div
              key={formation.id}
              className="bg-[#032622] shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-auto min-h-[350px] sm:min-h-[380px] md:h-[380px] w-full"
            >
              {/* Image de la formation */}
              <div className="h-32 sm:h-36 md:h-40 bg-gray-200 relative overflow-hidden flex-shrink-0">
                <Image
                  src={formation.image}
                  alt={formation.titre}
                  width={400}
                  height={160}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Image de fallback si l'image n'existe pas
                    e.currentTarget.src = '/img/formation/forma_digital.png';
                  }}
                />
               
              </div>

              {/* Contenu de la carte */}
              <div className="p-4 sm:p-5 flex flex-col flex-grow">
                {/* Titre */}
                <h3 
                  className="text-xs sm:text-sm md:text-[14px] font-bold mb-2 text-[#F8F5E4] leading-tight flex-shrink-0 min-h-[36px] sm:min-h-[40px] md:h-12 overflow-hidden"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {formation.titre}
                </h3>

                {/* Description */}
                <p className="text-[#F8F5E4] text-xs mb-3 sm:mb-4 leading-relaxed flex-grow min-h-[48px] sm:min-h-[56px] md:h-16 overflow-hidden">
                  {formation.description}
                </p>

                {/* Bouton et icône - toujours en bas */}
                <div className="flex items-center justify-between mt-auto gap-2 sm:gap-3">
                  <button
                    onClick={() => window.location.href = formation.redirection}
                    className="bg-[#F8F5E4] text-[#032622] px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold hover:bg-[#F8F5E4]/90 active:bg-[#F8F5E4]/80 transition-colors duration-300 flex-1 sm:flex-none"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    EN SAVOIR PLUS
                  </button>
                  
                  {/* Icône de l'école */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0">
                    <Image
                      src={formation.icon}
                      alt={`Logo ${formation.ecole}`}
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Message si aucune formation trouvée */}
        {!loading && filteredFormations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#032622] text-lg">
              Aucune formation trouvée pour cette catégorie.
            </p>
          </div>
        )}

        {/* Bouton pour aller à la page formations complète */}
        <div className="text-center mt-6 sm:mt-8">
          <a
            href="/formations"
            className="bg-[#032622] text-[#F8F5E4] px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold hover:bg-[#044a3a] active:bg-[#032622]/80 transition-all duration-300 inline-block"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            VOIR PLUS
          </a>
        </div>
      </div>
    </div>
  );
};
