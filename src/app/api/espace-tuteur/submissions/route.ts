import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    // Vérifier que l'utilisateur est bien un tuteur
    const { data: tuteur } = await supabase
      .from('tuteurs')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!tuteur) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Récupérer les filtres
    const { searchParams } = new URL(request.url);
    const statut = searchParams.get('statut');
    const etudeCasId = searchParams.get('etude_cas_id');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Construire la requête
    let query = supabase
      .from('soumissions_etude_cas')
      .select(`
        *,
        etudiants:etudiant_id (
          id,
          prenom,
          nom,
          email
        ),
        etudes_cas:etude_cas_id (
          id,
          titre,
          description,
          note_maximale,
          bloc_id
        )
      `)
      .eq('corrige_par', tuteur.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (statut) {
      query = query.eq('statut', statut);
    }

    if (etudeCasId) {
      query = query.eq('etude_cas_id', etudeCasId);
    }

    const { data: submissions, error } = await query;

    if (error) {
      console.error('Erreur submissions:', error);
      return NextResponse.json({ error: 'Erreur lors du chargement' }, { status: 500 });
    }

    // Transformer pour mapper les relations
    const result = (submissions || []).map((s: any) => ({
      ...s,
      etudiant: s.etudiants || null,
      etude_cas: s.etudes_cas || null,
      etudiants: undefined,
      etudes_cas: undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur submissions:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
