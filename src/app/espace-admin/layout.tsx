'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminUserProvider } from './components/AdminUserProvider';
import { SessionTracker } from '@/components/SessionTracker';
import { getSessionRole, getCurrentUser } from '@/lib/auth-api';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAdminAccess = async (): Promise<void> => {
      try {
        // Si on est déjà sur la page de changement de mot de passe, ne pas rediriger
        if (pathname === '/espace-admin/change-password') {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        const sessionResult = await getSessionRole();

        if (!sessionResult.success || !sessionResult.role) {
          router.replace('/');
          return;
        }

        if (sessionResult.role !== 'admin') {
          router.replace(sessionResult.redirectTo ?? '/');
          return;
        }

        // Vérifier si l'utilisateur doit changer son mot de passe
        const userResult = await getCurrentUser();
        if (userResult.success && userResult.user) {
          const userMetadata = userResult.user.user_metadata;
          const requiresPasswordChange = userMetadata?.requires_password_change === true;
          const hasTempPassword = !!userMetadata?.temp_password;
          
          // Si l'utilisateur a un mot de passe temporaire ou le flag est activé, forcer le changement
          if (requiresPasswordChange || hasTempPassword) {
            router.replace('/espace-admin/change-password');
            return;
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        router.replace('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F5E4] p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-[#032622] mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-[#032622] break-words">Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F5E4] p-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-[#032622] mb-3 sm:mb-4 break-words">Accès Refusé</h1>
          <p className="text-sm sm:text-base text-[#032622] break-words">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <AdminUserProvider>
      <SessionTracker />
      <div className="flex min-h-screen bg-[#F8F5E4] overflow-x-hidden max-w-full">
        <AdminSidebar onCollapseChange={setIsCollapsed} />
        <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-24' : 'lg:ml-64'} ml-0 overflow-x-hidden max-w-full`}>
          {children}
        </main>
      </div>
    </AdminUserProvider>
  );
}


