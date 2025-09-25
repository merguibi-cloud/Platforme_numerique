"use client";
import { useState } from 'react';
import Image from 'next/image';

// Interface pour définir la structure d'une formation
interface Formation {
  id: number;
  titre: string;
  description: string;
  redirection: string;
  icon: string;
  image: string;
  theme: 'DIGITAL' | 'BUSINESS' | 'FINANCE' | 'CRÉATIVITÉ' | 'MANAGEMENT';
  ecole: 'DIGITAL LEGACY' | 'KEOS' | '1001' | 'AFRICAN BUSINESS SCHOOL' | 'CREATIVE NATION' | 'CSAM' |
          'EDIFICE' | 'FINANCE SOCIETY' | 'LEADER SOCIETY' | 'STUDIO CAMPUS' | 'TALENT BUSINESS SCHOOL' |
           'ELITE SOCIETY ONLINE';
}

// Données des formations
const formationsData: Formation[] = [
  {
    id: 1,
    titre: "RESPONSABLE MARKETING PRODUITS ET SERVICES",
    description: "Piloter des stratégies marketing et valoriser des offres adaptées aux besoins du marché",
    redirection: "/formations/marketing-produits",
    icon: "/img/icon_ecole/D_logo.png",
    image: "/img/formation/forma_digital.png",
    theme: "BUSINESS",
    ecole: "DIGITAL LEGACY"
  },
  {
    id: 2,
    titre: "NÉGOCIATEUR TECHNICO-COMMERCIAL",
    description: "Vendre des solutions techniques en alliant expertise produit et sens de la négociation",
    redirection: "/formations/negociateur-technico",
    icon: "/img/icon_ecole/K_KEOS.png",
    image: "/img/formation/forma_keos2.png",
    theme: "BUSINESS",
    ecole: "KEOS"
  },
  {
    id: 3,
    titre: "MANAGER FINANCIER",
    description: "Superviser la gestion financière et optimiser la performance économique de l'entreprise",
    redirection: "/formations/manager-financier",
    icon: "/img/icon_ecole/Finance.png",
    image: "/img/formation/forma_finance.png",
    theme: "FINANCE",
    ecole: "FINANCE SOCIETY"
  },
  {
    id: 4,
    titre: "DÉVELOPPEUR EN INTELLIGENCE ARTIFICIELLE",
    description: "Concevoir des applications intelligentes basées sur des modèles d'IA",
    redirection: "/formations/developpeur-ia",
    icon: "/img/icon_ecole/1001_logo.png",
    image: "/img/formation/forma_1001.png",
    theme: "DIGITAL",
    ecole: "1001"
  },
  {
    id: 5,
    titre: "MANAGEMENT COMMERCIAL OPÉRATIONNEL",
    description: "Encadrer des équipes terrain et optimiser les performances commerciales",
    redirection: "/formations/management-commercial",
    icon: "/img/icon_ecole/K_KEOS.png",
    image: "/img/formation/forma_keos.png",
    theme: "MANAGEMENT",
    ecole: "KEOS"
  },
  {
    id: 6,
    titre: "MANAGER EN RESSOURCES HUMAINES",
    description: "Piloter la stratégie RH et accompagner les transformations humaines",
    redirection: "/formations/manager-rh",
    icon: "/img/icon_ecole/Talent.png",
    image: "/img/formation/forma_talent.png",
    theme: "MANAGEMENT",
    ecole: "TALENT BUSINESS SCHOOL"
  },
  {
    id: 7,
    titre: "MANAGER COMMERCIAL ET MARKETING",
    description: "Concevoir des plans marketing et diriger les actions commerciales",
    redirection: "/formations/manager-commercial-marketing",
    icon: "/img/icon_ecole/K_KEOS.png",
    image: "/img/formation/forma_keos3.jpg",
    theme: "MANAGEMENT",
    ecole: "KEOS"
  },
  {
    id: 8,
    titre: "RESPONSABLE DU DÉVELOPPEMENT DES ACTIVITÉS",
    description: "Identifier de nouveaux leviers de croissance et structurer leur mise en œuvre",
    redirection: "/formations/responsable-developpement",
    icon: "/img/icon_ecole/Leader.png",
    image: "/img/formation/forma_leader.png",
    theme: "BUSINESS",
    ecole: "LEADER SOCIETY"
  },
];

const categories = ['DIGITAL', 'BUSINESS', 'FINANCE', 'CRÉATIVITÉ', 'MANAGEMENT'];

export const FormationsGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUS');
  const [showAll, setShowAll] = useState(false);

  // Filtrer les formations selon la catégorie sélectionnée
  const filteredFormations = selectedCategory === 'TOUS' 
    ? formationsData 
    : formationsData.filter(formation => formation.theme === selectedCategory);

  // Afficher seulement 8 formations initialement, ou toutes si "Voir Plus" est cliqué
  const displayedFormations = showAll ? filteredFormations : filteredFormations.slice(0, 8);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setShowAll(false); // Réinitialiser l'affichage quand on change de catégorie
  };

  const handleVoirPlus = () => {
    setShowAll(true);
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

<div className="text-center">
            <button
              onClick={handleVoirPlus}
              className="bg-[#032622] text-[#F8F5E4] px-8 py-4 text-lg font-bold hover:bg-[#044a3a] transition-colors duration-300"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              VOIR PLUS
            </button>
          </div>
      </div>
    </div>
  );
};
