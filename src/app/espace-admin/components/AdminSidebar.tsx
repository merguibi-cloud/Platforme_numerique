"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import { signOut } from '@/lib/auth-api';
import { Modal } from '../../validation/components/Modal';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  iconInactive: string;
  href: string;
  children?: MenuItem[];
}

interface MenuGroup {
  type: 'group';
  id: string;
  label: string;
  icon: string;
  iconInactive: string;
  children: MenuItem[];
}

const menuItems: (MenuItem | MenuGroup)[] = [
  { 
    id: 'dashboard', 
    label: 'DASHBOARD', 
    icon: '/menue_etudiant/Dashboard.png',
    iconInactive: '/menue_etudiant/nonselectionner/dashboard.png',
    href: '/espace-admin/dashboard'
  },
  {
    type: 'group',
    id: 'gestion',
    label: 'GESTION',
    icon: '/menue_etudiant/Livre.png',
    iconInactive: '/menue_etudiant/nonselectionner/mesformations.png',
    children: [
  { 
    id: 'gestion-etudiants', 
    label: 'GESTION ÉTUDIANTS', 
    icon: '/menue_etudiant/Etudiant.png',
    iconInactive: '/menue_etudiant/nonselectionner/Vieetudiant.png',
    href: '/espace-admin/gestion-etudiants'
  },
  { 
    id: 'gestion-formations', 
    label: 'GESTION FORMATIONS', 
    icon: '/menue_etudiant/Livre.png',
    iconInactive: '/menue_etudiant/nonselectionner/mesformations.png',
    href: '/espace-admin/gestion-formations'
  },
      { 
        id: 'gestion-inscriptions', 
        label: 'GESTION DES INSCRIPTIONS', 
        icon: '/menue_etudiant/Etudiant.png',
        iconInactive: '/menue_etudiant/nonselectionner/Vieetudiant.png',
        href: '/espace-admin/gestion-inscriptions'
      },
  { 
    id: 'attribution', 
    label: 'ESPACE D\'ATTRIBUTION', 
    icon: '/menue_etudiant/Etudiant.png',
    iconInactive: '/menue_etudiant/nonselectionner/Vieetudiant.png',
    href: '/espace-admin/attribution'
      }
    ]
  },
  { 
    id: 'bibliotheque', 
    label: 'BIBLIOTHÈQUE', 
    icon: '/menue_etudiant/Bibliothèque.png',
    iconInactive: '/menue_etudiant/nonselectionner/bibliothequenumerique.png',
    href: '/espace-admin/bibliotheque'
  },
  { 
    id: 'agenda', 
    label: 'AGENDA', 
    icon: '/menue_etudiant/calendrier.png',
    iconInactive: '/menue_etudiant/nonselectionner/calandrier.png',
    href: '/espace-admin/agenda'
  },
  { 
    id: 'messagerie', 
    label: 'MESSAGERIE', 
    icon: '/menue_etudiant/messagerie.png',
    iconInactive: '/menue_etudiant/nonselectionner/messagerie.png',
    href: '/espace-admin/messagerie'
  },
  { 
    id: 'vie-etudiante', 
    label: 'VIE ÉTUDIANTE', 
    icon: '/menue_etudiant/Etudiant.png',
    iconInactive: '/menue_etudiant/nonselectionner/Vieetudiant.png',
    href: '/espace-admin/vie-etudiante'
  }
];

const bottomMenuItems = [
  { 
    id: 'parametres', 
    label: 'PARAMÈTRES', 
    icon: '/menue_etudiant/Support.png',
    iconInactive: '/menue_etudiant/Support.png',
    href: '/espace-admin/parametres'
  },
  { 
    id: 'logout', 
    label: 'SE DÉCONNECTER', 
    icon: '/menue_etudiant/Logout2.png',
    iconInactive: '/menue_etudiant/nonselectionner/deconnexion.png',
    href: '/',
  }
];

