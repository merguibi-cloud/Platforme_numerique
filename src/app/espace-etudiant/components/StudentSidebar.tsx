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
    href: '/espace-etudiant'
  },
  { 
    id: 'formations', 
    label: 'MES FORMATIONS', 
    icon: '/menue_etudiant/Livre.png',
    iconInactive: '/menue_etudiant/nonselectionner/mesformations.png',
    href: '/espace-etudiant/mes-formations'
  },
  { 
    id: 'agenda', 
    label: 'MON AGENDA', 
    icon: '/menue_etudiant/calendrier.png',
    iconInactive: '/menue_etudiant/nonselectionner/calandrier.png',
    href: '/espace-etudiant/agenda'
  },
  { 
    id: 'bibliotheque', 
    label: 'BIBLIOTHÈQUE NUMÉRIQUE', 
    icon: '/menue_etudiant/Bibliothèque.png',
    iconInactive: '/menue_etudiant/nonselectionner/bibliothequenumerique.png',
    href: '/espace-etudiant/bibliotheque'
  },
  { 
    id: 'vie-etudiante', 
    label: 'VIE ÉTUDIANTE', 
    icon: '/images/student-library/VieStudent.png',
    iconInactive: '/images/student-library/VieStudentpasselectionné.png',
    href: '/espace-etudiant/vie-etudiante'
  },
  { 
    id: 'messagerie', 
    label: 'MESSAGERIE', 
    icon: '/menue_etudiant/messagerie.png',
    iconInactive: '/menue_etudiant/nonselectionner/messagerie.png',
    href: '/espace-etudiant/messagerie'
  }
];

const bottomMenuItems = [
  { 
    id: 'support', 
    label: 'SUPPORT', 
    icon: '/menue_etudiant/Support.png',
    iconInactive: '/menue_etudiant/Support.png',
    href: '/espace-etudiant/support'
  },
  { 
    id: 'logout', 
    label: 'SE DÉCONNECTER', 
    icon: '/menue_etudiant/Logout2.png',
    iconInactive: '/menue_etudiant/nonselectionner/deconnexion.png',
    href: '/'
  }
];

interface StudentSidebarProps {
  isCollapsed: boolean;
  onCollapseChange: (isCollapsed: boolean) => void;
}

export const StudentSidebar = ({ isCollapsed, onCollapseChange }: StudentSidebarProps) => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState('dashboard');

  const handleCollapse = () => {
    onCollapseChange(!isCollapsed);
  };

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    // Ne pas ouvrir la sidebar automatiquement quand on clique sur un item
  };

  // Déterminer l'élément actif basé sur l'URL
  useEffect(() => {
    if (pathname === '/espace-etudiant') {
      setActiveItem('dashboard');
    } else if (pathname.includes('/mes-formations')) {
      setActiveItem('formations');
    } else if (pathname.includes('/agenda')) {
      setActiveItem('agenda');
    } else if (pathname.includes('/bibliotheque')) {
      setActiveItem('bibliotheque');
    } else if (pathname.includes('/vie-etudiante')) {
      setActiveItem('vie-etudiante');
    } else if (pathname.includes('/messagerie')) {
      setActiveItem('messagerie');
    } else if (pathname.includes('/support')) {
      setActiveItem('support');
    }
  }, [pathname]);

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-[#032622] min-h-screen flex flex-col transition-all duration-300 fixed left-0 top-0 z-40`}>
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
            {!isCollapsed && (
              <div>
                <h1 className="text-white text-sm font-bold uppercase tracking-wide">
                  ELITE SOCIETY
                </h1>
                <p className="text-white text-xs opacity-80">
                  ONLINE
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleCollapse}
            className="text-white hover:bg-gray-700 p-1 rounded transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Menu principal */}
      <div className="flex-1 py-6">
        <nav className={`space-y-2 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => handleItemClick(item.id)}
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
          {bottomMenuItems.map((item) => (
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
          ))}
        </nav>
      </div>
    </div>
  );
};

