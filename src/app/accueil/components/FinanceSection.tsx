"use client";
import Image from 'next/image';

export default function FinanceSection() {
  return (
    <div className="w-full bg-[#F8F5E4] py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Section gauche - Image */}
          <div className="relative max-w-md mx-auto lg:mx-0">
            <Image
              src="/img/accueil/need_finance.png"
              alt="Besoin de se faire financer"
              width={400}
              height={300}
              className="w-full h-auto shadow-lg"
              priority
            />
          </div>

          {/* Section droite - Contenu */}
          <div className="space-y-6">
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#032622] leading-tight"
              style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
            >
              BESOIN DE SE FAIRE FINANCER ?
            </h2>
            
            <p 
              className="text-lg text-[#032622] leading-relaxed"
              style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
            >
              Elle permet de combiner théorie et pratique, tout en facilitant l'insertion professionnelle. Un rythme dynamique, une expérience encadrée, un véritable accélérateur de parcours.
            </p>

            {/* Liste avec puces personnalisées */}
            <ul className="space-y-4">
              <li className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <Image
                    src="/img/accueil/ecusson_vert.png"
                    alt=""
                    width={16}
                    height={16}
                    className="transform -rotate-90"
                  />
                </div>
                <span 
                  className="text-[#032622] text-lg"
                  style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                >
                  Une immersion concrète dans le monde du travail
                </span>
              </li>
              
              <li className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <Image
                    src="/img/accueil/ecusson_vert.png"
                    alt=""
                    width={16}
                    height={16}
                    className="transform -rotate-90"
                  />
                </div>
                <span 
                  className="text-[#032622] text-lg"
                  style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                >
                  Des compétences directement applicables
                </span>
              </li>
              
              <li className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <Image
                    src="/img/accueil/ecusson_vert.png"
                    alt=""
                    width={16}
                    height={16}
                    className="transform -rotate-90"
                  />
                </div>
                <span 
                  className="text-[#032622] text-lg"
                  style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                >
                  Un lien fort avec les entreprises partenaires
                </span>
              </li>
              
              <li className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <Image
                    src="/img/accueil/ecusson_vert.png"
                    alt=""
                    width={16}
                    height={16}
                    className="transform -rotate-90"
                  />
                </div>
                <span 
                  className="text-[#032622] text-lg"
                  style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                >
                  Une montée en confiance et en autonomie
                </span>
              </li>
            </ul>

            {/* Bouton CTA */}
            <div className="pt-4">
              <button 
                className="bg-[#032622] hover:bg-[#032622]/90 text-[#F8F5E4] px-8 py-4 font-bold text-lg transition-colors duration-200"
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
