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

    // Construire la requête - sans embedded select pour etudiants (pas de FK vers etudiants)
    let query = supabase
      .from('soumissions_etude_cas')
      .select(`
        *,
        etudes_cas:etude_cas_id (
          id,
          titre,
          description,
          points_max
        )
      `)
      .eq('tuteur_id', tuteur.id)
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

    // Récupérer les infos des étudiants séparément
    // etudiant_id (ou user_id) référence auth.users(id)
    const studentUserIds = (submissions || [])
      .map((s: any) => s.etudiant_id || s.user_id)
      .filter(Boolean);
    let etudiantsMap: Record<string, any> = {};

    if (studentUserIds.length > 0) {
      const { data: etudiants } = await supabase
        .from('etudiants')
        .select('id, user_id, nom, prenom, email')
        .in('user_id', studentUserIds);

      if (etudiants) {
        etudiantsMap = Object.fromEntries(etudiants.map((e: any) => [e.user_id, e]));
      }
    }

    // Joindre les données
    const result = (submissions || []).map((s: any) => ({
      ...s,
      etudiant: etudiantsMap[s.etudiant_id || s.user_id] || null,
      etude_cas: s.etudes_cas || null,
      etudes_cas: undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur submissions:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
