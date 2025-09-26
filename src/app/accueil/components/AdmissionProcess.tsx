/* eslint-disable react/no-unescaped-entities */
"use client";
import Image from 'next/image';
import Link from 'next/link';

export const AdmissionProcess = () => {
  return (
    <div className="w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] bg-[#032622] py-6 md:py-8 lg:py-10 px-0">
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-center">
          
          {/* Colonne de gauche - Texte et bouton */}
          <div className="ml-0 sm:ml-10 md:ml-20 lg:ml-40 px-4 md:px-8 lg:px-12 xl:px-16">
            {/* Titre */}
            <h2 className="text-[#F8F5E4] text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#2D5C4E] uppercase tracking-wide leading-tight mb-4 md:mb-6" style={{ fontFamily: 'var(--font-termina-demi)' }}>
              NOTRE PROCESSUS D'ADMISSION
            </h2>
            
            {/* Paragraphe */}
            <p className="text-[#F8F5E4] text-sm md:text-base lg:text-lg leading-relaxed mb-8 md:mb-10" style={{ fontFamily: 'var(--font-rota-medium)' }}>
              Rejoindre une école du groupe Elite Society, c'est intégrer un environnement exigeant, tourné vers l'action, le réseau et l'employabilité.
            </p>
            
            {/* Bouton */}
            <Link href="/admissions" className="bg-[#F8F5E4] text-[#032622] px-6 md:px-8 py-3 md:py-4 font-bold uppercase tracking-wide hover:bg-[#1e4035] transition-colors text-sm md:text-base" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              EN SAVOIR PLUS
            </Link>
          </div>
          
          {/* Colonne de droite - Timeline du processus - Collée au bord droit */}
          <div className="relative w-full flex justify-end mt-8 lg:mt-0">
            <div className="w-full max-w-[400px] sm:max-w-[600px] md:max-w-[700px] xl:max-w-[800px] h-auto">
              <Image
                src="/img/accueil/process_admission.png"
                alt="Processus d'admission - Timeline"
                width={600}
                height={400}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

