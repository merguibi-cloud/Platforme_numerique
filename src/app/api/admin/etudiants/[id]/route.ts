import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';
import { logDelete } from '@/lib/audit-logger';

// GET - Récupérer les détails d'un étudiant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const supabase = getSupabaseServerClient();

    // Récupérer l'étudiant par id
    const { data: etudiant, error: etudiantError } = await supabase
      .from('etudiants')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (etudiantError || !etudiant) {
      return NextResponse.json(
        { success: false, error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les informations utilisateur depuis auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(etudiant.user_id);

    // Récupérer les informations depuis candidatures
    const { data: candidature, error: candidatureError } = await supabase
      .from('candidatures')
      .select('*')
      .eq('user_id', etudiant.user_id)
      .maybeSingle();

    // Récupérer la formation si elle existe
    let formationData = null;
    if (etudiant.formation_id) {
      const { data: formation, error: formationError } = await supabase
        .from('formations')
        .select('id, titre, ecole, type_formation, description')
        .eq('id', etudiant.formation_id)
        .maybeSingle();

      if (!formationError && formation) {
        formationData = formation;
      }
    }

    // Construire la réponse avec toutes les informations
    const result = {
      id: etudiant.id,
      user_id: etudiant.user_id,
      statut: etudiant.statut,
      date_inscription: etudiant.date_inscription,
      created_at: etudiant.created_at,
      updated_at: etudiant.updated_at,
      email: authUser?.user?.email || candidature?.email || '',
      telephone: candidature?.telephone || '',
      formation_id: etudiant.formation_id,
      formation: formationData,
      candidature: candidature ? {
        id: candidature.id,
        civilite: candidature.civilite || '',
        nom: candidature.nom || '',
        prenom: candidature.prenom || '',
        adresse: candidature.adresse || '',
        code_postal: candidature.code_postal || '',
        ville: candidature.ville || '',
        pays: candidature.pays || '',
        date_naissance: candidature.date_naissance || '',
        type_formation: candidature.type_formation || '',
        etudiant_etranger: candidature.etudiant_etranger || 'non',
        a_une_entreprise: candidature.a_une_entreprise || 'non',
        email: candidature.email || '',
        telephone: candidature.telephone || '',
        // Documents
        photo_identite_path: candidature.photo_identite_path,
        cv_path: candidature.cv_path,
        diplome_path: candidature.diplome_path,
        releves_paths: candidature.releves_paths || [],
        piece_identite_paths: candidature.piece_identite_paths || [],
        lettre_motivation_path: candidature.lettre_motivation_path,
        created_at: candidature.created_at,
        paid_at: candidature.paid_at,
      } : null,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des détails:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un étudiant et toutes ses références
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const supabase = getSupabaseServerClient();

    // Récupérer l'étudiant avant de le supprimer
    const { data: etudiant, error: etudiantError } = await supabase
      .from('etudiants')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (etudiantError || !etudiant) {
      return NextResponse.json(
        { success: false, error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    const userIdToDelete = etudiant.user_id;

    console.log(`=== SUPPRESSION DE L'ÉTUDIANT ${id} (user_id: ${userIdToDelete}) ===`);

    // 1. Supprimer les sessions de connexion
    console.log('1. Suppression des sessions de connexion...');
    const { error: sessionsDeleteError } = await supabase
      .from('sessions_connexion')
      .delete()
      .eq('user_id', userIdToDelete);
    if (sessionsDeleteError) {
      // Erreur silencieuse
    }

    // 2. Supprimer les notes
    const { error: notesDeleteError } = await supabase
      .from('notes_etudiants')
      .delete()
      .eq('user_id', userIdToDelete);
    if (notesDeleteError) {
      // Erreur silencieuse
    }

    // 3. Supprimer les tentatives de quiz
    const { error: tentativesDeleteError } = await supabase
      .from('tentatives_quiz')
      .delete()
      .eq('user_id', userIdToDelete);
    if (tentativesDeleteError) {
      // Erreur silencieuse
    }

    // 4. Supprimer les soumissions d'étude de cas
    const { error: soumissionsDeleteError } = await supabase
      .from('soumissions_etude_cas')
      .delete()
      .eq('user_id', userIdToDelete);
    if (soumissionsDeleteError) {
      // Erreur silencieuse
    }

    // 5. Supprimer les progressions
    const { error: progressionDeleteError } = await supabase
      .from('progression_etudiants')
      .delete()
      .eq('user_id', userIdToDelete);
    if (progressionDeleteError) {
      // Erreur silencieuse
    }

    // 6. Supprimer les événements de l'agenda
    const { error: agendaDeleteError } = await supabase
      .from('agenda_etudiants')
      .delete()
      .eq('etudiant_id', id);
    if (agendaDeleteError) {
      // Erreur silencieuse
    }

    // 7. Supprimer les réponses de quiz
    const { error: reponsesDeleteError } = await supabase
      .from('reponses_quiz')
      .delete()
      .eq('user_id', userIdToDelete);
    if (reponsesDeleteError) {
      // Erreur silencieuse
    }

    // 8. Supprimer l'étudiant
    const { error: etudiantDeleteError } = await supabase
      .from('etudiants')
      .delete()
      .eq('id', id);
    if (etudiantDeleteError) {
      return NextResponse.json(
        { success: false, error: `Erreur lors de la suppression de l'étudiant` },
        { status: 500 }
      );
    }

    // 9. Supprimer la candidature si elle existe
    const { data: candidature } = await supabase
      .from('candidatures')
      .select('*')
      .eq('user_id', userIdToDelete)
      .maybeSingle();

    if (candidature) {
      // Supprimer les fichiers associés
      const filesToDelete: string[] = [];
      if (candidature.photo_identite_path) filesToDelete.push(candidature.photo_identite_path);
      if (candidature.cv_path) filesToDelete.push(candidature.cv_path);
      if (candidature.diplome_path) filesToDelete.push(candidature.diplome_path);
      if (candidature.lettre_motivation_path) filesToDelete.push(candidature.lettre_motivation_path);
      if (candidature.releves_paths && Array.isArray(candidature.releves_paths)) {
        filesToDelete.push(...candidature.releves_paths);
      }
      if (candidature.piece_identite_paths && Array.isArray(candidature.piece_identite_paths)) {
        filesToDelete.push(...candidature.piece_identite_paths);
      }

      for (const filePath of filesToDelete) {
        if (filePath) {
          try {
            await supabase.storage.from('user_documents').remove([filePath]);
            await supabase.storage.from('photo_profil').remove([filePath]);
          } catch (error) {
            // Erreur silencieuse
          }
        }
      }

      // Supprimer les paiements
      await supabase.from('paiements').delete().eq('candidature_id', candidature.id);

      // Supprimer la candidature
      await supabase.from('candidatures').delete().eq('user_id', userIdToDelete);
    }

    // 10. Supprimer le user_profile
    const { error: profileDeleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userIdToDelete);
    if (profileDeleteError) {
      // Erreur silencieuse
    }

    // 11. Déconnecter l'utilisateur s'il est connecté
    try {
      const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) + 'A1!';
      await supabase.auth.admin.updateUserById(userIdToDelete, {
        password: randomPassword,
        app_metadata: {
          sessions_invalidated_at: new Date().toISOString()
        }
      });
    } catch (signOutException) {
      // Erreur silencieuse
    }

    // 12. Supprimer l'utilisateur de auth.users
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userIdToDelete);
    if (deleteUserError) {
      return NextResponse.json(
        { success: false, error: `Erreur lors de la suppression de l'utilisateur` },
        { status: 500 }
      );
    }
    // Enregistrer dans audit_log
    try {
      await logDelete(
        request,
        'etudiants',
        id,
        {
          etudiant_id: id,
          user_id: userIdToDelete,
          email: etudiant.email || null,
          formation_id: etudiant.formation_id || null,
        },
        `Suppression complète de l'étudiant ${id} et de toutes ses données associées`
      );
    } catch (auditError) {
      // Ne pas bloquer si l'audit log échoue
    }

    return NextResponse.json({
      success: true,
      message: 'Étudiant et toutes ses références supprimés avec succès.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
