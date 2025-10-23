import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

// GET - Récupérer les détails d'un module avec ses cours
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const supabase = getSupabaseServerClient();
    
    // Récupérer le token d'authentification depuis les cookies
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const accessToken = cookieStore.get('sb-access-token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier l'authentification avec le token
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier le rôle de l'utilisateur
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || !['admin', 'superadmin', 'pedagogie'].includes(profile.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

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
    const supabase = getSupabaseServerClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier le rôle de l'utilisateur
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || !['admin', 'superadmin', 'pedagogie'].includes(profile.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

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
      return NextResponse.json({ error: 'Erreur lors de la création du cours' }, { status: 500 });
    }

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
    const supabase = getSupabaseServerClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier le rôle de l'utilisateur
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || !['admin', 'superadmin', 'pedagogie'].includes(profile.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { coursId, ...updateData } = body;

    // Mettre à jour le cours
    const { error: updateError } = await supabase
      .from('cours_contenu')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', coursId);

    if (updateError) {
      console.error('Erreur lors de la mise à jour du cours:', updateError);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

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
    const supabase = getSupabaseServerClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier le rôle de l'utilisateur
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || !['admin', 'superadmin', 'pedagogie'].includes(profile.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const coursId = searchParams.get('coursId');

    if (!coursId) {
      return NextResponse.json({ error: 'ID du cours requis' }, { status: 400 });
    }

    // Supprimer le cours
    const { error: deleteError } = await supabase
      .from('cours_contenu')
      .delete()
      .eq('id', coursId);

    if (deleteError) {
      console.error('Erreur lors de la suppression du cours:', deleteError);
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur dans l\'API suppression cours:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
