import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
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
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const supabase = getSupabaseServerClient();

    const { searchParams } = new URL(request.url);
    const formationId = searchParams.get('formationId');

    if (!formationId) {
      return NextResponse.json({ error: 'formationId requis' }, { status: 400 });
    }

    // Récupérer tous les cours de la formation via les blocs et modules
    const { data: blocs, error: blocsError } = await supabase
      .from('blocs_competences')
      .select('id')
      .eq('formation_id', parseInt(formationId))
      .eq('actif', true);

    if (blocsError) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des blocs' }, { status: 500 });
    }

    const blocIds = blocs?.map(b => b.id) || [];
    
    if (blocIds.length === 0) {
      return NextResponse.json({ cours: [] });
    }

    const { data: modules, error: modulesError } = await supabase
      .from('modules_apprentissage')
      .select('id, titre, bloc_id')
      .in('bloc_id', blocIds)
      .eq('actif', true);

    if (modulesError) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des modules' }, { status: 500 });
    }

    const moduleIds = modules?.map(m => m.id) || [];
    
    if (moduleIds.length === 0) {
      return NextResponse.json({ cours: [] });
    }

    // Récupérer tous les cours avec leurs informations de module
    const { data: cours, error: coursError } = await supabase
      .from('cours_contenu')
      .select(`
        id,
        module_id,
        titre,
        statut,
        created_at,
        updated_at,
        modules_apprentissage (
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
      .in('module_id', moduleIds)
      .order('created_at', { ascending: false });

    if (coursError) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des cours' }, { status: 500 });
    }

    // Formater les cours avec les informations nécessaires
    const formattedCours = cours?.map(c => {
      const module = c.modules_apprentissage as any;
      const bloc = module?.blocs_competences;
      
      return {
        id: c.id,
        titre: c.titre,
        statut: c.statut || 'brouillon',
        module: module?.titre || 'Module inconnu',
        bloc: bloc?.titre || 'Bloc inconnu',
        module_id: module?.id || null,
        bloc_id: module?.bloc_id || null,
        formation_id: bloc?.formation_id || parseInt(formationId),
        created_at: c.created_at,
        updated_at: c.updated_at,
      };
    }) || [];

    return NextResponse.json({ cours: formattedCours });
  } catch (error) {
    console.error('Erreur dans l\'API cours by-formation:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

