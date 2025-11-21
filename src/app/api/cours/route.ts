import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { createCoursWithChapitres } from '@/lib/cours-api';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';
import { logCreate, logUpdate, logDelete, logAuditAction } from '@/lib/audit-logger';
import { getChapitreByIdServer } from '@/lib/chapitres-api';

// GET - Récupérer les cours d'un bloc avec gestion des permissions
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    
    const { searchParams } = new URL(request.url);
    const formationId = searchParams.get('formationId');
    const blocId = searchParams.get('blocId');

    if (!blocId) {
      return NextResponse.json({ error: 'ID du bloc requis' }, { status: 400 });
    }

    // Récupérer les cours du bloc (pour l'admin, on charge tous les cours même inactifs)
    const { data: cours, error: coursError } = await supabase
      .from('cours_apprentissage')
      .select(`
        id,
        bloc_id,
        numero_cours,
        titre,
        description,
        type_module,
        duree_estimee,
        ordre_affichage,
        actif,
        created_at,
        updated_at,
        created_by
      `)
      .eq('bloc_id', blocId)
      // Pas de filtre actif pour l'admin - on veut voir tous les cours
      .order('ordre_affichage');

    if (coursError) {
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
    const coursIds = (cours ?? []).map((c) => c.id);

    const { data: chapitresData, error: chapitresError } =
      coursIds.length > 0
        ? await supabase
            .from('chapitres_cours')
            .select('id, cours_id, titre, actif, updated_at')
            .in('cours_id', coursIds)
            // Pas de filtre actif pour l'admin - on veut voir tous les chapitres
        : { data: [], error: null };

    if (chapitresError) {
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    const chapitresByCours = new Map<number, { id: number; titre: string; actif: boolean; updated_at: string | null }[]>();
    chapitresData?.forEach((chapitre) => {
      const list = chapitresByCours.get(chapitre.cours_id) ?? [];
      list.push({
        id: chapitre.id,
        titre: chapitre.titre,
        actif: Boolean(chapitre.actif),
        updated_at: chapitre.updated_at ?? null,
      });
      chapitresByCours.set(chapitre.cours_id, list);
    });

    // Récupérer les études de cas pour chaque cours (via les chapitres)
    const chapitreIds = chapitresData?.map(c => c.id) ?? [];
    const { data: etudesCasData, error: etudesCasError } =
      chapitreIds.length > 0
        ? await supabase
            .from('etudes_cas')
            .select('id, chapitre_id, actif')
            .in('chapitre_id', chapitreIds)
            .eq('actif', true)
        : { data: [], error: null };

    if (etudesCasError) {
      console.error('Erreur lors de la récupération des études de cas:', etudesCasError);
    }

    // Créer une map chapitre_id -> cours_id pour trouver le cours parent
    const chapitreToCours = new Map<number, number>();
    chapitresData?.forEach((chapitre) => {
      chapitreToCours.set(chapitre.id, chapitre.cours_id);
    });

    const etudesCasByCours = new Set<number>();
    etudesCasData?.forEach((etudeCas) => {
      const coursId = chapitreToCours.get(etudeCas.chapitre_id);
      if (coursId) {
        etudesCasByCours.add(coursId);
      }
    });

    const creatorIds = Array.from(
      new Set(
        (cours || [])
          .map((c) => c.created_by)
          .filter((id): id is string => Boolean(id))
      )
    );

    const creatorNameMap = new Map<string, string>();

    if (creatorIds.length > 0) {
      const { data: adminProfiles } = await supabase
        .from('administrateurs')
        .select('user_id, nom, prenom')
        .in('user_id', creatorIds);

      adminProfiles?.forEach((profile) => {
        const name = [profile.prenom, profile.nom].filter(Boolean).join(' ').trim();
        if (name) {
          creatorNameMap.set(profile.user_id, name);
        }
      });
    }

    // Transformer les données pour l'interface
    const coursWithStatus = (cours || []).map(c => {
      const chapitresList = chapitresByCours.get(c.id) ?? [];
      const chapitresDetails = chapitresList.map((chapitre) => ({
        id: chapitre.id.toString(),
        titre: chapitre.titre,
      }));
      const chapitresTitles = chapitresDetails.map((chapitre) => chapitre.titre);
      const chapitresActifs = chapitresList.filter((chapitre) => chapitre.actif).length;

      let statut: 'en_ligne' | 'brouillon' | 'manquant' = 'brouillon';
      if (chapitresList.length === 0) {
        statut = 'manquant';
      } else if (chapitresActifs === chapitresList.length && chapitresList.length > 0) {
        statut = 'en_ligne';
      }

      const latestUpdate = chapitresList.length > 0
        ? chapitresList
            .map((chapitre) => chapitre.updated_at ?? c.updated_at)
            .concat(c.updated_at)
            .filter(Boolean)
            .map((date) => new Date(date as string))
            .sort((a, b) => b.getTime() - a.getTime())[0]
        : c.updated_at ? new Date(c.updated_at) : new Date(c.created_at);

      const creatorName = c.created_by
        ? creatorNameMap.get(c.created_by) || 'Administrateur'
        : 'Non renseigné';

      return {
        id: c.id.toString(),
        coursName: c.titre,
        chapitres: chapitresTitles,
        creationModification: latestUpdate
          ? latestUpdate.toLocaleDateString('fr-FR')
          : new Date(c.created_at).toLocaleDateString('fr-FR'),
        creePar: creatorName,
        statut,
        duree_estimee: c.duree_estimee || 0,
        chapitres_count: chapitresList.length,
        chapitres_actifs: chapitresActifs,
        ordre_affichage: c.ordre_affichage,
        numero_cours: c.numero_cours,
        chapitresDetails,
        hasEtudeCas: etudesCasByCours.has(c.id),
      };
    });

    
    // Retourner avec la clé "modules" pour compatibilité avec le code existant
    // mais aussi "cours" pour la nouvelle structure
    return NextResponse.json({ 
      modules: coursWithStatus,
      cours: coursWithStatus 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau cours
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    const { searchParams } = new URL(request.url);
    const formationId = searchParams.get('formationId');
    const blocId = searchParams.get('blocId');

    if (!blocId) {
      return NextResponse.json({ error: 'ID du bloc requis' }, { status: 400 });
    }

    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    // Vérification des permissions (admin ou rôles pédagogie)
    const permissionResult = await requireAdminOrRole(user.id, ['admin', 'superadmin', 'pedagogie']);
    if ('error' in permissionResult) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    // Récupérer le profil admin pour le nom du créateur
    let adminProfile: { nom?: string; prenom?: string } | null = null;
    if ('admin' in permissionResult) {
      adminProfile = {
        nom: permissionResult.admin.nom,
        prenom: permissionResult.admin.prenom
      };
    }

    const body = await request.json();
    const { titre, chapitres, description, type_module, coursId } = body;

    if (coursId) {
      const coursIdNumber = parseInt(coursId, 10);
      if (Number.isNaN(coursIdNumber)) {
        return NextResponse.json({ error: 'ID de cours invalide' }, { status: 400 });
      }

      const { data: existingCours, error: coursFetchError } = await supabase
        .from('cours_apprentissage')
        .select('id, bloc_id, titre, numero_cours, ordre_affichage, created_by, created_at, updated_at')
        .eq('id', coursIdNumber)
        .maybeSingle();

      if (coursFetchError) {
        return NextResponse.json({ error: 'Erreur lors de la récupération du cours' }, { status: 500 });
      }

      if (!existingCours) {
        return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 });
      }

      if (existingCours.bloc_id !== parseInt(blocId, 10)) {
        return NextResponse.json({ error: 'Cours non associé à ce bloc' }, { status: 400 });
      }

      // Normaliser les chapitres : peut être un tableau de strings ou un tableau d'objets {id?, titre}
      const chapitresNormalises = (chapitres || []).map((ch: string | { id?: number; titre: string }) => {
        if (typeof ch === 'string') {
          return { titre: ch.trim() };
        }
        return { id: ch.id, titre: ch.titre.trim() };
      }).filter((ch: { id?: number; titre: string }) => ch.titre);

      if (chapitresNormalises.length === 0) {
        return NextResponse.json({
          success: true,
          cours: existingCours,
          chapitres: [],
          message: 'Aucun chapitre à traiter',
        });
      }

      // Séparer les chapitres existants (avec ID) et les nouveaux (sans ID)
      const chapitresToUpdate = chapitresNormalises.filter((ch: { id?: number; titre: string }) => ch.id);
      const chapitresToInsert = chapitresNormalises.filter((ch: { id?: number; titre: string }) => !ch.id);

      // Récupérer tous les chapitres existants pour déterminer l'ordre et identifier ceux à supprimer
      const { data: allExistingChapitres, error: existingChapitresError } = await supabase
        .from('chapitres_cours')
        .select('id, ordre_affichage, titre')
        .eq('cours_id', coursIdNumber)
        .order('ordre_affichage', { ascending: true });

      if (existingChapitresError) {
        // Erreur silencieuse, on continue avec baseOrder = 0
      }

      // Identifier les chapitres à supprimer (ceux qui existent en DB mais ne sont plus dans la liste envoyée)
      const chapitresIdsToKeep = new Set(chapitresToUpdate.map((ch: { id?: number }) => ch.id).filter(Boolean));
      const chapitresToDelete = (allExistingChapitres || []).filter((ch: { id: number }) => !chapitresIdsToKeep.has(ch.id));

      const baseOrder = allExistingChapitres?.length ?? 0;
      const updatedChapitres: any[] = [];
      const newChapitres: any[] = [];

      // Supprimer les chapitres qui ne sont plus dans la liste
      if (chapitresToDelete.length > 0) {
        const chapitresIdsToDelete = chapitresToDelete.map((ch: { id: number }) => ch.id);
        
        const { error: deleteError } = await supabase
          .from('chapitres_cours')
          .delete()
          .in('id', chapitresIdsToDelete)
          .eq('cours_id', coursIdNumber);

        if (!deleteError) {
          for (const chapitre of chapitresToDelete) {
            await logDelete(request, 'chapitres_cours', chapitre.id, chapitre, `Suppression du chapitre "${chapitre.titre}" (retiré de la liste)`).catch(() => {});
          }
        }
      }

      // Mettre à jour les chapitres existants
      for (const chapitre of chapitresToUpdate) {
        if (chapitre.id) {
          const { data: updatedChapitre, error: updateError } = await supabase
            .from('chapitres_cours')
            .update({ titre: chapitre.titre })
            .eq('id', chapitre.id)
            .eq('cours_id', coursIdNumber)
            .select()
            .single();

          if (!updateError && updatedChapitre) {
            updatedChapitres.push(updatedChapitre);
            await logUpdate(request, 'chapitres_cours', chapitre.id, { titre: chapitre.titre }, updatedChapitre, ['titre'], `Mise à jour du chapitre "${chapitre.titre}"`).catch(() => {});
          }
        }
      }

      // Créer les nouveaux chapitres
      if (chapitresToInsert.length > 0) {
        const chapitresToInsertData = chapitresToInsert.map((ch: { titre: string }, index: number) => ({
          cours_id: coursIdNumber,
          titre: ch.titre,
          type_contenu: 'texte' as const,
          ordre_affichage: baseOrder + index + 1,
          actif: false,
        }));

        const { data: insertedChapitres, error: chapitresInsertError } = await supabase
          .from('chapitres_cours')
          .insert(chapitresToInsertData)
          .select();

        if (chapitresInsertError) {
          await logCreate(request, 'chapitres_cours', 'unknown', chapitresToInsertData, `Échec d'ajout de chapitres au cours: ${chapitresInsertError.message}`).catch(() => {});
        } else if (insertedChapitres) {
          newChapitres.push(...insertedChapitres);
          for (const chapitre of insertedChapitres) {
            await logCreate(request, 'chapitres_cours', chapitre.id, chapitre, `Ajout du chapitre "${chapitre.titre}" au cours ${existingCours.titre}`).catch(() => {});
          }
        }
      }

      const deletedCount = chapitresToDelete.length;
      const messageParts = [];
      if (deletedCount > 0) messageParts.push(`${deletedCount} chapitre(s) supprimé(s)`);
      if (updatedChapitres.length > 0) messageParts.push(`${updatedChapitres.length} chapitre(s) mis à jour`);
      if (newChapitres.length > 0) messageParts.push(`${newChapitres.length} nouveau(x) chapitre(s) ajouté(s)`);
      
      return NextResponse.json({
        success: true,
        cours: existingCours,
        chapitres: [...updatedChapitres, ...newChapitres],
        creatorName: null,
        message: messageParts.length > 0 ? messageParts.join('. ') + '.' : 'Aucune modification',
      });
    }

    // Normaliser les chapitres pour la création d'un nouveau cours
    // Peut être un tableau de strings ou un tableau d'objets {id?, titre}
    let chapitresNormalises: string[] = [];
    
    if (Array.isArray(chapitres)) {
      chapitresNormalises = chapitres
        .map((ch: string | { id?: number; titre: string }) => {
          if (typeof ch === 'string') {
            return ch.trim();
          }
          if (ch && typeof ch === 'object' && 'titre' in ch) {
            return ch.titre.trim();
          }
          return '';
        })
        .filter((titre: string) => titre);
    }
    
    // Utiliser la fonction CRUD existante pour créer un cours
    const result = await createCoursWithChapitres({
      bloc_id: parseInt(blocId),
      titre,
      description: description || '',
      type_module: (type_module as 'cours' | 'etude_cas' | 'quiz' | 'projet') || 'cours',
      chapitres: chapitresNormalises,
      created_by: user.id,
    });

    let creatorName =
      [user.user_metadata?.prenom, user.user_metadata?.nom].filter(Boolean).join(' ').trim() ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      '';

    if (!creatorName) {
      creatorName = [adminProfile?.prenom, adminProfile?.nom].filter(Boolean).join(' ').trim();
    }

    if (!creatorName) {
      creatorName = user.email ?? 'Administrateur';
    }

    if (!result.success) {
      await logCreate(request, 'cours_apprentissage', 'unknown', { titre, description, type_module }, `Échec de création de cours: ${result.error}`).catch(() => {});
      return NextResponse.json({ error: result.error || 'Erreur lors de la création du cours' }, { status: 500 });
    }

    // Logger la création du cours
    if (result.cours) {
      await logCreate(request, 'cours_apprentissage', result.cours.id, result.cours, `Création du cours "${result.cours.titre}"`).catch(() => {});
    }
    // Logger la création des chapitres
    if (result.chapitres && result.chapitres.length > 0) {
      for (const chapitre of result.chapitres) {
        await logCreate(request, 'chapitres_cours', chapitre.id, chapitre, `Création du chapitre "${chapitre.titre}" dans le cours`).catch(() => {});
      }
    }
    
    return NextResponse.json({ 
      success: true,
      cours: result.cours,
      chapitres: result.chapitres,
      creatorName,
      message: 'Cours créé avec succès'
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// PUT - Mettre à jour le statut d'un cours
export async function PUT(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    // Vérification des permissions (admin ou rôles pédagogie)
    const permissionResult = await requireAdminOrRole(user.id, ['admin', 'superadmin', 'pedagogie']);
    if ('error' in permissionResult) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const supabase = getSupabaseServerClient();

    const body = await request.json();
    const { coursId, action } = body;
    
    // Récupérer le cours pour le log
    const { data: cours } = await supabase
      .from('cours_apprentissage')
      .select('*')
      .eq('id', coursId)
      .single();

    if (action === 'publish') {
      // Publier le cours (mettre tous les chapitres en actif)
      const { error: updateError } = await supabase
        .from('chapitres_cours')
        .update({ actif: true })
        .eq('cours_id', coursId);

      if (updateError) {
        await logAuditAction(request, {
          action_type: 'VALIDATE',
          table_name: 'cours_apprentissage',
          resource_id: coursId.toString(),
          status: 'error',
          error_message: updateError.message,
          description: `Échec de publication du cours ${cours?.titre || coursId}`
        }).catch(() => {});
        return NextResponse.json({ error: 'Erreur lors de la publication' }, { status: 500 });
      }
      
      await logAuditAction(request, {
        action_type: 'VALIDATE',
        table_name: 'cours_apprentissage',
        resource_id: coursId.toString(),
        status: 'success',
        description: `Publication du cours "${cours?.titre || coursId}"`
      }).catch(() => {});
    } else if (action === 'unpublish') {
      // Dépublier le cours (mettre tous les chapitres en inactif)
      const { error: updateError } = await supabase
        .from('chapitres_cours')
        .update({ actif: false })
        .eq('cours_id', coursId);

      if (updateError) {
        await logAuditAction(request, {
          action_type: 'REJECT',
          table_name: 'cours_apprentissage',
          resource_id: coursId.toString(),
          status: 'error',
          error_message: updateError.message,
          description: `Échec de dépublication du cours ${cours?.titre || coursId}`
        }).catch(() => {});
        return NextResponse.json({ error: 'Erreur lors de la dépublication' }, { status: 500 });
      }
      
      await logAuditAction(request, {
        action_type: 'REJECT',
        table_name: 'cours_apprentissage',
        resource_id: coursId.toString(),
        status: 'success',
        description: `Dépublication du cours "${cours?.titre || coursId}"`
      }).catch(() => {});
    }
      
      return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un cours et ses chapitres
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const coursIdParam = searchParams.get('coursId');
    const scopeParam = searchParams.get('scope');
    const chapitreIdParam = searchParams.get('chapitreId');

    if (!coursIdParam) {
      return NextResponse.json({ error: 'ID du cours requis' }, { status: 400 });
    }

    const coursId = parseInt(coursIdParam, 10);
    if (Number.isNaN(coursId)) {
      return NextResponse.json({ error: 'ID du cours invalide' }, { status: 400 });
    }
    const scope = scopeParam === 'chapitre' ? 'chapitre' : 'cours';

    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    // Vérification des permissions (admin ou rôles pédagogie)
    const permissionResult = await requireAdminOrRole(user.id, ['admin', 'superadmin', 'pedagogie']);
    if ('error' in permissionResult) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    if (scope === 'chapitre') {
      if (!chapitreIdParam) {
        return NextResponse.json({ error: 'ID du chapitre requis pour cette action' }, { status: 400 });
      }

      const chapitreId = parseInt(chapitreIdParam, 10);
      if (Number.isNaN(chapitreId)) {
        return NextResponse.json({ error: 'ID du chapitre invalide' }, { status: 400 });
    }
    
      // Récupérer le chapitre avant suppression
      const oldChapitreResult = await getChapitreByIdServer(chapitreId);
      const oldChapitre = oldChapitreResult.success ? oldChapitreResult.chapitre : null;


      // 1. Supprimer les quiz associés au chapitre (avec leurs questions et réponses)
      const { data: quizzes, error: quizzesFetchError } = await supabase
        .from('quiz_evaluations')
        .select('id')
        .eq('chapitre_id', chapitreId);

      if (quizzesFetchError) {
        console.error('Erreur lors de la récupération des quiz:', quizzesFetchError);
      } else if (quizzes && quizzes.length > 0) {
        const quizIds = quizzes.map(q => q.id);

        // Récupérer les questions des quiz
        const { data: questions, error: questionsFetchError } = await supabase
          .from('questions_quiz')
          .select('id')
          .in('quiz_id', quizIds);

        if (questionsFetchError) {
          console.error('Erreur lors de la récupération des questions:', questionsFetchError);
        } else if (questions && questions.length > 0) {
          const questionIds = questions.map(q => q.id);

          // Supprimer les réponses possibles
          const { error: reponsesDeleteError } = await supabase
            .from('reponses_possibles')
            .delete()
            .in('question_id', questionIds);

          if (reponsesDeleteError) {
            console.error('Erreur lors de la suppression des réponses:', reponsesDeleteError);
          }

          // Supprimer les questions
          const { error: questionsDeleteError } = await supabase
            .from('questions_quiz')
            .delete()
            .in('quiz_id', quizIds);

          if (questionsDeleteError) {
            console.error('Erreur lors de la suppression des questions:', questionsDeleteError);
          }
        }

        // Supprimer les quiz
        const { error: quizzesDeleteError } = await supabase
          .from('quiz_evaluations')
          .delete()
          .eq('chapitre_id', chapitreId);

        if (quizzesDeleteError) {
          console.error('Erreur lors de la suppression des quiz:', quizzesDeleteError);
        }
      }

      // 2. Supprimer l'étude de cas associée au chapitre (avec ses questions et réponses)
      const { data: etudeCas, error: etudeCasFetchError } = await supabase
        .from('etudes_cas')
        .select('id')
        .eq('chapitre_id', chapitreId)
        .maybeSingle();

      if (etudeCasFetchError && etudeCasFetchError.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération de l\'étude de cas:', etudeCasFetchError);
      } else if (etudeCas) {

        // Récupérer les questions de l'étude de cas
        const { data: questionsEtudeCas, error: questionsEtudeCasFetchError } = await supabase
          .from('questions_etude_cas')
          .select('id')
          .eq('etude_cas_id', etudeCas.id);

        if (questionsEtudeCasFetchError) {
          console.error('Erreur lors de la récupération des questions d\'étude de cas:', questionsEtudeCasFetchError);
        } else if (questionsEtudeCas && questionsEtudeCas.length > 0) {
          const questionEtudeCasIds = questionsEtudeCas.map(q => q.id);

          // Supprimer les réponses possibles de l'étude de cas
          const { error: reponsesEtudeCasDeleteError } = await supabase
            .from('reponses_possibles_etude_cas')
            .delete()
            .in('question_id', questionEtudeCasIds);

          if (reponsesEtudeCasDeleteError) {
            console.error('Erreur lors de la suppression des réponses d\'étude de cas:', reponsesEtudeCasDeleteError);
          }

          // Supprimer les questions d'étude de cas
          const { error: questionsEtudeCasDeleteError } = await supabase
            .from('questions_etude_cas')
            .delete()
            .eq('etude_cas_id', etudeCas.id);

          if (questionsEtudeCasDeleteError) {
            console.error('Erreur lors de la suppression des questions d\'étude de cas:', questionsEtudeCasDeleteError);
          }
        }

        // Supprimer l'étude de cas
        const { error: etudeCasDeleteError } = await supabase
          .from('etudes_cas')
          .delete()
          .eq('chapitre_id', chapitreId);

        if (etudeCasDeleteError) {
          console.error('Erreur lors de la suppression de l\'étude de cas:', etudeCasDeleteError);
        }
      }

      // 3. Supprimer le chapitre
      const { error: singleChapitreDeleteError } = await supabase
        .from('chapitres_cours')
        .delete()
        .eq('id', chapitreId)
        .eq('cours_id', coursId);

      if (singleChapitreDeleteError) {
        console.error('Erreur lors de la suppression du chapitre:', singleChapitreDeleteError);
        await logDelete(request, 'chapitres_cours', chapitreId, oldChapitre || { id: chapitreId }, `Échec de suppression du chapitre: ${singleChapitreDeleteError.message}`).catch(() => {});
        return NextResponse.json({ error: 'Erreur lors de la suppression du chapitre' }, { status: 500 });
      }

      await logDelete(request, 'chapitres_cours', chapitreId, oldChapitre || { id: chapitreId }, `Suppression du chapitre "${oldChapitre?.titre || chapitreId}" et de tous ses éléments associés (quiz, étude de cas)`).catch(() => {});
    } else {
      // SUPPRESSION EN CASCADE : Supprimer tous les éléments associés au cours
      
      // 1. Récupérer tous les chapitres du cours
      const { data: chapitres, error: chapitresFetchError } = await supabase
        .from('chapitres_cours')
        .select('id')
        .eq('cours_id', coursId);

      if (chapitresFetchError) {
        console.error('Erreur lors de la récupération des chapitres:', chapitresFetchError);
        return NextResponse.json({ error: 'Erreur lors de la récupération des chapitres' }, { status: 500 });
      }

      const chapitreIds = (chapitres || []).map(c => c.id);

      // 2. Supprimer tous les quiz associés aux chapitres (avec leurs questions et réponses)
      if (chapitreIds.length > 0) {
        // Récupérer les quiz
        const { data: quizzes, error: quizzesFetchError } = await supabase
          .from('quiz_evaluations')
          .select('id')
          .in('chapitre_id', chapitreIds);

        if (quizzesFetchError) {
          return NextResponse.json({ error: `Erreur lors de la récupération des quiz: ${quizzesFetchError.message}` }, { status: 500 });
        } else if (quizzes && quizzes.length > 0) {
          const quizIds = quizzes.map(q => q.id);

          // Récupérer les questions des quiz
          const { data: questions, error: questionsFetchError } = await supabase
            .from('questions_quiz')
            .select('id')
            .in('quiz_id', quizIds);

          if (questionsFetchError) {
            console.error('Erreur lors de la récupération des questions:', questionsFetchError);
          } else if (questions && questions.length > 0) {
            const questionIds = questions.map(q => q.id);

            // Supprimer les réponses possibles
            const { error: reponsesDeleteError } = await supabase
              .from('reponses_possibles')
              .delete()
              .in('question_id', questionIds);

            if (reponsesDeleteError) {
              return NextResponse.json({ error: `Erreur lors de la suppression des réponses: ${reponsesDeleteError.message}` }, { status: 500 });
            }

            // Supprimer les questions
            const { error: questionsDeleteError } = await supabase
              .from('questions_quiz')
              .delete()
              .in('quiz_id', quizIds);

            if (questionsDeleteError) {
              return NextResponse.json({ error: `Erreur lors de la suppression des questions: ${questionsDeleteError.message}` }, { status: 500 });
            }
          }

          // Supprimer les quiz
          const { error: quizzesDeleteError } = await supabase
            .from('quiz_evaluations')
            .delete()
            .in('chapitre_id', chapitreIds);

          if (quizzesDeleteError) {
            return NextResponse.json({ error: `Erreur lors de la suppression des quiz: ${quizzesDeleteError.message}` }, { status: 500 });
          }
        }

        // 3. Supprimer toutes les études de cas associées aux chapitres (avec leurs questions et réponses)
        const { data: etudesCas, error: etudesCasFetchError } = await supabase
          .from('etudes_cas')
          .select('id')
          .in('chapitre_id', chapitreIds);

        if (etudesCasFetchError) {
          return NextResponse.json({ error: `Erreur lors de la récupération des études de cas: ${etudesCasFetchError.message}` }, { status: 500 });
        } else if (etudesCas && etudesCas.length > 0) {
          const etudeCasIds = etudesCas.map(e => e.id);

          // Récupérer les questions des études de cas
          const { data: questionsEtudeCas, error: questionsEtudeCasFetchError } = await supabase
            .from('questions_etude_cas')
            .select('id')
            .in('etude_cas_id', etudeCasIds);

          if (questionsEtudeCasFetchError) {
            console.error('Erreur lors de la récupération des questions d\'étude de cas:', questionsEtudeCasFetchError);
          } else if (questionsEtudeCas && questionsEtudeCas.length > 0) {
            const questionEtudeCasIds = questionsEtudeCas.map(q => q.id);

            // Supprimer les réponses possibles des études de cas
            const { error: reponsesEtudeCasDeleteError } = await supabase
              .from('reponses_possibles_etude_cas')
              .delete()
              .in('question_id', questionEtudeCasIds);

            if (reponsesEtudeCasDeleteError) {
              return NextResponse.json({ error: `Erreur lors de la suppression des réponses d'étude de cas: ${reponsesEtudeCasDeleteError.message}` }, { status: 500 });
            }

            // Supprimer les questions d'étude de cas
            const { error: questionsEtudeCasDeleteError } = await supabase
              .from('questions_etude_cas')
              .delete()
              .in('etude_cas_id', etudeCasIds);

            if (questionsEtudeCasDeleteError) {
              return NextResponse.json({ error: `Erreur lors de la suppression des questions d'étude de cas: ${questionsEtudeCasDeleteError.message}` }, { status: 500 });
            }
          }

          // Supprimer les études de cas
          const { error: etudesCasDeleteError } = await supabase
            .from('etudes_cas')
            .delete()
            .in('chapitre_id', chapitreIds);

          if (etudesCasDeleteError) {
            return NextResponse.json({ error: `Erreur lors de la suppression des études de cas: ${etudesCasDeleteError.message}` }, { status: 500 });
          }
        }
      }

      // 4. Supprimer tous les chapitres
      const { data: deletedChapitres, error: chapitresDeleteError } = await supabase
        .from('chapitres_cours')
        .delete()
        .eq('cours_id', coursId)
        .select();

      if (chapitresDeleteError) {
        return NextResponse.json({ error: `Erreur lors de la suppression des chapitres: ${chapitresDeleteError.message}` }, { status: 500 });
      }

      // 5. Supprimer le cours
      const { data: coursData, error: coursFetchError } = await supabase
        .from('cours_apprentissage')
        .select('titre')
        .eq('id', coursId)
        .single();

      if (coursFetchError && coursFetchError.code !== 'PGRST116') {
        console.error('[DELETE /cours] Erreur lors de la récupération du cours:', coursFetchError);
        return NextResponse.json({ error: `Erreur lors de la récupération du cours: ${coursFetchError.message}` }, { status: 500 });
      }

      // Vérifier d'abord que le cours existe
      const { data: existingCours, error: checkError } = await supabase
        .from('cours_apprentissage')
        .select('id, titre')
        .eq('id', coursId)
        .maybeSingle();

      if (checkError) {
        console.error('[DELETE /cours] Erreur lors de la vérification du cours:', checkError);
        return NextResponse.json({ error: `Erreur lors de la vérification du cours: ${checkError.message}` }, { status: 500 });
    }

      if (!existingCours) {
        console.error('[DELETE /cours] Cours non trouvé avec l\'ID:', coursId);
        return NextResponse.json({ error: 'Aucun cours trouvé avec cet ID' }, { status: 404 });
      }

      console.log(`[DELETE /cours] Cours trouvé:`, existingCours);

      // Supprimer le cours
      const { data: deletedCours, error: coursDeleteError } = await supabase
        .from('cours_apprentissage')
        .delete()
        .eq('id', coursId)
        .select();

      if (coursDeleteError) {
        return NextResponse.json({ error: `Erreur lors de la suppression du cours: ${coursDeleteError.message}` }, { status: 500 });
      }
      
      if (!deletedCours || deletedCours.length === 0) {
        return NextResponse.json({ error: 'Aucun cours supprimé (peut-être déjà supprimé ou contrainte de clé étrangère)' }, { status: 404 });
      }

      // Logger la suppression
      await logDelete(request, 'cours_apprentissage', coursId, coursData || { id: coursId }, `Suppression du cours "${coursData?.titre || coursId}" et de tous ses éléments associés (chapitres, quiz, études de cas)`).catch(() => {});
    }
    return NextResponse.json({
      success: true,
      scope,
      message: scope === 'cours' ? 'Cours supprimé avec succès' : 'Chapitre supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur dans l\'API suppression cours:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
