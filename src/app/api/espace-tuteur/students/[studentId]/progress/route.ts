import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { getSupabaseServerClient } from '@/lib/supabase';
import type { StudentProgress } from '@/types/tutor';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;

    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

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

    // Verify this student is assigned to this tutor
    const { data: relationship } = await supabase
      .from('tuteur_etudiants')
      .select('id')
      .eq('tuteur_id', tuteur.id)
      .eq('etudiant_id', studentId)
      .eq('statut', 'actif')
      .maybeSingle();

    if (!relationship) {
      return NextResponse.json(
        { error: 'Étudiant non assigné à ce tuteur' },
        { status: 403 }
      );
    }

    // Get student info
    const { data: etudiant } = await supabase
      .from('etudiants')
      .select('id, user_id')
      .eq('id', studentId)
      .single();

    if (!etudiant) {
      return NextResponse.json(
        { error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    // Get student auth info for name/email
    const { data: authUser } = await supabase.auth.admin.getUserById(etudiant.user_id);
    const metadata = authUser?.user?.user_metadata || {};

    // Get all courses the student is enrolled in
    const { data: inscriptions } = await supabase
      .from('inscriptions')
      .select(
        `
        cours_id,
        cours:cours_id (
          id,
          titre
        )
      `
      )
      .eq('etudiant_id', studentId)
      .eq('statut', 'actif');

    if (!inscriptions || inscriptions.length === 0) {
      return NextResponse.json([]);
    }

    // Get progress for each course
    const studentProgress: StudentProgress[] = await Promise.all(
      inscriptions.map(async (inscription: any) => {
        const coursId = inscription.cours_id;
        const cours = inscription.cours;

        // Get student's progress
        const { data: progressData } = await supabase
          .from('progression_etudiants')
          .select('*')
          .eq('etudiant_id', studentId)
          .eq('cours_id', coursId);

        // Count total chapters
        const { count: totalChapitres } = await supabase
          .from('chapitres')
          .select('*', { count: 'exact', head: true })
          .eq('cours_id', coursId);

        // Count completed chapters
        const completedChapitres = progressData?.filter(
          (p) => p.statut === 'termine' && p.chapitre_id
        ).length || 0;

        // Calculate overall progression
        const progression = totalChapitres
          ? Math.round((completedChapitres / totalChapitres) * 100)
          : 0;

        // Get last activity
        const lastActivity = progressData?.reduce((latest: any, current: any) => {
          if (!current.date_derniere_activite) return latest;
          if (!latest) return current.date_derniere_activite;
          return new Date(current.date_derniere_activite) > new Date(latest)
            ? current.date_derniere_activite
            : latest;
        }, null);

        // Determine status
        let statut: 'non_commence' | 'en_cours' | 'termine' = 'non_commence';
        if (completedChapitres === totalChapitres && totalChapitres > 0) {
          statut = 'termine';
        } else if (completedChapitres > 0) {
          statut = 'en_cours';
        }

        return {
          etudiant_id: studentId,
          prenom: metadata.prenom || '',
          nom: metadata.nom || '',
          email: authUser?.user?.email || '',
          cours_id: coursId,
          cours_titre: cours?.titre || '',
          progression,
          statut,
          date_derniere_activite: lastActivity,
          total_chapitres: totalChapitres || 0,
          chapitres_termines: completedChapitres,
        };
      })
    );

    return NextResponse.json(studentProgress);
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
