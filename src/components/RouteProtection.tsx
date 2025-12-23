'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface RouteProtectionProps {
  children: React.ReactNode;
  requiredRoles: string[];
  redirectTo?: string;
}

export default function RouteProtection({ 
  children, 
  requiredRoles, 
  redirectTo = '/' 
}: RouteProtectionProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async (): Promise<void> => {
      try {
        // Utiliser les APIs pour vérifier l'authentification et le rôle
        const userResponse = await fetch('/api/auth/user');
        const userData = await userResponse.json();
        
        // Vérifier si c'est une erreur 401 (session expirée)
        if (!userData.success || !userData.user) {
          if (!userResponse.ok && userResponse.status === 401) {
            const hasToken = typeof document !== 'undefined' && 
              document.cookie.includes('sb-access-token=');
            
            if (hasToken) {
              router.push('/?session_expired=true');
            } else {
              router.push(redirectTo);
            }
          } else {
            router.push(redirectTo);
          }
          return;
        }

        // Récupérer le profil pour vérifier le rôle
        const profileResponse = await fetch('/api/user/ensure-profile');
        const profileData = await profileResponse.json();
        
        if (!profileData.success || !profileData.profile) {
          if (!profileResponse.ok && profileResponse.status === 401) {
            const hasToken = typeof document !== 'undefined' && 
              document.cookie.includes('sb-access-token=');
            
            if (hasToken) {
              router.push('/?session_expired=true');
            } else {
              router.push(redirectTo);
            }
          } else {
            router.push(redirectTo);
          }
          return;
        }

        const userRole = profileData.profile.role as string;
        
        if (!requiredRoles.includes(userRole)) {
          router.push(redirectTo);
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        router.push(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [router, requiredRoles, redirectTo]);

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

  return <>{children}</>;
}
