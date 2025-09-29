"use client";
import { useState } from 'react';
import { Search, ChevronDown, Filter } from 'lucide-react';
import { categories, niveaux, rythmes } from '@/types/formations';

interface FormationFiltersProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onNiveauChange: (niveau: string) => void;
  onRythmeChange: (rythme: string) => void;
  searchTerm: string;
  selectedCategory: string;
  selectedNiveau: string;
  selectedRythme: string;
}

export const FormationFilters = ({
  onSearchChange,
  onCategoryChange,
  onNiveauChange,
  onRythmeChange,
  searchTerm,
  selectedCategory,
  selectedNiveau,
  selectedRythme
}: FormationFiltersProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <div className="py-8 px-4" style={{ backgroundColor: '#F8F5E4' }}>
      <div className="max-w-7xl mx-auto">
        {/* Barre de filtres */}
        <div className="bg-[#F8F5E4] border border-gray-300 p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Champ de recherche */}
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#032622] w-5 h-5" />
                <input
                  type="text"
                  placeholder="RECHERCHER"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3  bg-[#F8F5E4] focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent placeholder-[#032622]"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                />
              </div>
            </div>

            {/* Filtre par niveau d'étude */}
            <div className="relative">
              <select
                value={selectedNiveau}
                onChange={(e) => onNiveauChange(e.target.value)}
                className="appearance-none bg-[#F8F5E4] text-[#032622] px-4 py-3 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent min-w-[200px]"
                style={{ fontFamily: 'var(--font-termina-bold)', color: '#032622' }}
              >
                <option value="TOUS" className="text-[#032622]" style={{ color: '#032622' }}>NIVEAU D'ÉTUDE</option>
                {niveaux.map((niveau) => (
                  <option key={niveau} value={niveau} className="text-[#032622]" style={{ color: '#032622' }}>
                    {niveau}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#032622] w-5 h-5 pointer-events-none" />
            </div>

            {/* Filtre par spécialisation */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="appearance-none bg-[#F8F5E4] text-[#032622] px-4 py-3 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent min-w-[200px]"
                style={{ fontFamily: 'var(--font-termina-bold)', color: '#032622' }}
              >
                <option value="TOUS" className="text-[#032622]" style={{ color: '#032622' }}>SPÉCIALISATION</option>
                {categories.map((category) => (
                  <option key={category} value={category} className="text-[#032622]" style={{ color: '#032622' }}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#032622] w-5 h-5 pointer-events-none" />
            </div>

            {/* Filtre par rythme de formation */}
            <div className="relative">
              <select
                value={selectedRythme}
                onChange={(e) => onRythmeChange(e.target.value)}
                className="appearance-none bg-[#F8F5E4] text-[#032622] px-4 py-3 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent min-w-[200px]"
                style={{ fontFamily: 'var(--font-termina-bold)', color: '#032622' }}
              >
                <option value="TOUS" className="text-[#032622]" style={{ color: '#032622' }}>RYTHME DE FORMATION</option>
                {rythmes.map((rythme) => (
                  <option key={rythme} value={rythme} className="text-[#032622]" style={{ color: '#032622' }}>
                    {rythme}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#032622] w-5 h-5 pointer-events-none" />
            </div>

            {/* Bouton filtre avancé */}
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="bg-[#032622] text-white px-6 py-3  flex items-center gap-2 hover:bg-[#044a3a] transition-colors duration-300"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              <Filter className="w-5 h-5" />
              FILTRE AVANCÉ
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
