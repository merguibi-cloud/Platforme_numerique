import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { updateBlocServer, deleteBlocServer, getBlocsByFormationIdServer, getModulesByBlocIdServer, getUserProfileServer } from '@/lib/blocs-api';
import { cookies } from 'next/headers';
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();
    // Récupérer le token d'accès depuis les cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 });
    }
    // Vérifier l'authentification avec le token
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Token invalide'
      }, { status: 401 });
    }
    // Récupérer le profil utilisateur pour vérifier le rôle
    const profile = await getUserProfileServer(user.id);
    if (!profile) {
      return NextResponse.json({
        success: false,
        error: 'Profil utilisateur non trouvé'
      }, { status: 404 });
    }
    // Vérifier les permissions (admin, superadmin, pedagogie)
    const allowedRoles = ['admin', 'superadmin', 'pedagogie'];
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json({
        success: false,
        error: 'Permissions insuffisantes. Seuls les administrateurs peuvent créer des blocs.'
      }, { status: 403 });
    }
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
    // Créer les modules associés
    const modulesToInsert = body.modules.map((moduleTitre: string, index: number) => ({
      bloc_id: bloc.id,
      numero_module: index + 1,
      titre: moduleTitre,
      type_module: 'cours', // Default type
      ordre_affichage: index + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    const { data: modules, error: modulesError } = await supabase
      .from('modules_apprentissage')
      .insert(modulesToInsert)
      .select();
    if (modulesError) {
      // Tenter de supprimer le bloc si les modules échouent
      await supabase.from('blocs_competences').delete().eq('id', bloc.id);
      return NextResponse.json({ success: false, error: 'Erreur lors de la création des modules' }, { status: 500 });
    }
    return NextResponse.json({ success: true, bloc, modules }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur de traitement interne du serveur' },
      { status: 500 }
    );
  }
}
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const formationId = searchParams.get('formationId');
    const blocId = searchParams.get('blocId');
    // Si blocId est fourni, récupérer les modules du bloc
    if (blocId) {
      // Récupérer le token d'accès depuis les cookies
      const cookieStore = await cookies();
      const accessToken = cookieStore.get('sb-access-token')?.value;
      if (!accessToken) {
        return NextResponse.json({
          error: 'Non authentifié'
        }, { status: 401 });
      }
      // Vérifier l'authentification avec le token
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return NextResponse.json({
          error: 'Token invalide'
        }, { status: 401 });
      }
      // Récupérer les modules via fonction côté serveur
      const modules = await getModulesByBlocIdServer(parseInt(blocId));
      return NextResponse.json({ modules: modules || [] });
    }
    // Sinon, récupérer les blocs de la formation
    if (!formationId) {
      return NextResponse.json({
        error: 'ID de formation requis'
      }, { status: 400 });
    }
    // Récupérer le token d'accès depuis les cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    if (!accessToken) {
      return NextResponse.json({
        error: 'Non authentifié'
      }, { status: 401 });
    }
    // Vérifier l'authentification avec le token
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({
        error: 'Token invalide'
      }, { status: 401 });
    }
    // Récupérer les blocs via fonction côté serveur
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
    const supabase = getSupabaseServerClient();
    const body = await request.json();
    // Récupérer le token d'accès depuis les cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 });
    }
    // Vérifier l'authentification avec le token
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Token invalide'
      }, { status: 401 });
    }
    // Récupérer le profil utilisateur pour vérifier le rôle
    const profile = await getUserProfileServer(user.id);
    if (!profile) {
      return NextResponse.json({
        success: false,
        error: 'Profil utilisateur non trouvé'
      }, { status: 404 });
    }
    // Vérifier les permissions (admin, superadmin, pedagogie)
    const allowedRoles = ['admin', 'superadmin', 'pedagogie'];
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json({
        success: false,
        error: 'Permissions insuffisantes. Seuls les administrateurs peuvent modifier des blocs.'
      }, { status: 403 });
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
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const blocId = searchParams.get('blocId');
    if (!blocId) {
      return NextResponse.json({
        success: false,
        error: 'ID de bloc requis'
      }, { status: 400 });
    }
    // Récupérer le token d'accès depuis les cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 });
    }
    // Vérifier l'authentification avec le token
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Token invalide'
      }, { status: 401 });
    }
    // Récupérer le profil utilisateur pour vérifier le rôle
    const profile = await getUserProfileServer(user.id);
    if (!profile) {
      return NextResponse.json({
        success: false,
        error: 'Profil utilisateur non trouvé'
      }, { status: 404 });
    }
    // Vérifier les permissions (admin, superadmin, pedagogie)
    const allowedRoles = ['admin', 'superadmin', 'pedagogie'];
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json({
        success: false,
        error: 'Permissions insuffisantes. Seuls les administrateurs peuvent supprimer des blocs.'
      }, { status: 403 });
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