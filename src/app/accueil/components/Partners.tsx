"use client";
import Image from 'next/image';
import { useEffect, useRef } from 'react';

export default function Partners() {
  const carouselRef = useRef<HTMLDivElement>(null);

  // Liste des partenaires
  const partners = [
    { name: 'Accor', image: '/img/partenaires/Accor.png' },
    { name: 'Crédit Agricole', image: '/img/partenaires/Credit_agricole.png' },
    { name: 'PayPal', image: '/img/partenaires/paypal.png' },
    { name: 'Rbnb', image: '/img/partenaires/Rbnb.png' },
    { name: 'Station F', image: '/img/partenaires/station_f.png' },
    { name: 'Statut France', image: '/img/partenaires/Statut_fr.png' },
  ];

  // Dupliquer les partenaires pour un défilement infini fluide
  const duplicatedPartners = [...partners, ...partners, ...partners];

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // Vitesse de défilement (pixels par frame)

    const animate = () => {
      scrollPosition += scrollSpeed;
      carousel.scrollLeft = scrollPosition;
      
      // Reset de la position pour un défilement infini
      if (scrollPosition >= carousel.scrollWidth / 3) {
        scrollPosition = 0;
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <div className="w-full bg-[#F8F5E4] py-8 sm:py-10 md:py-12">
      <div className="w-full px-4 sm:px-6 md:px-8">
        <h2 
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-[#032622] mb-8 sm:mb-10 md:mb-12"
          style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
        >
          NOS PARTENAIRES
        </h2>
        
        <div 
          ref={carouselRef}
          className="relative overflow-x-hidden w-full carousel-container"
          style={{ maxWidth: '100%' }}
        >
          <div className="flex space-x-8 sm:space-x-12 md:space-x-16 items-center" style={{ willChange: 'scroll-position' }}>
            {duplicatedPartners.map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex-shrink-0 flex items-center justify-center min-w-[150px] sm:min-w-[200px] md:min-w-[250px] lg:min-w-[300px] h-16 sm:h-20 md:h-24 lg:h-[120px]"
              >
                <div className="relative w-full h-full opacity-90 hover:opacity-100 transition-opacity duration-300 px-2 sm:px-4">
                  <Image
                    src={partner.image}
                    alt={partner.name}
                    fill
                    className="object-contain transition-all duration-300"
                    sizes="(max-width: 640px) 150px, (max-width: 768px) 200px, (max-width: 1024px) 250px, 300px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};