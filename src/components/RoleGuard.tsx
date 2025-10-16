"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, getUserRole, canAccessRoute } from '@/lib/user-roles';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallbackRoute?: string;
  fallbackComponent?: React.ReactNode;
}

export const RoleGuard = ({ 
  children, 
  requiredRoles = ['lead'], 
  fallbackRoute = '/',
  fallbackComponent 
}: RoleGuardProps) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const role = await getUserRole();
      setUserRole(role);
      
      // Vérifier si l'utilisateur a accès avec l'un des rôles requis
      const access = requiredRoles.some(requiredRole => 
        canAccessRoute(role, `/${requiredRole}`)
      );
      
      setHasAccess(access);
      
      if (!access && fallbackRoute) {
        router.push(fallbackRoute);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle:', error);
      router.push(fallbackRoute);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#032622]"></div>
          <p className="mt-4 text-[#032622]">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#032622] mb-4">Accès refusé</h1>
          <p className="text-[#032622] mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="bg-[#032622] text-white px-6 py-3 font-bold hover:bg-[#032622]/90 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Composants de convenance pour chaque rôle
export const LeadGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard requiredRoles={['lead']}>
    {children}
  </RoleGuard>
);

export const CandidateGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard requiredRoles={['candidat']}>
    {children}
  </RoleGuard>
);

export const StudentGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard requiredRoles={['etudiant', 'admin', 'superadmin']}>
    {children}
  </RoleGuard>
);

export const FormateurGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard requiredRoles={['formateur', 'admin', 'superadmin']}>
    {children}
  </RoleGuard>
);

export const PedagogieGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard requiredRoles={['pedagogie', 'admin', 'superadmin']}>
    {children}
  </RoleGuard>
);

export const CommercialGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard requiredRoles={['commercial', 'admin', 'superadmin']}>
    {children}
  </RoleGuard>
);

export const AdvGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard requiredRoles={['adv', 'admin', 'superadmin']}>
    {children}
  </RoleGuard>
);

export const AdminGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard requiredRoles={['admin', 'superadmin']}>
    {children}
  </RoleGuard>
);

export const SuperAdminGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard requiredRoles={['superadmin']}>
    {children}
  </RoleGuard>
);

// Composants pour les groupes de rôles
export const AdminWithRestrictionsGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard requiredRoles={['pedagogie', 'commercial', 'adv', 'admin', 'superadmin']}>
    {children}
  </RoleGuard>
);

export const StudentOrCandidateGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard requiredRoles={['lead', 'candidat', 'etudiant']}>
    {children}
  </RoleGuard>
);
