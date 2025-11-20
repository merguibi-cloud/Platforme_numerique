import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';

// GET - Récupérer la liste des utilisateurs (admin/superadmin seulement)
export async function GET(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    // Vérification des permissions (admin ou superadmin requis)
    const permissionResult = await requireAdminOrRole(user.id, ['admin', 'superadmin']);
    if ('error' in permissionResult) {
      return permissionResult.error;
    }

    const supabase = getSupabaseServerClient();

    // Récupérer tous les utilisateurs avec leurs profils
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        auth_users:user_id (
          email,
          created_at,
          last_sign_in_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des utilisateurs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: users
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
