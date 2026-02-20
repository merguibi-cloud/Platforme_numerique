import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { getSupabaseServerClient } from '@/lib/supabase';
import type { TutorDashboardStats } from '@/types/tutor';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    // Get tutor ID
    const { data: tuteur, error: tuteurError } = await supabase
      .from('tuteurs')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tuteurError || !tuteur) {
      return NextResponse.json(
        { error: 'Profil tuteur non trouvé' },
        { status: 404 }
      );
    }

    // Get total students
    const { count: totalEtudiants } = await supabase
      .from('tuteur_etudiants')
      .select('*', { count: 'exact', head: true })
      .eq('tuteur_id', tuteur.id)
      .eq('statut', 'actif');

    // Get total courses
    const { count: totalCours } = await supabase
      .from('tuteur_cours')
      .select('*', { count: 'exact', head: true })
      .eq('tuteur_id', tuteur.id);

    // Get pending submissions
    const { data: submissions } = await supabase
      .from('soumissions_etude_cas')
      .select(
        `
        id,
        etude_cas:etude_cas_id (
          bloc:bloc_id (
            chapitre:chapitre_id (
              cours_id
            )
          )
        )
      `
      )
      .eq('statut', 'en_attente');

    // Filter submissions for tutor's courses
    const { data: tuteurCoursIds } = await supabase
      .from('tuteur_cours')
      .select('cours_id')
      .eq('tuteur_id', tuteur.id);

    const coursIds = tuteurCoursIds?.map((tc) => tc.cours_id) || [];
    const pendingSubmissions = submissions?.filter((sub: any) => {
      const coursId = sub.etude_cas?.bloc?.chapitre?.cours_id;
      return coursId && coursIds.includes(coursId);
    });

    // Calculate average success rate
    const { data: gradedSubmissions } = await supabase
      .from('soumissions_etude_cas')
      .select(
        `
        note,
        etude_cas:etude_cas_id (
          note_maximale,
          bloc:bloc_id (
            chapitre:chapitre_id (
              cours_id
            )
          )
        )
      `
      )
      .eq('statut', 'corrige');

    const relevantGraded = gradedSubmissions?.filter((sub: any) => {
      const coursId = sub.etude_cas?.bloc?.chapitre?.cours_id;
      return coursId && coursIds.includes(coursId);
    });

    let tauxReussiteMoyen = 0;
    if (relevantGraded && relevantGraded.length > 0) {
      const total = relevantGraded.reduce((sum: number, sub: any) => {
        const percentage = (sub.note / sub.etude_cas.note_maximale) * 100;
        return sum + percentage;
      }, 0);
      tauxReussiteMoyen = Math.round(total / relevantGraded.length);
    }

    // Get last activity date
    const { data: lastActivity } = await supabase
      .from('progression_etudiants')
      .select('date_derniere_activite')
      .order('date_derniere_activite', { ascending: false })
      .limit(1)
      .maybeSingle();

    const stats: TutorDashboardStats = {
      total_etudiants: totalEtudiants || 0,
      total_cours: totalCours || 0,
      total_soumissions_en_attente: pendingSubmissions?.length || 0,
      taux_reussite_moyen: tauxReussiteMoyen,
      derniere_activite: lastActivity?.date_derniere_activite,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
