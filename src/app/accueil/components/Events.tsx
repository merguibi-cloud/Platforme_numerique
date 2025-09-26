"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export const Events = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Tableau d'images d'événements
  const eventImages = [
    {
      id: 1,
      src: "/img/events/event1.jpg",
      alt: "Conférence en ligne",
      title: "Conférence Tech 2024"
    },
    {
      id: 2,
      src: "/img/events/event2.jpg",
      alt: "Workshop Data Science",
      title: "Workshop Data Science"
    },
    {
      id: 3,
      src: "/img/events/event3.jpg",
      alt: "Masterclass Marketing",
      title: "Masterclass Marketing"
    },
    {
      id: 4,
      src: "/img/events/event4.jpg",
      alt: "Webinaire Finance",
      title: "Webinaire Finance"
    }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % eventImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + eventImages.length) % eventImages.length);
  };
  return (
    <div className="w-full bg-[#F8F5E4] py-16">
      <div className="w-full px-4">
        {/* Titre et texte au-dessus */}
        <div className="text-left ml-0 sm:ml-10 md:ml-20 lg:ml-40 px-4 md:px-8 lg:px-12 xl:px-16 mb-12">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#032622] leading-tight mb-6"
            style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
          >
            DES TEMPS FORTS, MÊME À DISTANCE
          </h2>
          
          <div className="space-y-4">
            <p 
              className="text-lg text-[#032622] leading-relaxed"
              style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
            >
              Webinaires, masterclass, workshops, conférences en live...
            </p>
            <p 
              className="text-lg text-[#032622] leading-relaxed"
              style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
            >
              Le campus vit toute l'année au rythme d'événements exclusifs pour apprendre, rencontrer, échanger et se projeter.
            </p>
          </div>
        </div>

        {/* Carrousel pleine largeur */}
        <div className="relative w-full max-w-7xl mx-auto flex items-center">
          {/* Flèche gauche - à l'extérieur */}
          <button 
            onClick={prevImage}
            className="flex-shrink-0 w-12 h-12 text-[#032622] rounded-full flex items-center justify-center hover:text-[#F8F5E4] hover:bg-[#032622] transition-colors mr-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Image du carrousel */}
          <div className="flex-1 relative aspect-[16/9] bg-gray-200 overflow-hidden">
            <Image
              src={eventImages[currentImageIndex].src}
              alt={eventImages[currentImageIndex].alt}
              fill
              className="object-cover transition-opacity duration-300"
              priority
            />
            
            {/* Titre de l'événement */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded">
              <h3 className="font-bold text-sm">{eventImages[currentImageIndex].title}</h3>
            </div>
          </div>
          
          {/* Flèche droite - à l'extérieur */}
          <button 
            onClick={nextImage}
            className="flex-shrink-0 w-12 h-12 text-[#032622] rounded-full flex items-center justify-center hover:bg-[#032622] hover:text-[#F8F5E4] transition-colors ml-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Indicateurs de pagination */}
        <div className="flex justify-center mt-6 space-x-2">
          {eventImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentImageIndex ? 'bg-[#032622]' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
          {/* Bouton CTA */}
          <div className="pt-6 text-center">
             <Link 
               href="/evenements"
               className="bg-[#032622] hover:bg-[#032622]/90 text-[#F8F5E4] px-8 py-4 font-bold text-lg transition-colors duration-200 inline-block"
               style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
             >
               EN SAVOIR PLUS
             </Link>
           </div>
      </div>
    </div>
  );
};