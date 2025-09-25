/* eslint-disable react/no-unescaped-entities */
"use client";
import Image from 'next/image';
import { ChevronDown, Search } from 'lucide-react';

export const OnlineHero = () => {
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

        {/* Barre de recherche */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-4xl">
          {/* Champ de sélection */}
          <div className="flex-1 relative">
            <div className="bg-white/90 backdrop-blur-sm  p-4 flex items-center justify-between cursor-pointer hover:bg-white transition-colors duration-200">
              <span className="text-gray-700 font-medium" style={{ fontFamily: 'var(--font-rota-medium)' }}>
                Sélectionner une formation
              </span>
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </div>
          </div>
          
          {/* Bouton de recherche */}
          <button className="bg-[#032622] hover:bg-[#032622]/90 text-white px-8 py-4 font-bold uppercase tracking-wide transition-colors duration-200 flex items-center justify-center gap-2 " style={{ fontFamily: 'var(--font-rota-medium)' }}>
            <Search className="w-5 h-5" />
            RECHERCHE
          </button>
        </div>
      </div>
    </div>
  );
};
