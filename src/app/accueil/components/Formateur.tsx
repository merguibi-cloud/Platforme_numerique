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
    <div className="w-full bg-[#032622] py-16">
      <div className="w-full px-4">
        {/* Header */}
        <div className="text-left ml-0 sm:ml-10 md:ml-20 lg:ml-40 px-4 md:px-8 lg:px-12 xl:px-16 mb-12">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
          >
            DES EXPERTS QUALIFIÉS, AU SERVICE DE VOTRE PROGRESSION
          </h2>
          <p 
            className="text-lg text-white leading-relaxed"
            style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
          >
            Tous nos cours sont conçus et animés par des professionnels certifiés, reconnus dans leur domaine. Leur mission : transmettre un savoir concret, à jour, et directement applicable sur le terrain. Nos programmes intègrent les enjeux sociaux et environnementaux, et encouragent les projets à impact positif, à toutes les échelles.
          </p>
        </div>

        {/* Experts */}
        <div className="ml-0 sm:ml-10 md:ml-20 lg:ml-40 px-4 md:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {experts.map((expert) => (
            <div key={expert.id} className="relative group">
              {/* Image de l'expert */}
              <div className="relative w-full h-80 bg-gray-200 overflow-hidden">
                <Image
                  src={expert.image}
                  alt={expert.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Icône LinkedIn */}
                <div className="absolute top-4 right-4">
                  <a 
                    href={expert.linkedin}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-black font-bold text-xs">in</span>
                  </a>
                </div>
                
                {/* Logo/icône en bas */}
                <div className="absolute bottom-4 right-4 w-8 h-8 bg-white rounded flex items-center justify-center">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>

        {/* Bouton CTA */}
        <div className="text-center">
          <Link 
            href="/devenir-formateur"
            className="bg-[#F8F5E4] hover:bg-[#F8F5E4]/90 text-[#032622] px-8 py-4 font-bold text-lg transition-colors duration-200 inline-block"
            style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
          >
            DEVENIR FORMATEUR
          </Link>
        </div>
      </div>
    </div>
  );
};
