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

    // Récupérer les formations assignées au tuteur
    const { data: assignments, error: assignError } = await supabase
      .from('tuteur_formations')
      .select('formation_id')
      .eq('tuteur_id', tuteur.id);

    if (assignError) {
      console.error('Erreur tuteur_formations:', assignError);
      return NextResponse.json({ error: 'Erreur lors du chargement' }, { status: 500 });
    }

    if (!assignments || assignments.length === 0) {
      return NextResponse.json([]);
    }

    const formationIds = assignments.map((a: any) => a.formation_id);

    // Récupérer tous les étudiants inscrits dans ces formations
    const { data: etudiants, error: etudiantsError } = await supabase
      .from('etudiants')
      .select('id, user_id, formation_id, created_at')
      .in('formation_id', formationIds);

    if (etudiantsError) {
      console.error('Erreur etudiants:', etudiantsError);
      return NextResponse.json({ error: 'Erreur lors du chargement' }, { status: 500 });
    }

    if (!etudiants || etudiants.length === 0) {
      return NextResponse.json([]);
    }

    // Récupérer les infos de chaque étudiant depuis candidatures
    const result = await Promise.all(
      etudiants.map(async (etudiant: any) => {
        const { data: candidature } = await supabase
          .from('candidatures')
          .select('nom, prenom, email')
          .eq('user_id', etudiant.user_id)
          .maybeSingle();

        return {
          id: etudiant.id,
          tuteur_id: tuteur.id,
          etudiant_id: etudiant.id,
          statut: 'actif',
          date_debut: etudiant.created_at,
          created_at: etudiant.created_at,
          formation_id: etudiant.formation_id,
          etudiant: {
            id: etudiant.id,
            prenom: candidature?.prenom || '',
            nom: candidature?.nom || '',
            email: candidature?.email || '',
          },
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur tutees:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
