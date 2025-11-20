import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { logCreate, logUpdate } from '@/lib/audit-logger';

// POST - Créer une nouvelle question
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    const { etude_cas_id, question, type_question, points, ordre_affichage, contenu_question, image_url, video_url, fichier_question, supports_annexes, reponses_possibles } = body;

    if (!etude_cas_id || !question || !type_question) {
      return NextResponse.json({ error: 'etude_cas_id, question et type_question requis' }, { status: 400 });
    }

    // Créer la question
    const { data: questionData, error: questionError } = await supabase
      .from('questions_etude_cas')
      .insert({
        etude_cas_id,
        question,
        type_question,
        points: points || 1,
        ordre_affichage: ordre_affichage || 0,
        contenu_question,
        image_url,
        video_url,
        fichier_question,
        supports_annexes: supports_annexes || [],
        actif: true,
      })
      .select()
      .single();

    if (questionError) {
      console.error('Erreur lors de la création de la question:', questionError);
      await logCreate(request, 'questions_etude_cas', 'unknown', { etude_cas_id, question, type_question }, `Échec de création de question: ${questionError.message}`).catch(() => {});
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    // Logger la création de la question
    await logCreate(request, 'questions_etude_cas', questionData.id, questionData, `Création d'une question pour l'étude de cas ${etude_cas_id}`).catch(() => {});

    // Créer les réponses possibles si nécessaire
    if (reponses_possibles && reponses_possibles.length > 0) {
      const reponsesToInsert = reponses_possibles.map((r: any) => ({
        question_id: questionData.id,
        reponse: r.reponse,
        est_correcte: r.est_correcte || false,
        ordre_affichage: r.ordre_affichage || 0,
      }));

      const { error: reponsesError } = await supabase
        .from('reponses_possibles_etude_cas')
        .insert(reponsesToInsert);

      if (reponsesError) {
        console.error('Erreur lors de la création des réponses:', reponsesError);
      }
    }

    // Récupérer la question avec ses réponses
    const { data: questionWithReponses, error: fetchError } = await supabase
      .from('questions_etude_cas')
      .select(`
        *,
        reponses_possibles:reponses_possibles_etude_cas(*)
      `)
      .eq('id', questionData.id)
      .single();

    return NextResponse.json({ question: questionWithReponses });
  } catch (error) {
    console.error('Erreur dans POST /api/etude-cas/questions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour une question
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    const { questionId, question, type_question, points, ordre_affichage, contenu_question, image_url, video_url, fichier_question, supports_annexes, reponses_possibles } = body;

    if (!questionId) {
      return NextResponse.json({ error: 'questionId requis' }, { status: 400 });
    }

    // Mettre à jour la question
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (question !== undefined) updateData.question = question;
    if (type_question !== undefined) updateData.type_question = type_question;
    if (points !== undefined) updateData.points = points;
    if (ordre_affichage !== undefined) updateData.ordre_affichage = ordre_affichage;
    if (contenu_question !== undefined) updateData.contenu_question = contenu_question;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (video_url !== undefined) updateData.video_url = video_url;
    if (fichier_question !== undefined) updateData.fichier_question = fichier_question;
    if (supports_annexes !== undefined) updateData.supports_annexes = supports_annexes;

    const { error: questionError } = await supabase
      .from('questions_etude_cas')
      .update(updateData)
      .eq('id', questionId);

    // Récupérer l'ancienne question pour le log (avant l'update)
    const { data: oldQuestion } = await supabase
      .from('questions_etude_cas')
      .select('*')
      .eq('id', questionId)
      .single();

    if (questionError) {
      console.error('Erreur lors de la mise à jour de la question:', questionError);
      await logUpdate(request, 'questions_etude_cas', questionId, oldQuestion || {}, updateData, Object.keys(updateData), `Échec de mise à jour de question: ${questionError.message}`).catch(() => {});
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    // Récupérer la question mise à jour pour le log
    const { data: updatedQuestion } = await supabase
      .from('questions_etude_cas')
      .select('*')
      .eq('id', questionId)
      .single();
    
    // Logger la mise à jour
    await logUpdate(request, 'questions_etude_cas', questionId, oldQuestion || {}, updatedQuestion || updateData, Object.keys(updateData), `Mise à jour de la question ${questionId}`).catch(() => {});

    // Supprimer les anciennes réponses et créer les nouvelles
    if (reponses_possibles !== undefined) {
      // Supprimer les anciennes réponses
      await supabase
        .from('reponses_possibles_etude_cas')
        .delete()
        .eq('question_id', questionId);

      // Créer les nouvelles réponses si nécessaire
      if (reponses_possibles.length > 0) {
        const reponsesToInsert = reponses_possibles.map((r: any) => ({
          question_id: questionId,
          reponse: r.reponse,
          est_correcte: r.est_correcte || false,
          ordre_affichage: r.ordre_affichage || 0,
        }));

        const { error: reponsesError } = await supabase
          .from('reponses_possibles_etude_cas')
          .insert(reponsesToInsert);

        if (reponsesError) {
          console.error('Erreur lors de la mise à jour des réponses:', reponsesError);
        }
      }
    }

    // Récupérer la question mise à jour avec ses réponses
    const { data: questionWithReponses, error: fetchError } = await supabase
      .from('questions_etude_cas')
      .select(`
        *,
        reponses_possibles:reponses_possibles_etude_cas(*)
      `)
      .eq('id', questionId)
      .single();

    return NextResponse.json({ question: questionWithReponses });
  } catch (error) {
    console.error('Erreur dans PUT /api/etude-cas/questions:', error);
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
      return NextResponse.json({ error: 'questionId requis' }, { status: 400 });
    }

    // Supprimer les réponses associées
    await supabase
      .from('reponses_possibles_etude_cas')
      .delete()
      .eq('question_id', questionId);

    // Supprimer la question
    const { error } = await supabase
      .from('questions_etude_cas')
      .delete()
      .eq('id', questionId);

    if (error) {
      console.error('Erreur lors de la suppression de la question:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur dans DELETE /api/etude-cas/questions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

