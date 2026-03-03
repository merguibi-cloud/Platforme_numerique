import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';
import { logUpdate, logDelete } from '@/lib/audit-logger';

// PUT - Modifier un administrateur ou formateur
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
    const { nom, prenom, email, role, ecole, formations } = body;

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

    const supabase = getSupabaseServerClient();

    // Vérifier si c'est un tuteur (formateur) - les IDs tuteurs sont préfixés avec "tuteur_"
    const isTuteur = id.startsWith('tuteur_');

    if (isTuteur) {
      const tuteurId = id.replace('tuteur_', '');

      const { data: tuteurToUpdate, error: fetchError } = await supabase
        .from('tuteurs')
        .select('*')
        .eq('id', tuteurId)
        .maybeSingle();

      if (fetchError || !tuteurToUpdate) {
        return NextResponse.json(
          { success: false, error: 'Formateur non trouvé' },
          { status: 404 }
        );
      }

      if (role !== 'FORMATEUR') {
        // === Changement de rôle: Formateur → Admin ===
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
        } else {
          return NextResponse.json(
            { success: false, error: 'Rôle invalide' },
            { status: 400 }
          );
        }

        // Générer un nouveau mot de passe temporaire
        const tempPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16).toUpperCase() + '!@#';
        const tempPasswordBase64 = Buffer.from(tempPassword).toString('base64');

        // Mettre à jour l'utilisateur auth
        await supabase.auth.admin.updateUserById(tuteurToUpdate.user_id, {
          email: email.toLowerCase(),
          password: tempPassword,
          user_metadata: {
            nom: nom.toUpperCase(),
            prenom: prenom.toUpperCase(),
            temp_password: tempPasswordBase64,
            requires_password_change: true,
          },
        });

        // Supprimer de la table tuteurs
        const { error: deleteTuteurError } = await supabase
          .from('tuteurs')
          .delete()
          .eq('id', tuteurId);

        if (deleteTuteurError) {
          return NextResponse.json(
            { success: false, error: `Erreur lors de la suppression de l'ancien rôle: ${deleteTuteurError.message}` },
            { status: 500 }
          );
        }

        // Créer dans administrateurs
        const { data: newAdmin, error: adminError } = await supabase
          .from('administrateurs')
          .insert({
            user_id: tuteurToUpdate.user_id,
            nom: nom.toUpperCase(),
            prenom: prenom.toUpperCase(),
            email: email.toLowerCase(),
            niveau: 'admin',
            role_secondaire,
            service: service || null,
          })
          .select()
          .single();

        if (adminError) {
          return NextResponse.json(
            { success: false, error: `Erreur lors de la création de l'administrateur: ${adminError.message}` },
            { status: 500 }
          );
        }

        await logUpdate(
          request,
          'tuteurs',
          tuteurId,
          tuteurToUpdate,
          newAdmin,
          ['role'],
          `Changement de rôle: formateur → administrateur pour ${prenom} ${nom}`
        ).catch(() => {});

        return NextResponse.json({
          success: true,
          message: 'Rôle changé en administrateur avec succès.',
          admin: newAdmin,
          credentials: {
            email: email.toLowerCase(),
            password: tempPassword,
          },
        });
      }

      // === Formateur reste formateur: mise à jour simple ===
      // Nettoyer toute entrée obsolète dans administrateurs (éviter conflit de rôle)
      await supabase
        .from('administrateurs')
        .delete()
        .eq('user_id', tuteurToUpdate.user_id);

      // Mettre à jour l'email et les métadonnées dans auth.users
      await supabase.auth.admin.updateUserById(tuteurToUpdate.user_id, {
        email: email.toLowerCase(),
        user_metadata: {
          nom: nom.toUpperCase(),
          prenom: prenom.toUpperCase(),
        },
      });

      // Mettre à jour le tuteur
      const { data: updatedTuteur, error: updateError } = await supabase
        .from('tuteurs')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('id', tuteurId)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { success: false, error: `Erreur lors de la mise à jour: ${updateError.message}` },
          { status: 500 }
        );
      }

      // Mettre à jour les formations assignées
      if (Array.isArray(formations)) {
        // Supprimer les anciennes assignations
        await supabase.from('tuteur_formations').delete().eq('tuteur_id', tuteurId);
        // Insérer les nouvelles
        if (formations.length > 0) {
          const formationRows = formations.map((fid: number) => ({
            tuteur_id: parseInt(tuteurId),
            formation_id: fid,
          }));
          await supabase.from('tuteur_formations').insert(formationRows);
        }
      }

      await logUpdate(
        request,
        'tuteurs',
        tuteurId,
        tuteurToUpdate,
        updatedTuteur,
        ['nom', 'prenom', 'email'],
        `Mise à jour du formateur ${prenom} ${nom}`
      ).catch(() => {});

      return NextResponse.json({
        success: true,
        message: 'Formateur mis à jour avec succès',
        admin: {
          ...updatedTuteur,
          nom: nom.toUpperCase(),
          prenom: prenom.toUpperCase(),
          email: email.toLowerCase(),
          role_secondaire: 'pedagogie',
          service: ecole || null,
        },
      });
    }

    // === ADMIN: Logique existante ===
    const { data: adminToUpdate, error: fetchError } = await supabase
      .from('administrateurs')
      .select('*')
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
      // === Changement de rôle: Admin → Formateur ===
      // Supprimer de la table administrateurs et créer dans tuteurs

      // Générer un nouveau mot de passe temporaire
      const tempPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16).toUpperCase() + '!@#';
      const tempPasswordBase64 = Buffer.from(tempPassword).toString('base64');

      // Mettre à jour l'utilisateur auth avec nouveau mot de passe + métadonnées
      await supabase.auth.admin.updateUserById(adminToUpdate.user_id, {
        email: email.toLowerCase(),
        password: tempPassword,
        user_metadata: {
          nom: nom.toUpperCase(),
          prenom: prenom.toUpperCase(),
          temp_password: tempPasswordBase64,
          requires_password_change: true,
        },
      });

      // Supprimer l'entrée dans administrateurs
      const { error: deleteAdminError } = await supabase
        .from('administrateurs')
        .delete()
        .eq('id', id);

      if (deleteAdminError) {
        return NextResponse.json(
          { success: false, error: `Erreur lors de la suppression de l'ancien rôle: ${deleteAdminError.message}` },
          { status: 500 }
        );
      }

      // Supprimer user_profile si existant
      await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', adminToUpdate.user_id);

      // Créer ou mettre à jour dans tuteurs
      const { data: newTuteur, error: tuteurError } = await supabase
        .from('tuteurs')
        .insert({
          user_id: adminToUpdate.user_id,
          statut: 'actif',
        })
        .select()
        .single();

      let finalTuteur;

      if (tuteurError) {
        if (tuteurError.code === '23505') {
          // Le tuteur existe déjà, mettre à jour
          const { data: updatedTuteur, error: updateTuteurError } = await supabase
            .from('tuteurs')
            .update({
              statut: 'actif',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', adminToUpdate.user_id)
            .select()
            .single();

          if (updateTuteurError || !updatedTuteur) {
            return NextResponse.json(
              { success: false, error: 'Erreur lors de la mise à jour du formateur' },
              { status: 500 }
            );
          }
          finalTuteur = updatedTuteur;
        } else {
          return NextResponse.json(
            { success: false, error: `Erreur lors de la création du formateur: ${tuteurError.message}` },
            { status: 500 }
          );
        }
      } else {
        finalTuteur = newTuteur;
      }

      // Assigner les formations si fournies
      if (Array.isArray(formations) && formations.length > 0) {
        const formationRows = formations.map((fid: number) => ({
          tuteur_id: finalTuteur.id,
          formation_id: fid,
        }));
        await supabase
          .from('tuteur_formations')
          .upsert(formationRows, { onConflict: 'tuteur_id,formation_id' });
      }

      await logUpdate(
        request,
        'administrateurs',
        id,
        adminToUpdate,
        finalTuteur,
        ['role'],
        `Changement de rôle: administrateur → formateur pour ${prenom} ${nom}`
      ).catch(() => {});

      return NextResponse.json({
        success: true,
        message: 'Rôle changé en formateur avec succès.',
        admin: {
          ...finalTuteur,
          nom: nom.toUpperCase(),
          prenom: prenom.toUpperCase(),
          email: email.toLowerCase(),
          role_secondaire: 'pedagogie',
          service: ecole || null,
        },
        credentials: {
          email: email.toLowerCase(),
          password: tempPassword,
        },
      });
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
      await logUpdate(request, 'administrateurs', id, adminToUpdate, {
        nom, prenom, email, role, ecole
      }, undefined, `Échec de mise à jour d'administrateur: ${updateError.message}`).catch(() => {});

      return NextResponse.json(
        { success: false, error: `Erreur lors de la mise à jour: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Logger la mise à jour
    const changedFields: string[] = [];
    if (adminToUpdate.nom !== nom.toUpperCase()) changedFields.push('nom');
    if (adminToUpdate.prenom !== prenom.toUpperCase()) changedFields.push('prenom');
    if (adminToUpdate.email !== email.toLowerCase()) changedFields.push('email');
    if (adminToUpdate.role_secondaire !== role_secondaire) changedFields.push('role_secondaire');
    if (adminToUpdate.service !== service) changedFields.push('service');

    await logUpdate(
      request,
      'administrateurs',
      id,
      adminToUpdate,
      updatedAdmin,
      changedFields,
      `Mise à jour de l'administrateur ${updatedAdmin.prenom} ${updatedAdmin.nom}`
    ).catch(() => {});

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

// DELETE - Supprimer un administrateur ou formateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Vérifier si c'est un tuteur (formateur) - les IDs tuteurs sont préfixés avec "tuteur_"
    const isTuteur = id.startsWith('tuteur_');

    if (isTuteur) {
      const tuteurId = id.replace('tuteur_', '');

      const { data: tuteurToDelete, error: fetchError } = await supabase
        .from('tuteurs')
        .select('*')
        .eq('id', tuteurId)
        .maybeSingle();

      if (fetchError || !tuteurToDelete) {
        return NextResponse.json(
          { success: false, error: 'Formateur non trouvé' },
          { status: 404 }
        );
      }

      // Empêcher de se supprimer soi-même
      if (tuteurToDelete.user_id === user.id) {
        return NextResponse.json(
          { success: false, error: 'Vous ne pouvez pas vous supprimer vous-même' },
          { status: 403 }
        );
      }

      const userIdToDelete = tuteurToDelete.user_id;

      // 1. Supprimer l'entrée dans tuteurs
      const { error: deleteTuteurError } = await supabase
        .from('tuteurs')
        .delete()
        .eq('id', tuteurId);

      if (deleteTuteurError) {
        return NextResponse.json(
          { success: false, error: `Erreur lors de la suppression du formateur: ${deleteTuteurError.message}` },
          { status: 500 }
        );
      }

      // 2. Supprimer l'entrée dans user_profiles
      await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userIdToDelete);

      // 3. Supprimer l'utilisateur dans auth.users
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userIdToDelete);

      if (deleteUserError) {
        return NextResponse.json(
          { success: false, error: `Erreur lors de la suppression de l'utilisateur: ${deleteUserError.message}` },
          { status: 500 }
        );
      }

      await logDelete(
        request,
        'tuteurs',
        tuteurId,
        tuteurToDelete,
        `Suppression du formateur (user_id: ${userIdToDelete})`
      ).catch(() => {});

      return NextResponse.json({
        success: true,
        message: 'Formateur et utilisateur supprimés avec succès',
      });
    }

    // === ADMIN: Logique existante ===
    const { data: adminToDelete, error: fetchError } = await supabase
      .from('administrateurs')
      .select('*')
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

    // Empêcher un administrateur de se supprimer lui-même
    if (adminToDelete.user_id === user.id) {
      return NextResponse.json(
        { success: false, error: 'Vous ne pouvez pas vous supprimer vous-même' },
        { status: 403 }
      );
    }

    const userIdToDelete = adminToDelete.user_id;

    // 1. Supprimer l'entrée dans administrateurs
    const { error: deleteAdminError } = await supabase
      .from('administrateurs')
      .delete()
      .eq('id', id);

    if (deleteAdminError) {
      return NextResponse.json(
        { success: false, error: `Erreur lors de la suppression de l'administrateur: ${deleteAdminError.message}` },
        { status: 500 }
      );
    }

    // 2. Supprimer l'entrée dans user_profiles
    const { error: deleteProfileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userIdToDelete);

    if (deleteProfileError) {
      console.warn('Impossible de supprimer le user_profile (peut-être qu\'il n\'existe pas)');
    }

    // 3. Supprimer l'utilisateur dans auth.users
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userIdToDelete);

    if (deleteUserError) {
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

    // Logger la suppression
    await logDelete(
      request,
      'administrateurs',
      id,
      adminToDelete,
      `Suppression de l'administrateur ${adminToDelete.nom} ${adminToDelete.prenom} (${adminToDelete.email})`
    ).catch(() => {});

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
