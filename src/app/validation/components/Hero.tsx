"use client";
import Image from 'next/image';

interface HeroProps {
  children?: React.ReactNode;
}

export const Hero = ({ children }: HeroProps) => {
  return (
    <div className="relative w-full h-[300px]">
      {/* Image de fond */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/img/validation/hero_background.jpg"
          alt="Background"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
      </div>
      
      {/* Contenu overlay */}
      <div className="relative z-10 w-full h-[300px]">
        {children}
      </div>
    </div>
  );
};
