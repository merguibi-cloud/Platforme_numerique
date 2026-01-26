import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { updateBlocServer, deleteBlocServer, getBlocsByFormationIdServer, getModulesByBlocIdServer } from '@/lib/blocs-api';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:7',message:'POST /api/blocs - Entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
  // #endregion
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:11',message:'Auth result',data:{hasError:'error' in authResult},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    // Vérification des permissions (admin ou rôles pédagogie)
    const permissionResult = await requireAdminOrRole(user.id, ['admin', 'superadmin', 'pedagogie']);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:18',message:'Permission result',data:{hasError:'error' in permissionResult},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    if ('error' in permissionResult) {
      return NextResponse.json({
        success: false,
        error: 'Permissions insuffisantes. Seuls les administrateurs peuvent créer des blocs.'
      }, { status: 403 });
    }

    const supabase = getSupabaseServerClient();
    const body = await request.json();
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:26',message:'Request body received',data:{formation_id:body.formation_id,titre:body.titre,hasDescription:!!body.description,modulesCount:body.modules?.length,modules:body.modules},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    // Vérifier que la formation existe
    const { data: formation, error: formationError } = await supabase
      .from('formations')
      .select('id')
      .eq('id', body.formation_id)
      .single();
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:32',message:'Formation check',data:{found:!!formation,hasError:!!formationError,errorMessage:formationError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
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
    // Vérifier la structure de la table pour comprendre le problème d'ID
    // #region agent log
    const { data: tableInfo, error: tableInfoError } = await supabase.rpc('pg_get_table_def', { table_name: 'blocs_competences' }).single();
    fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:51',message:'Table info check',data:{hasTableInfo:!!tableInfo,hasError:!!tableInfoError,errorMessage:tableInfoError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H6'})}).catch(()=>{});
    // #endregion
    
    // Essayer de récupérer le prochain ID de la séquence
    let nextId: number | null = null;
    try {
      const { data: seqData, error: seqError } = await supabase.rpc('exec_sql', {
        query: `SELECT COALESCE((SELECT MAX(id) FROM blocs_competences), 0) + 1 as next_id`
      });
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:56',message:'Sequence query attempt',data:{hasSeqData:!!seqData,hasError:!!seqError,seqData,errorMessage:seqError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H6'})}).catch(()=>{});
      // #endregion
      
      // Alternative : Récupérer le max ID directement
      const { data: maxIdData, error: maxIdError } = await supabase
        .from('blocs_competences')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:64',message:'Max ID query',data:{maxId:maxIdData?.id,hasError:!!maxIdError,errorMessage:maxIdError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H6'})}).catch(()=>{});
      // #endregion
      nextId = maxIdData?.id ? maxIdData.id + 1 : 1;
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:70',message:'Error getting next ID',data:{errorMessage:err instanceof Error ? err.message : String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H6'})}).catch(()=>{});
      // #endregion
    }
    
    // Créer le bloc de compétences
    // Note: On ne spécifie pas 'id' ni 'created_at'/'updated_at' car Supabase les gère automatiquement
    // Mais si nextId est disponible, on l'utilise comme fallback
    const blocInsertData: any = {
      formation_id: body.formation_id,
      numero_bloc: nextBlocNumber,
      titre: body.titre,
      description: body.description || null,
      duree_estimee: body.duree_estimee || null,
      ordre_affichage: nextBlocNumber,
      actif: true // Actif par défaut pour être visible
    };
    
    // Si nextId est disponible, l'ajouter (temporaire pour debugging)
    if (nextId !== null) {
      blocInsertData.id = nextId;
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:85',message:'Before bloc insert with ID',data:{...blocInsertData,hasId:!!blocInsertData.id},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H6'})}).catch(()=>{});
    // #endregion
    const { data: bloc, error: blocError } = await supabase
      .from('blocs_competences')
      .insert(blocInsertData)
      .select()
      .single();
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:65',message:'Bloc insert result',data:{hasBloc:!!bloc,hasError:!!blocError,errorCode:blocError?.code,errorMessage:blocError?.message,errorDetails:blocError?.details,errorHint:blocError?.hint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    if (blocError || !bloc) {
      return NextResponse.json({ success: false, error: blocError?.message || 'Erreur lors de la création du bloc' }, { status: 500 });
    }
    // Créer les cours associés
    // Récupérer le max ID des cours pour générer les nouveaux IDs
    const { data: maxCoursIdData, error: maxCoursIdError } = await supabase
      .from('cours_apprentissage')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .single();
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:92',message:'Max cours ID query',data:{maxCoursId:maxCoursIdData?.id,hasError:!!maxCoursIdError},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    let nextCoursId = maxCoursIdData?.id ? maxCoursIdData.id + 1 : 1;
    
    // Note: On ne spécifie pas 'created_at'/'updated_at' car Supabase les gère automatiquement
    // Mais on doit spécifier l'ID manuellement car la séquence n'est pas configurée
    const coursToInsert = body.modules.map((moduleTitre: string, index: number) => ({
      id: nextCoursId + index, // Générer des IDs séquentiels
      bloc_id: bloc.id,
      numero_cours: index + 1,
      titre: moduleTitre,
      type_module: 'cours', // Default type
      ordre_affichage: index + 1,
      created_by: user.id,
      actif: true // Actif par défaut pour être visible
    }));
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:105',message:'Before cours insert with IDs',data:{coursCount:coursToInsert.length,firstCours:coursToInsert[0],nextCoursId},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    const { data: cours, error: coursError } = await supabase
      .from('cours_apprentissage')
      .insert(coursToInsert)
      .select();
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:83',message:'Cours insert result',data:{hasCours:!!cours,hasError:!!coursError,errorCode:coursError?.code,errorMessage:coursError?.message,errorDetails:coursError?.details,errorHint:coursError?.hint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    if (coursError) {
      // Tenter de supprimer le bloc si les cours échouent
      await supabase.from('blocs_competences').delete().eq('id', bloc.id);
      return NextResponse.json({ success: false, error: coursError?.message || 'Erreur lors de la création des cours' }, { status: 500 });
    }
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:88',message:'POST /api/blocs - Success',data:{blocId:bloc.id,coursCount:cours?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'ALL'})}).catch(()=>{});
    // #endregion
    return NextResponse.json({ success: true, bloc, cours }, { status: 201 });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:90',message:'POST /api/blocs - Exception caught',data:{errorMessage:error instanceof Error ? error.message : String(error),errorStack:error instanceof Error ? error.stack : undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
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