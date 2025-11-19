import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServerClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// POST - Inviter un administrateur
export async function POST(request: NextRequest) {
  try {
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

    // Si le rôle nécessite une école et qu'elle n'est pas fournie
    if (role !== 'ADMINISTRATEUR' && !ecole) {
      return NextResponse.json(
        { success: false, error: 'Une école est requise pour ce rôle' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabase = getSupabaseServerClient();
    
    // Vérifier que l'utilisateur actuel est admin/superadmin
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

    // Vérifier que l'utilisateur a les permissions (doit être dans la table administrateurs)
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

    // Vérifier si un admin existe déjà avec cet email
    const { data: existingAdmin, error: checkAdminError } = await supabase
      .from('administrateurs')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (checkAdminError && checkAdminError.code !== 'PGRST116') {
      console.error('Erreur vérification admin existant:', checkAdminError);
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

    console.log('=== DÉBUT INVITATION ADMIN ===');
    console.log('Email:', email.toLowerCase());
    console.log('Supabase URL:', supabaseUrl);
    console.log('Service Role Key présent:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
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
    
    // NOUVELLE APPROCHE : Utiliser createUser + generateLink avec type 'recovery' (24h)
    // Puis utiliser inviteUserByEmail pour envoyer l'email avec le lien recovery
    // Cela garantit une durée de validité de 24h au lieu de 1h (ou moins selon config Supabase)
    console.log('Création de l\'utilisateur et génération d\'un lien recovery (24h)...');
    
    // IMPORTANT: Le redirectTo doit être une URL complète et absolue
    // Supabase va construire le lien avec le token dans le hash : #access_token=...&type=recovery
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectTo = `${baseUrl}/admin/accept-invitation`;
    console.log('RedirectTo (URL complète requise par Supabase):', redirectTo);
    
    // Étape 1: Créer l'utilisateur avec createUser
    const tempPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16).toUpperCase() + '!@#';
    console.log('Création de l\'utilisateur avec createUser...');
    
    const { data: createUserData, error: createUserError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password: tempPassword, // Mot de passe temporaire
      email_confirm: true,
    });

    if (createUserError) {
      // Si l'utilisateur existe déjà, récupérer son ID
      if (createUserError.message?.includes('already registered') || createUserError.message?.includes('already exists')) {
        console.log('ℹ️ Utilisateur existe déjà, récupération de l\'utilisateur...');
        
        // Récupérer l'utilisateur depuis la table administrateurs
        const { data: existingAdmin } = await supabase
          .from('administrateurs')
          .select('user_id')
          .eq('email', email.toLowerCase())
          .maybeSingle();
        
        if (existingAdmin) {
          const { data: existingUserData } = await supabase.auth.admin.getUserById(existingAdmin.user_id);
          if (existingUserData?.user) {
            var createdUser = { user: existingUserData.user };
          } else {
            return NextResponse.json(
              { success: false, error: 'Erreur lors de la récupération de l\'utilisateur existant' },
              { status: 400 }
            );
          }
        } else {
          return NextResponse.json(
            { success: false, error: 'Utilisateur existe mais non trouvé dans les administrateurs' },
            { status: 400 }
          );
        }
      } else {
        console.error('❌ ERREUR création utilisateur:', createUserError);
        return NextResponse.json(
          { success: false, error: `Erreur lors de la création: ${createUserError.message}` },
          { status: 400 }
        );
      }
    } else {
      if (!createUserData?.user) {
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la création de l\'utilisateur' },
          { status: 500 }
        );
      }
      var createdUser = createUserData;
    }

    console.log('✓ Utilisateur créé/récupéré:', createdUser.user.id);
    
    // Étape 2: Générer un lien 'recovery' (24h) - durée plus longue et plus stable
    console.log('Génération d\'un lien recovery (type recovery, durée 24h)...');
    const { data: recoveryLinkData, error: recoveryLinkError } = await supabase.auth.admin.generateLink({
      type: 'recovery', // Type recovery = 24h de validité (au lieu de 1h ou moins pour invite)
      email: email.toLowerCase(),
      options: {
        redirectTo: redirectTo,
      },
    });

    if (recoveryLinkError) {
      console.error('❌ ERREUR génération lien recovery:', recoveryLinkError);
      return NextResponse.json(
        { success: false, error: `Erreur lors de la génération du lien: ${recoveryLinkError.message}` },
        { status: 500 }
      );
    }

    if (!recoveryLinkData?.properties?.action_link) {
      return NextResponse.json(
        { success: false, error: 'Lien de réinitialisation non généré' },
        { status: 500 }
      );
    }

    const recoveryLink = recoveryLinkData.properties.action_link;
    console.log('✓ Lien recovery généré (durée: 24h)');
    console.log('Lien complet:', recoveryLink);
    console.log('');
    
    // Étape 3: Utiliser inviteUserByEmail pour envoyer l'email OBLIGATOIREMENT
    // inviteUserByEmail génère un token invite, mais on l'utilise pour garantir l'envoi de l'email
    // Le lien recovery (24h) est disponible dans les logs et la réponse pour une durée plus longue
    console.log('Envoi OBLIGATOIRE de l\'email d\'invitation avec inviteUserByEmail...');
    console.log('Note: inviteUserByEmail génère un token invite qui peut expirer rapidement.');
    console.log('Le lien recovery (24h) est disponible ci-dessous pour une durée plus longue.');
    
    const { data: inviteResult, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email.toLowerCase(),
      {
        redirectTo: redirectTo,
      }
    );

    if (inviteError) {
      // Si inviteUserByEmail échoue, on retourne une erreur car l'envoi d'email est obligatoire
      console.error('❌ ERREUR: Impossible d\'envoyer l\'email d\'invitation:', inviteError.message);
      console.error('L\'envoi d\'email est obligatoire. Le lien recovery (24h) est disponible ci-dessous pour envoi manuel.');
      console.error('Lien recovery (24h):', recoveryLink);
      
      // Retourner une erreur mais avec le lien recovery disponible
      return NextResponse.json(
        { 
          success: false, 
          error: `Impossible d'envoyer l'email automatiquement: ${inviteError.message}`,
          recoveryLink: recoveryLink, // Lien recovery (24h) disponible
          message: 'L\'email n\'a pas pu être envoyé automatiquement. Utilisez le lien recovery ci-dessus pour l\'envoyer manuellement.'
        },
        { status: 500 }
      );
    }

    console.log('✓ Email d\'invitation envoyé avec succès');
    console.log('⚠️ IMPORTANT: Le token dans l\'email (type invite) peut expirer rapidement selon la configuration Supabase.');
    console.log('Si le token expire, utilisez le lien recovery (24h) ci-dessous:');
    console.log('Lien recovery (24h):', recoveryLink);

    let linkData = recoveryLinkData;

    // IMPORTANT: Créer le user_profile IMMÉDIATEMENT après la création de l'utilisateur
    // On le fait tout de suite pour éviter qu'un trigger ne le fasse avec des valeurs par défaut
    console.log('Création du user_profile pour l\'administrateur...');
    console.log('Rôle user_profile:', userProfileRole);
    
    const { data: newProfile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: createdUser.user.id,
        email: email.toLowerCase(), // Ajouter l'email car le trigger l'attend
        formation_id: null, // NULL est autorisé par la contrainte FK
        profile_completed: true, // Les admins ont un profil complet dès la création
        role: userProfileRole as any,
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Erreur création user_profile:');
      console.error('  - Message:', profileError.message);
      console.error('  - Code:', profileError.code);
      console.error('  - Details:', profileError.details);
      console.error('  - Hint:', profileError.hint);
      console.error('  - Erreur complète:', JSON.stringify(profileError, null, 2));
      
      // Si le user_profile existe déjà (créé par un trigger), on le met à jour
      if (profileError.code === '23505') {
        console.log('⚠️ user_profile existe déjà (créé par un trigger?), mise à jour...');
        const { data: updatedProfile, error: updateError } = await supabase
          .from('user_profiles')
          .update({
            email: email.toLowerCase(), // Mettre à jour l'email aussi
            role: userProfileRole as any,
            profile_completed: true,
          })
          .eq('user_id', createdUser.user.id)
          .select()
          .single();
        
        if (updateError) {
          console.error('❌ Erreur mise à jour user_profile:', updateError);
          return NextResponse.json(
            { 
              success: false, 
              error: `Erreur lors de la mise à jour du profil: ${updateError.message}`,
              details: {
                code: updateError.code,
                details: updateError.details
              }
            },
            { status: 500 }
          );
        }
        
        console.log('✓ user_profile mis à jour avec succès');
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: `Erreur lors de la création du profil: ${profileError.message}`,
            details: {
              code: profileError.code,
              details: profileError.details,
              hint: profileError.hint
            }
          },
          { status: 500 }
        );
      }
    } else {
      console.log('✓ user_profile créé avec succès:', newProfile?.id);
    }

    // Créer l'entrée dans la table administrateurs
    console.log('Création de l\'entrée dans la table administrateurs...');
    console.log('Données à insérer:', {
      user_id: createdUser.user.id,
      niveau: 'admin',
      role_secondaire,
      service,
      nom: nom.toUpperCase(),
      prenom: prenom.toUpperCase(),
      email: email.toLowerCase(),
    });
    
    const { data: newAdmin, error: adminError } = await supabase
      .from('administrateurs')
      .insert({
        user_id: createdUser.user.id,
        niveau: 'admin' as any, // Cast pour éviter les problèmes d'enum
        role_secondaire: role_secondaire as any, // Cast pour éviter les problèmes d'enum
        service: service,
        nom: nom.toUpperCase(),
        prenom: prenom.toUpperCase(),
        email: email.toLowerCase(),
      })
      .select()
      .single();

    if (adminError) {
      console.error('❌ Erreur création admin:');
      console.error('  - Message:', adminError.message);
      console.error('  - Code:', adminError.code);
      console.error('  - Details:', adminError.details);
      console.error('  - Hint:', adminError.hint);
      console.error('  - Erreur complète:', JSON.stringify(adminError, null, 2));
      
      // Si l'insertion échoue, on peut essayer de supprimer l'utilisateur créé
      // Mais pour l'instant, on retourne juste l'erreur
      return NextResponse.json(
        { 
          success: false, 
          error: `Erreur lors de la création de l'administrateur: ${adminError.message}`,
          details: {
            code: adminError.code,
            details: adminError.details,
            hint: adminError.hint
          }
        },
        { status: 500 }
      );
    }
    
    console.log('✓ Administrateur créé avec succès:', newAdmin?.id);

    console.log('=== FIN INVITATION ADMIN - SUCCÈS ===');
    
    // Retourner le lien d'invitation dans la réponse pour pouvoir l'envoyer manuellement si nécessaire
    const invitationLink = linkData?.properties?.action_link || null;
    
    return NextResponse.json({
      success: true,
      message: 'Invitation envoyée avec succès',
      admin: newAdmin,
      invitationLink: invitationLink, // Lien disponible si l'email n'est pas reçu
      emailSent: true, // inviteUserByEmail devrait avoir envoyé l'email
      note: invitationLink 
        ? 'Si l\'email n\'est pas reçu, vous pouvez utiliser le lien d\'invitation ci-dessus pour l\'envoyer manuellement.'
        : 'Vérifiez la configuration email de Supabase si l\'email n\'est pas reçu.'
    });

  } catch (error) {
    console.error('❌ ERREUR EXCEPTION lors de l\'invitation:');
    console.error('  - Type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('  - Message:', error instanceof Error ? error.message : String(error));
    console.error('  - Stack:', error instanceof Error ? error.stack : 'N/A');
    console.error('  - Erreur complète:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? {
          message: error.message,
          name: error.name
        } : null
      },
      { status: 500 }
    );
  }
}

