import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

/**
 * Endpoint optimisé pour charger toutes les données d'un cours en une seule requête
 * 
 * AVANT : 5 + 2N + M requêtes (N = nombre de chapitres, M = nombre de cours)
 * APRÈS : 1 requête avec jointures SQL
 * 
 * Charge :
 * - Le cours avec ses informations
 * - Tous les chapitres avec leurs fichiers complémentaires
 * - Tous les quiz avec leurs questions et réponses possibles
 * - L'étude de cas avec ses questions et réponses possibles
 * - Le bloc associé
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coursId: string }> }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { coursId } = await params;
    const coursIdNum = parseInt(coursId, 10);

    if (isNaN(coursIdNum)) {
      return NextResponse.json({ error: 'ID de cours invalide' }, { status: 400 });
    }

    // 1. Charger le cours
    const { data: cours, error: coursError } = await supabase
      .from('cours_apprentissage')
      .select('*')
      .eq('id', coursIdNum)
      .single();

    if (coursError) {
      console.error('Erreur lors de la récupération du cours:', coursError);
      return NextResponse.json({ error: 'Cours non trouvé', details: coursError.message }, { status: 404 });
    }

    // 1b. Charger le bloc associé séparément
    let blocs_competences = null;
    if (cours.bloc_id) {
      const { data: blocData, error: blocError } = await supabase
        .from('blocs_competences')
        .select('id, numero_bloc, titre, description, formation_id')
        .eq('id', cours.bloc_id)
        .single();

      if (blocError) {
        console.error('Erreur lors de la récupération du bloc:', blocError);
      } else {
        blocs_competences = blocData;
      }
    }

    // 2. Charger tous les chapitres du cours (pour la visualisation, on charge tous les chapitres, même inactifs)
    const { data: chapitres, error: chapitresError } = await supabase
      .from('chapitres_cours')
      .select('*')
      .eq('cours_id', coursIdNum)
      // Pas de filtre actif pour la visualisation - on veut voir tous les chapitres
      .order('ordre_affichage', { ascending: true });

    if (chapitresError) {
      console.error('Erreur lors de la récupération des chapitres:', chapitresError);
    }

    const chapitresList = chapitres || [];
    const chapitreIds = chapitresList.map(c => c.id);

    // 3. Charger tous les quiz pour ces chapitres avec leurs questions et réponses
    let quizzesMap = new Map<number, any>();
    
    if (chapitreIds.length > 0) {
      // Charger les quiz qui ont un chapitre_id correspondant à nos chapitres
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quiz_evaluations')
        .select('*')
        .in('chapitre_id', chapitreIds)
        .eq('actif', true);

      if (quizzesError) {
        console.error('Erreur lors de la récupération des quiz:', quizzesError);
      } else if (quizzes && quizzes.length > 0) {
        const quizIds = quizzes.map(q => q.id);

        // Charger les questions pour tous les quiz
        const { data: questions, error: questionsError } = await supabase
          .from('questions_quiz')
          .select(`
            *,
            reponses_possibles (*)
          `)
          .in('quiz_id', quizIds)
          .eq('actif', true)
          .order('ordre_affichage', { ascending: true });

        if (questionsError) {
          console.error('Erreur lors de la récupération des questions:', questionsError);
        }

        // Organiser les questions par quiz_id
        const questionsByQuiz = new Map<number, any[]>();
        questions?.forEach((q: any) => {
          if (!questionsByQuiz.has(q.quiz_id)) {
            questionsByQuiz.set(q.quiz_id, []);
          }
          questionsByQuiz.get(q.quiz_id)!.push(q);
        });

        // Construire la map des quiz avec leurs questions
        quizzes.forEach((quiz: any) => {
          quizzesMap.set(quiz.chapitre_id || quiz.cours_id, {
            ...quiz,
            questions: questionsByQuiz.get(quiz.id) || []
          });
        });
      }
    }

    // 4. Charger l'étude de cas du cours (si elle existe) avec ses questions et réponses
    // L'étude de cas est associée directement au cours via cours_id
    // Il ne peut y avoir qu'une seule étude de cas par cours
    let etudeCas = null;
    let etudeCasQuestions = [];

    // Chercher l'étude de cas pour ce cours
    const { data: etudeCasData, error: etudeCasError } = await supabase
      .from('etudes_cas')
      .select('*')
      .eq('cours_id', coursId)
      .eq('actif', true)
      .maybeSingle();

    if (etudeCasError && etudeCasError.code !== 'PGRST116') {
      console.error('Erreur lors de la récupération de l\'étude de cas:', etudeCasError);
    } else if (etudeCasData) {
      etudeCas = etudeCasData;
      const etudeCasId = etudeCasData.id;

      // Charger les questions de l'étude de cas
      const { data: questionsEtudeCas, error: questionsEtudeCasError } = await supabase
        .from('questions_etude_cas')
        .select(`
          *,
          reponses_possibles_etude_cas (*)
        `)
        .eq('etude_cas_id', etudeCasId)
        .eq('actif', true)
        .order('ordre_affichage', { ascending: true });

      if (questionsEtudeCasError) {
        console.error('Erreur lors de la récupération des questions de l\'étude de cas:', questionsEtudeCasError);
      } else {
        etudeCasQuestions = questionsEtudeCas || [];
      }
    }

    // 5. Organiser les quiz par chapitre_id
    const quizzesByChapitre = new Map<number, any[]>();
    quizzesMap.forEach((quiz, chapitreId) => {
      if (!quizzesByChapitre.has(chapitreId)) {
        quizzesByChapitre.set(chapitreId, []);
      }
      quizzesByChapitre.get(chapitreId)!.push(quiz);
    });

    // 6. Construire la réponse finale
    const response = {
      cours: {
        ...cours,
        blocs_competences,
        chapitres: chapitresList.map((chapitre: any) => ({
          ...chapitre,
          fichiers_complementaires: chapitre.fichiers_complementaires || [],
          quizzes: quizzesByChapitre.get(chapitre.id) || []
        })),
        etude_cas: etudeCas,
        etude_cas_questions: etudeCasQuestions
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erreur dans l\'endpoint complete:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

