import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';
import { logCreate } from '@/lib/audit-logger';

// POST - Inviter un administrateur ou formateur
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
    const isFormateur = role === 'FORMATEUR';

    // Pour les admins, vérifier si un admin existe déjà avec cet email
    if (!isFormateur) {
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

      // Pour les formateurs, vérifier si un tuteur existe déjà
      if (isFormateur) {
        const { data: existingTuteur } = await supabase
          .from('tuteurs')
          .select('id')
          .eq('user_id', existingUser.id)
          .maybeSingle();

        if (existingTuteur) {
          return NextResponse.json(
            { success: false, error: 'Un formateur avec cet email existe déjà' },
            { status: 400 }
          );
        }
      }

      // Mettre à jour le mot de passe si l'utilisateur existe déjà
      await supabase.auth.admin.updateUserById(existingUser.id, {
        password: tempPassword,
        user_metadata: {
          ...(isFormateur ? { nom: nom.toUpperCase(), prenom: prenom.toUpperCase() } : {}),
          temp_password: tempPasswordBase64,
          requires_password_change: true,
        },
      });
    } else {
      // Créer l'utilisateur avec email non confirmé
      const { data: createUserData, error: createUserError } = await supabase.auth.admin.createUser({
        email: email.toLowerCase(),
        password: tempPassword,
        email_confirm: false,
        user_metadata: {
          ...(isFormateur ? { nom: nom.toUpperCase(), prenom: prenom.toUpperCase() } : {}),
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

    if (isFormateur) {
      // === FORMATEUR: Insérer dans la table tuteurs ===

      // Supprimer de la table administrateurs si l'utilisateur y existe (éviter conflit de rôle)
      await supabase
        .from('administrateurs')
        .delete()
        .eq('user_id', createdUser.user.id);

      // Supprimer user_profile si créé par un trigger (les formateurs sont dans tuteurs, pas user_profiles)
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', createdUser.user.id)
        .maybeSingle();

      if (existingProfile) {
        await supabase
          .from('user_profiles')
          .delete()
          .eq('user_id', createdUser.user.id);
      }

      const { data: newTuteur, error: tuteurError } = await supabase
        .from('tuteurs')
        .insert({
          user_id: createdUser.user.id,
          statut: 'actif',
        })
        .select()
        .single();

      let finalTuteur;

      if (tuteurError) {
        if (tuteurError.code === '23505') {
          const { data: updatedTuteur, error: updateError } = await supabase
            .from('tuteurs')
            .update({
              statut: 'actif',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', createdUser.user.id)
            .select()
            .single();

          if (updateError || !updatedTuteur) {
            return NextResponse.json(
              { success: false, error: 'Erreur lors de la mise à jour du formateur' },
              { status: 500 }
            );
          }
          finalTuteur = updatedTuteur;
        } else {
          await logCreate(request, 'tuteurs', 'unknown', {
            nom, prenom, email, role, ecole
          }, `Échec de création de formateur: ${tuteurError.message}`).catch(() => {});

          return NextResponse.json(
            { success: false, error: 'Erreur lors de la création du formateur' },
            { status: 500 }
          );
        }
      } else {
        finalTuteur = newTuteur;
      }

      await logCreate(request, 'tuteurs', finalTuteur.id, {
        id: finalTuteur.id,
        user_id: finalTuteur.user_id,
        nom,
        prenom,
        email: email.toLowerCase(),
      }, `Création d'un nouveau formateur: ${prenom} ${nom} (${email})`).catch(() => {});

      return NextResponse.json({
        success: true,
        message: 'Formateur créé avec succès.',
        admin: {
          ...finalTuteur,
          nom: nom.toUpperCase(),
          prenom: prenom.toUpperCase(),
          email: email.toLowerCase(),
          role_secondaire: 'pedagogie',
          service: service || null,
        },
        credentials: {
          email: email.toLowerCase(),
          password: tempPassword,
        },
      });

    } else {
      // === ADMIN: Insérer dans la table administrateurs ===

      // Supprimer de la table tuteurs si l'utilisateur y existe (éviter conflit de rôle)
      await supabase
        .from('tuteurs')
        .delete()
        .eq('user_id', createdUser.user.id);

      // Supprimer user_profile si créé par un trigger (les admins sont dans administrateurs, pas user_profiles)
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', createdUser.user.id)
        .maybeSingle();

      if (existingProfile) {
        await supabase
          .from('user_profiles')
          .delete()
          .eq('user_id', createdUser.user.id);
      }

      const { data: newAdmin, error: adminError } = await supabase
        .from('administrateurs')
        .insert({
          user_id: createdUser.user.id,
          nom,
          prenom,
          email: email.toLowerCase(),
          niveau: 'admin',
          role_secondaire: role_secondaire,
          service: service || null,
        })
        .select()
        .single();

      let finalAdmin;

      if (adminError) {
        if (adminError.code === '23505') {
          const { data: existingAdmin, error: updateError } = await supabase
            .from('administrateurs')
            .update({
              nom: nom.toUpperCase(),
              prenom: prenom.toUpperCase(),
              email: email.toLowerCase(),
              niveau: 'admin',
              role_secondaire: role_secondaire as any,
              service: service || null,
            })
            .eq('user_id', createdUser.user.id)
            .select()
            .single();

          if (updateError || !existingAdmin) {
            return NextResponse.json(
              { success: false, error: 'Erreur lors de la mise à jour de l\'administrateur' },
              { status: 500 }
            );
          }
          finalAdmin = existingAdmin;
        } else {
          await logCreate(request, 'administrateurs', 'unknown', {
            nom, prenom, email, role, ecole
          }, `Échec de création d'administrateur: ${adminError.message}`).catch(() => {});

          return NextResponse.json(
            { success: false, error: 'Erreur lors de la création de l\'administrateur' },
            { status: 500 }
          );
        }
      } else {
        finalAdmin = newAdmin;
      }

      await logCreate(request, 'administrateurs', finalAdmin.id, {
        id: finalAdmin.id,
        nom: finalAdmin.nom,
        prenom: finalAdmin.prenom,
        email: finalAdmin.email,
        role_secondaire: finalAdmin.role_secondaire,
        service: finalAdmin.service,
        niveau: finalAdmin.niveau,
      }, `Création d'un nouvel administrateur: ${finalAdmin.prenom} ${finalAdmin.nom} (${finalAdmin.email})`).catch(() => {});

      return NextResponse.json({
        success: true,
        message: 'Administrateur créé avec succès. L\'email sera confirmé après la première connexion.',
        admin: finalAdmin,
        credentials: {
          email: email.toLowerCase(),
          password: tempPassword,
        },
      });
    }

  } catch (error) {
    await logCreate(request, 'administrateurs', 'unknown', {}, `Erreur lors de la création: ${error instanceof Error ? error.message : 'Erreur inconnue'}`).catch(() => {});

    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
