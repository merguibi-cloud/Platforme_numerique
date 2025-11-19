import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServerClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// PUT - Modifier un administrateur
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nom, prenom, email, role, ecole } = body;

    // Validation
    if (!nom || !prenom || !email || !role) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    if (role !== 'ADMINISTRATEUR' && !ecole) {
      return NextResponse.json(
        { success: false, error: 'Une école est requise pour ce rôle' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabase = getSupabaseServerClient();
    
    // Vérifier les permissions
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

    // Récupérer l'admin à modifier
    const { data: adminToUpdate, error: fetchError } = await supabase
      .from('administrateurs')
      .select('user_id, email')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('Erreur récupération admin:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération de l\'administrateur' },
        { status: 500 }
      );
    }

    if (!adminToUpdate) {
      return NextResponse.json(
        { success: false, error: 'Administrateur non trouvé' },
        { status: 404 }
      );
    }

    // Mapper le rôle
    let role_secondaire: string;
    let service: string;

    if (role === 'ADMINISTRATEUR') {
      role_secondaire = 'all';
      service = 'all';
    } else if (role === 'ADMINISTRATEUR ADV') {
      role_secondaire = 'adv';
      service = ecole;
    } else if (role === 'ADMINISTRATEUR COMMERCIAL') {
      role_secondaire = 'commercial';
      service = ecole;
    } else if (role === 'FORMATEUR') {
      role_secondaire = 'pedagogie';
      service = ecole;
    } else {
      return NextResponse.json(
        { success: false, error: 'Rôle invalide' },
        { status: 400 }
      );
    }

    // Mettre à jour l'email dans auth.users si nécessaire
    if (email.toLowerCase() !== adminToUpdate.email?.toLowerCase()) {
      await supabase.auth.admin.updateUserById(adminToUpdate.user_id, {
        email: email.toLowerCase(),
      });
    }

    // Mettre à jour l'administrateur
    const { data: updatedAdmin, error: updateError } = await supabase
      .from('administrateurs')
      .update({
        nom: nom.toUpperCase(),
        prenom: prenom.toUpperCase(),
        email: email.toLowerCase(),
        role_secondaire: role_secondaire,
        service: service,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur mise à jour admin:', updateError);
      return NextResponse.json(
        { success: false, error: `Erreur lors de la mise à jour: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Administrateur mis à jour avec succès',
      admin: updatedAdmin,
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un administrateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    
    // Vérifier les permissions
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

    // Récupérer l'admin à supprimer avec toutes les informations nécessaires
    const { data: adminToDelete, error: fetchError } = await supabase
      .from('administrateurs')
      .select('user_id, email')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('Erreur récupération admin:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération de l\'administrateur' },
        { status: 500 }
      );
    }

    if (!adminToDelete) {
      return NextResponse.json(
        { success: false, error: 'Administrateur non trouvé' },
        { status: 404 }
      );
    }

    const userIdToDelete = adminToDelete.user_id;
    console.log('=== SUPPRESSION ADMINISTRATEUR ===');
    console.log('Admin ID:', id);
    console.log('User ID:', userIdToDelete);
    console.log('Email:', adminToDelete.email);

    // Ordre de suppression pour éviter les problèmes de contraintes :
    // 1. Supprimer l'entrée dans administrateurs
    // 2. Supprimer l'entrée dans user_profiles
    // 3. Supprimer l'utilisateur dans auth.users

    // 1. Supprimer l'entrée dans administrateurs
    console.log('1. Suppression de l\'entrée dans administrateurs...');
    const { error: deleteAdminError } = await supabase
      .from('administrateurs')
      .delete()
      .eq('id', id);

    if (deleteAdminError) {
      console.error('❌ Erreur suppression admin:', deleteAdminError);
      return NextResponse.json(
        { success: false, error: `Erreur lors de la suppression de l'administrateur: ${deleteAdminError.message}` },
        { status: 500 }
      );
    }
    console.log('✓ Administrateur supprimé de la table administrateurs');

    // 2. Supprimer l'entrée dans user_profiles
    console.log('2. Suppression de l\'entrée dans user_profiles...');
    const { error: deleteProfileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userIdToDelete);

    if (deleteProfileError) {
      console.error('❌ Erreur suppression user_profile:', deleteProfileError);
      // Ne pas bloquer si le user_profile n'existe pas, mais logger l'erreur
      console.warn('⚠️ Impossible de supprimer le user_profile (peut-être qu\'il n\'existe pas)');
    } else {
      console.log('✓ user_profile supprimé');
    }

    // 3. Supprimer l'utilisateur dans auth.users
    console.log('3. Suppression de l\'utilisateur dans auth.users...');
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userIdToDelete);

    if (deleteUserError) {
      console.error('❌ Erreur suppression utilisateur auth:', deleteUserError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Erreur lors de la suppression de l'utilisateur: ${deleteUserError.message}`,
          details: {
            adminDeleted: true,
            profileDeleted: !deleteProfileError,
            userDeleted: false
          }
        },
        { status: 500 }
      );
    }
    console.log('✓ Utilisateur supprimé de auth.users');
    console.log('=== SUPPRESSION COMPLÈTE ===');

    return NextResponse.json({
      success: true,
      message: 'Administrateur, profil et utilisateur supprimés avec succès',
    });

  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

