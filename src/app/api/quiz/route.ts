import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { QuizEvaluation, CreateQuizData } from '@/types/formation-detailed';

// GET - Récupérer un quiz par cours_id ou module_id
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const coursId = searchParams.get('coursId');
    const moduleId = searchParams.get('moduleId');
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

    if (coursId) {
      // Récupérer le quiz pour un cours spécifique
      const { data: quiz, error } = await supabase
        .from('quiz_evaluations')
        .select('*')
        .eq('cours_id', coursId)
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

    if (moduleId) {
      // Récupérer tous les quiz d'un module
      const { data: quizzes, error } = await supabase
        .from('quiz_evaluations')
        .select('*')
        .eq('module_id', moduleId)
        .eq('actif', true)
        .order('created_at', { ascending: true });

      if (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
      }

      return NextResponse.json({ quizzes: quizzes || [] });
    }

    return NextResponse.json({ error: 'coursId, moduleId ou quizId requis' }, { status: 400 });
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
    const { module_id, cours_id, titre, description, duree_minutes, nombre_tentatives_max, seuil_reussite, questions_aleatoires } = body;

    if (!module_id || !titre) {
      return NextResponse.json({ error: 'module_id et titre sont requis' }, { status: 400 });
    }

    const quizData: CreateQuizData = {
      module_id,
      cours_id,
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
      return NextResponse.json({ error: 'Erreur lors de la création du quiz' }, { status: 500 });
    }

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

    const { data: quiz, error } = await supabase
      .from('quiz_evaluations')
      .update(updates)
      .eq('id', quizId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du quiz:', error);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour du quiz' }, { status: 500 });
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du quiz:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

