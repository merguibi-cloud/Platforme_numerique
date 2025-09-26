/* eslint-disable react/no-unescaped-entities */
"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from './Navbar';
import { Improve } from './Improve';
import { Footer } from './Footer';

export const NotFound = () => {
  return (
    <>
    <Navbar />
     <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center px-4 relative overflow-hidden">
       {/* Background image */}
       <div className="absolute inset-0">
         <Image
           src="/img/img_labyrinthe.png"
           alt="Background"
           fill
           className="object-cover"
           priority
         />
         {/* Beige overlay with opacity */}
         <div className="absolute inset-0 bg-[#F8F5E4] opacity-60"></div>
       </div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* 404 Number */}
        <div className="text-8xl md:text-9xl lg:text-[12rem] font-bold text-[#032622] mb-4" 
             style={{ fontFamily: 'var(--font-termina-demi)' }}>
          404
        </div>

        {/* PAGE INTROUVABLE */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#032622] mb-8 uppercase tracking-wide" 
            style={{ fontFamily: 'var(--font-termina-demi)' }}>
          PAGE INTROUVABLE
        </h1>

        {/* Description text */}
        <div className="max-w-2xl mx-auto mb-12">
          <p className="text-lg md:text-xl text-[#032622] leading-relaxed" 
             style={{ fontFamily: 'var(--font-rota-medium)' }}>
            Cette page n'existe pas, mais notre écosystème reste bien structuré. 
            Revenez à l'accueil ou explorez nos formations pour poursuivre votre parcours.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/"
            className="bg-[#032622] text-[#F8F5E4] px-8 py-4 font-bold uppercase tracking-wide text-base hover:bg-[#054A3A] transition-colors rounded-lg flex items-center space-x-3 min-w-[280px] justify-center" 
            style={{ fontFamily: 'var(--font-rota-medium)' }}
          >
           
            <span>RETOURNER À LA PAGE D'ACCUEIL</span>
          </Link>

          <Link 
            href="/formations"
            className="bg-[#032622] text-[#F8F5E4] px-8 py-4 font-bold uppercase tracking-wide text-base hover:bg-[#054A3A] transition-colors rounded-lg flex items-center space-x-3 min-w-[280px] justify-center" 
            style={{ fontFamily: 'var(--font-rota-medium)' }}
          >
            <span>DÉCOUVRIR NOS FORMATIONS</span>
          </Link>
        </div>
      </div>
    </div>
    <Improve />
    <Footer />
    </>
  );
};
