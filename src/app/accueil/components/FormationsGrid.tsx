"use client";
import { useState } from 'react';
import Image from 'next/image';
import { formationsData, categories } from '../../formations/data/formationsData';

export const FormationsGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUS');

  // Filtrer les formations selon la catégorie sélectionnée
  const filteredFormations = selectedCategory === 'TOUS' 
    ? formationsData 
    : formationsData.filter(formation => formation.theme === selectedCategory);

  // Afficher seulement 8 formations maximum sur la page d'accueil
  const displayedFormations = filteredFormations.slice(0, 8);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="py-16 px-4" style={{ backgroundColor: '#F8F5E4' }}>
      <div className="max-w-7xl mx-auto">
        {/* Titre principal */}
        <div className="text-left mb-8">
          <h2 
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ 
              color: '#032622',
              fontFamily: 'var(--font-termina-bold)',
              fontWeight: '700'
            }}
          >
            FORMATIONS
          </h2>
          <div className="w-full">
            <p className="text-lg text-gray-700 mb-4">
              Elite Society s'engage pour une éducation responsable, inclusive et tournée vers l'avenir.
            </p>
            <p className="text-lg text-gray-700">
              Nos programmes intègrent les enjeux sociaux et environnementaux, et encouragent les projets à impact positif, à toutes les échelles.
            </p>
          </div>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => handleCategoryClick('TOUS')}
            className={`px-6 py-3 font-bold text-sm transition-all duration-300 ${
              selectedCategory === 'TOUS'
                ? 'bg-[#032622] text-white'
                : ' text-[#032622] hover:bg-gray-100'
            }`}
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            TOUS
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`px-6 py-3 font-bold text-sm transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-[#032622] text-white'
                  : 'text-[#032622] hover:bg-gray-100'
              }`}
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grille des formations - 4 par ligne */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {displayedFormations.map((formation) => (
            <div
              key={formation.id}
              className="bg-[#032622] shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-[380px] w-full"
            >
              {/* Image de la formation */}
              <div className="h-40 bg-gray-200 relative overflow-hidden flex-shrink-0">
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
              <div className="p-5 flex flex-col flex-grow">
                {/* Titre */}
                <h3 
                  className="text-[14px] font-bold mb-2 text-[#F8F5E4] leading-tight flex-shrink-0 h-12 overflow-hidden"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {formation.titre}
                </h3>

                {/* Description */}
                <p className="text-[#F8F5E4] text-xs mb-3 leading-relaxed flex-grow h-16 overflow-hidden">
                  {formation.description}
                </p>

                {/* Bouton et icône - toujours en bas */}
                <div className="flex items-center justify-between mt-auto">
                  <button
                    onClick={() => window.location.href = formation.redirection}
                    className="bg-[#F8F5E4] text-[#032622] px-3 py-2 text-sm font-bold hover:bg-[#044a3a] transition-colors duration-300"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    EN SAVOIR PLUS
                  </button>
                  
                  {/* Icône de l'école */}
                  <div className="w-12 h-12 flex items-center justify-center">
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

        {/* Message si aucune formation trouvée */}
        {filteredFormations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#032622] text-lg">
              Aucune formation trouvée pour cette catégorie.
            </p>
          </div>
        )}

        {/* Bouton pour aller à la page formations complète */}
        <div className="text-center">
          <a
            href="/formations"
            className="bg-[#032622] text-[#F8F5E4] px-8 py-4 text-lg font-bold hover:bg-[#044a3a] transition-colors duration-300 inline-block"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            VOIR PLUS
          </a>
        </div>
      </div>
    </div>
  );
};
