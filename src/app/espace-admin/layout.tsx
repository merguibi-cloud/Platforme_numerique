'use client';
import { AdminSidebar } from './components/AdminSidebar';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async (): Promise<void> => {
      try {
        // Utiliser les APIs pour vérifier l'authentification et le rôle
        const userResponse = await fetch('/api/auth/user');
        const userData = await userResponse.json();
        
        if (!userData.success || !userData.user) {
          router.push('/');
          return;
        }

        // Récupérer le profil pour vérifier le rôle
        const profileResponse = await fetch('/api/user/ensure-profile');
        const profileData = await profileResponse.json();
        
        if (!profileData.success || !profileData.profile) {
          router.push('/');
          return;
        }

        const userRole = profileData.profile.role;
        
        if (!['admin', 'superadmin'].includes(userRole)) {
          router.push('/');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Erreur vérification admin:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F5E4]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
          <p className="text-[#032622]">Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F5E4]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#032622] mb-4">Accès Refusé</h1>
          <p className="text-[#032622]">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F5E4]">
      <AdminSidebar onCollapseChange={setIsCollapsed} />
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  );
}


