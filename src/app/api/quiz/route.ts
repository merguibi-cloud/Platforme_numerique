import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { QuizEvaluation, CreateQuizData } from '@/types/formation-detailed';
import { logCreate, logUpdate, logDelete } from '@/lib/audit-logger';

// GET - Récupérer un quiz par chapitre_id ou cours_id
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const chapitreId = searchParams.get('chapitreId');
    const coursId = searchParams.get('coursId');
    const quizId = searchParams.get('quizId');

    if (quizId) {
      // Récupérer un quiz spécifique avec ses questions
      const { data: quiz, error: quizError } = await supabase
        .from('quiz_evaluations')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError || !quiz) {
        return NextResponse.json({ error: 'Quiz non trouvé' }, { status: 404 });
      }

      // Récupérer les questions avec leurs réponses possibles
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:27',message:'Fetching questions for quizId',data:{quizId,quizActif:quiz.actif},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      const { data: questions, error: questionsError } = await supabase
        .from('questions_quiz')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('actif', true)
        .order('ordre_affichage', { ascending: true});

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:32',message:'Questions query result for quizId',data:{quizId,questionsCount:questions?.length || 0,hasError:!!questionsError,errorMessage:questionsError?.message,questionIds:questions?.map(q => ({id:q.id,actif:q.actif})) || []},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion

      if (questionsError) {
        return NextResponse.json({ quiz, questions: [] });
      }

      // Récupérer les réponses possibles pour toutes les questions
      let questionsWithReponses = questions || [];
      if (questions && questions.length > 0) {
        const questionIds = questions.map(q => q.id);
        const { data: reponses, error: reponsesError } = await supabase
          .from('reponses_possibles')
          .select('*')
          .in('question_id', questionIds)
          .order('ordre_affichage', { ascending: true });

        if (!reponsesError && reponses) {
          // Group reponses by question_id
          const reponsesByQuestion = new Map<number, any[]>();
          reponses.forEach(reponse => {
            if (!reponsesByQuestion.has(reponse.question_id)) {
              reponsesByQuestion.set(reponse.question_id, []);
            }
            reponsesByQuestion.get(reponse.question_id)!.push(reponse);
          });

          // Attach reponses to questions
          questionsWithReponses = questions.map(q => ({
            ...q,
            reponses_possibles: reponsesByQuestion.get(q.id) || []
          }));
        }
      }

      return NextResponse.json({ quiz, questions: questionsWithReponses });
    }

    if (chapitreId) {
      // Récupérer le quiz pour un chapitre spécifique
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:70',message:'GET quiz by chapitreId',data:{chapitreId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      const { data: quiz, error } = await supabase
        .from('quiz_evaluations')
        .select('*')
        .eq('chapitre_id', chapitreId)
        .eq('actif', true)
        .single();
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:78',message:'Quiz query result',data:{hasQuiz:!!quiz,hasError:!!error,errorCode:error?.code,errorMessage:error?.message,quizId:quiz?.id,quizChapitreId:quiz?.chapitre_id,quizCoursId:quiz?.cours_id,quizActif:quiz?.actif},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
      }

      if (!quiz) {
        return NextResponse.json({ quiz: null });
      }

      // Récupérer les questions
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:88',message:'Fetching questions for quiz by chapitreId',data:{quizId:quiz.id,chapitreId,quizActif:quiz.actif},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      const { data: questions, error: questionsError } = await supabase
        .from('questions_quiz')
        .select('*')
        .eq('quiz_id', quiz.id)
        .eq('actif', true)
        .order('ordre_affichage', { ascending: true });
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:95',message:'Questions query result for chapitreId',data:{quizId:quiz.id,chapitreId,questionsCount:questions?.length || 0,hasError:!!questionsError,errorMessage:questionsError?.message,questionIds:questions?.map(q => ({id:q.id,actif:q.actif})) || []},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion

      // Récupérer les réponses possibles pour toutes les questions
      let questionsWithReponses = questions || [];
      if (questions && questions.length > 0) {
        const questionIds = questions.map(q => q.id);
        const { data: reponses, error: reponsesError } = await supabase
          .from('reponses_possibles')
          .select('*')
          .in('question_id', questionIds)
          .order('ordre_affichage', { ascending: true });

        if (!reponsesError && reponses) {
          // Group reponses by question_id
          const reponsesByQuestion = new Map<number, any[]>();
          reponses.forEach(reponse => {
            if (!reponsesByQuestion.has(reponse.question_id)) {
              reponsesByQuestion.set(reponse.question_id, []);
            }
            reponsesByQuestion.get(reponse.question_id)!.push(reponse);
          });

          // Attach reponses to questions
          questionsWithReponses = questions.map(q => ({
            ...q,
            reponses_possibles: reponsesByQuestion.get(q.id) || []
          }));
        }
      }

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:147',message:'Returning quiz with questions for chapitreId',data:{quizId:quiz.id,chapitreId,questionsCount:questionsWithReponses?.length || 0,questionsWithReponses:questionsWithReponses?.map(q => ({id:q.id,hasReponses:q.reponses_possibles?.length > 0})) || []},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion

      return NextResponse.json({
        quiz,
        questions: questionsWithReponses
      });
    }

    if (coursId) {
      // Récupérer tous les quiz d'un cours (soit directement liés au cours, soit via chapitre_id)
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:143',message:'GET quiz by coursId',data:{coursId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      
      // D'abord, récupérer tous les chapitres du cours pour chercher les quiz liés à ces chapitres
      const { data: chapitresDuCours } = await supabase
        .from('chapitres_cours')
        .select('id')
        .eq('cours_id', coursId)
        .eq('actif', true);
      
      const chapitreIds = chapitresDuCours?.map(ch => ch.id) || [];
      
      // Chercher les quiz liés au cours directement OU aux chapitres du cours
      let query = supabase
        .from('quiz_evaluations')
        .select('*')
        .eq('actif', true);
      
      // Construire la requête : quiz avec cours_id OU quiz avec chapitre_id dans les chapitres du cours
      if (chapitreIds.length > 0) {
        query = query.or(`cours_id.eq.${coursId},chapitre_id.in.(${chapitreIds.join(',')})`);
      } else {
        query = query.eq('cours_id', coursId);
      }
      
      const { data: quizzes, error } = await query.order('created_at', { ascending: true });
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:160',message:'Quiz query by coursId result',data:{coursId,chapitresCount:chapitreIds.length,quizzesCount:quizzes?.length || 0,hasError:!!error,errorMessage:error?.message,quizIds:quizzes?.map(q => q.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion

      if (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
      }

      return NextResponse.json({ quizzes: quizzes || [] });
    }

    return NextResponse.json({ error: 'chapitreId, coursId ou quizId requis' }, { status: 400 });
  } catch (error) {
    console.error('Erreur lors de la récupération du quiz:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau quiz
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();
    const { cours_id, chapitre_id, titre, description, duree_minutes, nombre_tentatives_max, seuil_reussite, questions_aleatoires } = body;

    if (!cours_id || !chapitre_id || !titre) {
      return NextResponse.json({ error: 'cours_id, chapitre_id et titre sont requis' }, { status: 400 });
    }

    // Récupérer le max ID des quiz
    const { data: maxQuizIdData, error: maxQuizIdError } = await supabase
      .from('quiz_evaluations')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .single();
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:163',message:'Max quiz ID query',data:{maxQuizId:maxQuizIdData?.id,hasError:!!maxQuizIdError},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    const nextQuizId = maxQuizIdData?.id ? maxQuizIdData.id + 1 : 1;

    const quizData = {
      id: nextQuizId, // Ajouter l'ID manuellement
      cours_id,
      chapitre_id,
      titre,
      description,
      duree_minutes: duree_minutes || 30,
      nombre_tentatives_max: nombre_tentatives_max || 3,
      seuil_reussite: seuil_reussite || 50,
      questions_aleatoires: questions_aleatoires || false,
      actif: true, // Le quiz est actif par défaut pour être visible côté étudiant
    };
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:177',message:'Before quiz insert',data:quizData,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion

    const { data: quiz, error } = await supabase
      .from('quiz_evaluations')
      .insert(quizData)
      .select()
      .single();
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:186',message:'Quiz insert result',data:{hasQuiz:!!quiz,hasError:!!error,errorCode:error?.code,errorMessage:error?.message,errorDetails:error?.details},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion

    if (error) {
      console.error('Erreur lors de la création du quiz:', error);
      await logCreate(request, 'quiz_evaluations', 'unknown', quizData, `Échec de création de quiz: ${error.message}`).catch(() => {});
      return NextResponse.json({ error: 'Erreur lors de la création du quiz' }, { status: 500 });
    }

    await logCreate(request, 'quiz_evaluations', quiz.id, quiz, `Création du quiz "${quiz.titre}"`).catch(() => {});

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du quiz:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour un quiz
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();
    const { quizId, ...updates } = body;

    if (!quizId) {
      return NextResponse.json({ error: 'quizId est requis' }, { status: 400 });
    }

    // Récupérer l'ancien quiz pour le log
    const { data: oldQuiz } = await supabase
      .from('quiz_evaluations')
      .select('*')
      .eq('id', quizId)
      .single();

    const { data: quiz, error } = await supabase
      .from('quiz_evaluations')
      .update(updates)
      .eq('id', quizId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du quiz:', error);
      await logUpdate(request, 'quiz_evaluations', quizId, oldQuiz || {}, updates, Object.keys(updates), `Échec de mise à jour du quiz: ${error.message}`).catch(() => {});
      return NextResponse.json({ error: 'Erreur lors de la mise à jour du quiz' }, { status: 500 });
    }

    await logUpdate(request, 'quiz_evaluations', quizId, oldQuiz || {}, quiz, Object.keys(updates), `Mise à jour du quiz "${quiz.titre || quizId}"`).catch(() => {});

    // Vérifier si le quiz est vide (sans questions actives) et le supprimer automatiquement
    const { data: questions } = await supabase
      .from('questions_quiz')
      .select('id')
      .eq('quiz_id', quizId)
      .eq('actif', true)
      .limit(1);

    if (!questions || questions.length === 0) {
      // Le quiz est vide, le désactiver
      await supabase
        .from('quiz_evaluations')
        .update({ actif: false })
        .eq('id', quizId);

      await logDelete(request, 'quiz_evaluations', quizId, quiz, `Suppression automatique du quiz vide "${quiz.titre || quizId}" (aucune question active)`).catch(() => {});
      
      return NextResponse.json({ 
        quiz: { ...quiz, actif: false },
        message: 'Quiz désactivé automatiquement car vide'
      });
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du quiz:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

