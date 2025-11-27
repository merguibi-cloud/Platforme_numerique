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

    // Récupérer le quiz pour obtenir la limite de tentatives
    const { data: quizData, error: quizDataError } = await supabase
      .from('quiz_evaluations')
      .select('nombre_tentatives_max')
      .eq('id', quiz_id)
      .single();

    if (quizDataError || !quizData) {
      return NextResponse.json(
        { success: false, error: 'Quiz non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier le nombre de tentatives existantes
    const { data: tentativesExistantes, error: tentativesError } = await supabase
      .from('tentatives_quiz')
      .select('numero_tentative')
      .eq('quiz_id', quiz_id)
      .eq('user_id', user.id)
      .order('numero_tentative', { ascending: false });

    if (tentativesError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la vérification des tentatives' },
        { status: 500 }
      );
    }

    const nombreTentatives = tentativesExistantes?.length || 0;
    const nombreTentativesMax = quizData.nombre_tentatives_max || 3;

    // Vérifier si l'étudiant a atteint la limite de tentatives
    if (nombreTentatives >= nombreTentativesMax) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Vous avez atteint le nombre maximum de tentatives (${nombreTentativesMax}). Vous ne pouvez plus faire ce quiz.` 
        },
        { status: 403 }
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

    // Calculer le score sur 20 (toutes les notes sont sur 20)
    // 1 question = 20 points, 2 questions = 10 points chacun, etc.
    const nombreQuestions = questions?.length || 0;
    const pointsParQuestion = nombreQuestions > 0 ? 20 / nombreQuestions : 0;
    
    let scoreTotal = 0;
    let reponsesCorrectes = 0;
    const reponsesDetaillees: any[] = [];

    for (const question of questions || []) {
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

      // Points obtenus : si correct, pointsParQuestion, sinon 0
      const pointsObtenus = isCorrect ? pointsParQuestion : 0;
      scoreTotal += pointsObtenus;
      if (isCorrect) reponsesCorrectes++;

      // Enregistrer la réponse détaillée
      reponsesDetaillees.push({
        question_id: question.id,
        reponse_donnee: Array.isArray(userReponses) ? JSON.stringify(userReponses) : userReponses,
        reponse_correcte_id: bonnesReponsesIds.length === 1 ? bonnesReponsesIds[0] : null,
        points_obtenus: pointsObtenus
        // Note: points_max n'existe pas dans la table reponses_quiz
        // Les points maximums sont stockés dans questions_quiz.points
      });
    }

    // Le score est directement sur 20 (pas de pourcentage)
    const scoreSur20 = Math.round(scoreTotal * 100) / 100; // Arrondir à 2 décimales
    const scorePourcentage = Math.round((scoreSur20 / 20) * 100); // Pourcentage pour compatibilité

    // Calculer le numéro de tentative (on utilise déjà tentativesExistantes récupéré plus haut)
    const numeroTentative = nombreTentatives + 1;

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
          // Créer ou mettre à jour la note (une seule note par quiz, écrase l'ancienne)
          // scoreSur20 est déjà calculé sur 20
          
          // Vérifier si une note existe déjà
          const { data: noteExistante } = await supabase
            .from('notes_etudiants')
            .select('id')
            .eq('etudiant_id', etudiant.id)
            .eq('type_evaluation', 'quiz')
            .eq('evaluation_id', quiz_id)
            .maybeSingle();

          if (noteExistante) {
            // Mettre à jour la note existante (écrase l'ancienne)
            await supabase
              .from('notes_etudiants')
              .update({
                note: scoreSur20,
                note_max: 20,
                temps_passe: temps_passe_minutes || 0,
                numero_tentative: numeroTentative,
                date_evaluation: new Date().toISOString()
              })
              .eq('id', noteExistante.id);
          } else {
            // Créer une nouvelle note
            await supabase
              .from('notes_etudiants')
              .insert({
                etudiant_id: etudiant.id,
                bloc_id: cours.bloc_id,
                type_evaluation: 'quiz',
                evaluation_id: quiz_id,
                note: scoreSur20,
                note_max: 20,
                temps_passe: temps_passe_minutes || 0,
                numero_tentative: numeroTentative,
                date_evaluation: new Date().toISOString()
              });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      tentative: {
        id: tentative.id,
        score: scorePourcentage, // Pourcentage pour compatibilité
        scoreSur20: scoreSur20, // Score réel sur 20
        reponsesCorrectes: reponsesCorrectes,
        totalQuestions: nombreQuestions,
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

