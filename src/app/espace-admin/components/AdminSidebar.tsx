"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    href: '/'
  }
];

interface AdminSidebarProps {
  isCollapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export const AdminSidebar = ({ isCollapsed, defaultCollapsed = false, onCollapseChange }: AdminSidebarProps) => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState('dashboard');
  const isControlled = typeof isCollapsed === 'boolean';
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(defaultCollapsed);
  const currentIsCollapsed = isControlled ? isCollapsed : internalIsCollapsed;

  useEffect(() => {
    if (!isControlled) {
      setInternalIsCollapsed(defaultCollapsed);
    }
  }, [defaultCollapsed, isControlled]);

  const handleCollapse = () => {
    const newCollapsed = !currentIsCollapsed;
    if (!isControlled) {
      setInternalIsCollapsed(newCollapsed);
    }
    onCollapseChange?.(newCollapsed);
  };

  // Déterminer l'élément actif basé sur l'URL
  useEffect(() => {
    if (pathname === '/espace-admin/dashboard') {
      setActiveItem('dashboard');
    } else if (pathname.includes('/gestion-etudiants')) {
      setActiveItem('gestion-etudiants');
    } else if (pathname.includes('/gestion-formations')) {
      setActiveItem('gestion-formations');
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

  return (
    <div className={`${currentIsCollapsed ? 'w-16' : 'w-64'} bg-[#032622] min-h-screen flex flex-col transition-all duration-300 fixed left-0 top-0 z-40`}>
      {/* Logo et titre */}
      <div className="p-6 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image 
              src="/menue_etudiant/ESObeige.png" 
              alt="ELITE SOCIETY ONLINE" 
              width={40} 
              height={40}
              className="w-10 h-10"
            />
            {!currentIsCollapsed && (
              <div>
                <h1 className="text-white text-sm font-bold uppercase tracking-wide">
                  ELITE SOCIETY
                </h1>
                <p className="text-white text-xs opacity-80">
                  ADMIN
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleCollapse}
            className="text-white hover:bg-gray-700 p-1 rounded transition-colors"
          >
            {currentIsCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Menu principal */}
      <div className="flex-1 py-6">
        <nav className={`space-y-2 ${currentIsCollapsed ? 'px-2' : 'px-4'}`}>
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveItem(item.id)}
              className={`flex items-center ${currentIsCollapsed ? 'justify-center px-2 py-4' : 'space-x-3 px-4 py-3'} rounded-lg transition-colors duration-200 ${
                activeItem === item.id
                  ? 'text-[#F8F5E4]'
                  : 'text-white hover:bg-gray-700'
              }`}
              title={currentIsCollapsed ? item.label : undefined}
            >
              <Image 
                src={activeItem === item.id ? item.icon : item.iconInactive} 
                alt={item.label} 
                width={24} 
                height={24}
                className={`${currentIsCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`}
              />
              {!currentIsCollapsed && (
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
      <div className={`${currentIsCollapsed ? 'p-2' : 'p-4'} border-t border-gray-600`}>
        <nav className="space-y-2">
          {bottomMenuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center ${currentIsCollapsed ? 'justify-center px-2 py-4' : 'space-x-3 px-4 py-3'} rounded-lg text-white hover:bg-gray-700 transition-colors duration-200`}
              title={currentIsCollapsed ? item.label : undefined}
            >
              <Image 
                src={activeItem === item.id ? item.icon : item.iconInactive} 
                alt={item.label} 
                width={24} 
                height={24}
                className={`${currentIsCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`}
              />
              {!currentIsCollapsed && (
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
    </div>
  );
};
