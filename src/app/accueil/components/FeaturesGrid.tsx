"use client";
import Image from 'next/image';
import Link from 'next/link';

export const FeaturesGrid = () => {
  return (
    <div className="w-full bg-[#F8F5ED] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Hero */}
        <div className="text-left mb-16 ">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#032622] mb-6"
          >
            ELITE SOCIETY. ONLINE
          </h1>
          <p 
            className="text-lg  md:text-xl text-[#032622] w-full leading-relaxed"
          >
            Formez-vous où vous voulez, quand vous voulez, sans compromis sur la qualité.
            
            <br />
            Le campus numérique d'Elite Society vous donne accès à des parcours flexibles, professionnalisants et conçus pour vous faire avancer, étape par étape.
          </p>
        </div>

        {/* Grille de contenu */}
        <div className="max-w-7xl mx-auto">
          <Image src="/img/accueil/features.png" alt="Features" width={1000} height={1000} className="w-full h-full object-cover" />
        </div>

         {/* Bouton Voir les formations */}
         <div className="text-center mt-12">
           <Link 
             href="/formations"
             className="inline-block bg-[#032622] hover:bg-[#032622]/90 text-white px-8 py-4 font-bold text-lg transition-colors duration-200"
             style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
           >
             VOIR LES FORMATIONS
           </Link>
         </div>

      </div>
    </div>
  );
};
