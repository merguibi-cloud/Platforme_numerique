"use client";
import Image from 'next/image';
import Link from 'next/link';

export const Formateur = () => {
  const experts = [
    {
      id: 1,
      name: "Expert Mathématiques",
      title: "Professeur de Mathématiques",
      image: "/img/experts/expert-math.jpg",
      linkedin: "#"
    },
    {
      id: 2,
      name: "Expert Data Science",
      title: "Data Scientist Senior",
      image: "/img/experts/expert-data.jpg",
      linkedin: "#"
    },
    {
      id: 3,
      name: "Expert Développement",
      title: "Développeur Full-Stack",
      image: "/img/experts/expert-dev.jpg",
      linkedin: "#"
    }
  ];

  return (
    <div className="w-full bg-[#032622] py-8 sm:py-12 md:py-16">
      <div className="w-full px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="text-left ml-0 sm:ml-4 md:ml-10 lg:ml-20 xl:ml-40 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mb-8 sm:mb-10 md:mb-12">
          <h2 
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-5 md:mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
          >
            DES EXPERTS QUALIFIÉS, AU SERVICE DE VOTRE PROGRESSION
          </h2>
          <p 
            className="text-sm sm:text-base md:text-lg text-white leading-relaxed"
            style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
          >
            Tous nos cours sont conçus et animés par des professionnels certifiés, reconnus dans leur domaine. Leur mission : transmettre un savoir concret, à jour, et directement applicable sur le terrain. Nos programmes intègrent les enjeux sociaux et environnementaux, et encouragent les projets à impact positif, à toutes les échelles.
          </p>
        </div>

        {/* Experts */}
        <div className="ml-0 sm:ml-4 md:ml-10 lg:ml-20 xl:ml-40 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12">
          {experts.map((expert) => (
            <div key={expert.id} className="relative group">
              {/* Image de l'expert */}
              <div className="relative w-full h-60 sm:h-72 md:h-80 bg-gray-200 overflow-hidden rounded-lg">
                <Image
                  src={expert.image}
                  alt={expert.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Icône LinkedIn */}
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                  <a 
                    href={expert.linkedin}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    aria-label={`LinkedIn de ${expert.name}`}
                  >
                    <span className="text-black font-bold text-xs">in</span>
                  </a>
                </div>
                
                {/* Logo/icône en bas */}
                <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 bg-white/90 backdrop-blur-sm rounded flex items-center justify-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded"></div>
                </div>
              </div>
              
              {/* Nom et titre - visible en dessous sur mobile */}
              <div className="mt-3 sm:hidden">
                <h3 className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                  {expert.name}
                </h3>
                <p className="text-white/80 text-xs" style={{ fontFamily: 'var(--font-termina-medium)' }}>
                  {expert.title}
                </p>
              </div>
            </div>
          ))}
          </div>
        </div>

        {/* Bouton CTA */}
        <div className="text-center">
          <Link 
            href="/devenir-formateur"
            className="bg-[#F8F5E4] hover:bg-[#F8F5E4]/90 active:bg-[#F8F5E4]/80 text-[#032622] px-6 sm:px-8 py-3 sm:py-4 font-bold text-base sm:text-lg transition-all duration-200 inline-block"
            style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
          >
            DEVENIR FORMATEUR
          </Link>
        </div>
      </div>
    </div>
  );
};
