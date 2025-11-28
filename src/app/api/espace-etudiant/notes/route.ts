import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

/**
 * GET - Récupérer les dernières notes (quiz et études de cas) pour l'étudiant connecté
 */
export async function GET(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    // Récupérer l'étudiant
    const { data: etudiant, error: etudiantError } = await supabase
      .from('etudiants')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (etudiantError || !etudiant) {
      return NextResponse.json(
        { success: false, error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les notes depuis les tentatives de quiz
    const { data: tentativesQuiz, error: quizError } = await supabase
      .from('tentatives_quiz')
      .select(`
        id,
        quiz_id,
        score,
        date_fin,
        quiz_evaluations!inner(
          id,
          titre,
          cours_id,
          cours_apprentissage!inner(
            id,
            titre,
            bloc_id,
            blocs_competences!inner(
              id,
              numero_bloc,
              titre
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('termine', true)
      .order('date_fin', { ascending: false })
      .limit(10);

    // Récupérer les notes depuis les soumissions d'études de cas
    const { data: soumissionsEtudeCas, error: etudeCasError } = await supabase
      .from('soumissions_etude_cas')
      .select(`
        id,
        etude_cas_id,
        note,
        date_correction,
        etudes_cas!inner(
          id,
          titre,
          cours_id,
          cours_apprentissage!inner(
            id,
            titre,
            bloc_id,
            blocs_competences!inner(
              id,
              numero_bloc,
              titre
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .not('note', 'is', null)
      .order('date_correction', { ascending: false })
      .limit(10);

    if (quizError || etudeCasError) {
      console.error('Erreur lors de la récupération des notes:', quizError || etudeCasError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des notes' },
        { status: 500 }
      );
    }

    // Formater les notes
    const notes: any[] = [];

    // Notes quiz
    tentativesQuiz?.forEach((tentative) => {
      const quiz = tentative.quiz_evaluations as any;
      const cours = quiz?.cours_apprentissage as any;
      const bloc = cours?.blocs_competences as any;
      
      // Le score est stocké en pourcentage, on le convertit sur 20
      // Les quiz sont toujours des nombres entiers
      const noteSur20 = tentative.score ? Math.round(tentative.score * 20 / 100).toString() : '0';
      
      notes.push({
        id: `quiz-${tentative.id}`,
        title: `Bloc ${bloc?.numero_bloc || ''} - ${cours?.titre || 'Module'}`,
        label: 'Quizz',
        grade: noteSur20,
        date: tentative.date_fin,
        type: 'quiz'
      });
    });

    // Notes études de cas
    soumissionsEtudeCas?.forEach((soumission) => {
      const etudeCas = soumission.etudes_cas as any;
      const cours = etudeCas?.cours_apprentissage as any;
      const bloc = cours?.blocs_competences as any;
      
      // Formater la note avec virgule pour les études de cas (peut avoir des décimales)
      const noteFormatee = soumission.note 
        ? parseFloat(soumission.note.toString()).toFixed(1).replace('.', ',') 
        : '0';
      
      notes.push({
        id: `etude-cas-${soumission.id}`,
        title: `Bloc ${bloc?.numero_bloc || ''}`,
        label: 'Étude de cas',
        grade: noteFormatee,
        date: soumission.date_correction,
        type: 'etude_cas'
      });
    });

    // Trier par date (plus récentes en premier) et limiter à 5
    notes.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });

    const dernieresNotes = notes.slice(0, 5);

    return NextResponse.json({
      success: true,
      notes: dernieresNotes
    });
  } catch (error) {
    console.error('Erreur dans GET /api/espace-etudiant/notes:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

