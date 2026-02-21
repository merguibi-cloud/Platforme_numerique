import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    // Récupérer le tuteur
    const { data: tuteur } = await supabase
      .from('tuteurs')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!tuteur) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Récupérer les étudiants assignés avec leurs infos
    const { data: tutees, error } = await supabase
      .from('tuteur_etudiants')
      .select(`
        id,
        tuteur_id,
        etudiant_id,
        statut,
        date_debut,
        date_fin,
        created_at,
        etudiants:etudiant_id (
          id,
          user_id,
          nom,
          prenom,
          email,
          photo_url
        )
      `)
      .eq('tuteur_id', tuteur.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur tutees:', error);
      return NextResponse.json({ error: 'Erreur lors du chargement' }, { status: 500 });
    }

    // Transformer pour mapper etudiants -> etudiant
    const result = (tutees || []).map((t: any) => ({
      ...t,
      etudiant: t.etudiants || null,
      etudiants: undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur tutees:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
