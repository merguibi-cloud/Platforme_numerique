import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Vérifier l'authentification
    const authClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier les permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || !['admin', 'superadmin', 'pedagogie'].includes(profile.role)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

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

