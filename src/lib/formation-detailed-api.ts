import { getSupabaseServerClient } from './supabase';
import { 
  Formation, 
  BlocCompetence, 
  CoursApprentissage, 
  EtudeCas, 
  QuizEvaluation, 
  QuestionQuiz, 
  ReponsePossible,
  FormationStats,
  ProgressionFormation,
  CreateFormationData,
  CreateBlocData,
  CreateCoursData,
  CreateEtudeCasData,
  CreateQuizData,
  CreateQuestionData
} from '@/types/formation-detailed';
import { CoursContenu } from '@/types/cours';

// =============================================
// FONCTIONS POUR LES FORMATIONS
// =============================================

export async function getAllFormationsDetailed(): Promise<Formation[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('formations')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      
      return [];
    }

    return data || [];
  } catch (error) {
    
    return [];
  }
}

export async function getFormationWithStats(formationId: number): Promise<Formation & { stats: FormationStats } | null> {
  try {
    const supabase = getSupabaseServerClient();
    // Récupérer la formation
    const { data: formation, error: formationError } = await supabase
      .from('formations')
      .select('*')
      .eq('id', formationId)
      .single();

    if (formationError || !formation) {
      return null;
    }

    // Récupérer les statistiques
    const { data: stats, error: statsError } = await supabase
      .rpc('get_formation_stats', { p_formation_id: formationId });

    if (statsError) {
      
      return { ...formation, stats: { total_blocs: 0, total_modules: 0, total_cours: 0, total_etudes_cas: 0, total_quiz: 0, duree_totale: 0 } };
    }

    return { ...formation, stats: stats[0] || { total_blocs: 0, total_modules: 0, total_cours: 0, total_etudes_cas: 0, total_quiz: 0, duree_totale: 0 } };
  } catch (error) {
    
    return null;
  }
}

// =============================================
// FONCTIONS POUR LES BLOCS DE COMPÉTENCES
// =============================================

export async function getBlocsByFormation(formationId: number): Promise<BlocCompetence[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('blocs_competences')
      .select('*')
      .eq('formation_id', formationId)
      .eq('actif', true)
      .order('ordre_affichage', { ascending: true });

    if (error) {
      
      return [];
    }

    return data || [];
  } catch (error) {
    
    return [];
  }
}

export async function createBloc(blocData: CreateBlocData): Promise<BlocCompetence | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('blocs_competences')
      .insert(blocData)
      .select()
      .single();

    if (error) {
      
      return null;
    }

    return data;
  } catch (error) {
    
    return null;
  }
}

export async function updateBloc(blocId: number, updates: Partial<BlocCompetence>): Promise<BlocCompetence | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('blocs_competences')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', blocId)
      .select()
      .single();

    if (error) {
      
      return null;
    }

    return data;
  } catch (error) {
    
    return null;
  }
}

export async function deleteBloc(blocId: number): Promise<boolean> {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from('blocs_competences')
      .update({ actif: false, updated_at: new Date().toISOString() })
      .eq('id', blocId);

    if (error) {
      
      return false;
    }

    return true;
  } catch (error) {
    
    return false;
  }
}

// =============================================
// FONCTIONS POUR LES MODULES D'APPRENTISSAGE
// =============================================

export async function getModulesByBloc(blocId: number): Promise<CoursApprentissage[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('cours_apprentissage')
      .select('*')
      .eq('bloc_id', blocId)
      .eq('actif', true)
      .order('ordre_affichage', { ascending: true });

    if (error) {
      
      return [];
    }

    return data || [];
  } catch (error) {
    
    return [];
  }
}

export async function createModule(moduleData: CreateCoursData): Promise<CoursApprentissage | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('cours_apprentissage')
      .insert(moduleData)
      .select()
      .single();

    if (error) {
      
      return null;
    }

    return data;
  } catch (error) {
    
    return null;
  }
}

// =============================================
// FONCTIONS POUR LES COURS
// =============================================

export async function getCoursByModule(moduleId: number): Promise<CoursContenu[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('cours_contenu')
      .select('*')
      .eq('module_id', moduleId)
      .eq('actif', true)
      .order('ordre_affichage', { ascending: true });

    if (error) {
      
      return [];
    }

    return data || [];
  } catch (error) {
    
    return [];
  }
}

export async function createCours(coursData: CreateCoursData): Promise<CoursContenu | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('cours_contenu')
      .insert(coursData)
      .select()
      .single();

    if (error) {
      
      return null;
    }

    return data;
  } catch (error) {
    
    return null;
  }
}

// =============================================
// FONCTIONS POUR LES ÉTUDES DE CAS
// =============================================

export async function getEtudesCasByModule(moduleId: number): Promise<EtudeCas[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('etudes_cas')
      .select('*')
      .eq('module_id', moduleId)
      .eq('actif', true);

    if (error) {
      
      return [];
    }

    return data || [];
  } catch (error) {
    
    return [];
  }
}

