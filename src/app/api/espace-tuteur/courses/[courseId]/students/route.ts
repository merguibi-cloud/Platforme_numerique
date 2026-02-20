import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { getSupabaseServerClient } from '@/lib/supabase';
import type { StudentProgress } from '@/types/tutor';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

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

    // Verify tutor has access to this course
    const { data: courseAccess } = await supabase
      .from('tuteur_cours')
      .select('id')
      .eq('tuteur_id', tuteur.id)
      .eq('cours_id', courseId)
      .maybeSingle();

    if (!courseAccess) {
      return NextResponse.json(
        { error: 'Accès non autorisé à ce cours' },
        { status: 403 }
      );
    }

    // Get course info
    const { data: cours } = await supabase
      .from('cours')
      .select('id, titre')
      .eq('id', courseId)
      .single();

    // Get students enrolled in this course
    const { data: inscriptions } = await supabase
      .from('inscriptions')
      .select(
        `
        etudiant_id,
        etudiants:etudiant_id (
          id,
          user_id,
          users:user_id (
            prenom,
            nom,
            email
          )
        )
      `
      )
      .eq('cours_id', courseId)
      .eq('statut', 'actif');

    if (!inscriptions || inscriptions.length === 0) {
      return NextResponse.json([]);
    }

    // Get progress for each student
    const studentProgress: StudentProgress[] = await Promise.all(
      inscriptions.map(async (inscription: any) => {
        const etudiantId = inscription.etudiant_id;
        const etudiant = inscription.etudiants;
        const userInfo = etudiant?.users;

        // Get student's progress
        const { data: progressData } = await supabase
          .from('progression_etudiants')
          .select('*')
          .eq('etudiant_id', etudiantId)
          .eq('cours_id', courseId);

        // Count total chapters
        const { count: totalChapitres } = await supabase
          .from('chapitres')
          .select('*', { count: 'exact', head: true })
          .eq('cours_id', courseId);

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
          etudiant_id: etudiantId,
          prenom: userInfo?.prenom || '',
          nom: userInfo?.nom || '',
          email: userInfo?.email || '',
          cours_id: courseId,
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
    console.error('Error fetching course students:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
