import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * POST - Soumettre un quiz (créer une tentative avec les réponses)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    const body = await request.json();
    const { 
      quiz_id, 
      reponses, // { question_id: [reponse_id] ou reponse_donnee }
      temps_passe_minutes,
      date_debut,
      date_fin
    } = body;

    if (!quiz_id) {
      return NextResponse.json(
        { success: false, error: 'quiz_id est requis' },
        { status: 400 }
      );
    }

    // Récupérer les questions du quiz pour calculer le score
    const { data: questions, error: questionsError } = await supabase
      .from('questions_quiz')
      .select('id, points, type_question')
      .eq('quiz_id', quiz_id)
      .eq('actif', true);

    if (questionsError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des questions' },
        { status: 500 }
      );
    }

    // Calculer le score
    let scoreTotal = 0;
    let pointsMax = 0;
    const reponsesDetaillees: any[] = [];

    for (const question of questions || []) {
      pointsMax += question.points || 1;
      
      const userReponses = reponses[question.id];
      if (!userReponses) continue;

      // Récupérer les bonnes réponses pour cette question
      const { data: bonnesReponses } = await supabase
        .from('reponses_possibles')
        .select('id')
        .eq('question_id', question.id)
        .eq('est_correcte', true);

      const bonnesReponsesIds = bonnesReponses?.map(r => r.id) || [];
      const userReponsesArray = Array.isArray(userReponses) ? userReponses : [userReponses];

      let isCorrect = false;
      if (question.type_question === 'choix_multiple') {
        // Pour choix multiple, toutes les bonnes réponses doivent être sélectionnées
        isCorrect = userReponsesArray.length === bonnesReponsesIds.length &&
          bonnesReponsesIds.every(id => userReponsesArray.includes(id));
      } else {
        // Pour choix unique ou vrai_faux
        isCorrect = userReponsesArray.length === 1 && bonnesReponsesIds.includes(userReponsesArray[0]);
      }

      const pointsObtenus = isCorrect ? (question.points || 1) : 0;
      scoreTotal += pointsObtenus;

      // Enregistrer la réponse détaillée
      reponsesDetaillees.push({
        question_id: question.id,
        reponse_donnee: Array.isArray(userReponses) ? JSON.stringify(userReponses) : userReponses,
        reponse_correcte_id: bonnesReponsesIds.length === 1 ? bonnesReponsesIds[0] : null,
        points_obtenus: pointsObtenus
      });
    }

    // Calculer le score en pourcentage
    const scorePourcentage = pointsMax > 0 ? Math.round((scoreTotal / pointsMax) * 100) : 0;

    // Récupérer le numéro de tentative actuel
    const { data: tentativesExistantes } = await supabase
      .from('tentatives_quiz')
      .select('numero_tentative')
      .eq('quiz_id', quiz_id)
      .eq('user_id', user.id)
      .order('numero_tentative', { ascending: false })
      .limit(1);

    const numeroTentative = tentativesExistantes && tentativesExistantes.length > 0
      ? tentativesExistantes[0].numero_tentative + 1
      : 1;

    // Créer la tentative
    const { data: tentative, error: tentativeError } = await supabase
      .from('tentatives_quiz')
      .insert({
        quiz_id: quiz_id,
        user_id: user.id,
        numero_tentative: numeroTentative,
        score: scorePourcentage,
        temps_passe: temps_passe_minutes || 0,
        termine: true,
        date_debut: date_debut || new Date().toISOString(),
        date_fin: date_fin || new Date().toISOString()
      })
      .select()
      .single();

    if (tentativeError) {
      console.error('Erreur lors de la création de la tentative:', tentativeError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la soumission du quiz' },
        { status: 500 }
      );
    }

    // Enregistrer les réponses détaillées
    if (reponsesDetaillees.length > 0) {
      const reponsesAInserer = reponsesDetaillees.map(r => ({
        ...r,
        tentative_id: tentative.id
      }));

      const { error: reponsesError } = await supabase
        .from('reponses_quiz')
        .insert(reponsesAInserer);

      if (reponsesError) {
        console.error('Erreur lors de l\'enregistrement des réponses:', reponsesError);
      }
    }

    // Récupérer le cours et le bloc pour créer une note
    const { data: quiz } = await supabase
      .from('quiz_evaluations')
      .select('cours_id')
      .eq('id', quiz_id)
      .single();

    if (quiz) {
      const { data: cours } = await supabase
        .from('cours_apprentissage')
        .select('bloc_id')
        .eq('id', quiz.cours_id)
        .single();

      if (cours) {
        // Récupérer l'étudiant
        const { data: etudiant } = await supabase
          .from('etudiants')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (etudiant) {
          // Créer ou mettre à jour la note
          const noteSur20 = Math.round((scorePourcentage / 100) * 20);
          
          await supabase
            .from('notes_etudiants')
            .upsert({
              etudiant_id: etudiant.id,
              bloc_id: cours.bloc_id,
              type_evaluation: 'quiz',
              evaluation_id: quiz_id,
              note: noteSur20,
              note_max: 20,
              temps_passe: temps_passe_minutes || 0,
              numero_tentative: numeroTentative,
              date_evaluation: new Date().toISOString()
            }, {
              onConflict: 'etudiant_id,type_evaluation,evaluation_id,numero_tentative'
            });
        }
      }
    }

    return NextResponse.json({
      success: true,
      tentative: {
        id: tentative.id,
        score: scorePourcentage,
        scoreSur20: Math.round((scorePourcentage / 100) * 20),
        pointsObtenus: scoreTotal,
        pointsMax: pointsMax,
        numeroTentative: numeroTentative
      }
    });
  } catch (error) {
    console.error('Erreur dans POST /api/espace-etudiant/quiz/submit:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

