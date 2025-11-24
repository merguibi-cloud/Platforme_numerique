"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { signOut } from '@/lib/auth-api';
import { Modal } from '../../validation/components/Modal';

const menuItems = [
  { 
    id: 'dashboard', 
    label: 'DASHBOARD', 
    icon: '/menue_etudiant/Dashboard.png',
    iconInactive: '/menue_etudiant/nonselectionner/dashboard.png',
    href: '/espace-admin/dashboard'
  },
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // États pour le modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

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
    } else if (pathname.includes('/gestion-formations')) {
      setActiveItem('gestion-formations');
    } else if (pathname.includes('/gestion-inscriptions')) {
      setActiveItem('gestion-inscriptions');
    } else if (pathname.includes('/bibliotheque')) {
      setActiveItem('bibliotheque');
    } else if (pathname.includes('/agenda')) {
      setActiveItem('agenda');
    } else if (pathname.includes('/messagerie')) {
      setActiveItem('messagerie');
    } else if (pathname.includes('/vie-etudiante')) {
      setActiveItem('vie-etudiante');
    } else if (pathname.includes('/attribution')) {
      setActiveItem('attribution');
    } else if (pathname.includes('/parametres')) {
      setActiveItem('parametres');
    }
  }, [pathname]);

  // Reset de l'état de déconnexion au montage
  useEffect(() => {
    setIsLoggingOut(false);
  }, []);

  return (
    <div className={`${isCollapsed ? 'w-24' : 'w-64'} bg-[#032622] min-h-screen flex flex-col transition-all duration-300 fixed left-0 top-0 z-40`}>
      {/* Logo et titre */}
      <div className={`${isCollapsed ? 'p-4' : 'p-6'} border-b border-gray-600`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {isCollapsed ? (
            <button
              onClick={handleCollapse}
              className="flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
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
                className="text-white hover:bg-gray-700 p-1 rounded transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Menu principal */}
      <div className="flex-1 py-6">
        <nav className={`space-y-2 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveItem(item.id)}
              className={`flex items-center ${isCollapsed ? 'justify-center px-2 py-4' : 'space-x-3 px-4 py-3'} rounded-lg transition-colors duration-200 ${
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
            </Link>
          ))}
        </nav>
      </div>

      {/* Menu du bas */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-600`}>
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
                    className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`}
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
                className={`flex items-center ${isCollapsed ? 'justify-center px-2 py-4' : 'space-x-3 px-4 py-3'} rounded-lg text-white hover:bg-gray-700 transition-colors duration-200`}
                title={isCollapsed ? item.label : undefined}
              >
                <Image 
                  src={activeItem === item.id ? item.icon : item.iconInactive} 
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
  );
};
