"use client";
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LoginWithFormationSelection } from './LoginWithFormationSelection';

const navigationItems = [
  { label: "FORMATIONS", href: "/formations" },
  { label: "ADMISSION", href: "/admission" },
  { label: "ÉVÉNEMENTS", href: "/evenements" },
];

export const Navbar = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const openLogin = () => {
    setIsLoginOpen(true);
  };

  const closeLogin = () => {
    setIsLoginOpen(false);
  };


  return (
    <>
      <nav className="fixed w-full h-[100px] sm:h-[120px] md:h-[140px] top-4 sm:top-6 md:top-8 left-0 px-2 sm:px-4 z-50">
        {/* Glassmorphism container */}
        <div className="w-full h-full px-2 sm:px-4 md:px-8">
          <div className="bg-[#032622]/30  border border-[#F8F5E4]/20 shadow-2xl h-full">
            <div className="flex items-center h-full px-2 sm:px-4 md:px-8">
              {/* Logo */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link href="/" className="cursor-pointer">
                       <Image src="/img/accueil/logo_elite_society_online_blanc.png" alt="ELITE SOCIETY" width={120} height={120} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain" />
                </Link>
              </div>

              {/* Desktop Navigation Links */}
              <div className="hidden lg:flex items-center space-x-16 ml-16">
                {navigationItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-[#F8F5E4] hover:text-[#F8F5E4]/80 transition-colors duration-200 tracking-wide text-base sm:text-lg cursor-pointer font-bold"
                    style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Desktop Action Button */}
              <div className="hidden sm:flex items-center space-x-2 md:space-x-3 ml-auto">
                <button 
                  onClick={openLogin}
                  className="bg-[#032622] hover:bg-[#032622]/50 text-[#F8F5E4] border-0 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 tracking-wide transition-all duration-200 text-sm sm:text-sm md:text-base flex items-center justify-center"
                  style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '900' }}
                >
                  <span style={{ fontWeight: '900' }}>ME CONNECTER</span>
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden ml-auto">
                <button
                  onClick={toggleMobileMenu}
                  className="text-[#F8F5E4] p-2"
                  aria-label="Toggle mobile menu"
                >
                  {isMobileNavOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-[70]">
          {/* Menu de navigation avec animation slide-right */}
          <div className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-[#F8F5E4] shadow-2xl transition-all duration-300 flex flex-col">
            {/* Header du menu */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#032622] flex-shrink-0">
              <h3 className="text-lg font-semibold text-[#F8F5E4]" style={{ fontFamily: 'var(--font-termina-bold)' }}>

                  <span className="text-black font-bold text-sm" style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}>
                    <Image src="/img/accueil/logo_elite_society_online_blanc.png" alt="ELITE SOCIETY" width={80} height={80} className="w-10 h-10 sm:w-14 sm:h-14 md:w-18 md:h-18 object-contain" />
                  </span>
                
              </h3>
              <button
                onClick={toggleMobileMenu}
                className="p-2 hover:bg-[#F8F5E4]/10 transition-colors"
              >
                <X className="w-6 h-6 text-[#F8F5E4]" />
              </button>
            </div>

            {/* Contenu de navigation avec scroll */}
            <div className="flex-1 overflow-y-auto">
              <div className="py-4">
                {navigationItems.map((item) => (
                  <div key={item.label} className="border-b border-gray-200 last:border-b-0">
                    <Link
                      href={item.href}
                      onClick={toggleMobileMenu}
                      className="w-full flex items-center justify-between px-6 py-4 text-[#032622] hover:bg-gray-50 transition-colors duration-200"
                      style={{ fontFamily: 'var(--font-termina-bold)' }}
                    >
                      <span>{item.label}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button - Toujours visible en bas */}
            <div className="flex flex-col space-y-3 px-6 py-4 bg-[#F8F5E4] border-t border-gray-200 flex-shrink-0">
              <button 
                onClick={() => {
                  openLogin();
                  toggleMobileMenu();
                }}
                className="bg-[#032622] hover:bg-[#032622]/50 text-[#F8F5E4] border-0 px-6 py-3 tracking-wide transition-all duration-200 flex items-center justify-center"
                style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '900' }}
              >
                <span style={{ fontWeight: '900' }}>ME CONNECTER</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login with Formation Selection Modal */}
      <LoginWithFormationSelection 
        isOpen={isLoginOpen} 
        onCloseAction={closeLogin}
        onCompleteAction={(selectedFormations) => {
          console.log('Formations sélectionnées:', selectedFormations);
          // Ici vous pouvez traiter les formations sélectionnées
        }}
      />
    </>
  );
};
