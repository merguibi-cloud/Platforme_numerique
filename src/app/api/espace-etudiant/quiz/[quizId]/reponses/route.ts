import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET - Récupérer les réponses d'un étudiant pour un quiz déjà fait
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const { quizId } = await params;
    const quizIdNum = parseInt(quizId, 10);

    if (isNaN(quizIdNum)) {
      return NextResponse.json(
        { success: false, error: 'ID de quiz invalide' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Récupérer la dernière tentative terminée de l'étudiant pour ce quiz
    const { data: tentative, error: tentativeError } = await supabase
      .from('tentatives_quiz')
      .select('id, score, date_fin')
      .eq('quiz_id', quizIdNum)
      .eq('user_id', user.id)
      .eq('termine', true)
      .order('date_fin', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tentativeError || !tentative) {
      return NextResponse.json(
        { success: false, error: 'Aucune tentative trouvée pour ce quiz' },
        { status: 404 }
      );
    }

    // Récupérer les réponses de cette tentative
    const { data: reponses, error: reponsesError } = await supabase
      .from('reponses_quiz')
      .select(`
        question_id,
        reponse_donnee,
        points_obtenus,
        questions_quiz (
          id,
          question,
          type_question,
          points
        )
      `)
      .eq('tentative_id', tentative.id);

    if (reponsesError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des réponses' },
        { status: 500 }
      );
    }

    // Formater les réponses
    const reponsesFormatees = reponses?.map(r => {
      let reponseDonnee = null;
      try {
        // Essayer de parser si c'est un JSON
        reponseDonnee = JSON.parse(r.reponse_donnee);
      } catch {
        // Sinon utiliser directement
        reponseDonnee = r.reponse_donnee;
      }

      return {
        question_id: r.question_id,
        question: r.questions_quiz?.question || '',
        type_question: r.questions_quiz?.type_question || '',
        reponse_donnee: reponseDonnee,
        points_obtenus: r.points_obtenus || 0,
        points_max: r.questions_quiz?.points || 0
      };
    }) || [];

    return NextResponse.json({
      success: true,
      tentative: {
        id: tentative.id,
        score: tentative.score,
        date_fin: tentative.date_fin,
        noteSur20: Math.round((tentative.score / 100) * 20)
      },
      reponses: reponsesFormatees
    });
  } catch (error) {
    console.error('Erreur dans GET /api/espace-etudiant/quiz/[quizId]/reponses:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

