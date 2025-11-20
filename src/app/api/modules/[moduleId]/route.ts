import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';
import { getCoursByIdServer } from '@/lib/cours-api';
import { logCreate, logUpdate, logDelete, logAuditAction } from '@/lib/audit-logger';

// GET - Récupérer les détails d'un module avec ses cours
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
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

    const { moduleId } = await params;

    // Récupérer le module avec ses cours
    const { data: module, error: moduleError } = await supabase
      .from('modules_apprentissage')
      .select(`
        id,
        bloc_id,
        numero_module,
        titre,
        description,
        type_module,
        duree_estimee,
        ordre_affichage,
        actif,
        created_at,
        updated_at,
        cours_contenu (
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
      .eq('id', moduleId)
      .single();

    if (moduleError) {
      console.error('Erreur lors de la récupération du module:', moduleError);
      return NextResponse.json({ error: 'Module non trouvé' }, { status: 404 });
    }

    // Déterminer le statut du module
    const coursCount = module.cours_contenu?.length || 0;
    const coursActifs = module.cours_contenu?.filter((c: any) => c.actif).length || 0;
    
    let statut: 'en_ligne' | 'brouillon' | 'manquant' = 'manquant';
    if (coursCount > 0) {
      if (coursActifs === coursCount && coursCount >= 2) {
        statut = 'en_ligne';
      } else {
        statut = 'brouillon';
      }
    }

    // Trier les cours par ordre d'affichage
    const coursTries = module.cours_contenu?.sort((a: any, b: any) => a.ordre_affichage - b.ordre_affichage) || [];

    return NextResponse.json({
      module: {
        id: module.id.toString(),
        titre: module.titre,
        description: module.description,
        type_module: module.type_module,
        duree_estimee: module.duree_estimee,
        ordre_affichage: module.ordre_affichage,
        numero_module: module.numero_module,
        statut,
        cours: coursTries,
        created_at: module.created_at,
        updated_at: module.updated_at,
        created_by: 'SYSTÈME' // TODO: Récupérer le nom de l'utilisateur créateur
      }
    });
  } catch (error) {
    console.error('Erreur dans l\'API détails module:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau cours dans un module
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
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

    const { moduleId } = await params;
    const body = await request.json();
    const { titre, description, type_contenu, contenu, url_video, duree_video } = body;

    // Créer le cours
    const { data: cours, error: coursError } = await supabase
      .from('cours_contenu')
      .insert({
        module_id: parseInt(moduleId),
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

    if (coursError) {
      console.error('Erreur lors de la création du cours:', coursError);
      await logCreate(request, 'cours_contenu', 'unknown', body, `Échec de création de cours: ${coursError.message}`).catch(() => {});
      return NextResponse.json({ error: 'Erreur lors de la création du cours' }, { status: 500 });
    }

    // Logger la création du cours
    await logCreate(request, 'cours_contenu', cours.id, cours, `Création du cours "${cours.titre}" dans le module ${moduleId}`).catch(() => {});

    return NextResponse.json({ 
      success: true, 
      cours: {
        id: cours.id.toString(),
        statut: 'brouillon'
      }
    });
  } catch (error) {
    console.error('Erreur dans l\'API création cours:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour un cours
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
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
    const { coursId, ...updateData } = body;

    // Récupérer l'ancien cours pour le log
    const oldCoursResult = await getCoursByIdServer(coursId);
    const oldCours = oldCoursResult.success ? oldCoursResult.cours : null;

    // Mettre à jour le cours
    const { data: updatedCours, error: updateError } = await supabase
      .from('cours_contenu')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', coursId)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur lors de la mise à jour du cours:', updateError);
      await logUpdate(request, 'cours_contenu', coursId, oldCours || {}, updateData, Object.keys(updateData), `Échec de mise à jour du cours: ${updateError.message}`).catch(() => {});
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    // Logger la mise à jour
    await logUpdate(request, 'cours_contenu', coursId, oldCours || {}, updatedCours || updateData, Object.keys(updateData), `Mise à jour du cours "${oldCours?.titre || coursId}"`).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur dans l\'API mise à jour cours:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un cours
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
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

    const { moduleId } = await params;
    const { searchParams } = new URL(request.url);
    const coursId = searchParams.get('coursId');

    if (!coursId) {
      return NextResponse.json({ error: 'ID du cours requis' }, { status: 400 });
    }

    // Récupérer le cours avant suppression pour le log
    const oldCoursResult = await getCoursByIdServer(parseInt(coursId));
    const oldCours = oldCoursResult.success ? oldCoursResult.cours : null;

    // Supprimer le cours
    const { error: deleteError } = await supabase
      .from('cours_contenu')
      .delete()
      .eq('id', coursId);

    if (deleteError) {
      console.error('Erreur lors de la suppression du cours:', deleteError);
      await logDelete(request, 'cours_contenu', coursId, oldCours || { id: coursId }, `Échec de suppression du cours: ${deleteError.message}`).catch(() => {});
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }

    // Logger la suppression
    await logDelete(request, 'cours_contenu', coursId, oldCours || { id: coursId }, `Suppression du cours "${oldCours?.titre || coursId}" du module ${moduleId}`).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur dans l\'API suppression cours:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
