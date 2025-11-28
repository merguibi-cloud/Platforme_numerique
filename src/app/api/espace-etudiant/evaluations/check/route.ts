import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET - Vérifier si un étudiant a déjà une note pour un quiz ou a soumis une étude de cas
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const quizIds = searchParams.get('quizIds');
    const etudeCasId = searchParams.get('etudeCasId');

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

    const result: { quizAvecNote: number[]; etudeCasSoumis: boolean } = {
      quizAvecNote: [],
      etudeCasSoumis: false
    };

    // Vérifier les quiz avec note
    if (quizIds) {
      const quizIdsArray = quizIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (quizIdsArray.length > 0) {
        const { data: notes } = await supabase
          .from('notes_etudiants')
          .select('evaluation_id')
          .eq('etudiant_id', etudiant.id)
          .eq('type_evaluation', 'quiz')
          .in('evaluation_id', quizIdsArray)
          .not('note', 'is', null);

        if (notes) {
          result.quizAvecNote = notes.map(n => n.evaluation_id).filter(Boolean);
        }
      }
    }

    // Vérifier si l'étude de cas est soumise
    if (etudeCasId) {
      const { data: soumission } = await supabase
        .from('soumissions_etude_cas')
        .select('id')
        .eq('etude_cas_id', parseInt(etudeCasId))
        .eq('user_id', user.id)
        .maybeSingle();

      result.etudeCasSoumis = !!soumission;
    }

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Erreur dans GET /api/espace-etudiant/evaluations/check:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}




