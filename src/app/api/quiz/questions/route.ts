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
    };

    const { data: newQuestion, error: questionError } = await supabase
      .from('questions_quiz')
      .insert(questionData)
      .select()
      .single();

    if (questionError) {
      console.error('Erreur lors de la création de la question:', questionError);
      await logCreate(request, 'questions_quiz', 'unknown', questionData, `Échec de création de question: ${questionError.message}`).catch(() => {});
      return NextResponse.json({ error: 'Erreur lors de la création de la question' }, { status: 500 });
    }

    // Logger la création de la question
    await logCreate(request, 'questions_quiz', newQuestion.id, newQuestion, `Création d'une question pour le quiz ${quiz_id}`).catch(() => {});

    // Si c'est une question avec réponses possibles (choix_unique, choix_multiple, vrai_faux)
    if (reponses_possibles && reponses_possibles.length > 0 && 
        (type_question === 'choix_unique' || type_question === 'choix_multiple' || type_question === 'vrai_faux')) {
      
      const reponsesData = reponses_possibles.map((reponse: any, index: number) => ({
        question_id: newQuestion.id,
        reponse: reponse.reponse,
        est_correcte: reponse.est_correcte || false,
        ordre_affichage: reponse.ordre_affichage || index + 1,
      }));

      const { error: reponsesError } = await supabase
        .from('reponses_possibles')
        .insert(reponsesData);

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
        
        const reponsesData = reponses_possibles.map((reponse: any, index: number) => ({
          question_id: questionId,
          reponse: reponse.reponse,
          est_correcte: reponse.est_correcte || false,
          ordre_affichage: reponse.ordre_affichage || index + 1,
        }));

        await supabase
          .from('reponses_possibles')
          .insert(reponsesData);
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

    // Supprimer les réponses possibles associées
    await supabase
      .from('reponses_possibles')
      .delete()
      .eq('question_id', questionId);

    // Supprimer la question (soft delete en mettant actif à false)
    const { error } = await supabase
      .from('questions_quiz')
      .update({ actif: false })
      .eq('id', questionId);

    if (error) {
      console.error('Erreur lors de la suppression de la question:', error);
      await logDelete(request, 'questions_quiz', questionId, oldQuestion || { id: questionId }, `Échec de suppression de question: ${error.message}`).catch(() => {});
      return NextResponse.json({ error: 'Erreur lors de la suppression de la question' }, { status: 500 });
    }

    // Logger la suppression réussie
    await logDelete(request, 'questions_quiz', questionId, oldQuestion || { id: questionId }, `Suppression de la question ${questionId}`).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la question:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

