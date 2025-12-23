import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';

// GET - Récupérer la liste des administrateurs
export async function GET(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    // Vérification des permissions (admin ou superadmin requis)
    const adminResult = await requireAdmin(user.id);
    if ('error' in adminResult) {
      return adminResult.error;
    }

    const supabase = getSupabaseServerClient();

    // Récupérer tous les administrateurs
    const { data: admins, error } = await supabase
      .from('administrateurs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération admins:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des administrateurs' },
        { status: 500 }
      );
    }

    // Récupérer les informations d'authentification pour chaque admin
    const adminsWithStatus = await Promise.all(
      (admins || []).map(async (admin: any) => {
        try {
          // Récupérer les infos de l'utilisateur depuis auth.users via l'admin client
          const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(admin.user_id);
          
          const isPending = !authUser?.user?.email_confirmed_at || !authUser?.user?.last_sign_in_at;
          
          return {
            id: admin.id,
            nom: admin.nom,
            prenom: admin.prenom,
            mail: admin.email,
            ecole: admin.service === 'all' ? 'TOUTES LES ÉCOLES' : admin.service,
            role: getRoleDisplayName(admin.role_secondaire),
            role_secondaire: admin.role_secondaire,
            niveau: admin.niveau,
            service: admin.service,
            status: isPending ? 'pending' : 'actif',
            created_at: admin.created_at,
            last_sign_in_at: authUser?.user?.last_sign_in_at,
          };
        } catch (err) {
          // Si erreur, considérer comme pending
          return {
            id: admin.id,
            nom: admin.nom,
            prenom: admin.prenom,
            mail: admin.email,
            ecole: admin.service === 'all' ? 'TOUTES LES ÉCOLES' : admin.service,
            role: getRoleDisplayName(admin.role_secondaire),
            role_secondaire: admin.role_secondaire,
            niveau: admin.niveau,
            service: admin.service,
            status: 'pending',
            created_at: admin.created_at,
            last_sign_in_at: null,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      administrateurs: adminsWithStatus,
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des administrateurs:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Fonction helper pour obtenir le nom d'affichage du rôle
function getRoleDisplayName(role_secondaire: string): string {
  const roleMap: Record<string, string> = {
    'all': 'ADMINISTRATEUR',
    'adv': 'ADMINISTRATEUR ADV',
    'commercial': 'ADMINISTRATEUR COMMERCIAL',
    'pedagogie': 'FORMATEUR',
  };
  return roleMap[role_secondaire] || 'ADMINISTRATEUR';
}

