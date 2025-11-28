import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';

// GET - Récupérer les détails d'un lead ou candidat
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
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

    const { type, id } = await params;
    const supabase = getSupabaseServerClient();

    // Récupérer le profil depuis user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .eq('role', type)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'Profil non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer la candidature associée
    const { data: candidature, error: candidatureError } = await supabase
      .from('candidatures')
      .select('*')
      .eq('user_id', profile.user_id)
      .maybeSingle();

    // Note: candidatureError peut être ignoré si la candidature n'existe pas encore (pour les leads)

    // Récupérer la formation si formation_id existe
    let formationData = null;
    if (profile.formation_id) {
      const { data: formation, error: formationError } = await supabase
        .from('formations')
        .select('id, titre, ecole, type_formation')
        .eq('id', profile.formation_id)
        .maybeSingle();

      if (!formationError && formation) {
        formationData = formation;
      }
    }

    // Formater les données
    const result = {
      id: profile.id,
      user_id: profile.user_id,
      role: profile.role,
      email: profile.email || candidature?.email || '',
      telephone: profile.telephone || candidature?.telephone || '',
      formation_id: profile.formation_id,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      // Données de candidature
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
        current_step: candidature.current_step || 'informations',
        status: candidature.status || 'draft',
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
      // Formation
      formation: formationData,
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

// PUT - Mettre à jour le rôle (débloquer l'accès à la plateforme)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    // Vérification des permissions
    const permissionResult = await requireAdminOrRole(user.id, ['admin', 'superadmin']);
    if ('error' in permissionResult) {
      return permissionResult.error;
    }

    const { type, id } = await params;
    const body = await request.json();
    const { action } = body;

    const supabase = getSupabaseServerClient();

    // Récupérer le profil avec le rôle
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_id, role')
      .eq('id', id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'Profil non trouvé' },
        { status: 404 }
      );
    }

    if (action === 'debloquer_acces') {
      // Vérifier que l'utilisateur n'est pas un lead (seuls les candidats peuvent être débloqués)
      if (profile.role === 'lead') {
        return NextResponse.json(
          { success: false, error: 'Impossible de débloquer l\'accès pour un lead. Seuls les candidats peuvent être débloqués.' },
          { status: 400 }
        );
      }
      // Changer le rôle à 'etudiant' et créer l'entrée dans la table etudiants
      // D'abord, mettre à jour user_profiles (ou supprimer car les étudiants n'ont pas de user_profile)
      // Ensuite, créer l'entrée dans etudiants
      
      // Récupérer formation_id depuis user_profiles
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('formation_id')
        .eq('id', id)
        .single();

      // Créer l'étudiant
      const { data: etudiant, error: etudiantError } = await supabase
        .from('etudiants')
        .insert({
          user_id: profile.user_id,
          formation_id: currentProfile?.formation_id || null,
          statut: 'inscrit',
        })
        .select()
        .single();

      if (etudiantError) {
        // Si l'étudiant existe déjà, on met à jour
        const { data: existingEtudiant } = await supabase
          .from('etudiants')
          .select('id')
          .eq('user_id', profile.user_id)
          .maybeSingle();

        if (existingEtudiant) {
          // Mettre à jour
          const { error: updateError } = await supabase
            .from('etudiants')
            .update({
              formation_id: currentProfile?.formation_id || null,
              statut: 'inscrit',
            })
            .eq('user_id', profile.user_id);

          if (updateError) {
            return NextResponse.json(
              { success: false, error: 'Erreur lors de la mise à jour' },
              { status: 500 }
            );
          }
        } else {
          return NextResponse.json(
            { success: false, error: 'Erreur lors de la création de l\'étudiant' },
            { status: 500 }
          );
        }
      }

      // Supprimer le user_profile (les étudiants n'ont pas de user_profile)
      await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);

      return NextResponse.json({
        success: true,
        message: 'Accès à la plateforme débloqué. L\'utilisateur est maintenant étudiant.',
      });

    } else if (action === 'supprimer_candidature') {
      // Récupérer la candidature avant de la supprimer pour obtenir les fichiers associés
      const { data: candidature, error: candidatureError } = await supabase
        .from('candidatures')
        .select('*')
        .eq('user_id', profile.user_id)
        .maybeSingle();

      if (candidatureError) {
        console.error('Erreur lors de la récupération de la candidature:', candidatureError);
      }

      // Si une candidature existe, supprimer tous les fichiers associés
      if (candidature) {
        const filesToDelete: string[] = [];

        // Collecter tous les chemins de fichiers
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

        // Supprimer les fichiers des buckets
        for (const filePath of filesToDelete) {
          if (filePath) {
            try {
              // Essayer user_documents
              await supabase.storage
                .from('user_documents')
                .remove([filePath]);
              
              // Essayer photo_profil
              await supabase.storage
                .from('photo_profil')
                .remove([filePath]);
            } catch (error) {
              // Continuer même si la suppression échoue
              console.warn(`Impossible de supprimer le fichier ${filePath}:`, error);
            }
          }
        }

        // Supprimer les paiements associés à cette candidature
        const { error: paiementsDeleteError } = await supabase
          .from('paiements')
          .delete()
          .eq('candidature_id', candidature.id);

        if (paiementsDeleteError) {
          console.error('Erreur lors de la suppression des paiements:', paiementsDeleteError);
        }

        // Supprimer la candidature
        const { error: candidatureDeleteError } = await supabase
          .from('candidatures')
          .delete()
          .eq('user_id', profile.user_id);

        if (candidatureDeleteError) {
          console.error('Erreur lors de la suppression de la candidature:', candidatureDeleteError);
          return NextResponse.json(
            { success: false, error: 'Erreur lors de la suppression de la candidature' },
            { status: 500 }
          );
        }
      }

      // Déconnecter l'utilisateur s'il est connecté (forcer la déconnexion)
      try {
        // Réinitialiser le mot de passe pour invalider toutes les sessions actives
        // Cela forcera la déconnexion immédiate de toutes les sessions
        const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) + 'A1!';
        const { error: signOutError } = await supabase.auth.admin.updateUserById(
          profile.user_id,
          {
            password: randomPassword,
            // Marquer les sessions comme invalidées
            app_metadata: {
              sessions_invalidated_at: new Date().toISOString()
            }
          }
        );
        
        if (signOutError) {
          console.warn('Impossible de déconnecter l\'utilisateur:', signOutError);
          // On continue quand même la suppression
        } else {
        }
      } catch (signOutException) {
        // Continuer même si la déconnexion échoue
        console.warn('Erreur lors de la tentative de déconnexion:', signOutException);
      }

      // Supprimer le user_profile
      const { error: profileDeleteError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);

      if (profileDeleteError) {
        console.error('Erreur lors de la suppression du user_profile:', profileDeleteError);
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la suppression du profil utilisateur' },
          { status: 500 }
        );
      }

      // Supprimer l'utilisateur de auth.users pour permettre la réinscription avec le même email
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(profile.user_id);

      if (deleteUserError) {
        // Erreur silencieuse
      }

      return NextResponse.json({
        success: true,
        message: 'Candidature, profil utilisateur et compte d\'authentification supprimés avec succès. L\'utilisateur peut maintenant se réinscrire avec le même email.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

