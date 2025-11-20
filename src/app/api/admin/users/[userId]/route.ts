import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';

// PUT - Mettre à jour le rôle d'un utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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

    // Récupérer le profil pour vérifier si c'est un superadmin
    const currentProfile = 'profile' in permissionResult 
      ? permissionResult.profile 
      : await getSupabaseServerClient()
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()
          .then(r => r.data);

    const { userId } = await params;
    const body = await request.json();
    const { role } = body;

    // Valider le rôle
    if (!role || !['etudiant', 'animateur', 'admin', 'superadmin'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Rôle invalide' },
        { status: 400 }
      );
    }

    // Empêcher un admin de promouvoir quelqu'un en superadmin
    if (currentProfile?.role === 'admin' && role === 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Seuls les super-administrateurs peuvent promouvoir en super-admin' },
        { status: 403 }
      );
    }

    // Empêcher de modifier son propre rôle
    if (userId === user.id) {
      return NextResponse.json(
        { success: false, error: 'Vous ne pouvez pas modifier votre propre rôle' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Mettre à jour le rôle
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('user_id', userId)
      .select();

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour du rôle' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Rôle mis à jour avec succès'
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
