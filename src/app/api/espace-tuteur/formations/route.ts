import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

// GET - Récupérer les formations assignées au tuteur connecté
export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    // Trouver le tuteur par user_id
    const { data: tuteur, error: tuteurError } = await supabase
      .from('tuteurs')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (tuteurError || !tuteur) {
      return NextResponse.json(
        { success: false, error: 'Tuteur non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les IDs des formations assignées
    const { data: assignments, error: assignError } = await supabase
      .from('tuteur_formations')
      .select('formation_id')
      .eq('tuteur_id', tuteur.id);

    if (assignError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des formations' },
        { status: 500 }
      );
    }

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({ success: true, formations: [] });
    }

    const formationIds = assignments.map((a) => a.formation_id);

    // Récupérer les détails des formations
    const { data: formations, error: formationsError } = await supabase
      .from('formations')
      .select('id, titre, ecole, niveau, description, image, theme')
      .in('id', formationIds)
      .order('ecole', { ascending: true })
      .order('titre', { ascending: true });

    if (formationsError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des formations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, formations: formations || [] });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
