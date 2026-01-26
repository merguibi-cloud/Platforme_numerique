import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { CreateQuestionData, QuestionQuiz } from '@/types/formation-detailed';
import { logCreate, logUpdate, logDelete } from '@/lib/audit-logger';

// POST - Créer une question
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();
    const { quiz_id, question, type_question, points, explication, justification, reponses_possibles } = body;

    if (!quiz_id || !question || !type_question) {
      return NextResponse.json({ error: 'quiz_id, question et type_question sont requis' }, { status: 400 });
    }

    // Récupérer le nombre de questions existantes pour l'ordre d'affichage
    const { count } = await supabase
      .from('questions_quiz')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quiz_id);

    const questionData = {
      quiz_id,
      question,
      type_question,
      points: points || 1,
      ordre_affichage: (count || 0) + 1,
      explication,
      justification,
      actif: true, // Les questions sont actives par défaut pour être visibles
    };

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:33',message:'Before question insert',data:questionData,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    
    // Récupérer le max ID pour générer l'ID manuellement
    const { data: maxQuestionIdData, error: maxQuestionIdError } = await supabase
      .from('questions_quiz')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .single();
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:37',message:'Max question ID query',data:{maxQuestionId:maxQuestionIdData?.id,hasError:!!maxQuestionIdError},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    const nextQuestionId = maxQuestionIdData?.id ? maxQuestionIdData.id + 1 : 1;
    
    const questionDataWithId = { ...questionData, id: nextQuestionId };
    
    const { data: newQuestion, error: questionError } = await supabase
      .from('questions_quiz')
      .insert(questionDataWithId)
      .select()
      .single();
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:45',message:'Question insert result',data:{hasQuestion:!!newQuestion,hasError:!!questionError,errorCode:questionError?.code,errorMessage:questionError?.message,errorDetails:questionError?.details},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion

    if (questionError) {
      console.error('Erreur lors de la création de la question:', questionError);
      await logCreate(request, 'questions_quiz', 'unknown', questionData, `Échec de création de question: ${questionError.message}`).catch(() => {});
      return NextResponse.json({ error: questionError.message || 'Erreur lors de la création de la question' }, { status: 500 });
    }

    // Logger la création de la question
    await logCreate(request, 'questions_quiz', newQuestion.id, newQuestion, `Création d'une question pour le quiz ${quiz_id}`).catch(() => {});

    // Si c'est une question avec réponses possibles (choix_unique, choix_multiple, vrai_faux)
    if (reponses_possibles && reponses_possibles.length > 0 && 
        (type_question === 'choix_unique' || type_question === 'choix_multiple' || type_question === 'vrai_faux')) {
      
      // Récupérer le max ID des réponses
      const { data: maxReponseIdData, error: maxReponseIdError } = await supabase
        .from('reponses_possibles')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:62',message:'Max reponse ID query',data:{maxReponseId:maxReponseIdData?.id,hasError:!!maxReponseIdError},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
      let nextReponseId = maxReponseIdData?.id ? maxReponseIdData.id + 1 : 1;
      
      const reponsesData = reponses_possibles.map((reponse: any, index: number) => ({
        id: nextReponseId + index, // Générer des IDs séquentiels
        question_id: newQuestion.id,
        reponse: reponse.reponse,
        est_correcte: reponse.est_correcte || false,
        ordre_affichage: reponse.ordre_affichage || index + 1,
      }));
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:71',message:'Before reponses insert',data:{reponsesCount:reponsesData.length,firstReponse:reponsesData[0]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
      // #endregion

      const { error: reponsesError } = await supabase
        .from('reponses_possibles')
        .insert(reponsesData);
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:76',message:'Reponses insert result',data:{hasError:!!reponsesError,errorCode:reponsesError?.code,errorMessage:reponsesError?.message,errorDetails:reponsesError?.details},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
      // #endregion

      if (reponsesError) {
        console.error('Erreur lors de la création des réponses:', reponsesError);
        // Ne pas échouer complètement, on a déjà créé la question
      }
    }

    // Récupérer la question avec ses réponses
    const { data: questionWithReponses, error: fetchError } = await supabase
      .from('questions_quiz')
      .select(`
        *,
        reponses_possibles (*)
      `)
      .eq('id', newQuestion.id)
      .single();

    return NextResponse.json({ question: questionWithReponses }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la question:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour une question
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();
    const { questionId, question, type_question, points, explication, justification, reponses_possibles } = body;

    if (!questionId) {
      return NextResponse.json({ error: 'questionId est requis' }, { status: 400 });
    }

    const updateData: any = {};
    if (question !== undefined) updateData.question = question;
    if (type_question !== undefined) updateData.type_question = type_question;
    if (points !== undefined) updateData.points = points;
    if (explication !== undefined) updateData.explication = explication;
    if (justification !== undefined) updateData.justification = justification;

    const { data: updatedQuestion, error: updateError } = await supabase
      .from('questions_quiz')
      .update(updateData)
      .eq('id', questionId)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur lors de la mise à jour de la question:', updateError);
      // Récupérer l'ancienne question pour le log
      const { data: oldQuestion } = await supabase
        .from('questions_quiz')
        .select('*')
        .eq('id', questionId)
        .single();
      await logUpdate(request, 'questions_quiz', questionId, oldQuestion || {}, updateData, Object.keys(updateData), `Échec de mise à jour de question: ${updateError.message}`).catch(() => {});
      return NextResponse.json({ error: 'Erreur lors de la mise à jour de la question' }, { status: 500 });
    }

    // Logger la mise à jour
    const { data: oldQuestion } = await supabase
      .from('questions_quiz')
      .select('*')
      .eq('id', questionId)
      .single();
    await logUpdate(request, 'questions_quiz', questionId, oldQuestion || {}, updatedQuestion, Object.keys(updateData), `Mise à jour de la question ${questionId}`).catch(() => {});

    // Si des réponses sont fournies, les mettre à jour
    if (reponses_possibles && Array.isArray(reponses_possibles)) {
      // Supprimer les anciennes réponses
      await supabase
        .from('reponses_possibles')
        .delete()
        .eq('question_id', questionId);

      // Créer les nouvelles réponses
      if (reponses_possibles.length > 0 && 
          (updatedQuestion.type_question === 'choix_unique' || 
           updatedQuestion.type_question === 'choix_multiple' || 
           updatedQuestion.type_question === 'vrai_faux')) {
        
        // Récupérer le max ID des réponses
        const { data: maxReponseIdData } = await supabase
          .from('reponses_possibles')
          .select('id')
          .order('id', { ascending: false })
          .limit(1)
          .single();
        let nextReponseId = maxReponseIdData?.id ? maxReponseIdData.id + 1 : 1;
        
        const reponsesData = reponses_possibles.map((reponse: any, index: number) => ({
          id: nextReponseId + index, // Générer des IDs séquentiels
          question_id: questionId,
          reponse: reponse.reponse,
          est_correcte: reponse.est_correcte || false,
          ordre_affichage: reponse.ordre_affichage || index + 1,
        }));

        const { error: reponsesInsertError } = await supabase
          .from('reponses_possibles')
          .insert(reponsesData);
        
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/69901f65-8844-4cd3-80e9-b1212b63434f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:163',message:'Reponses insert in PUT',data:{hasError:!!reponsesInsertError,errorMessage:reponsesInsertError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
        // #endregion
      }
    }

    // Récupérer la question mise à jour avec ses réponses
    const { data: questionWithReponses, error: fetchError } = await supabase
      .from('questions_quiz')
      .select(`
        *,
        reponses_possibles (*)
      `)
      .eq('id', questionId)
      .single();

    // Vérifier si le quiz est maintenant vide (si la question mise à jour est inactive ou vide)
    // Note: Si une question est vide ou inactive, elle devrait être supprimée plutôt que mise à jour
    if (questionWithReponses?.quiz_id && (!questionWithReponses.actif || !questionWithReponses.question?.trim())) {
      const { data: remainingQuestions } = await supabase
        .from('questions_quiz')
        .select('id')
        .eq('quiz_id', questionWithReponses.quiz_id)
        .eq('actif', true)
        .limit(1);

      // Si aucune question active ne reste, supprimer le quiz
      if (!remainingQuestions || remainingQuestions.length === 0) {
        const { data: quizToDelete } = await supabase
          .from('quiz_evaluations')
          .select('*')
          .eq('id', questionWithReponses.quiz_id)
          .single();

        if (quizToDelete) {
          await supabase
            .from('quiz_evaluations')
            .update({ actif: false })
            .eq('id', questionWithReponses.quiz_id);

          await logDelete(request, 'quiz_evaluations', questionWithReponses.quiz_id, quizToDelete, `Suppression automatique du quiz vide "${quizToDelete.titre || questionWithReponses.quiz_id}" après mise à jour de toutes les questions`).catch(() => {});
        }
      }
    }

    return NextResponse.json({ question: questionWithReponses });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la question:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer une question
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');

    if (!questionId) {
      return NextResponse.json({ error: 'questionId est requis' }, { status: 400 });
    }

    // Récupérer la question avant suppression pour le log
    const { data: oldQuestion } = await supabase
      .from('questions_quiz')
      .select('*')
      .eq('id', questionId)
      .single();

    if (!oldQuestion) {
      return NextResponse.json({ error: 'Question non trouvée' }, { status: 404 });
    }

    // Supprimer les réponses possibles associées AVANT de supprimer la question
    // Compter d'abord les réponses à supprimer
    const { count: reponsesCount } = await supabase
      .from('reponses_possibles')
      .select('*', { count: 'exact', head: true })
      .eq('question_id', questionId);

    const { error: reponsesDeleteError } = await supabase
      .from('reponses_possibles')
      .delete()
      .eq('question_id', questionId);

    if (reponsesDeleteError) {
      console.error('Erreur lors de la suppression des réponses:', reponsesDeleteError);
      // Continuer quand même la suppression de la question
    } else {
      console.log(`Suppression de ${reponsesCount || 0} réponse(s) pour la question ${questionId}`);
    }

    // Supprimer définitivement la question de la base de données (hard delete)
    const { error } = await supabase
      .from('questions_quiz')
      .delete()
      .eq('id', questionId);

    if (error) {
      console.error('Erreur lors de la suppression de la question:', error);
      await logDelete(request, 'questions_quiz', questionId, oldQuestion || { id: questionId }, `Échec de suppression de question: ${error.message}`).catch(() => {});
      return NextResponse.json({ error: 'Erreur lors de la suppression de la question' }, { status: 500 });
    }

    // Logger la suppression réussie
    await logDelete(request, 'questions_quiz', questionId, oldQuestion || { id: questionId }, `Suppression définitive de la question ${questionId} et de toutes ses réponses`).catch(() => {});

    // Vérifier si le quiz est maintenant vide et le supprimer automatiquement
    // Puisque les questions sont supprimées définitivement, on vérifie simplement s'il en reste
    if (oldQuestion?.quiz_id) {
      const { data: remainingQuestions } = await supabase
        .from('questions_quiz')
        .select('id')
        .eq('quiz_id', oldQuestion.quiz_id)
        .limit(1);

      // Si aucune question ne reste, supprimer le quiz
      if (!remainingQuestions || remainingQuestions.length === 0) {
        const { data: quizToDelete } = await supabase
          .from('quiz_evaluations')
          .select('*')
          .eq('id', oldQuestion.quiz_id)
          .single();

        if (quizToDelete) {
          await supabase
            .from('quiz_evaluations')
            .update({ actif: false })
            .eq('id', oldQuestion.quiz_id);

          await logDelete(request, 'quiz_evaluations', oldQuestion.quiz_id, quizToDelete, `Suppression automatique du quiz vide "${quizToDelete.titre || oldQuestion.quiz_id}" après suppression définitive de toutes les questions`).catch(() => {});
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la question:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

