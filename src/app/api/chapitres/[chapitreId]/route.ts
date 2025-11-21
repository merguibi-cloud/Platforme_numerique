import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';
import { getChapitreByIdServer } from '@/lib/chapitres-api';
import { logUpdate, logAuditAction } from '@/lib/audit-logger';

// GET - Récupérer un chapitre spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapitreId: string }> }
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

    const { chapitreId } = await params;

    // Récupérer le chapitre
    const { data: chapitre, error: chapitreError } = await supabase
      .from('chapitres_cours')
      .select(`
        *,
        cours_apprentissage (
          id,
          titre,
          bloc_id,
          blocs_competences (
            id,
            titre,
            formation_id
          )
        )
      `)
      .eq('id', chapitreId)
      .single();

    if (chapitreError) {
      console.error('Erreur lors de la récupération du chapitre:', chapitreError);
      return NextResponse.json({ error: 'Chapitre non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ chapitre });
  } catch (error) {
    console.error('Erreur dans l\'API chapitre:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour le statut d'un chapitre (actif/inactif)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ chapitreId: string }> }
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

    const { chapitreId } = await params;
    const body = await request.json();
    const { actif } = body;

    // Récupérer l'ancien chapitre pour le log
    const oldChapitreResult = await getChapitreByIdServer(parseInt(chapitreId));
    const oldChapitre = oldChapitreResult.success ? oldChapitreResult.chapitre : null;

    // Mettre à jour le statut du chapitre
    const { data: updatedChapitre, error: updateError } = await supabase
      .from('chapitres_cours')
      .update({ 
        actif: actif,
        updated_at: new Date().toISOString()
      })
      .eq('id', chapitreId)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur lors de la mise à jour du statut:', updateError);
      await logUpdate(
        request,
        'chapitres_cours',
        chapitreId,
        oldChapitre || {},
        { actif },
        ['actif'],
        `Échec de mise à jour du statut du chapitre: ${updateError.message}`
      ).catch(() => {});
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    // Logger la mise à jour du statut
    await logUpdate(
      request,
      'chapitres_cours',
      chapitreId,
      oldChapitre || {},
      updatedChapitre || { actif },
      ['actif'],
      `Mise à jour du statut du chapitre ${oldChapitre?.titre || chapitreId}: ${actif ? 'actif' : 'inactif'}`
    ).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur dans l\'API mise à jour statut chapitre:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

