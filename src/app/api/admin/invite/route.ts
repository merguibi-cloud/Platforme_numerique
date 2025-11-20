import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';
import { logCreate } from '@/lib/audit-logger';

// POST - Inviter un administrateur
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { nom, prenom, email, role, ecole } = body;

    // Validation
    if (!nom || !prenom || !email || !role) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Si le rôle nécessite une école et qu'elle n'est pas fournie
    if (role !== 'ADMINISTRATEUR' && !ecole) {
      return NextResponse.json(
        { success: false, error: 'Une école est requise pour ce rôle' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Vérifier si un admin existe déjà avec cet email
    const { data: existingAdmin, error: checkAdminError } = await supabase
      .from('administrateurs')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (checkAdminError && checkAdminError.code !== 'PGRST116') {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la vérification' },
        { status: 500 }
      );
    }

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Un administrateur avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Mapper le rôle du formulaire vers les champs de la base
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

    // Générer un mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16).toUpperCase() + '!@#';
    const tempPasswordBase64 = Buffer.from(tempPassword).toString('base64');
    
    // Vérifier si l'utilisateur existe déjà
    const { data: existingUserList } = await supabase.auth.admin.listUsers();
    const existingUser = existingUserList?.users?.find(u => u.email === email.toLowerCase());
    
    let createdUser;
    
    if (existingUser) {
      createdUser = { user: existingUser };
      // Mettre à jour le mot de passe si l'utilisateur existe déjà
      await supabase.auth.admin.updateUserById(existingUser.id, {
        password: tempPassword,
        user_metadata: {
          temp_password: tempPasswordBase64,
          requires_password_change: true, // Forcer le changement de mot de passe à la première connexion
        },
      });
    } else {
      // Créer l'utilisateur avec email non confirmé
      // L'email sera confirmé après la première connexion
      const { data: createUserData, error: createUserError } = await supabase.auth.admin.createUser({
        email: email.toLowerCase(),
        password: tempPassword,
        email_confirm: false, // Sera confirmé après la première connexion
        user_metadata: {
          temp_password: tempPasswordBase64,
        },
      });

      if (createUserError) {
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la création de l\'utilisateur' },
          { status: 400 }
        );
      }

      if (!createUserData?.user) {
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la création de l\'utilisateur' },
          { status: 500 }
        );
      }
      
      createdUser = createUserData;
    }


    // IMPORTANT: Ne PAS créer de user_profile pour les admins/formateurs
    // Les admins/formateurs sont uniquement dans la table administrateurs
    // user_profiles est réservé uniquement pour lead et candidat
    // Si un user_profile existe déjà (créé par un trigger), on le supprime car ce n'est pas un lead/candidat
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', createdUser.user.id)
      .maybeSingle();

    if (existingProfile) {
      // Supprimer le profil car cet utilisateur est un admin/formateur, pas un lead/candidat
      await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', createdUser.user.id);
    }

    // Créer l'administrateur dans la table administrateurs
    const { data: newAdmin, error: adminError } = await supabase
      .from('administrateurs')
      .insert({
        user_id: createdUser.user.id,
        nom,
        prenom,
        email: email.toLowerCase(),
        niveau: role === 'ADMINISTRATEUR' ? 'admin' : 'admin',
        role_secondaire: role_secondaire,
        service: service || null,
      })
      .select()
      .single();

    let finalAdmin;
    
    if (adminError) {
      // Si l'administrateur existe déjà, on le met à jour
      if (adminError.code === '23505') {
        const { data: existingAdmin, error: updateError } = await supabase
          .from('administrateurs')
          .update({
            nom: nom.toUpperCase(),
            prenom: prenom.toUpperCase(),
            email: email.toLowerCase(),
            niveau: role === 'ADMINISTRATEUR' ? 'admin' : 'admin',
            role_secondaire: role_secondaire as any,
            service: service || null,
          })
          .eq('user_id', createdUser.user.id)
          .select()
          .single();
        
        if (updateError || !existingAdmin) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Erreur lors de la mise à jour de l\'administrateur'
            },
            { status: 500 }
          );
        }
        
        // Utiliser l'administrateur existant mis à jour
        finalAdmin = existingAdmin;

      } else {
        await logCreate(request, 'administrateurs', 'unknown', {
          nom, prenom, email, role, ecole
        }, `Échec de création d'administrateur: ${adminError.message}`).catch(() => {});
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'Erreur lors de la création de l\'administrateur'
          },
          { status: 500 }
        );
      }
    } else {
      finalAdmin = newAdmin;
    }
    
    // Logger la création
    await logCreate(request, 'administrateurs', finalAdmin.id, {
      id: finalAdmin.id,
      nom: finalAdmin.nom,
      prenom: finalAdmin.prenom,
      email: finalAdmin.email,
      role_secondaire: finalAdmin.role_secondaire,
      service: finalAdmin.service,
      niveau: finalAdmin.niveau,
    }, `Création d'un nouvel administrateur: ${finalAdmin.prenom} ${finalAdmin.nom} (${finalAdmin.email})`).catch(() => {});
    
    // Retourner les identifiants pour affichage dans le modal
    return NextResponse.json({
      success: true,
      message: 'Administrateur créé avec succès. L\'email sera confirmé après la première connexion.',
      admin: finalAdmin,
      credentials: {
        email: email.toLowerCase(),
        password: tempPassword, // Retourner le mot de passe temporaire pour affichage
      },
    });

  } catch (error) {
    await logCreate(request, 'administrateurs', 'unknown', {}, `Erreur lors de la création d'administrateur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`).catch(() => {});
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur'
      },
      { status: 500 }
    );
  }
}

