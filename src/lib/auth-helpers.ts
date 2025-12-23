import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getUserProfileServer } from '@/lib/blocs-api';

/**
 * Interface pour un administrateur
 */
export interface Admin {
  id: string;
  niveau: 'admin' | 'superadmin';
  user_id: string;
  nom?: string;
  prenom?: string;
  email?: string;
  role_secondaire?: string;
  service?: string;
}

/**
 * Résultat de vérification de permissions
 */
export type PermissionResult = 
  | { admin: Admin }
  | { profile: any }
  | { error: NextResponse };

/**
 * Vérifie que l'utilisateur est admin ou superadmin
 * 
 * @param userId - L'ID de l'utilisateur à vérifier
 * @returns Les données de l'admin ou une erreur NextResponse
 * 
 * @example
 * ```typescript
 * const adminResult = await requireAdmin(user.id);
 * if ('error' in adminResult) {
 *   return adminResult.error;
 * }
 * const { admin } = adminResult;
 * ```
 */
export async function requireAdmin(
  userId: string
): Promise<{ admin: Admin } | { error: NextResponse }> {
  try {
    const supabase = getSupabaseServerClient();
    
    const { data: admin, error } = await supabase
      .from('administrateurs')
      .select('id, niveau, user_id, nom, prenom, email, role_secondaire, service')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Erreur vérification admin:', error);
      return {
        error: NextResponse.json(
          { success: false, error: 'Erreur lors de la vérification des permissions' },
          { status: 500 }
        ),
      };
    }

    if (!admin || !['admin', 'superadmin'].includes(admin.niveau)) {
      return {
        error: NextResponse.json(
          { success: false, error: 'Permissions insuffisantes' },
          { status: 403 }
        ),
      };
    }

    return { admin };
  } catch (error) {
    console.error('Erreur dans requireAdmin:', error);
    return {
      error: NextResponse.json(
        { success: false, error: 'Erreur lors de la vérification des permissions' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Vérifie que l'utilisateur est superadmin uniquement
 * 
 * @param userId - L'ID de l'utilisateur à vérifier
 * @returns Les données de l'admin ou une erreur NextResponse
 */
export async function requireSuperAdmin(
  userId: string
): Promise<{ admin: Admin } | { error: NextResponse }> {
  const result = await requireAdmin(userId);
  
  if ('error' in result) {
    return result;
  }

  if (result.admin.niveau !== 'superadmin') {
    return {
      error: NextResponse.json(
        { success: false, error: 'Permissions insuffisantes. Super-admin requis.' },
        { status: 403 }
      ),
    };
  }

  return result;
}

/**
 * Vérifie que l'utilisateur a un des rôles spécifiés
 * 
 * @param userId - L'ID de l'utilisateur à vérifier
 * @param allowedRoles - Liste des rôles autorisés
 * @returns Le profil utilisateur ou une erreur NextResponse
 * 
 * @example
 * ```typescript
 * const roleResult = await requireRole(user.id, ['admin', 'superadmin', 'pedagogie']);
 * if ('error' in roleResult) {
 *   return roleResult.error;
 * }
 * const { profile } = roleResult;
 * ```
 */
export async function requireRole(
  userId: string,
  allowedRoles: string[]
): Promise<{ profile: any } | { error: NextResponse }> {
  try {
    const profileResult = await getUserProfileServer(userId);
    
    if (!profileResult || !profileResult.role) {
      return {
        error: NextResponse.json(
          { error: 'Profil utilisateur non trouvé' },
          { status: 403 }
        ),
      };
    }

    const userRole = profileResult.role.toLowerCase();
    const normalizedRoles = allowedRoles.map(r => r.toLowerCase());

    if (!normalizedRoles.includes(userRole)) {
      return {
        error: NextResponse.json(
          { error: 'Permissions insuffisantes' },
          { status: 403 }
        ),
      };
    }

    return { profile: profileResult };
  } catch (error) {
    console.error('Erreur dans requireRole:', error);
    return {
      error: NextResponse.json(
        { error: 'Erreur lors de la vérification des permissions' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Vérifie que l'utilisateur est admin OU a un des rôles spécifiés
 * 
 * Cette fonction vérifie d'abord si l'utilisateur est admin, puis vérifie les rôles.
 * Utile pour les endpoints qui acceptent soit les admins, soit certains rôles.
 * 
 * @param userId - L'ID de l'utilisateur à vérifier
 * @param allowedRoles - Liste des rôles autorisés (en plus des admins)
 * @returns Les données de l'admin ou du profil, ou une erreur NextResponse
 * 
 * @example
 * ```typescript
 * const result = await requireAdminOrRole(user.id, ['pedagogie']);
 * if ('error' in result) {
 *   return result.error;
 * }
 * // result peut contenir 'admin' ou 'profile'
 * ```
 */
export async function requireAdminOrRole(
  userId: string,
  allowedRoles: string[]
): Promise<PermissionResult> {
  // Essayer d'abord comme admin
  const adminResult = await requireAdmin(userId);
  if (!('error' in adminResult)) {
    return { admin: adminResult.admin };
  }

  // Sinon vérifier le rôle
  const roleResult = await requireRole(userId, allowedRoles);
  if (!('error' in roleResult)) {
    return { profile: roleResult.profile };
  }

  // Vérifier aussi dans la table administrateurs (fallback pour compatibilité)
  try {
    const supabase = getSupabaseServerClient();
    const { data: adminRecord } = await supabase
      .from('administrateurs')
      .select('id, niveau, user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (adminRecord && ['admin', 'superadmin'].includes(adminRecord.niveau)) {
      return { admin: adminRecord as Admin };
    }
  } catch (error) {
    // Ignorer l'erreur et continuer
  }

  // Si rien ne fonctionne, retourner l'erreur du requireRole
  return roleResult;
}