export async function createEtudeCas(etudeCasData: CreateEtudeCasData): Promise<EtudeCas | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('etudes_cas')
      .insert(etudeCasData)
      .select()
      .single();

    if (error) {
      
      return null;
    }

    return data;
  } catch (error) {
    
    return null;
  }
}

// =============================================
// FONCTIONS POUR LES QUIZ
// =============================================

export async function getQuizByModule(moduleId: number): Promise<QuizEvaluation[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('quiz_evaluations')
      .select('*')
      .eq('module_id', moduleId)
      .eq('actif', true);

    if (error) {
      
      return [];
    }

    return data || [];
  } catch (error) {
    
    return [];
  }
}

export async function createQuiz(quizData: CreateQuizData): Promise<QuizEvaluation | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('quiz_evaluations')
      .insert(quizData)
      .select()
      .single();

    if (error) {
      
      return null;
    }

    return data;
  } catch (error) {
    
    return null;
  }
}

export async function getQuizWithQuestions(quizId: number): Promise<QuizEvaluation & { questions: QuestionQuiz[] } | null> {
  try {
    const supabase = getSupabaseServerClient();
    // Récupérer le quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quiz_evaluations')
      .select('*')
      .eq('id', quizId)
      .single();

    if (quizError || !quiz) {
      return null;
    }

    // Récupérer les questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions_quiz')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('actif', true)
      .order('ordre_affichage', { ascending: true });

    if (questionsError) {
      
      return { ...quiz, questions: [] };
    }

    return { ...quiz, questions: questions || [] };
  } catch (error) {
    
    return null;
  }
}

// =============================================
// FONCTIONS POUR LES QUESTIONS DE QUIZ
// =============================================

export async function createQuestion(questionData: CreateQuestionData): Promise<QuestionQuiz | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('questions_quiz')
      .insert({
        quiz_id: questionData.quiz_id,
        question: questionData.question,
        type_question: questionData.type_question,
        points: questionData.points,
        explication: questionData.explication
      })
      .select()
      .single();

    if (error) {
      
      return null;
    }

    // Si c'est une question avec réponses possibles (choix_unique, choix_multiple, vrai_faux), créer les réponses possibles
    if ((questionData.type_question === 'choix_unique' || 
         questionData.type_question === 'choix_multiple' || 
         questionData.type_question === 'vrai_faux') && 
        questionData.reponses_possibles) {
      const reponsesData = questionData.reponses_possibles.map(reponse => ({
        question_id: data.id,
        reponse: reponse.reponse,
        est_correcte: reponse.est_correcte,
        ordre_affichage: reponse.ordre_affichage
      }));

      const { error: reponsesError } = await supabase
        .from('reponses_possibles')
        .insert(reponsesData);

      if (reponsesError) {
        
      }
    }

    return data;
  } catch (error) {
    
    return null;
  }
}

// =============================================
// FONCTIONS POUR LA PROGRESSION DES ÉTUDIANTS
// =============================================

export async function getProgressionFormation(userId: string, formationId: number): Promise<ProgressionFormation | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .rpc('calculer_progression_formation', {
        p_user_id: userId,
        p_formation_id: formationId
      });

    if (error) {
      
      return null;
    }

    // Récupérer les informations de la formation
    const { data: formation, error: formationError } = await supabase
      .from('formations')
      .select('id, titre')
      .eq('id', formationId)
      .single();

    if (formationError || !formation) {
      return null;
    }

    return {
      formation_id: formationId,
      formation_titre: formation.titre,
      progression_pourcentage: data || 0,
      elements_termines: 0, // À calculer séparément si nécessaire
      elements_totaux: 0, // À calculer séparément si nécessaire
    };
  } catch (error) {
    
    return null;
  }
}

export async function updateProgression(
  userId: string,
  formationId: number,
  elementType: 'cours' | 'etude_cas' | 'quiz',
  elementId: number,
  statut: 'non_commence' | 'en_cours' | 'termine' | 'abandonne'
): Promise<boolean> {
  try {
    const supabase = getSupabaseServerClient();
    const progressionData: any = {
      user_id: userId,
      formation_id: formationId,
      statut,
      derniere_activite: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Ajouter l'ID de l'élément selon son type
    switch (elementType) {
      case 'cours':
        progressionData.cours_id = elementId;
        break;
      case 'etude_cas':
        progressionData.etude_cas_id = elementId;
        break;
      case 'quiz':
        progressionData.quiz_id = elementId;
        break;
    }

    const { error } = await supabase
      .from('progression_etudiants')
      .upsert(progressionData, {
        onConflict: 'user_id,formation_id,cours_id,etude_cas_id,quiz_id'
      });

    if (error) {
      
      return false;
    }

    return true;
  } catch (error) {
    
    return false;
  }
}
