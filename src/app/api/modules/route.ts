import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { createModuleWithCours } from '@/lib/modules-api';

// GET - Récupérer les modules d'un bloc avec gestion des permissions
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    
    const { searchParams } = new URL(request.url);
    const formationId = searchParams.get('formationId');
    const blocId = searchParams.get('blocId');

    if (!blocId) {
      return NextResponse.json({ error: 'ID du bloc requis' }, { status: 400 });
    }

    // Récupérer les modules du bloc
    const { data: modules, error: modulesError } = await supabase
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
        updated_at
      `)
      .eq('bloc_id', blocId)
      .eq('actif', true)
      .order('ordre_affichage');

    if (modulesError) {
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    // Transformer les données pour l'interface
    const modulesWithStatus = modules.map(module => {
      return {
        id: module.id.toString(),
        type: `MODULE ${module.numero_module}`,
        cours: module.titre,
        creationModification: new Date(module.created_at).toLocaleDateString('fr-FR'),
        creePar: 'SYSTÈME',
        statut: 'brouillon' as const,
        duree_estimee: module.duree_estimee || 0,
        cours_count: 0,
        cours_actifs: 0
      };
    });

    return NextResponse.json({ modules: modulesWithStatus });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau module
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    
    const { searchParams } = new URL(request.url);
    const formationId = searchParams.get('formationId');
    const blocId = searchParams.get('blocId');

    if (!blocId) {
      return NextResponse.json({ error: 'ID du bloc requis' }, { status: 400 });
    }

    const body = await request.json();
    const { titre, cours, description, type_module } = body;

    // Utiliser la fonction CRUD existante
    const result = await createModuleWithCours({
      bloc_id: parseInt(blocId),
      titre,
      description: description || '',
      type_module: (type_module as 'cours' | 'etude_cas' | 'quiz' | 'projet') || 'cours',
      cours: cours || []
    });

    if (result.success) {
      return NextResponse.json({ 
        success: true,
        module: result.module,
        cours: result.cours,
        message: 'Module créé avec succès'
      });
    } else {
      return NextResponse.json({ 
        error: result.error || 'Erreur lors de la création du module'
      }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({ 
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// PUT - Mettre à jour le statut d'un module
export async function PUT(request: NextRequest) {
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
    const { moduleId, action } = body;

    if (action === 'publish') {
      // Publier le module (mettre tous les cours en actif)
      const { error: updateError } = await supabase
        .from('cours_contenu')
        .update({ actif: true })
        .eq('module_id', moduleId);

      if (updateError) {
        console.error('Erreur lors de la publication:', updateError);
        return NextResponse.json({ error: 'Erreur lors de la publication' }, { status: 500 });
      }
    } else if (action === 'unpublish') {
      // Dépublier le module (mettre tous les cours en inactif)
      const { error: updateError } = await supabase
        .from('cours_contenu')
        .update({ actif: false })
        .eq('module_id', moduleId);

      if (updateError) {
        console.error('Erreur lors de la dépublication:', updateError);
        return NextResponse.json({ error: 'Erreur lors de la dépublication' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur dans l\'API mise à jour module:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
