import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { getSupabaseServerClient } from '@/lib/supabase';

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

    const { data: tuteur } = await supabase
      .from('tuteurs')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!tuteur) {
      return NextResponse.json({ error: 'Profil tuteur non trouvé' }, { status: 404 });
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

    
    const { data: etudiant } = await supabase
      .from('etudiants')
      .select('id, user_id, formation_id')
      .eq('id', studentId)
      .single();

    if (!etudiant) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 });
    }

    const { data: formation } = await supabase
      .from('tuteur_formations')
      .select('id')
      .eq('tuteur_id', tuteur.id)
      .eq('formation_id', etudiant.formation_id)
      .maybeSingle();

    if (!formation) {
      return NextResponse.json({ error: 'Étudiant non assigné à ce tuteur' }, { status: 403 });
    }

    const { data: authUser } = await supabase.auth.admin.getUserById(etudiant.user_id);
    const metadata = authUser?.user?.user_metadata || {};
    const email = authUser?.user?.email || '';

    // Get all blocs of the formation
    const { data: blocs } = await supabase
      .from('blocs_competences')
      .select('id')
      .eq('formation_id', etudiant.formation_id)
      .eq('actif', true);

    if (!blocs || blocs.length === 0) return NextResponse.json([]);
    const blocIds = blocs.map(b => b.id);

    // Get all cours (en_ligne)
    const { data: coursList } = await supabase
      .from('cours_apprentissage')
      .select('id, titre, bloc_id')
      .in('bloc_id', blocIds)
      .eq('actif', true)
      .eq('statut', 'en_ligne');

    if (!coursList || coursList.length === 0) return NextResponse.json([]);
    const coursIds = coursList.map(c => c.id);

    // Get all chapitres for all cours
    const { data: allChapitres } = await supabase
      .from('chapitres_cours')
      .select('id, cours_id')
      .in('cours_id', coursIds)
      .eq('actif', true);

    const chapitreIds = (allChapitres || []).map(c => c.id);

    // Get chapitres read by this student
    const { data: chapitresLus } = chapitreIds.length > 0
      ? await supabase
          .from('notes_etudiants')
          .select('evaluation_id, date_evaluation')
          .eq('etudiant_id', etudiant.id)
          .eq('type_evaluation', 'cours')
          .in('evaluation_id', chapitreIds)
      : { data: [] };

    const chapitresLusIds = new Set((chapitresLus || []).map(c => c.evaluation_id));

    // Get quiz for all cours + which ones the student completed
    const { data: quizList } = await supabase
      .from('quiz_evaluations')
      .select('id, cours_id')
      .in('cours_id', coursIds)
      .eq('actif', true);

    const quizIds = (quizList || []).map(q => q.id);

    const { data: quizCompletes } = quizIds.length > 0
      ? await supabase
          .from('tentatives_quiz')
          .select('quiz_id')
          .eq('user_id', etudiant.user_id)
          .in('quiz_id', quizIds)
          .eq('termine', true)
      : { data: [] };

    const completedQuizIds = new Set((quizCompletes || []).map(t => t.quiz_id));

    // Build per-cours progress (same formula as real-progress endpoint)
    const progress = coursList.map((cours) => {
      const chapitresDuCours = (allChapitres || []).filter(c => c.cours_id === cours.id);
      const totalChapitres = chapitresDuCours.length;
      const chapitresTermines = chapitresDuCours.filter(c => chapitresLusIds.has(c.id)).length;

      const quizDuCours = (quizList || []).filter(q => q.cours_id === cours.id);
      const totalQuiz = quizDuCours.length;
      const quizFaits = quizDuCours.filter(q => completedQuizIds.has(q.id)).length;

      const totalElements = totalChapitres + totalQuiz;
      const elementsCompletes = chapitresTermines + quizFaits;
      const progression = totalElements > 0
        ? Math.round((elementsCompletes / totalElements) * 100)
        : 0;

      let statut: 'non_commence' | 'en_cours' | 'termine' = 'non_commence';
      if (progression === 100 && totalElements > 0) statut = 'termine';
      else if (elementsCompletes > 0) statut = 'en_cours';

      // Last activity for this cours
      const idsThisCours = new Set(chapitresDuCours.map(c => c.id));
      const lastDate = (chapitresLus || [])
        .filter(c => idsThisCours.has(c.evaluation_id) && c.date_evaluation)
        .map(c => c.date_evaluation)
        .sort()
        .reverse()[0] || null;

      return {
        etudiant_id: studentId,
        prenom: metadata.prenom || '',
        nom: metadata.nom || '',
        email,
        cours_id: cours.id,
        cours_titre: cours.titre,
        progression,
        statut,
        date_derniere_activite: lastDate,
        total_chapitres: totalElements,
        chapitres_termines: elementsCompletes,
      };
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
