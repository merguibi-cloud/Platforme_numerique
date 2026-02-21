import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';

// GET - Récupérer la liste des administrateurs et formateurs
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

    // Récupérer tous les tuteurs (formateurs)
    const { data: tuteurs, error: tuteursError } = await supabase
      .from('tuteurs')
      .select('*')
      .order('created_at', { ascending: false });

    if (tuteursError) {
      console.error('Erreur récupération tuteurs:', tuteursError);
      // Continue without tutors - don't fail the whole request
    }

    // Récupérer les informations d'authentification pour chaque admin
    const adminsWithStatus = await Promise.all(
      (admins || []).map(async (admin: any) => {
        try {
          const { data: authUser } = await supabase.auth.admin.getUserById(admin.user_id);

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

    // Récupérer les informations d'authentification pour chaque tuteur (formateur)
    const tuteursWithStatus = await Promise.all(
      (tuteurs || []).map(async (tuteur: any) => {
        try {
          const { data: authUser } = await supabase.auth.admin.getUserById(tuteur.user_id);

          const isPending = !authUser?.user?.email_confirmed_at || !authUser?.user?.last_sign_in_at;
          const metadata = authUser?.user?.user_metadata || {};

          return {
            id: `tuteur_${tuteur.id}`,
            nom: metadata.nom || '',
            prenom: metadata.prenom || '',
            mail: authUser?.user?.email || '',
            ecole: '',
            role: 'FORMATEUR',
            role_secondaire: 'pedagogie',
            niveau: 'tuteur',
            service: null,
            status: isPending ? 'pending' : 'actif',
            created_at: tuteur.created_at,
            last_sign_in_at: authUser?.user?.last_sign_in_at,
          };
        } catch (err) {
          return {
            id: `tuteur_${tuteur.id}`,
            nom: '',
            prenom: '',
            mail: '',
            ecole: '',
            role: 'FORMATEUR',
            role_secondaire: 'pedagogie',
            niveau: 'tuteur',
            service: null,
            status: 'pending',
            created_at: tuteur.created_at,
            last_sign_in_at: null,
          };
        }
      })
    );

    // Fusionner les deux listes et trier par date de création
    const allUsers = [...adminsWithStatus, ...tuteursWithStatus].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({
      success: true,
      administrateurs: allUsers,
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
