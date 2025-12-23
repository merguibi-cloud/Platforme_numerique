import { createClient } from '@supabase/supabase-js';

export type UserRole = 'lead' | 'candidat' | 'etudiant' | 'pedagogie' | 'commercial' | 'adv' | 'formateur' | 'admin' | 'superadmin';

export interface UserWithRole {
  id: string;
  email: string;
  role: UserRole;
  nom?: string;
  prenom?: string;
}

// Fonction pour obtenir le rôle de l'utilisateur connecté
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return 'lead'; // Rôle par défaut
    }

    return profile.role as UserRole;
  } catch (error) {
    return null;
  }
}

// Fonction pour vérifier si l'utilisateur a un rôle spécifique
export function hasRole(userRole: UserRole | null, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  
  const roleHierarchy: Record<UserRole, number> = {
    'lead': 1,
    'candidat': 2,
    'etudiant': 3,
    'formateur': 4,
    'pedagogie': 5,
    'commercial': 5,
    'adv': 5,
    'admin': 6,
    'superadmin': 7
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Fonction pour vérifier si l'utilisateur est admin ou superadmin
export function isAdmin(userRole: UserRole | null): boolean {
  return userRole === 'admin' || userRole === 'superadmin';
}

// Fonction pour vérifier si l'utilisateur est superadmin
export function isSuperAdmin(userRole: UserRole | null): boolean {
  return userRole === 'superadmin';
}

// Fonction pour vérifier si l'utilisateur est formateur
export function isFormateur(userRole: UserRole | null): boolean {
  return userRole === 'formateur';
}

// Fonction pour vérifier si l'utilisateur est étudiant ou candidat
export function isStudentOrCandidate(userRole: UserRole | null): boolean {
  return userRole === 'lead' || userRole === 'candidat' || userRole === 'etudiant';
}

// Fonction pour vérifier si l'utilisateur a un rôle administratif (avec restrictions)
export function isAdminWithRestrictions(userRole: UserRole | null): boolean {
  return userRole === 'pedagogie' || userRole === 'commercial' || userRole === 'adv';
}

// Fonction pour vérifier si l'utilisateur peut accéder à une route
export function canAccessRoute(userRole: UserRole | null, route: string): boolean {
  const routePermissions: Record<string, UserRole[]> = {
    '/espace-superadmin': ['superadmin'],
    '/espace-admin': ['pedagogie', 'commercial', 'adv', 'admin', 'superadmin'],
    '/espace-animateur': ['formateur', 'admin', 'superadmin'],
    '/espace-etudiant': ['etudiant', 'admin', 'superadmin'],
    '/validation': ['lead', 'candidat'] // Étudiants n'ont plus accès à /validation
  };
  
  const allowedRoles = routePermissions[route];
  if (!allowedRoles) return true; // Route publique
  
  return userRole ? allowedRoles.includes(userRole) : false;
}

// Fonction pour obtenir le nom d'affichage du rôle
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    'lead': 'Lead',
    'candidat': 'Candidat',
    'etudiant': 'Étudiant',
    'formateur': 'Formateur',
    'pedagogie': 'Pédagogie',
    'commercial': 'Commercial',
    'adv': 'ADV',
    'admin': 'Administrateur',
    'superadmin': 'Super Administrateur'
  };
  
  return roleNames[role];
}

// Fonction pour obtenir la route de redirection par défaut selon le rôle
export function getDefaultRouteForRole(role: UserRole): string {
  const defaultRoutes: Record<UserRole, string> = {
    'lead': '/validation',
    'candidat': '/validation',
    'etudiant': '/espace-etudiant',
    'formateur': '/espace-animateur',
    'pedagogie': '/espace-admin/dashboard',
    'commercial': '/espace-admin/dashboard',
    'adv': '/espace-admin/dashboard',
    'admin': '/espace-admin/dashboard',
    'superadmin': '/espace-superadmin'
  };
  
  return defaultRoutes[role];
}
