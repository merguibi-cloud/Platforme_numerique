/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
"use client";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  navigation: [
    { label: "Formations", href: "/formations" },
    { label: "Admission", href: "/admission" },
    { label: "Événements", href: "/evenements" },
    { label: "Connexion", href: "/connexion" }
  ],
  legal: [
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Politique de Confidentialité", href: "/politique-confidentialite" },
    { label: "Politique de cookies", href: "/politique-cookies" },
    { label: "FAQ", href: "/contact#faq" }
  ],
};

const socialIcons = [
  { name: "Instagram", icon: "/img/footer/logo_instagram.png", href: "https://www.instagram.com/elitesociety_group/" },
  { name: "TikTok", icon: "/img/footer/logo_tiktok.png", href: "https://www.tiktok.com/@elitesocietygroup" },
  { name: "LinkedIn", icon: "/img/footer/logo_linkedin.png", href: "https://www.linkedin.com/company/elite-society-group/" },
  { name: "YouTube", icon: "/img/footer/logo_ytb.png", href: "https://www.youtube.com/@EliteSociety-group" },
];

export const Footer = () => {
  const [isNavigationDropdownOpen, setIsNavigationDropdownOpen] = useState(false);
  const [isLegalDropdownOpen, setIsLegalDropdownOpen] = useState(false);

  const toggleNavigationDropdown = () => {
    setIsNavigationDropdownOpen(!isNavigationDropdownOpen);
  };

  const toggleLegalDropdown = () => {
    setIsLegalDropdownOpen(!isLegalDropdownOpen);
  };

  return (
    <footer className="w-full bg-[#032622] text-[#F8F5E4]">
      {/* Social Media Bar */}
      <div className="w-full h-16 bg-[#032622] border-b border-[#f8f5e4]/20">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-center gap-4 md:gap-6 lg:gap-8">
          {socialIcons.map((social, index) => (
            <div
              key={social.name}
              className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-[#F8F5E4] hover:text-[#f8f5e4] transition-colors cursor-pointer"
            >
              <Link href={social.href}>
                <Image src={social.icon} alt={social.name} width={20} height={20} className="w-4 h-4 md:w-6 md:h-6" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="w-full px-4 py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-2">
          {/* Logo and Description Section */}
          <div className="lg:col-span-2 ml-0 sm:ml-10 md:ml-20 lg:ml-40 px-4 md:px-8 lg:px-12 xl:px-16 space-y-4 md:space-y-6">
            <div className="flex items-center space-x-4">
                <Image src="/img/accueil/logo_elite_society_online_blanc.png" alt="ELITE SOCIETY" width={64} height={64} className="w-12 h-12 md:w-16 md:h-16 object-contain" />
              <div>
                <h3 className="text-lg md:text-xl font-bold text-[#F8F5E4]" style={{ fontFamily: 'var(--font-termina-demi)' }}>ELITE SOCIETY</h3>
              </div>
            </div>
            
            <p className="text-[#F8F5E4]/90 text-sm md:text-base leading-relaxed max-w-md" style={{ fontFamily: 'var(--font-rota-medium)' }}>
              Un groupe d'écoles engagé pour une formation exigeante, accessible
              et tournée vers l'avenir. Formations diplômantes, accompagnement, 
              ouverture internationale : votre parcours commence ici.
            </p>

            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Image 
                  src="/img/footer/pos_icon.png" 
                  alt="Position" 
                  width={16}
                  height={16}
                  className="mt-1 opacity-70"
                />
                <div className="text-[#F8F5E4]/90" style={{ fontFamily: 'var(--font-rota-medium)' }}>
                  <div>50 avenue des Champs Elysées</div>
                  <div>75008 Paris</div>
                </div>
              </div>
             
              <div className="flex items-center space-x-3">
                <Image 
                  src="/img/footer/icon_mobile.png" 
                  alt="Téléphone" 
                  width={16}
                  height={16}
                  className="opacity-70"
                />
                <div className="text-[#F8F5E4]/90" style={{ fontFamily: 'var(--font-rota-medium)' }}>01 89 71 44 73</div>
              </div>
              
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2">
              <div className="ml-0 sm:ml-10 md:ml-20 lg:ml-0 px-4 md:px-8 lg:px-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {/* Navigation Column */}
              <div>
                <h4 className="text-[#F8F5E4] font-bold text-base md:text-lg mb-3 md:mb-4" style={{ fontFamily: 'var(--font-termina-demi)' }}>Navigation</h4>
                {/* Version Desktop - Liste normale */}
                <ul className="hidden md:block space-y-2 md:space-y-3">
                  {footerLinks.navigation.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[#F8F5E4]/80 hover:text-[#F8F5E4] transition-colors text-xs md:text-sm"
                        style={{ fontFamily: 'var(--font-rota-medium)' }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Version Mobile - Dropdown */}
                <div className="md:hidden">
                  <button
                    onClick={toggleNavigationDropdown}
                    className="w-full flex items-center justify-between text-[#F8F5E4]/80 hover:text-[#F8F5E4] transition-colors text-xs py-2"
                    style={{ fontFamily: 'var(--font-rota-medium)' }}
                  >
                    <span>Voir la navigation</span>
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isNavigationDropdownOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  
                  {isNavigationDropdownOpen && (
                    <ul className="mt-2 space-y-2 pl-4 border-l border-[#F8F5E4]/20">
                      {footerLinks.navigation.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="text-[#F8F5E4]/70 hover:text-[#F8F5E4] transition-colors text-xs block py-1"
                            style={{ fontFamily: 'var(--font-rota-medium)' }}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Legal Column */}
              <div>
                <h4 className="text-[#F8F5E4] font-bold text-base md:text-lg mb-3 md:mb-4" style={{ fontFamily: 'var(--font-termina-demi)' }}>Légal</h4>
                {/* Version Desktop - Liste normale */}
                <ul className="hidden md:block space-y-2 md:space-y-3">
                  {footerLinks.legal.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[#F8F5E4]/80 hover:text-[#F8F5E4] transition-colors text-xs md:text-sm"
                        style={{ fontFamily: 'var(--font-rota-medium)' }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Version Mobile - Dropdown */}
                <div className="md:hidden">
                  <button
                    onClick={toggleLegalDropdown}
                    className="w-full flex items-center justify-between text-[#F8F5E4]/80 hover:text-[#F8F5E4] transition-colors text-xs py-2"
                    style={{ fontFamily: 'var(--font-rota-medium)' }}
                  >
                    <span>Voir les mentions légales</span>
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isLegalDropdownOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  
                  {isLegalDropdownOpen && (
                    <ul className="mt-2 space-y-2 pl-4 border-l border-[#F8F5E4]/20">
                      {footerLinks.legal.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="text-[#F8F5E4]/70 hover:text-[#F8F5E4] transition-colors text-xs block py-1"
                            style={{ fontFamily: 'var(--font-rota-medium)' }}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