interface AdminSidebarProps {
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export const AdminSidebar = ({ onCollapseChange }: AdminSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['gestion'])); // Par défaut ouvert
  
  // États pour le modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const isGroupOpen = (groupId: string) => openGroups.has(groupId);

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Empêcher tout comportement par défaut
    e.stopPropagation(); // Empêcher la propagation
   
    setShowConfirmModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowConfirmModal(false);
    setIsLoggingOut(true);
    
    try {
      const result = await signOut();
      if (result.success) {
        router.push('/');
        router.refresh();
      } else {
        setErrorMessage('Erreur lors de la déconnexion. Veuillez réessayer.');
        setShowErrorModal(true);
      }
    } catch (error) {
      setErrorMessage('Erreur lors de la déconnexion. Veuillez réessayer.');
      setShowErrorModal(true);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowConfirmModal(false);
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  // Déterminer l'élément actif basé sur l'URL
  useEffect(() => {
    if (pathname === '/espace-admin/dashboard') {
      setActiveItem('dashboard');
    } else if (pathname.includes('/gestion-etudiants')) {
      setActiveItem('gestion-etudiants');
      setOpenGroups(prev => new Set(prev).add('gestion'));
    } else if (pathname.includes('/gestion-formations')) {
      setActiveItem('gestion-formations');
      setOpenGroups(prev => new Set(prev).add('gestion'));
    } else if (pathname.includes('/gestion-inscriptions')) {
      setActiveItem('gestion-inscriptions');
      setOpenGroups(prev => new Set(prev).add('gestion'));
    } else if (pathname.includes('/attribution')) {
      setActiveItem('attribution');
      setOpenGroups(prev => new Set(prev).add('gestion'));
    } else if (pathname.includes('/bibliotheque')) {
      setActiveItem('bibliotheque');
    } else if (pathname.includes('/agenda')) {
      setActiveItem('agenda');
    } else if (pathname.includes('/messagerie')) {
      setActiveItem('messagerie');
    } else if (pathname.includes('/vie-etudiante')) {
      setActiveItem('vie-etudiante');
    } else if (pathname.includes('/parametres')) {
      setActiveItem('parametres');
    }
  }, [pathname]);

  // Reset de l'état de déconnexion au montage
  useEffect(() => {
    setIsLoggingOut(false);
  }, []);

  return (
    <>
      {/* Mobile Menu Button - Caché quand le menu est ouvert */}
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-[101] bg-[#032622] text-white p-2 rounded-lg shadow-lg hover:bg-[#01302C] active:bg-[#012a26] transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Mobile Overlay - En arrière-plan, ne bloque pas la sidebar */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[45]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Au-dessus de l'overlay */}
      <div className={`
        ${isCollapsed ? 'w-24' : 'w-64'} 
        bg-[#032622] 
        min-h-screen 
        flex 
        flex-col 
        transition-all 
        duration-300 
        fixed 
        left-0 
        top-0 
        z-[50]
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMobileMenuOpen(false);
          }}
          className="lg:hidden absolute top-4 right-4 text-white hover:bg-gray-700 p-1 rounded transition-colors z-[51]"
          aria-label="Fermer le menu"
        >
          <X className="w-6 h-6" />
        </button>

      {/* Logo et titre */}
      <div className={`${isCollapsed ? 'p-4' : 'p-6'} border-b border-gray-600`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {isCollapsed ? (
            <button
              onClick={handleCollapse}
              className="hidden lg:flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Image 
                src="/menue_etudiant/ESObeige.png" 
                alt="ELITE SOCIETY ONLINE" 
                width={36} 
                height={36}
                className="w-9 h-9"
              />
            </button>
          ) : (
            <>
          <div className="flex items-center space-x-3">
            <Image 
              src="/menue_etudiant/ESObeige.png" 
              alt="ELITE SOCIETY ONLINE" 
                  width={50} 
                  height={50}
                  className="w-12 h-12"
            />
              <div>
                <h1 className="text-white text-sm font-bold uppercase tracking-wide">
                  ELITE SOCIETY
                </h1>
                <p className="text-white text-xs opacity-80">
                  ADMIN
                </p>
              </div>
          </div>
          <button
            onClick={handleCollapse}
                className="hidden lg:flex text-white hover:bg-gray-700 p-1 rounded transition-colors flex-shrink-0"
            aria-label={isCollapsed ? "Développer le menu" : "Réduire le menu"}
          >
                <ChevronLeft className="w-4 h-4" />
          </button>
            </>
          )}
        </div>
      </div>

      {/* Menu principal */}
      <div className="flex-1 py-6 overflow-y-auto relative z-[51]">
        <nav className={`space-y-2 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {menuItems.map((item) => {
            // Gestion des groupes avec sous-menus
            if ('type' in item && item.type === 'group') {
              const isOpen = isGroupOpen(item.id);
              const hasActiveChild = item.children?.some(child => 
                pathname.includes(child.href) || activeItem === child.id
              );
              
              return (
                <div key={item.id}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGroup(item.id);
                    }}
                    className={`flex items-center ${isCollapsed ? 'justify-center px-2 py-4' : 'justify-between px-4 py-3'} rounded-lg transition-colors duration-200 w-full relative z-[51] ${
                      hasActiveChild
                        ? 'text-[#F8F5E4]'
                        : 'text-white hover:bg-gray-700'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center space-x-3">
                      <Image 
                        src={hasActiveChild ? item.icon : item.iconInactive} 
                        alt={item.label} 
                        width={24} 
                        height={24}
                        className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`}
                      />
                      {!isCollapsed && (
                        <span 
                          className="text-sm font-medium"
                          style={{ fontFamily: 'var(--font-termina-bold)' }}
                        >
                          {item.label}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      isOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )
                    )}
                  </button>
                  
                  {/* Sous-menus */}
                  {!isCollapsed && isOpen && item.children && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const isActive = activeItem === child.id || pathname.includes(child.href);
                        return (
                          <Link
                            key={child.id}
                            href={child.href}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveItem(child.id);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-200 relative z-[51] ${
                              isActive
                                ? 'text-[#F8F5E4] bg-gray-700'
                                : 'text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            <Image 
                              src={isActive ? child.icon : child.iconInactive} 
                              alt={child.label} 
                              width={20} 
                              height={20}
                              className="w-5 h-5"
                            />
                            <span 
                              className="text-sm font-medium"
                              style={{ fontFamily: 'var(--font-termina-bold)' }}
                            >
                              {child.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                  {isCollapsed && isOpen && item.children && (
                    <div className="mt-2 flex flex-col items-center gap-2">
                      {item.children.map((child) => {
                        const isActive = activeItem === child.id || pathname.includes(child.href);
                        return (
                          <div key={child.id} className="flex flex-col items-center gap-1">
                            <div className="w-px h-3 bg-gray-600" />
                            <Link
                              href={child.href}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveItem(child.id);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 relative z-[51] ${
                                isActive ? 'bg-gray-700 text-[#F8F5E4]' : 'text-gray-200 hover:bg-gray-700'
                              }`}
                              title={child.label}
                            >
                              <Image 
                                src={isActive ? child.icon : child.iconInactive} 
                                alt={child.label} 
                                width={20} 
                                height={20}
                                className="w-5 h-5"
                              />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            
            // Gestion des items normaux
            if ('href' in item) {
              return (
            <Link
              key={item.id}
              href={item.href}
              onClick={(e) => {
                e.stopPropagation();
                setActiveItem(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center ${isCollapsed ? 'justify-center px-2 py-4' : 'space-x-3 px-4 py-3'} rounded-lg transition-colors duration-200 relative z-[51] ${
                activeItem === item.id
                  ? 'text-[#F8F5E4]'
                  : 'text-white hover:bg-gray-700'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Image 
                src={activeItem === item.id ? item.icon : item.iconInactive} 
                alt={item.label} 
                width={24} 
                height={24}
                    className={`${isCollapsed ? 'w-8 h-8' : 'w-5 h-5'}`}
              />
              {!isCollapsed && (
                <span 
                  className="text-sm font-medium"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {item.label}
                </span>
              )}
            </Link>
              );
            }
            return null;
          })}
        </nav>
      </div>

      {/* Menu du bas */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-600 relative z-[51]`}>
        <nav className="space-y-2">
          {bottomMenuItems.map((item) => {
            if (item.id === 'logout') {
              return (
                <button
                  key={item.id}
                  onClick={handleLogoutClick}
                  disabled={isLoggingOut}
                  className={`flex items-center ${isCollapsed ? 'justify-center px-2 py-4' : 'space-x-3 px-4 py-3'} rounded-lg text-white hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full cursor-pointer`}
                  title={isCollapsed ? item.label : undefined}
                  style={{ pointerEvents: isLoggingOut ? 'none' : 'auto' }}
                >
                  <Image 
                    src={item.icon} 
                    alt={item.label} 
                    width={24} 
                    height={24}
                    className={`${isCollapsed ? 'w-8 h-8' : 'w-5 h-5'}`}
                  />
                  {!isCollapsed && (
                    <span 
                      className="text-sm font-medium"
                      style={{ fontFamily: 'var(--font-termina-bold)' }}
                    >
                      {isLoggingOut ? 'DÉCONNEXION...' : item.label}
                    </span>
                  )}
                  {isCollapsed && isLoggingOut && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            }
            
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center ${isCollapsed ? 'justify-center px-2 py-4' : 'space-x-3 px-4 py-3'} rounded-lg text-white hover:bg-gray-700 transition-colors duration-200 relative z-[51]`}
                title={isCollapsed ? item.label : undefined}
              >
                <Image 
                  src={activeItem === item.id ? item.icon : item.iconInactive} 
                  alt={item.label} 
                  width={24} 
                  height={24}
                  className={`${isCollapsed ? 'w-8 h-8' : 'w-5 h-5'}`}
                />
                {!isCollapsed && (
                  <span 
                    className="text-sm font-medium"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Modal de confirmation de déconnexion */}
      <Modal
        isOpen={showConfirmModal}
        onClose={handleLogoutCancel}
        title="Confirmation de déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        type="warning"
        isConfirm={true}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />

      {/* Modal d'erreur */}
      <Modal
        isOpen={showErrorModal}
        onClose={handleErrorModalClose}
        title="Erreur de déconnexion"
        message={errorMessage}
        type="error"
        isConfirm={false}
      />
    </div>
    </>
  );
};
