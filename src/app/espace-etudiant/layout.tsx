'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { StudentSidebar } from './components/StudentSidebar';
import { SessionTracker } from '@/components/SessionTracker';
import { SessionExpiredModal } from '@/components/SessionExpiredModal';
import { getSessionRole } from '@/lib/auth-api';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkStudentAccess = async () => {
      try {
        const sessionResult = await getSessionRole();

        if (!sessionResult.success || !sessionResult.role) {
          // Vérifier si c'est une session expirée
          const hasToken = typeof document !== 'undefined' && 
            document.cookie.includes('sb-access-token=');
          
          if (hasToken && sessionResult.error === 'Non authentifié') {
            // Ne pas rediriger immédiatement, le modal va s'afficher
            // Ajouter le paramètre dans l'URL pour déclencher le modal
            const url = new URL(window.location.href);
            url.searchParams.set('session_expired', 'true');
            window.history.replaceState({}, '', url.toString());
            // Ne pas bloquer l'affichage, permettre au modal de s'afficher
            setIsLoading(false);
            return;
          } else {
            router.replace('/');
            return;
          }
        }

        if (sessionResult.role !== 'etudiant') {
          router.replace(sessionResult.redirectTo ?? '/');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        router.replace('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkStudentAccess();
  }, [router]);
  
  // Vérifier aussi au chargement si le paramètre session_expired est présent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('session_expired') === 'true') {
        setIsLoading(false);
      }
    }
  }, []);

  // Vérifier si c'est une session expirée
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
            <p className="text-[#032622]">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
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
      <div className="flex min-h-screen bg-[#F8F5E4] overflow-x-hidden max-w-full">
        <StudentSidebar onCollapseChange={setIsCollapsed} />
        <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-24' : 'lg:ml-64'} ml-0 overflow-x-hidden max-w-full`}>
          {children}
        </main>
      </div>
    </>
  );
}


