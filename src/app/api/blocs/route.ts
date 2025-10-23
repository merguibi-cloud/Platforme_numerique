import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { updateBlocServer, deleteBlocServer, getBlocsByFormationIdServer, getModulesByBlocIdServer, getUserProfileServer } from '@/lib/blocs-api';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('🔨 API: Création d\'un nouveau bloc - VERSION DYNAMIQUE');
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    console.log('📋 Données reçues:', body);
    console.log('🔍 Vérification: numero_bloc dans body?', 'numero_bloc' in body);

    // Récupérer le token d'accès depuis les cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    
    if (!accessToken) {
      console.log('❌ Aucun token d\'accès trouvé');
      return NextResponse.json({ 
        success: false, 
        error: 'Non authentifié' 
      }, { status: 401 });
    }

    // Vérifier l'authentification avec le token
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log('❌ Token invalide:', authError);
      return NextResponse.json({ 
        success: false, 
        error: 'Token invalide' 
      }, { status: 401 });
    }

    console.log('✅ Utilisateur authentifié:', user.email);

    // Récupérer le profil utilisateur pour vérifier le rôle
    const profile = await getUserProfileServer(user.id);

    if (!profile) {
      console.log('❌ Profil utilisateur non trouvé');
      return NextResponse.json({
        success: false,
        error: 'Profil utilisateur non trouvé'
      }, { status: 404 });
    }

    console.log('👤 Rôle utilisateur:', profile.role);

    // Vérifier les permissions (admin, superadmin, pedagogie)
    const allowedRoles = ['admin', 'superadmin', 'pedagogie'];
    if (!allowedRoles.includes(profile.role)) {
      console.log('❌ Permissions insuffisantes. Rôle:', profile.role);
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
      console.error('❌ Formation non trouvée:', formationError);
      return NextResponse.json({ success: false, error: 'Formation non trouvée' }, { status: 404 });
    }

    // Calculer le prochain numéro de bloc disponible
    const { data: existingBlocs } = await supabase
      .from('blocs_competences')
      .select('numero_bloc')
      .eq('formation_id', body.formation_id)
      .order('numero_bloc', { ascending: true });

    console.log('📊 Blocs existants:', existingBlocs);

    let nextBlocNumber = 1;
    if (existingBlocs && existingBlocs.length > 0) {
      // Trouver le prochain numéro disponible
      const usedNumbers = existingBlocs.map(bloc => bloc.numero_bloc);
      console.log('📊 Numéros utilisés:', usedNumbers);
      while (usedNumbers.includes(nextBlocNumber)) {
        nextBlocNumber++;
      }
    }

    console.log('📊 Prochain numéro de bloc disponible:', nextBlocNumber);

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
      console.error('❌ Erreur lors de la création du bloc:', blocError);
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
      console.error('❌ Erreur lors de la création des modules:', modulesError);
      // Tenter de supprimer le bloc si les modules échouent
      await supabase.from('blocs_competences').delete().eq('id', bloc.id);
      return NextResponse.json({ success: false, error: 'Erreur lors de la création des modules' }, { status: 500 });
    }

    console.log('✅ Bloc et modules créés avec succès');
    return NextResponse.json({ success: true, bloc, modules }, { status: 201 });

  } catch (error) {
    console.error('💥 Erreur de traitement dans l\'API blocs:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur de traitement interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Récupération des blocs');
    const supabase = getSupabaseServerClient();
    
    const { searchParams } = new URL(request.url);
    const formationId = searchParams.get('formationId');
    const blocId = searchParams.get('blocId');

    // Si blocId est fourni, récupérer les modules du bloc
    if (blocId) {
      console.log('📋 Bloc ID pour modules:', blocId);
      
      // Récupérer le token d'accès depuis les cookies
      const cookieStore = await cookies();
      const accessToken = cookieStore.get('sb-access-token')?.value;
      
      if (!accessToken) {
        console.log('❌ Aucun token d\'accès trouvé');
        return NextResponse.json({ 
          error: 'Non authentifié' 
        }, { status: 401 });
      }

      // Vérifier l'authentification avec le token
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      
      if (authError || !user) {
        console.log('❌ Token invalide:', authError);
        return NextResponse.json({ 
          error: 'Token invalide' 
        }, { status: 401 });
      }

      console.log('✅ Utilisateur authentifié:', user.email);

      // Récupérer les modules via fonction côté serveur
      const modules = await getModulesByBlocIdServer(parseInt(blocId));

      console.log('✅ Modules récupérés:', modules?.length || 0, 'modules');
      return NextResponse.json({ modules: modules || [] });
    }

    // Sinon, récupérer les blocs de la formation
    if (!formationId) {
      return NextResponse.json({ 
        error: 'ID de formation requis' 
      }, { status: 400 });
    }

    console.log('📋 Formation ID:', formationId);

    // Récupérer le token d'accès depuis les cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    
    if (!accessToken) {
      console.log('❌ Aucun token d\'accès trouvé');
      return NextResponse.json({ 
        error: 'Non authentifié' 
      }, { status: 401 });
    }

    // Vérifier l'authentification avec le token
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log('❌ Token invalide:', authError);
      return NextResponse.json({ 
        error: 'Token invalide' 
      }, { status: 401 });
    }

    console.log('✅ Utilisateur authentifié:', user.email);

    // Récupérer les blocs via fonction côté serveur
    const blocs = await getBlocsByFormationIdServer(parseInt(formationId));

    console.log('✅ Blocs récupérés:', blocs?.length || 0, 'blocs');
    return NextResponse.json({ blocs: blocs || [] });

  } catch (error) {
    console.error('💥 Erreur lors de la récupération des blocs:', error);
    return NextResponse.json({ 
      error: 'Erreur de traitement' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ API: Modification du bloc');
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    console.log('📋 Données de modification:', body);

    // Récupérer le token d'accès depuis les cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      console.log('❌ Aucun token d\'accès trouvé');
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 });
    }

    // Vérifier l'authentification avec le token
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.log('❌ Token invalide:', authError);
      return NextResponse.json({
        success: false,
        error: 'Token invalide'
      }, { status: 401 });
    }

    console.log('✅ Utilisateur authentifié:', user.email);

    // Récupérer le profil utilisateur pour vérifier le rôle
    const profile = await getUserProfileServer(user.id);

    if (!profile) {
      console.log('❌ Profil utilisateur non trouvé');
      return NextResponse.json({
        success: false,
        error: 'Profil utilisateur non trouvé'
      }, { status: 404 });
    }

    console.log('👤 Rôle utilisateur:', profile.role);

    // Vérifier les permissions (admin, superadmin, pedagogie)
    const allowedRoles = ['admin', 'superadmin', 'pedagogie'];
    if (!allowedRoles.includes(profile.role)) {
      console.log('❌ Permissions insuffisantes. Rôle:', profile.role);
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
      console.error('❌ Erreur lors de la modification du bloc:', result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Erreur lors de la modification du bloc' 
      }, { status: 500 });
    }

    console.log('✅ Bloc modifié avec succès');
    return NextResponse.json({ success: true, bloc: result.bloc }, { status: 200 });

  } catch (error) {
    console.error('💥 Erreur lors de la modification du bloc:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur de traitement interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ API: Suppression du bloc');
    const supabase = getSupabaseServerClient();
    
    const { searchParams } = new URL(request.url);
    const blocId = searchParams.get('blocId');

    if (!blocId) {
      return NextResponse.json({
        success: false,
        error: 'ID de bloc requis'
      }, { status: 400 });
    }

    console.log('📋 Bloc ID:', blocId);

    // Récupérer le token d'accès depuis les cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      console.log('❌ Aucun token d\'accès trouvé');
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 });
    }

    // Vérifier l'authentification avec le token
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.log('❌ Token invalide:', authError);
      return NextResponse.json({
        success: false,
        error: 'Token invalide'
      }, { status: 401 });
    }

    console.log('✅ Utilisateur authentifié:', user.email);

    // Récupérer le profil utilisateur pour vérifier le rôle
    const profile = await getUserProfileServer(user.id);

    if (!profile) {
      console.log('❌ Profil utilisateur non trouvé');
      return NextResponse.json({
        success: false,
        error: 'Profil utilisateur non trouvé'
      }, { status: 404 });
    }

    console.log('👤 Rôle utilisateur:', profile.role);

    // Vérifier les permissions (admin, superadmin, pedagogie)
    const allowedRoles = ['admin', 'superadmin', 'pedagogie'];
    if (!allowedRoles.includes(profile.role)) {
      console.log('❌ Permissions insuffisantes. Rôle:', profile.role);
      return NextResponse.json({
        success: false,
        error: 'Permissions insuffisantes. Seuls les administrateurs peuvent supprimer des blocs.'
      }, { status: 403 });
    }

    // Supprimer le bloc
    const result = await deleteBlocServer(parseInt(blocId), user.id);

    if (!result.success) {
      console.error('❌ Erreur lors de la suppression du bloc:', result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Erreur lors de la suppression du bloc' 
      }, { status: 500 });
    }

    console.log('✅ Bloc supprimé avec succès');
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('💥 Erreur lors de la suppression du bloc:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur de traitement interne du serveur' },
      { status: 500 }
    );
  }
}