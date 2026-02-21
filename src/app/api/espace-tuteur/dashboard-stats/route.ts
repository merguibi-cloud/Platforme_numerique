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

    // Compter les étudiants assignés
    const { count: totalEtudiants } = await supabase
      .from('tuteur_etudiants')
      .select('id', { count: 'exact', head: true })
      .eq('tuteur_id', tuteur.id)
      .eq('statut', 'actif');

    // Compter les cours assignés
    const { count: totalCours } = await supabase
      .from('tuteur_cours')
      .select('id', { count: 'exact', head: true })
      .eq('tuteur_id', tuteur.id);

    // Compter les soumissions en attente
    const { count: totalSoumissionsEnAttente } = await supabase
      .from('soumissions_etude_cas')
      .select('id', { count: 'exact', head: true })
      .eq('corrige_par', tuteur.id)
      .eq('statut', 'en_attente');

    // Dernière activité (dernière connexion)
    const { data: lastSession } = await supabase
      .from('sessions_connexion')
      .select('date_connexion')
      .eq('user_id', user.id)
      .order('date_connexion', { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      total_etudiants: totalEtudiants ?? 0,
      total_cours: totalCours ?? 0,
      total_soumissions_en_attente: totalSoumissionsEnAttente ?? 0,
      taux_reussite_moyen: 0,
      derniere_activite: lastSession?.date_connexion || null,
    });
  } catch (error) {
    console.error('Erreur dashboard-stats:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
