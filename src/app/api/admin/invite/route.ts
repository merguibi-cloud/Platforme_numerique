import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';

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

    // Déterminer le rôle dans user_profiles selon le rôle de l'admin
    let userProfileRole = 'admin'; // Par défaut
    if (role === 'ADMINISTRATEUR') {
      userProfileRole = 'admin';
    } else if (role === 'ADMINISTRATEUR ADV') {
      userProfileRole = 'adv';
    } else if (role === 'ADMINISTRATEUR COMMERCIAL') {
      userProfileRole = 'commercial';
    } else if (role === 'FORMATEUR') {
      userProfileRole = 'formateur';
    }
    
    // IMPORTANT: Le redirectTo doit être une URL complète et absolue
    // Rediriger vers la route de callback qui gère la confirmation d'email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectTo = `${baseUrl}/auth/callback`;
    
    // Étape 1: Générer un mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16).toUpperCase() + '!@#';
    const tempPasswordBase64 = Buffer.from(tempPassword).toString('base64');
    
    // Étape 2: Utiliser inviteUserByEmail EN PREMIER pour créer l'utilisateur et envoyer l'email
    
    const { data: inviteResult, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email.toLowerCase(),
      {
        redirectTo: redirectTo,
      }
    );

    let createdUser;
    
    if (inviteError) {
      // Si l'utilisateur existe déjà, récupérer son ID
      if (inviteError.code === 'email_exists' || inviteError.message?.includes('already registered') || inviteError.message?.includes('already exists')) {
        // Récupérer l'utilisateur depuis auth.users
        const { data: existingUserList } = await supabase.auth.admin.listUsers();
        const existingUser = existingUserList?.users?.find(u => u.email === email.toLowerCase());
        
        if (existingUser) {
          createdUser = { user: existingUser };
        } else {
          // Si on ne trouve pas l'utilisateur, essayer de le créer avec createUser
          const { data: createUserData, error: createUserError } = await supabase.auth.admin.createUser({
            email: email.toLowerCase(),
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              temp_password: tempPasswordBase64,
              requires_password_change: true,
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
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Impossible d\'envoyer l\'email d\'invitation'
          },
          { status: 500 }
        );
      }
    } else {
      // inviteUserByEmail a réussi, récupérer l'utilisateur créé
      // Récupérer l'utilisateur depuis auth.users (inviteUserByEmail ne retourne pas toujours l'utilisateur directement)
      const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la récupération de l\'utilisateur' },
          { status: 500 }
        );
      }
      
      const newUser = userList?.users?.find(u => u.email === email.toLowerCase());
      if (newUser) {
        createdUser = { user: newUser };
      } else {
        return NextResponse.json(
          { success: false, error: 'Utilisateur créé mais non trouvé' },
          { status: 500 }
        );
      }
    }
    
    // Étape 3: Mettre à jour l'utilisateur avec le mot de passe temporaire et les métadonnées
    const { error: updateError } = await supabase.auth.admin.updateUserById(createdUser.user.id, {
      password: tempPassword,
      user_metadata: {
        temp_password: tempPasswordBase64,
        requires_password_change: true,
      },
    });

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour de l\'utilisateur' },
        { status: 500 }
      );
    }

    // IMPORTANT: Créer le user_profile IMMÉDIATEMENT après la création de l'utilisateur
    // On le fait tout de suite pour éviter qu'un trigger ne le fasse avec des valeurs par défaut
    const { data: newProfile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: createdUser.user.id,
        email: email.toLowerCase(),
        formation_id: null,
        profile_completed: true,
        role: userProfileRole as any,
      })
      .select()
      .single();

    if (profileError) {
      // Si le user_profile existe déjà (créé par un trigger), on le met à jour
      if (profileError.code === '23505') {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            email: email.toLowerCase(),
            role: userProfileRole as any,
            profile_completed: true,
          })
          .eq('user_id', createdUser.user.id)
          .select()
          .single();
        
        if (updateError) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Erreur lors de la mise à jour du profil'
            },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Erreur lors de la création du profil'
          },
          { status: 500 }
        );
      }
    }

    // Créer l'entrée dans la table administrateurs
    const { data: newAdmin, error: adminError } = await supabase
      .from('administrateurs')
      .insert({
        user_id: createdUser.user.id,
        niveau: 'admin' as any,
        role_secondaire: role_secondaire as any,
        service: service,
        nom: nom.toUpperCase(),
        prenom: prenom.toUpperCase(),
        email: email.toLowerCase(),
      })
      .select()
      .single();

    if (adminError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur lors de la création de l\'administrateur'
        },
        { status: 500 }
      );
    }
    
    // Retourner les identifiants pour affichage dans le modal
    return NextResponse.json({
      success: true,
      message: 'Invitation envoyée avec succès',
      admin: newAdmin,
      credentials: {
        email: email.toLowerCase(),
        password: tempPassword, // Retourner le mot de passe temporaire pour affichage
      },
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur'
      },
      { status: 500 }
    );
  }
}

