"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FormationFilters } from './FormationFilters';
import { FormationsGridComplete } from './FormationsGridComplete';

export default function FormationsPageContent() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TOUS');
  const [selectedNiveau, setSelectedNiveau] = useState('TOUS');
  const [selectedRythme, setSelectedRythme] = useState('TOUS');

  // Gérer le paramètre de recherche depuis l'URL
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleNiveauChange = (niveau: string) => {
    setSelectedNiveau(niveau);
  };

  const handleRythmeChange = (rythme: string) => {
    setSelectedRythme(rythme);
  };

  return (
    <>
      <FormationFilters
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onNiveauChange={handleNiveauChange}
        onRythmeChange={handleRythmeChange}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        selectedNiveau={selectedNiveau}
        selectedRythme={selectedRythme}
      />
      <FormationsGridComplete
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        selectedNiveau={selectedNiveau}
        selectedRythme={selectedRythme}
      />
    </>
  );
}
