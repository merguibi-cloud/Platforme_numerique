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

    // Récupérer les relations tuteur-étudiants
    const { data: tutees, error } = await supabase
      .from('tuteur_etudiants')
      .select('id, tuteur_id, etudiant_id, statut, date_debut, date_fin, created_at')
      .eq('tuteur_id', tuteur.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur tutees:', error);
      return NextResponse.json({ error: 'Erreur lors du chargement' }, { status: 500 });
    }

    // Récupérer les infos des étudiants séparément
    // etudiant_id référence auth.users(id), etudiants.user_id aussi
    const etudiantUserIds = (tutees || []).map((t: any) => t.etudiant_id).filter(Boolean);
    let etudiantsMap: Record<string, any> = {};

    if (etudiantUserIds.length > 0) {
      const { data: etudiants } = await supabase
        .from('etudiants')
        .select('id, user_id, nom, prenom, email, photo_url')
        .in('user_id', etudiantUserIds);

      if (etudiants) {
        etudiantsMap = Object.fromEntries(etudiants.map((e: any) => [e.user_id, e]));
      }
    }

    // Joindre les données
    const result = (tutees || []).map((t: any) => ({
      ...t,
      etudiant: etudiantsMap[t.etudiant_id] || null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur tutees:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
