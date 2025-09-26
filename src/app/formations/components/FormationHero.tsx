"use client";
import Image from 'next/image';

export const FormationHero = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden z-30">
      {/* Image de fond */}
      <div className="absolute inset-0">
        <Image 
          src="/img/accueil/hero.png" 
          alt="Formations Elite Society" 
          fill 
          className="object-cover"
        /> 
      </div>
    </div>
  );
};
