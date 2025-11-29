"use client";
import Link from 'next/link';

export const Improve = () => {
  return (
    <div className="w-full bg-[#032622] py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
          
          {/* Section gauche - Texte */}
          <div className="text-left ml-0 sm:ml-4 md:ml-10 lg:ml-20 xl:ml-40 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 order-2 lg:order-1">
            <h2 
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight"
              style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
            >
              PRÊT À FAIRE ÉVOLUER VOTRE TRAJECTOIRE ?
            </h2>
            <p 
              className="text-white text-sm sm:text-base md:text-lg leading-relaxed"
              style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
            >
              Explorez nos formations certifiantes et tracez votre parcours, à votre rythme, depuis n'importe où.
            </p>
          </div>

          {/* Section droite - Boutons */}
          <div className="flex flex-col gap-3 sm:gap-4 lg:items-end lg:mr-8 order-1 lg:order-2 px-4 sm:px-6 md:px-8 lg:px-0">
            <Link 
              href="/candidater"
              className="w-full lg:w-auto bg-[#F8F5E4] hover:bg-[#F8F5E4]/90 active:bg-[#F8F5E4]/80 text-[#032622] px-6 py-3 font-bold text-sm sm:text-base transition-all duration-200 text-center"
              style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
            >
              CANDIDATER MAINTENANT
            </Link>
            
            <Link 
              href="/contact"
              className="w-full lg:w-auto bg-[#F8F5E4] hover:bg-[#F8F5E4]/90 active:bg-[#F8F5E4]/80 text-[#032622] px-6 py-3 font-bold text-sm sm:text-base transition-all duration-200 text-center"
              style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
            >
              PARLER À UN CONSEILLER
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
