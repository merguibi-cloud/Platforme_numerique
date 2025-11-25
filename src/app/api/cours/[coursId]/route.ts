import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, withRetry } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';
import { getCoursByIdServer } from '@/lib/cours-api';
import { getChapitreByIdServer } from '@/lib/chapitres-api';
import { logCreate, logUpdate, logDelete, logAuditAction } from '@/lib/audit-logger';

// GET - Récupérer les détails d'un cours avec ses chapitres
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coursId: string }> }
) {
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

    const { coursId } = await params;

    // Récupérer le cours avec ses chapitres (avec retry automatique)
    const { data: cours, error: coursError } = await withRetry(
      async () => {
        const result = await supabase
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
            chapitres_cours (
              id,
              titre,
              description,
              type_contenu,
              contenu,
              url_video,
              duree_video,
              ordre_affichage,
              actif,
              created_at,
              updated_at
            )
          `)
          .eq('id', coursId)
          .single();
        return result;
      },
      {
        onRetry: (attempt, error) => {
          console.warn(`[Retry ${attempt}] Erreur lors de la récupération du cours (${error.code || 'unknown'}):`, error.message);
        }
      }
    );

    if (coursError || !cours) {
      console.error('Erreur lors de la récupération du cours:', coursError);
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    // Déterminer le statut du cours
    const chapitresCount = cours.chapitres_cours?.length || 0;
    const chapitresActifs = cours.chapitres_cours?.filter((ch: any) => ch.actif).length || 0;
    
    let statut: 'en_ligne' | 'brouillon' | 'manquant' = 'manquant';
    if (chapitresCount > 0) {
      if (chapitresActifs === chapitresCount && chapitresCount >= 1) {
        statut = 'en_ligne';
      } else {
        statut = 'brouillon';
      }
    }

    // Trier les chapitres par ordre d'affichage
    const chapitresTries = cours.chapitres_cours?.sort((a: any, b: any) => a.ordre_affichage - b.ordre_affichage) || [];

    return NextResponse.json({
      cours: {
        id: cours.id.toString(),
        titre: cours.titre,
        description: cours.description,
        type_module: cours.type_module,
        duree_estimee: cours.duree_estimee,
        ordre_affichage: cours.ordre_affichage,
        numero_cours: cours.numero_cours,
        statut,
        chapitres: chapitresTries,
        created_at: cours.created_at,
        updated_at: cours.updated_at,
        created_by: 'SYSTÈME' // TODO: Récupérer le nom de l'utilisateur créateur
      }
    });
  } catch (error) {
    console.error('Erreur dans l\'API détails cours:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau chapitre dans un cours
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ coursId: string }> }
) {
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

    const { coursId } = await params;
    const body = await request.json();
    const { titre, description, type_contenu, contenu, url_video, duree_video } = body;

    // Créer le chapitre
    const { data: chapitre, error: chapitreError } = await supabase
      .from('chapitres_cours')
      .insert({
        cours_id: parseInt(coursId),
        titre,
        description: description || '',
        type_contenu: type_contenu || 'texte',
        contenu: contenu || '',
        url_video: url_video || null,
        duree_video: duree_video || null,
        ordre_affichage: 0, // TODO: Calculer le prochain ordre
        actif: false // Par défaut en brouillon
      })
      .select()
      .single();

    if (chapitreError) {
      console.error('Erreur lors de la création du chapitre:', chapitreError);
      await logCreate(request, 'chapitres_cours', 'unknown', body, `Échec de création de chapitre: ${chapitreError.message}`).catch(() => {});
      return NextResponse.json({ error: 'Erreur lors de la création du chapitre' }, { status: 500 });
    }

    // Logger la création du chapitre
    await logCreate(request, 'chapitres_cours', chapitre.id, chapitre, `Création du chapitre "${chapitre.titre}" dans le cours ${coursId}`).catch(() => {});

    return NextResponse.json({ 
      success: true, 
      chapitre: {
        id: chapitre.id.toString(),
        statut: 'brouillon'
      }
    });
  } catch (error) {
    console.error('Erreur dans l\'API création chapitre:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour un chapitre
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ coursId: string }> }
) {
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
    const { chapitreId, ...updateData } = body;

    // Récupérer l'ancien chapitre pour le log
    const oldChapitreResult = await getChapitreByIdServer(chapitreId);
    const oldChapitre = oldChapitreResult.success ? oldChapitreResult.chapitre : null;

    // Mettre à jour le chapitre
    const { data: updatedChapitre, error: updateError } = await supabase
      .from('chapitres_cours')
      .update({ 
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', chapitreId)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur lors de la mise à jour du chapitre:', updateError);
      await logUpdate(request, 'chapitres_cours', chapitreId, oldChapitre || {}, updateData, Object.keys(updateData), `Échec de mise à jour du chapitre: ${updateError.message}`).catch(() => {});
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    // Logger la mise à jour
    await logUpdate(request, 'chapitres_cours', chapitreId, oldChapitre || {}, updatedChapitre || updateData, Object.keys(updateData), `Mise à jour du chapitre "${oldChapitre?.titre || chapitreId}"`).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur dans l\'API mise à jour chapitre:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un chapitre
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ coursId: string }> }
) {
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

    const { coursId } = await params;
    const { searchParams } = new URL(request.url);
    const chapitreIdParam = searchParams.get('chapitreId');

    if (!chapitreIdParam) {
      return NextResponse.json({ error: 'ID du chapitre requis' }, { status: 400 });
    }

    const chapitreId = parseInt(chapitreIdParam, 10);

    // Récupérer le chapitre avant suppression pour le log
    const oldChapitreResult = await getChapitreByIdServer(chapitreId);
    const oldChapitre = oldChapitreResult.success ? oldChapitreResult.chapitre : null;

    // Supprimer le chapitre
    const { error: deleteError } = await supabase
      .from('chapitres_cours')
      .delete()
      .eq('id', chapitreId)
      .eq('cours_id', coursId);

    if (deleteError) {
      console.error('Erreur lors de la suppression du chapitre:', deleteError);
      await logDelete(request, 'chapitres_cours', chapitreId.toString(), oldChapitre || { id: chapitreId }, `Échec de suppression du chapitre: ${deleteError.message}`).catch(() => {});
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }

    // Logger la suppression
    await logDelete(request, 'chapitres_cours', chapitreId.toString(), oldChapitre || { id: chapitreId }, `Suppression du chapitre "${oldChapitre?.titre || chapitreId}" du cours ${coursId}`).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur dans l\'API suppression chapitre:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
