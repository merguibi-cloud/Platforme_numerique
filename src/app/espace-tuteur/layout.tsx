'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TutorSidebar } from './components/TutorSidebar';
import { SessionTracker } from '@/components/SessionTracker';
import { SessionExpiredModal } from '@/components/SessionExpiredModal';
import { getSessionRole, getCurrentUser } from '@/lib/auth-api';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  useTokenRefresh();

  useEffect(() => {
    const checkTutorAccess = async () => {
      try {
        // Si on est sur la page de changement de mot de passe, ne pas rediriger
        if (pathname === '/espace-tuteur/change-password') {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        const sessionResult = await getSessionRole();

        if (!sessionResult.success || !sessionResult.role) {
          const hasToken = typeof document !== 'undefined' &&
            document.cookie.includes('sb-access-token=');

          if (hasToken && sessionResult.error === 'Non authentifié') {
            const url = new URL(window.location.href);
            url.searchParams.set('session_expired', 'true');
            window.history.replaceState({}, '', url.toString());
            setIsLoading(false);
            return;
          } else {
            router.replace('/');
            return;
          }
        }

        if (sessionResult.role !== 'tuteur') {
          router.replace(sessionResult.redirectTo ?? '/');
          return;
        }

        // Vérifier si l'utilisateur doit changer son mot de passe
        const userResult = await getCurrentUser();
        if (userResult.success && userResult.user) {
          const userMetadata = userResult.user.user_metadata;
          const requiresPasswordChange = userMetadata?.requires_password_change === true;
          const hasTempPassword = !!userMetadata?.temp_password;

          if (requiresPasswordChange || hasTempPassword) {
            router.replace('/espace-tuteur/change-password');
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

    checkTutorAccess();
  }, [router, pathname]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('session_expired') === 'true') {
        setIsLoading(false);
      }
    }
  }, []);

  const isSessionExpired = typeof document !== 'undefined' &&
    new URLSearchParams(window.location.search).get('session_expired') === 'true';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F5E4]">
        <Suspense fallback={null}>
          <SessionExpiredModal />
        </Suspense>
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
        <Suspense fallback={null}>
          <SessionExpiredModal />
        </Suspense>
        {!isSessionExpired && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#032622] mb-4">Accès Refusé</h1>
            <p className="text-[#032622]">Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <SessionTracker />
      <Suspense fallback={null}>
        <SessionExpiredModal />
      </Suspense>
      <div className="flex min-h-screen bg-[#F8F5E4]">
        <TutorSidebar isCollapsed={isCollapsed} onCollapseChange={setIsCollapsed} />
        <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-24' : 'lg:ml-64'} ml-0 overflow-x-hidden max-w-full`}>
          {children}
        </main>
      </div>
    </>
  );
}
