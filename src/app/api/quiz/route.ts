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
      const { data: questions, error: questionsError } = await supabase
        .from('questions_quiz')
        .select(`
          *,
          reponses_possibles (*)
        `)
        .eq('quiz_id', quizId)
        .eq('actif', true)
        .order('ordre_affichage', { ascending: true });

      if (questionsError) {
        return NextResponse.json({ quiz, questions: [] });
      }

      return NextResponse.json({ quiz, questions: questions || [] });
    }

    if (chapitreId) {
      // Récupérer le quiz pour un chapitre spécifique
      const { data: quiz, error } = await supabase
        .from('quiz_evaluations')
        .select('*')
        .eq('chapitre_id', chapitreId)
        .eq('actif', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
      }

      if (!quiz) {
        return NextResponse.json({ quiz: null });
      }

      // Récupérer les questions
      const { data: questions, error: questionsError } = await supabase
        .from('questions_quiz')
        .select(`
          *,
          reponses_possibles (*)
        `)
        .eq('quiz_id', quiz.id)
        .eq('actif', true)
        .order('ordre_affichage', { ascending: true });

      return NextResponse.json({ 
        quiz, 
        questions: questions || [] 
      });
    }

    if (coursId) {
      // Récupérer tous les quiz d'un cours
      const { data: quizzes, error } = await supabase
        .from('quiz_evaluations')
        .select('*')
        .eq('cours_id', coursId)
        .eq('actif', true)
        .order('created_at', { ascending: true });

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

    const quizData = {
      cours_id,
      chapitre_id,
      titre,
      description,
      duree_minutes: duree_minutes || 30,
      nombre_tentatives_max: nombre_tentatives_max || 3,
      seuil_reussite: seuil_reussite || 50,
      questions_aleatoires: questions_aleatoires || false,
    };

    const { data: quiz, error } = await supabase
      .from('quiz_evaluations')
      .insert(quizData)
      .select()
      .single();

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

