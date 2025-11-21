import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

/**
 * Endpoint optimisé pour charger tous les cours d'un bloc avec leurs données complètes
 * 
 * AVANT : M + M×N + M requêtes (M = cours, N = chapitres par cours)
 * APRÈS : 1 requête avec jointures SQL
 * 
 * Charge pour chaque cours :
 * - Les informations du cours
 * - Tous les chapitres avec leurs fichiers complémentaires
 * - Tous les quiz avec leurs questions et réponses (indexés par chapitre_id)
 * - L'étude de cas avec ses questions et réponses
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blocId: string }> }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { blocId } = await params;
    const blocIdNum = parseInt(blocId, 10);

    if (isNaN(blocIdNum)) {
      return NextResponse.json({ error: 'ID de bloc invalide' }, { status: 400 });
    }

    // 1. Charger tous les cours du bloc
    const { data: cours, error: coursError } = await supabase
      .from('cours_apprentissage')
      .select('*')
      .eq('bloc_id', blocIdNum)
      .eq('actif', true)
      .order('ordre_affichage', { ascending: true });

    if (coursError) {
      console.error('Erreur lors de la récupération des cours:', coursError);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    if (!cours || cours.length === 0) {
      return NextResponse.json({ cours: [] });
    }

    const coursIds = cours.map(c => c.id);

    // 2. Charger tous les chapitres de tous les cours en une seule requête (pour la visualisation, on charge tous les chapitres)
    const { data: allChapitres, error: chapitresError } = await supabase
      .from('chapitres_cours')
      .select('*')
      .in('cours_id', coursIds)
      // Pas de filtre actif pour la visualisation - on veut voir tous les chapitres
      .order('ordre_affichage', { ascending: true });

    if (chapitresError) {
      console.error('Erreur lors de la récupération des chapitres:', chapitresError);
    }

    const chapitresList = allChapitres || [];
    const chapitreIds = chapitresList.map(c => c.id);

    console.log(`[DEBUG] ${chapitresList.length} chapitres trouvés pour ${coursIds.length} cours`);

    // 3. Organiser les chapitres par cours_id
    const chapitresByCours = new Map<number, any[]>();
    chapitresList.forEach((chapitre: any) => {
      if (!chapitresByCours.has(chapitre.cours_id)) {
        chapitresByCours.set(chapitre.cours_id, []);
      }
      chapitresByCours.get(chapitre.cours_id)!.push(chapitre);
    });

    // 4. Charger tous les quiz pour tous les chapitres en une seule requête
    let quizzesMap = new Map<number, any>();
    if (chapitreIds.length > 0) {
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quiz_evaluations')
        .select('*')
        .in('chapitre_id', chapitreIds)
        .eq('actif', true);

      if (quizzesError) {
        console.error('Erreur lors de la récupération des quiz:', quizzesError);
      } else if (quizzes && quizzes.length > 0) {
        console.log(`[DEBUG] ${quizzes.length} quiz trouvés pour les chapitres:`, chapitreIds);
        const quizIds = quizzes.map(q => q.id);

        // Charger les questions pour tous les quiz en une seule requête
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
        } else {
          console.log(`[DEBUG] ${questions?.length || 0} questions trouvées pour les quiz`);
        }

        // Organiser les questions par quiz_id
        const questionsByQuiz = new Map<number, any[]>();
        if (questions) {
          questions.forEach((q: any) => {
            const quizId = q.quiz_id;
            if (!questionsByQuiz.has(quizId)) {
              questionsByQuiz.set(quizId, []);
            }
            questionsByQuiz.get(quizId)!.push(q);
          });
        }

        // Associer chaque quiz à son chapitre_id avec ses questions
        quizzes.forEach((quiz: any) => {
          // Vérifier que chapitre_id existe et n'est pas null
          if (quiz.chapitre_id != null) {
            quizzesMap.set(quiz.chapitre_id, {
              id: quiz.id,
              chapitre_id: quiz.chapitre_id,
              cours_id: quiz.cours_id,
              titre: quiz.titre || 'Quiz',
              quiz,
              questions: questionsByQuiz.get(quiz.id) || []
            });
            console.log(`[DEBUG] Quiz ${quiz.id} associé au chapitre ${quiz.chapitre_id}`);
          } else {
            console.warn(`[DEBUG] Quiz ${quiz.id} n'a pas de chapitre_id`);
          }
        });
      } else {
        console.log(`[DEBUG] Aucun quiz trouvé pour les chapitres:`, chapitreIds);
      }
    } else {
      console.log('[DEBUG] Aucun chapitre trouvé, impossible de charger les quiz');
    }

    // 5. Charger toutes les études de cas pour tous les chapitres en une seule requête
    const { data: allEtudesCas, error: etudesCasError } = await supabase
      .from('etudes_cas')
      .select('*')
      .in('chapitre_id', chapitreIds)
      .eq('actif', true);

    if (etudesCasError) {
      console.error('Erreur lors de la récupération des études de cas:', etudesCasError);
    }

    const etudesCasList = allEtudesCas || [];
    const etudeCasIds = etudesCasList.map(ec => ec.id);

    // 6. Charger toutes les questions d'étude de cas en une seule requête
    let etudeCasQuestionsMap = new Map<number, any[]>();
    if (etudeCasIds.length > 0) {
      const { data: questions, error: questionsError } = await supabase
        .from('questions_etude_cas')
        .select(`
          *,
          reponses_possibles:reponses_possibles_etude_cas (*)
        `)
        .in('etude_cas_id', etudeCasIds)
        .eq('actif', true)
        .order('ordre_affichage', { ascending: true });

      if (questionsError) {
        console.error('Erreur lors de la récupération des questions d\'étude de cas:', questionsError);
      } else if (questions) {
        questions.forEach((q: any) => {
          const etudeCasId = q.etude_cas_id;
          if (!etudeCasQuestionsMap.has(etudeCasId)) {
            etudeCasQuestionsMap.set(etudeCasId, []);
          }
          etudeCasQuestionsMap.get(etudeCasId)!.push(q);
        });
      }
    }

    // 7. Organiser les études de cas par chapitre_id, puis par cours_id
    const etudeCasByChapitre = new Map<number, any>();
    etudesCasList.forEach((ec: any) => {
      etudeCasByChapitre.set(ec.chapitre_id, {
        id: ec.id,
        titre: ec.titre || 'Étude de cas',
        etudeCas: ec,
        questions: etudeCasQuestionsMap.get(ec.id) || []
      });
    });

    // 8. Construire la réponse optimisée avec tous les cours et leurs données
    const coursWithData = cours.map((c: any) => {
      const chapitres = chapitresByCours.get(c.id) || [];
      
      // Les fichiers complémentaires sont déjà dans le champ fichiers_complementaires (ARRAY)
      const chapitresWithDetails = chapitres.map((chapitre: any) => {
        const fichiersComplementaires = Array.isArray(chapitre.fichiers_complementaires) 
          ? chapitre.fichiers_complementaires.filter(Boolean)
          : [];

        // Récupérer les quiz pour ce chapitre
        const quizData = quizzesMap.get(chapitre.id);
        
        // Récupérer l'étude de cas pour ce chapitre
        const etudeCasData = etudeCasByChapitre.get(chapitre.id);

        return {
          ...chapitre,
          fichiers_complementaires: fichiersComplementaires,
          quiz: quizData || null,
          etude_cas: etudeCasData || null
        };
      });

      return {
        ...c,
        chapitres: chapitresWithDetails
      };
    });

    return NextResponse.json({ cours: coursWithData });
  } catch (error) {
    console.error('Erreur dans l\'API blocs cours-complete:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

