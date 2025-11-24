'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentSidebar } from './components/StudentSidebar';
import { SessionTracker } from '@/components/SessionTracker';
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
          router.replace('/');
          return;
        }

        if (sessionResult.role !== 'etudiant') {
          router.replace(sessionResult.redirectTo ?? '/');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Erreur vérification étudiant:', error);
        router.replace('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkStudentAccess();
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
    <>
      <SessionTracker />
      <div className="flex min-h-screen bg-[#F8F5E4]">
        <StudentSidebar onCollapseChange={setIsCollapsed} />
        <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          {children}
        </main>
      </div>
    </>
  );
}


