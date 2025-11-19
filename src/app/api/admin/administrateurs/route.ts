import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServerClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// GET - Récupérer la liste des administrateurs
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabase = getSupabaseServerClient();
    
    // Vérifier que l'utilisateur est admin/superadmin
    const authClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur a les permissions dans la table administrateurs
    const { data: currentAdmin, error: checkError } = await supabase
      .from('administrateurs')
      .select('niveau')
      .eq('user_id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('Erreur vérification permissions:', checkError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la vérification des permissions' },
        { status: 500 }
      );
    }

    if (!currentAdmin || !['admin', 'superadmin'].includes(currentAdmin.niveau)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      );
    }

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

