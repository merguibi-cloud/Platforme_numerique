  /* eslint-disable react/no-unescaped-entities */
"use client";
import Image from 'next/image';
import Link from 'next/link';

export const AdmissionProcess = () => {
  return (
    <div className="w-full min-h-[400px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[550px] bg-[#032622] py-6 sm:py-8 md:py-10 lg:py-12 px-0">
      <div className="w-full h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-6 items-center">
          
          {/* Colonne de gauche - Texte et bouton */}
          <div className="ml-0 sm:ml-4 md:ml-10 lg:ml-20 xl:ml-40 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 order-2 lg:order-1">
            {/* Titre */}
            <h2 className="text-[#F8F5E4] text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold uppercase tracking-wide leading-tight mb-3 sm:mb-4 md:mb-5 lg:mb-6" style={{ fontFamily: 'var(--font-termina-demi)' }}>
              NOTRE PROCESSUS D'ADMISSION
            </h2>
            
            {/* Paragraphe */}
            <p className="text-[#F8F5E4] text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 md:mb-10" style={{ fontFamily: 'var(--font-rota-medium)' }}>
              Rejoindre une école du groupe Elite Society, c'est intégrer un environnement exigeant, tourné vers l'action, le réseau et l'employabilité.
            </p>
            
            {/* Bouton */}
            <Link href="/admissions" className="bg-[#F8F5E4] text-[#032622] px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 font-bold uppercase tracking-wide hover:bg-[#F8F5E4]/90 active:bg-[#F8F5E4]/80 transition-all duration-200 text-xs sm:text-sm md:text-base inline-block w-full sm:w-auto text-center" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              EN SAVOIR PLUS
            </Link>
          </div>
          
          {/* Colonne de droite - Timeline du processus - Collée au bord droit */}
          <div className="relative w-full flex justify-center lg:justify-end mt-4 sm:mt-6 lg:mt-0 order-1 lg:order-2 px-4 sm:px-0">
            <div className="w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px] 2xl:max-w-[800px] h-auto">
              <Image
                src="/img/accueil/process_admission.png"
                alt="Processus d'admission - Timeline"
                width={600}
                height={400}
                className="w-full h-auto object-contain"
                priority={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

