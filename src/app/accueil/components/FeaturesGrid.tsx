"use client";
import Image from 'next/image';
import Link from 'next/link';

export const FeaturesGrid = () => {
  return (
    <div className="w-full bg-[#F8F5ED] py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Hero */}
        <div className="text-left mb-8 sm:mb-12 md:mb-16">
          <h1 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#032622] mb-4 sm:mb-5 md:mb-6"
            style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
          >
            ELITE SOCIETY. ONLINE
          </h1>
          <p 
            className="text-base sm:text-lg md:text-xl text-[#032622] w-full leading-relaxed"
            style={{ fontFamily: 'var(--font-termina-medium)' }}
          >
            Formez-vous où vous voulez, quand vous voulez, sans compromis sur la qualité.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Le campus numérique d'Elite Society vous donne accès à des parcours flexibles, professionnalisants et conçus pour vous faire avancer, étape par étape.
          </p>
        </div>

        {/* Grille de contenu */}
        <div className="max-w-7xl mx-auto mb-8 sm:mb-10 md:mb-12">
          <Image 
            src="/img/accueil/features.png" 
            alt="Features" 
            width={1000} 
            height={1000} 
            className="w-full h-auto object-cover rounded-lg" 
            priority={false}
          />
        </div>

         {/* Bouton Voir les formations */}
         <div className="text-center mt-6 sm:mt-8 md:mt-12">
           <Link 
             href="/formations"
             className="inline-block bg-[#032622] hover:bg-[#032622]/90 active:bg-[#032622]/80 text-white px-6 sm:px-8 py-3 sm:py-4 font-bold text-base sm:text-lg transition-all duration-200"
             style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
           >
             VOIR LES FORMATIONS
           </Link>
         </div>

      </div>
    </div>
  );
};
