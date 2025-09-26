"use client";
import Link from 'next/link';

export const Improve = () => {
  return (
    <div className="w-full bg-[#032622] py-16 px-4">
      <div className="w-full px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
          
          {/* Section gauche - Texte */}
          <div className="text-left ml-0 sm:ml-10 md:ml-20 lg:ml-40 px-4 md:px-8 lg:px-12 xl:px-16">
            <h2 
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
            >
              PRÊT À FAIRE ÉVOLUER VOTRE TRAJECTOIRE ?
            </h2>
            <p 
              className="text-white text-base md:text-lg leading-relaxed"
              style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
            >
              Explorez nos formations certifiantes et tracez votre parcours, à votre rythme, depuis n'importe où.
            </p>
          </div>

          {/* Section droite - Boutons */}
          <div className="flex flex-col gap-4 lg:items-end mr-8">
            <Link 
              href="/candidater"
              className="w-full lg:w-100 bg-[#F8F5E4] hover:bg-[#F8F5E4]/90 text-[#032622] px-6 py-3 font-bold text-base transition-colors duration-200 text-center"
              style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
            >
              CANDIDATER MAINTENANT
            </Link>
            
            <Link 
              href="/contact"
              className="w-full lg:w-100 bg-[#F8F5E4] hover:bg-[#F8F5E4]/90 text-[#032622] px-6 py-3 font-bold text-base transition-colors duration-200 text-center"
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
