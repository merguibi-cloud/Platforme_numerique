"use client";
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { LoginWithFormationSelection } from './LoginWithFormationSelection';
import { getCurrentUser, signOut } from '@/lib/auth-api';

const navigationItems = [
  { label: "FORMATIONS", href: "/formations" },
  { label: "ADMISSION", href: "/admission" },
  { label: "ÉVÉNEMENTS", href: "/evenements" },
];

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{name: string, role: string} | null>(null);

  // Vérifier l'état de connexion au chargement
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Vérifier le paramètre d'URL pour ouvrir le modal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const loginParam = searchParams.get('login');
      if (loginParam === 'true') {
        setIsLoginOpen(true);
      }
    }
  }, [pathname]);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    const result = await getCurrentUser();
    setIsAuthenticated(result.success && !!result.user);
    
    if (result.success && result.user) {
      // Récupérer les infos utilisateur pour affichage
      try {
        const profileResponse = await fetch('/api/user/ensure-profile');
        const profileData = await profileResponse.json();
        
        if (profileData.success && profileData.profile) {
          const nom = profileData.profile.nom?.trim();
          const prenom = profileData.profile.prenom?.trim();
          const displayName = [prenom, nom].filter(Boolean).join(' ') || 'Utilisateur';
          setUserInfo({
            name: displayName,
            role: profileData.profile.role
          });
        }
      } catch (error) {
        setUserInfo({ name: 'Utilisateur', role: 'user' });
      }
    } else {
      setUserInfo(null);
    }
    
    setIsLoading(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const openLogin = () => {
    setIsLoginOpen(true);
    // Mettre à jour l'URL avec le paramètre login
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('login', 'true');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : `${pathname}?login=true`;
      router.push(newUrl, { scroll: false });
    }
  };

  const closeLogin = () => {
    setIsLoginOpen(false);
    // Retirer les paramètres login et step de l'URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.delete('login');
      params.delete('step');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.push(newUrl, { scroll: false });
    }
    // Revérifier l'état après la connexion
    checkAuthStatus();
  };

  const handleUserAccess = () => {
    if (!userInfo) return;
    
    // Redirection selon le rôle
    switch (userInfo.role) {
      case 'admin':
      case 'superadmin':
        router.push('/espace-admin/dashboard');
        break;
      case 'pedagogie':
      case 'commercial':
      case 'adv':
        router.push('/espace-admin/dashboard');
        break;
      case 'formateur':
        router.push('/espace-animateur');
        break;
      case 'etudiant':
        router.push('/espace-etudiant');
        break;
      case 'lead':
      case 'candidat':
        router.push('/validation');
        break;
      default:
        router.push('/validation');
    }
  };

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      setIsAuthenticated(false);
      setUserInfo(null);
      router.push('/');
      router.refresh();
    }
  };

  // Déterminer si on est sur la page validation (seule page où on peut se déconnecter)
  const isOnValidationPage = pathname === '/validation';

  // Déterminer le texte et l'action du bouton
  const getButtonConfig = () => {
    if (!isAuthenticated) {
      return { text: 'ME CONNECTER', action: openLogin };
    }
    
    if (isOnValidationPage) {
      return { text: 'SE DÉCONNECTER', action: handleLogout };
    }
    
    return { text: 'DASHBOARD', action: handleUserAccess };
  };


  return (
    <>
      <nav className="fixed w-full h-[80px] xs:h-[90px] sm:h-[110px] md:h-[130px] lg:h-[140px] top-2 xs:top-3 sm:top-4 md:top-6 lg:top-8 left-0 px-2 sm:px-4 z-50">
        {/* Glassmorphism container */}
        <div className="w-full h-full px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="bg-[#032622]/30 backdrop-blur-md border border-[#F8F5E4]/20 shadow-2xl h-full rounded-lg sm:rounded-xl">
            <div className="flex items-center h-full px-2 sm:px-3 md:px-4 lg:px-8">
              {/* Logo */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3">
                <Link href="/" className="cursor-pointer flex-shrink-0">
                  <Image 
                    src="/img/accueil/logo_elite_society_online_blanc.png" 
                    alt="ELITE SOCIETY" 
                    width={120} 
                    height={120} 
                    className="w-12 h-12 xs:w-14 xs:h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain" 
                  />
                </Link>
              </div>

              {/* Desktop Navigation Links */}
              <div className="hidden lg:flex items-center space-x-12 xl:space-x-16 ml-8 xl:ml-16">
                {navigationItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-[#F8F5E4] hover:text-[#F8F5E4]/80 active:text-[#F8F5E4]/60 transition-colors duration-200 tracking-wide text-sm xl:text-base cursor-pointer font-bold"
                    style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Desktop Action Button */}
              <div className="hidden sm:flex items-center space-x-2 md:space-x-3 ml-auto">
                {!isLoading && (() => {
                  const config = getButtonConfig();
                  return (
                    <button 
                      onClick={config.action}
                      className="bg-[#032622] hover:bg-[#032622]/80 active:bg-[#032622]/60 text-[#F8F5E4] border-0 px-4 sm:px-5 md:px-6 lg:px-8 py-2 sm:py-2.5 tracking-wide transition-all duration-200 text-xs sm:text-sm md:text-base flex items-center justify-center whitespace-nowrap"
                      style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '900' }}
                    >
                      <span style={{ fontWeight: '900' }}>
                        {config.text}
                      </span>
                    </button>
                  );
                })()}
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden ml-auto flex-shrink-0">
                <button
                  onClick={toggleMobileMenu}
                  className="text-[#F8F5E4] p-2 hover:bg-white/10 rounded transition-colors"
                  aria-label="Toggle mobile menu"
                >
                  {isMobileNavOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-[70]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={toggleMobileMenu}
          />
          {/* Menu de navigation avec animation slide-right */}
          <div className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-[#F8F5E4] shadow-2xl transition-all duration-300 flex flex-col">
            {/* Header du menu */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-[#032622] flex-shrink-0">
              <div className="flex items-center">
                <Image 
                  src="/img/accueil/logo_elite_society_online_blanc.png" 
                  alt="ELITE SOCIETY" 
                  width={80} 
                  height={80} 
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain" 
                />
              </div>
              <button
                onClick={toggleMobileMenu}
                className="p-2 hover:bg-[#F8F5E4]/10 active:bg-[#F8F5E4]/20 rounded transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#F8F5E4]" />
              </button>
            </div>

            {/* Contenu de navigation avec scroll */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="py-2 sm:py-4">
                {navigationItems.map((item) => (
                  <div key={item.label} className="border-b border-gray-200 last:border-b-0">
                    <Link
                      href={item.href}
                      onClick={toggleMobileMenu}
                      className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 text-[#032622] hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200"
                      style={{ fontFamily: 'var(--font-termina-bold)' }}
                    >
                      <span className="text-sm sm:text-base">{item.label}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button - Toujours visible en bas */}
            <div className="flex flex-col space-y-2 sm:space-y-3 px-4 sm:px-6 py-3 sm:py-4 bg-[#F8F5E4] border-t border-gray-200 flex-shrink-0">
              {!isLoading && (() => {
                const config = getButtonConfig();
                return (
                  <button 
                    onClick={() => {
                      config.action();
                      toggleMobileMenu();
                    }}
                    className="bg-[#032622] hover:bg-[#032622]/80 active:bg-[#032622]/60 text-[#F8F5E4] border-0 px-4 sm:px-6 py-2.5 sm:py-3 tracking-wide transition-all duration-200 flex items-center justify-center text-sm sm:text-base"
                    style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '900' }}
                  >
                    <span style={{ fontWeight: '900' }}>
                      {config.text}
                    </span>
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Login with Formation Selection Modal */}
      <LoginWithFormationSelection 
        isOpen={isLoginOpen} 
        onCloseAction={closeLogin}
        onCompleteAction={(selectedFormations) => {
          // Formations sélectionnées traitées
        }}
      />
    </>
  );
};
