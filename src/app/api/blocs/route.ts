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

    // Vérification des permissions (admin, pédagogie ou tuteur)
    const permissionResult = await requireAdminOrRole(user.id, ['admin', 'superadmin', 'pedagogie', 'tuteur']);
    if ('error' in permissionResult) {
      return NextResponse.json({
        success: false,
        error: 'Permissions insuffisantes pour créer un bloc.'
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
        description: body.description || '',
        duree_estimee: body.duree_estimee || null,
        ordre_affichage: nextBlocNumber,
        actif: true,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    if (blocError || !bloc) {
      console.error('Erreur création bloc:', blocError);
      // Si la colonne created_by n'existe pas encore, réessayer sans elle
      if (blocError?.code === '42703') {
        const { data: bloc2, error: bloc2Error } = await supabase
          .from('blocs_competences')
          .insert({
            formation_id: body.formation_id,
            numero_bloc: nextBlocNumber,
            titre: body.titre,
            description: body.description || '',
            duree_estimee: body.duree_estimee || null,
            ordre_affichage: nextBlocNumber,
            actif: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        if (bloc2Error || !bloc2) {
          console.error('Erreur création bloc (sans created_by):', bloc2Error);
          return NextResponse.json({ success: false, error: bloc2Error?.message || 'Erreur lors de la création du bloc' }, { status: 500 });
        }
        // Continuer avec bloc2
        const coursToInsert2 = (body.modules || []).map((moduleTitre: string, index: number) => ({
          bloc_id: bloc2.id,
          numero_cours: index + 1,
          titre: moduleTitre,
          description: '',
          type_module: 'cours',
          duree_estimee: 0,
          ordre_affichage: index + 1,
          actif: true,
          statut: 'brouillon',
          nombre_cours: 0,
          cours_actifs: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: user.id
        }));
        if (coursToInsert2.length > 0) {
          const { error: coursError2 } = await supabase.from('cours_apprentissage').insert(coursToInsert2);
          if (coursError2) {
            await supabase.from('blocs_competences').delete().eq('id', bloc2.id);
            return NextResponse.json({ success: false, error: 'Erreur lors de la création des cours' }, { status: 500 });
          }
        }
        return NextResponse.json({ success: true, bloc: bloc2 }, { status: 201 });
      }
      return NextResponse.json({ success: false, error: blocError?.message || 'Erreur lors de la création du bloc' }, { status: 500 });
    }
    // Créer les cours associés
    const coursToInsert = (body.modules || []).map((moduleTitre: string, index: number) => ({
      bloc_id: bloc.id,
      numero_cours: index + 1,
      titre: moduleTitre,
      description: '',
      type_module: 'cours',
      duree_estimee: 0,
      ordre_affichage: index + 1,
      actif: true,
      statut: 'brouillon',
      nombre_cours: 0,
      cours_actifs: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user.id
    }));
    const { data: cours, error: coursError } = await supabase
      .from('cours_apprentissage')
      .insert(coursToInsert)
      .select();
    if (coursError) {
      console.error('Erreur création cours:', JSON.stringify(coursError));
      // Tenter de supprimer le bloc si les cours échouent
      await supabase.from('blocs_competences').delete().eq('id', bloc.id);
      return NextResponse.json({ success: false, error: `Erreur cours: ${coursError.message} (code: ${coursError.code})` }, { status: 500 });
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

    // Vérification des permissions (admin, pédagogie ou tuteur)
    const permissionResult = await requireAdminOrRole(user.id, ['admin', 'superadmin', 'pedagogie', 'tuteur']);
    if ('error' in permissionResult) {
      return NextResponse.json({
        success: false,
        error: 'Permissions insuffisantes pour modifier un bloc.'
      }, { status: 403 });
    }

    const body = await request.json();

    // Les tuteurs ne peuvent modifier que leurs propres blocs
    if (!('admin' in permissionResult)) {
      const supabase = getSupabaseServerClient();
      const { data: blocCheck } = await supabase
        .from('blocs_competences')
        .select('created_by')
        .eq('id', body.blocId)
        .maybeSingle();
      if (!blocCheck || blocCheck.created_by !== user.id) {
        return NextResponse.json({
          success: false,
          error: 'Vous ne pouvez modifier que vos propres blocs.'
        }, { status: 403 });
      }
    }

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

    // Vérification des permissions (admin, pédagogie ou tuteur)
    const permissionResult = await requireAdminOrRole(user.id, ['admin', 'superadmin', 'pedagogie', 'tuteur']);
    if ('error' in permissionResult) {
      return NextResponse.json({
        success: false,
        error: 'Permissions insuffisantes pour supprimer un bloc.'
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

    // Les tuteurs ne peuvent supprimer que leurs propres blocs
    if (!('admin' in permissionResult)) {
      const supabase = getSupabaseServerClient();
      const { data: blocCheck } = await supabase
        .from('blocs_competences')
        .select('created_by')
        .eq('id', parseInt(blocId))
        .maybeSingle();
      if (!blocCheck || blocCheck.created_by !== user.id) {
        return NextResponse.json({
          success: false,
          error: 'Vous ne pouvez supprimer que vos propres blocs.'
        }, { status: 403 });
      }
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