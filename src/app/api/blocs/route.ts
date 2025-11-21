import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { updateBlocServer, deleteBlocServer, getBlocsByFormationIdServer, getModulesByBlocIdServer } from '@/lib/blocs-api';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
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
      return NextResponse.json({
        success: false,
        error: 'Permissions insuffisantes. Seuls les administrateurs peuvent créer des blocs.'
      }, { status: 403 });
    }

    const supabase = getSupabaseServerClient();
    const body = await request.json();
    // Vérifier que la formation existe
    const { data: formation, error: formationError } = await supabase
      .from('formations')
      .select('id')
      .eq('id', body.formation_id)
      .single();
    if (formationError || !formation) {
      return NextResponse.json({ success: false, error: 'Formation non trouvée' }, { status: 404 });
    }
    // Calculer le prochain numéro de bloc disponible
    const { data: existingBlocs } = await supabase
      .from('blocs_competences')
      .select('numero_bloc')
      .eq('formation_id', body.formation_id)
      .order('numero_bloc', { ascending: true });
    let nextBlocNumber = 1;
    if (existingBlocs && existingBlocs.length > 0) {
      // Trouver le prochain numéro disponible
      const usedNumbers = existingBlocs.map(bloc => bloc.numero_bloc);
      while (usedNumbers.includes(nextBlocNumber)) {
        nextBlocNumber++;
      }
    }
    // Créer le bloc de compétences
    const { data: bloc, error: blocError } = await supabase
      .from('blocs_competences')
      .insert({
        formation_id: body.formation_id,
        numero_bloc: nextBlocNumber,
        titre: body.titre,
        description: body.description,
        duree_estimee: body.duree_estimee,
        ordre_affichage: nextBlocNumber,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    if (blocError || !bloc) {
      return NextResponse.json({ success: false, error: 'Erreur lors de la création du bloc' }, { status: 500 });
    }
    // Créer les cours associés
    const coursToInsert = body.modules.map((moduleTitre: string, index: number) => ({
      bloc_id: bloc.id,
      numero_cours: index + 1,
      titre: moduleTitre,
      type_module: 'cours', // Default type
      ordre_affichage: index + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user.id
    }));
    const { data: cours, error: coursError } = await supabase
      .from('cours_apprentissage')
      .insert(coursToInsert)
      .select();
    if (coursError) {
      // Tenter de supprimer le bloc si les cours échouent
      await supabase.from('blocs_competences').delete().eq('id', bloc.id);
      return NextResponse.json({ success: false, error: 'Erreur lors de la création des cours' }, { status: 500 });
    }
    return NextResponse.json({ success: true, bloc, cours }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur de traitement interne du serveur' },
      { status: 500 }
    );
  }
}
export async function GET(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { searchParams } = new URL(request.url);
    const formationId = searchParams.get('formationId');
    const blocId = searchParams.get('blocId');
    
    // Si blocId est fourni, récupérer les modules du bloc
    if (blocId) {
      const modules = await getModulesByBlocIdServer(parseInt(blocId));
      return NextResponse.json({ modules: modules || [] });
    }
    
    // Sinon, récupérer les blocs de la formation
    if (!formationId) {
      return NextResponse.json({
        error: 'ID de formation requis'
      }, { status: 400 });
    }
    
    const blocs = await getBlocsByFormationIdServer(parseInt(formationId));
    return NextResponse.json({ blocs: blocs || [] });
  } catch (error) {
    return NextResponse.json({
      error: 'Erreur de traitement'
    }, { status: 500 });
  }
}
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
      return NextResponse.json({
        success: false,
        error: 'Permissions insuffisantes. Seuls les administrateurs peuvent modifier des blocs.'
      }, { status: 403 });
    }

    const body = await request.json();
    // Mettre à jour le bloc
    const result = await updateBlocServer(body.blocId, {
      titre: body.titre,
      description: body.description,
      objectifs: body.objectifs,
      duree_estimee: body.duree_estimee
    }, user.id);
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Erreur lors de la modification du bloc'
      }, { status: 500 });
    }
    return NextResponse.json({ success: true, bloc: result.bloc }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur de traitement interne du serveur' },
      { status: 500 }
    );
  }
}
export async function DELETE(request: NextRequest) {
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
      return NextResponse.json({
        success: false,
        error: 'Permissions insuffisantes. Seuls les administrateurs peuvent supprimer des blocs.'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const blocId = searchParams.get('blocId');
    if (!blocId) {
      return NextResponse.json({
        success: false,
        error: 'ID de bloc requis'
      }, { status: 400 });
    }
    // Supprimer le bloc
    const result = await deleteBlocServer(parseInt(blocId), user.id);
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Erreur lors de la suppression du bloc'
      }, { status: 500 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur de traitement interne du serveur' },
      { status: 500 }
    );
  }
}