"use client";
import Image from 'next/image';

interface FormationHeroProps {
  backgroundImage: string;
  schoolLogo: string;
  schoolName: string;
}

export const FormationHero = ({ backgroundImage, schoolLogo, schoolName }: FormationHeroProps) => {
  return (
    <div className="relative w-full h-[505px] overflow-hidden z-30">
      {/* Image de fond */}
      <div className="absolute inset-0">
        <Image 
          src={backgroundImage} 
          alt={`Formation ${schoolName}`} 
          fill 
          className="object-cover"
        /> 
      </div>

      {/* Logo de l'école centré */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="text-center">
          <Image
            src={schoolLogo}
            alt={`Logo ${schoolName}`}
            width={457}
            height={64}
            className="mx-auto"
          />
        </div>
      </div>
    </div>
  );
};
