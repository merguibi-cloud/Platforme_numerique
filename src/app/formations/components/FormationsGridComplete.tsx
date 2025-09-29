"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Formation } from '@/types/formations';
import { getAllFormations, searchFormations } from '@/lib/formations';

interface FormationsGridCompleteProps {
  searchTerm?: string;
  selectedCategory?: string;
  selectedNiveau?: string;
  selectedRythme?: string;
}

export const FormationsGridComplete = ({ 
  searchTerm = '', 
  selectedCategory = 'TOUS', 
  selectedNiveau = 'TOUS',
  selectedRythme = 'TOUS'
}: FormationsGridCompleteProps) => {
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

  // Filtrer les formations selon les critères
  useEffect(() => {
    const filterFormations = async () => {
      try {
        // Si tous les filtres sont sur "TOUS", on récupère toutes les formations
        if (selectedCategory === 'TOUS' && selectedNiveau === 'TOUS' && selectedRythme === 'TOUS' && !searchTerm) {
          setFilteredFormations(formations);
          return;
        }

        // Sinon, on utilise la fonction de recherche de Supabase
        const filters: any = {};
        if (selectedCategory !== 'TOUS') filters.theme = selectedCategory;
        if (selectedNiveau !== 'TOUS') filters.niveau = selectedNiveau;
        if (selectedRythme !== 'TOUS') filters.rythme = selectedRythme;

        let results = await searchFormations(filters);

        // Filtrage côté client pour la recherche textuelle
        if (searchTerm) {
          results = results.filter(formation => 
            formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            formation.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setFilteredFormations(results);
      } catch (error) {
        console.error('Erreur lors du filtrage des formations:', error);
        setFilteredFormations(formations);
      }
    };

    filterFormations();
  }, [searchTerm, selectedCategory, selectedNiveau, selectedRythme, formations]);

  return (
    <div className="py-16 px-4" style={{ backgroundColor: '#F8F5E4' }}>
      <div className="max-w-7xl mx-auto">
        {/* Titre principal */}
        <div className="text-center mb-8">
          <h2 
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ 
              color: '#032622',
              fontFamily: 'var(--font-termina-bold)',
              fontWeight: '700'
            }}
          >
            NOS FORMATIONS, VOTRE TRAJECTOIRE
          </h2>
          <p className="text-lg text-gray-700 max-w-4xl mx-auto">
            Explorez l'ensemble de nos parcours certifiants et choisissez la formation qui s'inscrit dans votre ambition professionnelle.
          </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {filteredFormations.map((formation) => (
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
        )}

        {/* Message si aucune formation trouvée */}
        {!loading && filteredFormations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#032622] text-lg">
              Aucune formation trouvée pour ces critères de recherche.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
