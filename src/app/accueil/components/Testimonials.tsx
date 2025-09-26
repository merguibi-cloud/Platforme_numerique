"use client";
import Image from 'next/image';

export const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      quote: "Grâce à Campus Numérique, j'ai pu me reconvertir dans le développement web. L'accompagnement personnalisé m'a permis de décrocher un CDI rapidement.",
      name: "SOPHIE MARTIN",
      title: "Développeuse Web chez TechCorp",
      image: "/img/testimonials/sophie-martin.jpg"
    },
    {
      id: 2,
      quote: "La formation Data Science était parfaitement adaptée à mes besoins. Les projets pratiques m'ont donné une expérience concrète très appréciée par les employeurs.",
      name: "THOMAS DUBOIS",
      title: "Data Analyst chez DataFlow",
      image: "/img/testimonials/thomas-dubois.jpg"
    },
    {
      id: 3,
      quote: "Grâce à Campus Numérique, j'ai pu me reconvertir dans le développement web. L'accompagnement personnalisé m'a permis de décrocher un CDI rapidement.",
      name: "MARIE LEROY",
      title: "UX Designer chez DesignStudio",
      image: "/img/testimonials/marie-leroy.jpg"
    }
  ];

  return (
    <div className="w-full bg-[#F8F5E4] py-16">
      <div className="w-full px-4">
        {/* Header */}
        <div className="text-left ml-0 sm:ml-10 md:ml-20 lg:ml-40 px-4 md:px-8 lg:px-12 xl:px-16 mb-12">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#032622] mb-4"
            style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
          >
            ILS NOUS FONT CONFIANCE
          </h2>
          <p 
            className="text-lg text-[#032622]"
            style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
          >
            Découvrez les témoignages de nos anciens étudiants
          </p>
        </div>

        {/* Témoignages */}
        <div className="ml-0 sm:ml-10 md:ml-20 lg:ml-40 px-4 md:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-[#032622] p-6  h-full flex flex-col"
            >
              {/* Citation */}
              <blockquote className="text-white text-base leading-relaxed mb-6 flex-grow">
                "{testimonial.quote}"
              </blockquote>
              
              {/* Profil */}
              <div className="flex items-center space-x-4">
                {/* Photo de profil */}
                <div className="w-12 h-12 bg-[#F8F5E4] flex-shrink-0 flex items-center justify-center">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                
                {/* Nom et titre */}
                <div className="flex-1">
                  <h4 
                    className="text-white font-bold text-sm"
                    style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
                  >
                    {testimonial.name}
                  </h4>
                  <p 
                    className="text-white text-xs opacity-90"
                    style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                  >
                    {testimonial.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};
