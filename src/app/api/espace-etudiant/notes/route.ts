import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

/**
 * GET - Récupérer les dernières notes (quiz et études de cas) pour l'étudiant connecté
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    const { data: etudiant, error: etudiantError } = await supabase
      .from('etudiants')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (etudiantError || !etudiant) {
      return NextResponse.json(
        { success: false, error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    const notes: any[] = [];

    // --- Notes quiz (separate queries, no FK join) ---
    const { data: tentativesQuiz } = await supabase
      .from('tentatives_quiz')
      .select('id, quiz_id, score, date_fin')
      .eq('user_id', user.id)
      .eq('termine', true)
      .order('date_fin', { ascending: false })
      .limit(10);

    if (tentativesQuiz && tentativesQuiz.length > 0) {
      const quizIds = [...new Set(tentativesQuiz.map(t => t.quiz_id))];
      const { data: quizList } = await supabase
        .from('quiz_evaluations')
        .select('id, titre, cours_id')
        .in('id', quizIds);

      const coursIds = [...new Set((quizList || []).map(q => q.cours_id).filter(Boolean))];
      const { data: coursList } = await supabase
        .from('cours_apprentissage')
        .select('id, titre, bloc_id')
        .in('id', coursIds);

      const blocIds = [...new Set((coursList || []).map(c => c.bloc_id).filter(Boolean))];
      const { data: blocsList } = await supabase
        .from('blocs_competences')
        .select('id, numero_bloc, titre')
        .in('id', blocIds);

      const quizMap = new Map((quizList || []).map(q => [q.id, q]));
      const coursMap = new Map((coursList || []).map(c => [c.id, c]));
      const blocsMap = new Map((blocsList || []).map(b => [b.id, b]));

      tentativesQuiz.forEach((tentative) => {
        const quiz = quizMap.get(tentative.quiz_id);
        const cours = quiz ? coursMap.get(quiz.cours_id) : null;
        const bloc = cours ? blocsMap.get(cours.bloc_id) : null;
        const noteSur20 = tentative.score ? Math.round(tentative.score * 20 / 100).toString() : '0';

        notes.push({
          id: `quiz-${tentative.id}`,
          title: `Bloc ${bloc?.numero_bloc || ''} - ${cours?.titre || 'Module'}`,
          label: 'Quizz',
          grade: noteSur20,
          date: tentative.date_fin,
          type: 'quiz'
        });
      });
    }

    // --- Notes études de cas (separate queries, no FK join) ---
    const { data: soumissions } = await supabase
      .from('soumissions_etude_cas')
      .select('id, etude_cas_id, note, date_correction')
      .eq('user_id', user.id)
      .not('note', 'is', null)
      .order('date_correction', { ascending: false })
      .limit(10);

    if (soumissions && soumissions.length > 0) {
      const etudeCasIds = [...new Set(soumissions.map(s => s.etude_cas_id))];
      const { data: etudesCasList } = await supabase
        .from('etudes_cas')
        .select('id, titre, cours_id')
        .in('id', etudeCasIds);

      const coursIds2 = [...new Set((etudesCasList || []).map(ec => ec.cours_id).filter(Boolean))];
      const { data: coursList2 } = await supabase
        .from('cours_apprentissage')
        .select('id, titre, bloc_id')
        .in('id', coursIds2);

      const blocIds2 = [...new Set((coursList2 || []).map(c => c.bloc_id).filter(Boolean))];
      const { data: blocsList2 } = await supabase
        .from('blocs_competences')
        .select('id, numero_bloc, titre')
        .in('id', blocIds2);

      const etudeCasMap = new Map((etudesCasList || []).map(ec => [ec.id, ec]));
      const coursMap2 = new Map((coursList2 || []).map(c => [c.id, c]));
      const blocsMap2 = new Map((blocsList2 || []).map(b => [b.id, b]));

      soumissions.forEach((soumission) => {
        const etudeCas = etudeCasMap.get(soumission.etude_cas_id);
        const cours = etudeCas ? coursMap2.get(etudeCas.cours_id) : null;
        const bloc = cours ? blocsMap2.get(cours.bloc_id) : null;
        const noteFormatee = soumission.note
          ? parseFloat(soumission.note.toString()).toFixed(1).replace('.', ',')
          : '0';

        notes.push({
          id: `etude-cas-${soumission.id}`,
          title: `Bloc ${bloc?.numero_bloc || ''}`,
          label: 'Étude de cas',
          grade: noteFormatee,
          date: soumission.date_correction,
          type: 'etude_cas'
        });
      });
    }

    notes.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

    return NextResponse.json({
      success: true,
      notes: notes.slice(0, 5)
    });
  } catch (error) {
    console.error('Erreur dans GET /api/espace-etudiant/notes:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
