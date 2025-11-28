import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET - Vérifier si un bloc est complété (tous les quiz ont une note et toutes les études de cas sont soumises)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blocId: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();
    const { blocId } = await params;
    const blocIdNum = parseInt(blocId, 10);

    if (isNaN(blocIdNum)) {
      return NextResponse.json(
        { success: false, error: 'ID de bloc invalide' },
        { status: 400 }
      );
    }

    // Récupérer l'étudiant
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

    // Récupérer tous les cours du bloc (seulement ceux en ligne)
    const { data: cours, error: coursError } = await supabase
      .from('cours_apprentissage')
      .select('id')
      .eq('bloc_id', blocIdNum)
      .eq('actif', true)
      .eq('statut', 'en_ligne');

    if (coursError) {
      console.error('Erreur lors de la récupération des cours:', coursError);
      return NextResponse.json(
        { success: false, error: 'Erreur serveur' },
        { status: 500 }
      );
    }

    const coursIds = cours?.map(c => c.id) || [];

    if (coursIds.length === 0) {
      return NextResponse.json({
        success: true,
        isCompleted: false,
        message: 'Aucun cours dans ce bloc'
      });
    }

    // Récupérer tous les quiz du bloc
    const { data: quiz, error: quizError } = await supabase
      .from('quiz_evaluations')
      .select('id')
      .in('cours_id', coursIds)
      .eq('actif', true);

    if (quizError) {
      console.error('Erreur lors de la récupération des quiz:', quizError);
      return NextResponse.json(
        { success: false, error: 'Erreur serveur' },
        { status: 500 }
      );
    }

    const quizIds = quiz?.map(q => q.id) || [];

    // Vérifier si tous les quiz ont une note
    let allQuizHaveNotes = true;
    if (quizIds.length > 0) {
      const { data: notesQuiz, error: notesError } = await supabase
        .from('notes_etudiants')
        .select('evaluation_id')
        .eq('etudiant_id', etudiant.id)
        .eq('type_evaluation', 'quiz')
        .in('evaluation_id', quizIds)
        .not('note', 'is', null);

      if (notesError) {
        console.error('Erreur lors de la récupération des notes de quiz:', notesError);
        return NextResponse.json(
          { success: false, error: 'Erreur serveur' },
          { status: 500 }
        );
      }

      const quizAvecNote = new Set(notesQuiz?.map(n => n.evaluation_id) || []);
      allQuizHaveNotes = quizIds.every(id => quizAvecNote.has(id));
    }

    // Récupérer toutes les études de cas du bloc
    const { data: etudesCas, error: etudesCasError } = await supabase
      .from('etudes_cas')
      .select('id')
      .in('cours_id', coursIds)
      .eq('actif', true);

    if (etudesCasError) {
      console.error('Erreur lors de la récupération des études de cas:', etudesCasError);
      return NextResponse.json(
        { success: false, error: 'Erreur serveur' },
        { status: 500 }
      );
    }

    const etudeCasIds = etudesCas?.map(ec => ec.id) || [];

    // Vérifier si toutes les études de cas sont soumises
    let allEtudeCasSubmitted = true;
    if (etudeCasIds.length > 0) {
      const { data: soumissions, error: soumissionsError } = await supabase
        .from('soumissions_etude_cas')
        .select('etude_cas_id')
        .in('etude_cas_id', etudeCasIds)
        .eq('user_id', user.id);

      if (soumissionsError) {
        console.error('Erreur lors de la récupération des soumissions:', soumissionsError);
        return NextResponse.json(
          { success: false, error: 'Erreur serveur' },
          { status: 500 }
        );
      }

      const etudeCasSoumis = new Set(soumissions?.map(s => s.etude_cas_id) || []);
      allEtudeCasSubmitted = etudeCasIds.every(id => etudeCasSoumis.has(id));
    }

    const isCompleted = allQuizHaveNotes && allEtudeCasSubmitted;

    return NextResponse.json({
      success: true,
      isCompleted,
      details: {
        totalQuiz: quizIds.length,
        quizAvecNote: allQuizHaveNotes,
        totalEtudeCas: etudeCasIds.length,
        etudeCasSoumis: allEtudeCasSubmitted
      }
    });
  } catch (error) {
    console.error('Erreur dans GET /api/espace-etudiant/blocs/[blocId]/completion:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


