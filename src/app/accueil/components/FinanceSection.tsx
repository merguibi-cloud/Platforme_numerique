"use client";
import Image from 'next/image';

export default function FinanceSection() {
  return (
    <div className="w-full bg-[#F8F5E4] py-8 sm:py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
          
          {/* Section gauche - Image */}
          <div className="relative max-w-md mx-auto lg:mx-0 order-2 lg:order-1">
            <Image
              src="/img/accueil/need_finance.png"
              alt="Besoin de se faire financer"
              width={400}
              height={300}
              className="w-full h-auto shadow-lg"
              priority={false}
            />
          </div>

          {/* Section droite - Contenu */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6 order-1 lg:order-2">
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#032622] leading-tight"
              style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
            >
              BESOIN DE SE FAIRE FINANCER ?
            </h2>
            
            <p 
              className="text-base sm:text-lg text-[#032622] leading-relaxed"
              style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
            >
              Elle permet de combiner théorie et pratique, tout en facilitant l'insertion professionnelle. Un rythme dynamique, une expérience encadrée, un véritable accélérateur de parcours.
            </p>

            {/* Liste avec puces personnalisées */}
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start space-x-3 sm:space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <Image
                    src="/img/accueil/ecusson_vert.png"
                    alt=""
                    width={16}
                    height={16}
                    className="transform -rotate-90 w-4 h-4"
                  />
                </div>
                <span 
                  className="text-[#032622] text-sm sm:text-base md:text-lg"
                  style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                >
                  Une immersion concrète dans le monde du travail
                </span>
              </li>
              
              <li className="flex items-start space-x-3 sm:space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <Image
                    src="/img/accueil/ecusson_vert.png"
                    alt=""
                    width={16}
                    height={16}
                    className="transform -rotate-90 w-4 h-4"
                  />
                </div>
                <span 
                  className="text-[#032622] text-sm sm:text-base md:text-lg"
                  style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                >
                  Des compétences directement applicables
                </span>
              </li>
              
              <li className="flex items-start space-x-3 sm:space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <Image
                    src="/img/accueil/ecusson_vert.png"
                    alt=""
                    width={16}
                    height={16}
                    className="transform -rotate-90 w-4 h-4"
                  />
                </div>
                <span 
                  className="text-[#032622] text-sm sm:text-base md:text-lg"
                  style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                >
                  Un lien fort avec les entreprises partenaires
                </span>
              </li>
              
              <li className="flex items-start space-x-3 sm:space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <Image
                    src="/img/accueil/ecusson_vert.png"
                    alt=""
                    width={16}
                    height={16}
                    className="transform -rotate-90 w-4 h-4"
                  />
                </div>
                <span 
                  className="text-[#032622] text-sm sm:text-base md:text-lg"
                  style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                >
                  Une montée en confiance et en autonomie
                </span>
              </li>
            </ul>

            {/* Bouton CTA */}
            <div className="pt-2 sm:pt-4">
              <button 
                className="bg-[#032622] hover:bg-[#032622]/90 active:bg-[#032622]/80 text-[#F8F5E4] px-6 sm:px-8 py-3 sm:py-4 font-bold text-base sm:text-lg transition-all duration-200 w-full sm:w-auto"
                style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
              >
                EN SAVOIR PLUS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
