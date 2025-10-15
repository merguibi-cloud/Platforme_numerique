import { createClient } from '@supabase/supabase-js';

export type UserRole = 'etudiant' | 'animateur' | 'admin' | 'superadmin';

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
      return 'etudiant'; // Rôle par défaut
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
    'etudiant': 1,
    'animateur': 2,
    'admin': 3,
    'superadmin': 4
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Fonction pour vérifier si l'utilisateur est admin ou superadmin
export function isAdmin(userRole: UserRole | null): boolean {
  return userRole === 'admin' || userRole === 'superadmin';
}

// Fonction pour vérifier si l'utilisateur peut accéder à une route
export function canAccessRoute(userRole: UserRole | null, route: string): boolean {
  const routePermissions: Record<string, UserRole[]> = {
    '/espace-etudiant': ['etudiant', 'animateur', 'admin', 'superadmin'],
    '/espace-animateur': ['animateur', 'admin', 'superadmin'],
    '/espace-admin': ['admin', 'superadmin'],
    '/validation': ['etudiant', 'animateur', 'admin', 'superadmin']
  };
  
  const allowedRoles = routePermissions[route];
  if (!allowedRoles) return true; // Route publique
  
  return userRole ? allowedRoles.includes(userRole) : false;
}

// Fonction pour obtenir le nom d'affichage du rôle
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    'etudiant': 'Étudiant',
    'animateur': 'Animateur',
    'admin': 'Administrateur',
    'superadmin': 'Super Administrateur'
  };
  
  return roleNames[role];
}
