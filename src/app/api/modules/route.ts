import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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
        updated_at,
        created_by
      `)
      .eq('bloc_id', blocId)
      .eq('actif', true)
      .order('ordre_affichage');

    if (modulesError) {
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    const moduleIds = (modules ?? []).map((module) => module.id);

    const { data: coursData, error: coursError } =
      moduleIds.length > 0
        ? await supabase
            .from('cours_contenu')
            .select('id, module_id, titre, actif, updated_at')
            .in('module_id', moduleIds)
        : { data: [], error: null };

    if (coursError) {
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    const coursByModule = new Map<number, { id: number; titre: string; actif: boolean; updated_at: string | null }[]>();
    coursData?.forEach((cours) => {
      const list = coursByModule.get(cours.module_id) ?? [];
      list.push({
        id: cours.id,
        titre: cours.titre,
        actif: Boolean(cours.actif),
        updated_at: cours.updated_at ?? null,
      });
      coursByModule.set(cours.module_id, list);
    });

    const creatorIds = Array.from(
      new Set(
        (modules || [])
          .map((module) => module.created_by)
          .filter((id): id is string => Boolean(id))
      )
    );

    const creatorNameMap = new Map<string, string>();

    if (creatorIds.length > 0) {
      const { data: adminProfiles } = await supabase
        .from('administrateurs')
        .select('user_id, nom, prenom')
        .in('user_id', creatorIds);

      adminProfiles?.forEach((profile) => {
        const name = [profile.prenom, profile.nom].filter(Boolean).join(' ').trim();
        if (name) {
          creatorNameMap.set(profile.user_id, name);
        }
      });
    }

    // Transformer les données pour l'interface
    const modulesWithStatus = modules.map(module => {
      const coursList = coursByModule.get(module.id) ?? [];
      const coursDetails = coursList.map((cours) => ({
        id: cours.id.toString(),
        titre: cours.titre,
      }));
      const coursTitles = coursDetails.map((cours) => cours.titre);
      const coursActifs = coursList.filter((cours) => cours.actif).length;

      let statut: 'en_ligne' | 'brouillon' | 'manquant' = 'brouillon';
      if (coursList.length === 0) {
        statut = 'manquant';
      } else if (coursActifs === coursList.length) {
        statut = 'en_ligne';
      }

      const latestUpdate = coursList
        .map((cours) => cours.updated_at ?? module.updated_at)
        .concat(module.updated_at)
        .filter(Boolean)
        .map((date) => new Date(date as string))
        .sort((a, b) => b.getTime() - a.getTime())[0];

      const creatorName = module.created_by
        ? creatorNameMap.get(module.created_by) || 'Administrateur'
        : 'Non renseigné';

      return {
        id: module.id.toString(),
        moduleName: module.titre,
        cours: coursTitles,
        creationModification: latestUpdate
          ? latestUpdate.toLocaleDateString('fr-FR')
          : new Date(module.created_at).toLocaleDateString('fr-FR'),
        creePar: creatorName,
        statut,
        duree_estimee: module.duree_estimee || 0,
        cours_count: coursList.length,
        cours_actifs: coursActifs,
        ordre_affichage: module.ordre_affichage,
        numero_module: module.numero_module,
        coursDetails,
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

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    const allowedRoles = new Set(['admin', 'superadmin', 'pedagogie']);
    let isAuthorized = profile ? allowedRoles.has(profile.role) : false;
    let adminProfile: { nom?: string; prenom?: string } | null = null;

    if (!isAuthorized) {
      const { data: adminRecord } = await supabase
        .from('administrateurs')
        .select('nom, prenom')
        .eq('user_id', user.id)
        .maybeSingle();

      if (adminRecord) {
        isAuthorized = true;
        adminProfile = adminRecord;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const body = await request.json();
    const { titre, cours, description, type_module } = body;

    // Utiliser la fonction CRUD existante
    const result = await createModuleWithCours({
      bloc_id: parseInt(blocId),
      titre,
      description: description || '',
      type_module: (type_module as 'cours' | 'etude_cas' | 'quiz' | 'projet') || 'cours',
      cours: cours || [],
      created_by: user.id,
    });

    let creatorName =
      [user.user_metadata?.prenom, user.user_metadata?.nom].filter(Boolean).join(' ').trim() ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      '';

    if (!creatorName) {
      creatorName = [adminProfile?.prenom, adminProfile?.nom].filter(Boolean).join(' ').trim();
    }

    if (!creatorName) {
      creatorName = user.email ?? 'Administrateur';
    }

    if (result.success) {
      return NextResponse.json({ 
        success: true,
        module: result.module,
        cours: result.cours,
        creatorName,
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

// DELETE - Supprimer un module et ses cours
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const moduleIdParam = searchParams.get('moduleId');
    const scopeParam = searchParams.get('scope');
    const coursIdParam = searchParams.get('coursId');

    if (!moduleIdParam) {
      return NextResponse.json({ error: 'ID du module requis' }, { status: 400 });
    }

    const moduleId = parseInt(moduleIdParam, 10);
    if (Number.isNaN(moduleId)) {
      return NextResponse.json({ error: 'ID du module invalide' }, { status: 400 });
    }
    const scope = scopeParam === 'cours' ? 'cours' : 'module';

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    const allowedRoles = new Set(['admin', 'superadmin', 'pedagogie']);
    let isAuthorized = profile ? allowedRoles.has(profile.role) : false;

    if (!isAuthorized) {
      const { data: adminRecord } = await supabase
        .from('administrateurs')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (adminRecord) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    if (scope === 'cours') {
      if (!coursIdParam) {
        return NextResponse.json({ error: 'ID du cours requis pour cette action' }, { status: 400 });
      }

      const coursId = parseInt(coursIdParam, 10);
      if (Number.isNaN(coursId)) {
        return NextResponse.json({ error: 'ID du cours invalide' }, { status: 400 });
      }

      const { error: singleCoursDeleteError } = await supabase
        .from('cours_contenu')
        .delete()
        .eq('id', coursId)
        .eq('module_id', moduleId);

      if (singleCoursDeleteError) {
        console.error('Erreur lors de la suppression du cours:', singleCoursDeleteError);
        return NextResponse.json({ error: 'Erreur lors de la suppression du cours' }, { status: 500 });
      }
    } else {
      const { error: coursDeleteError } = await supabase
        .from('cours_contenu')
        .delete()
        .eq('module_id', moduleId);

      if (coursDeleteError) {
        console.error('Erreur lors de la suppression des cours du module:', coursDeleteError);
        return NextResponse.json({ error: 'Erreur lors de la suppression des cours' }, { status: 500 });
      }

      const { error: moduleDeleteError } = await supabase
        .from('modules_apprentissage')
        .delete()
        .eq('id', moduleId);

      if (moduleDeleteError) {
        console.error('Erreur lors de la suppression du module:', moduleDeleteError);
        return NextResponse.json({ error: 'Erreur lors de la suppression du module' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      scope,
    });
  } catch (error) {
    console.error('Erreur dans l\'API suppression module:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
