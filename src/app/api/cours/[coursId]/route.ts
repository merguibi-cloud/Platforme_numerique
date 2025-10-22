import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

// GET - Récupérer un cours spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { coursId: string } }
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

    const { coursId } = params;

    // Récupérer le cours
    const { data: cours, error: coursError } = await supabase
      .from('cours_contenu')
      .select(`
        *,
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
      .eq('id', coursId)
      .single();

    if (coursError) {
      console.error('Erreur lors de la récupération du cours:', coursError);
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ cours });
  } catch (error) {
    console.error('Erreur dans l\'API cours:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour le statut d'un cours (actif/inactif)
export async function PUT(
  request: NextRequest,
  { params }: { params: { coursId: string } }
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

    const { coursId } = params;
    const body = await request.json();
    const { actif } = body;

    // Mettre à jour le statut du cours
    const { error: updateError } = await supabase
      .from('cours_contenu')
      .update({ 
        actif: actif,
        updated_at: new Date().toISOString()
      })
      .eq('id', coursId);

    if (updateError) {
      console.error('Erreur lors de la mise à jour du statut:', updateError);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur dans l\'API mise à jour statut cours:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
