import { getSupabaseClient, getSupabaseServerClient } from './supabase';
import { BlocCompetence, CoursApprentissage } from '@/types/formation-detailed';
// =============================================
// API POUR LES BLOCS DE COMPÉTENCES
// =============================================
export interface CreateBlocRequest {
  formation_id: number;
  titre: string;
  description?: string;
  objectifs?: string[];
  duree_estimee?: number;
  modules: string[];
}
export interface UpdateBlocRequest {
  titre?: string;
  description?: string;
  objectifs?: string[];
  duree_estimee?: number;
  ordre_affichage?: number;
}
export interface BlocWithModules extends BlocCompetence {
  modules: CoursApprentissage[];
}
export interface BlocStats {
  total_modules: number;
  modules_actifs: number;
  modules_inactifs: number;
  duree_totale: number;
}
export interface CreateBlocResponse {
  success: boolean;
  bloc?: BlocCompetence;
  modules?: CoursApprentissage[];
  error?: string;
}
// =============================================
// CRÉATION DE BLOCS (via API)
// =============================================
export async function createBlocWithModules(data: CreateBlocRequest): Promise<CreateBlocResponse> {
  try {
    const response = await fetch('/api/blocs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      console.error('Erreur lors de la création du bloc:', result.error);
      return {
        success: false,
        error: result.error || 'Erreur lors de la création du bloc'
      };
    }
    return result;
  } catch (error) {
    console.error('Erreur lors de la création du bloc:', error);
    return {
      success: false,
      error: 'Erreur de traitement'
    };
  }
}
// =============================================
// LECTURE DE BLOCS
// =============================================
export async function getBlocsByFormationId(formationId: number): Promise<BlocCompetence[]> {
  try {
    const response = await fetch(`/api/blocs?formationId=${formationId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    if (!response.ok) {
      return [];
    }
    return result.blocs || [];
  } catch (error) {
    return [];
  }
}
export async function getBlocById(blocId: number): Promise<BlocCompetence | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('blocs_competences')
      .select('*')
      .eq('id', blocId)
      .eq('actif', true)
      .single();
    if (error) {
      console.error('Erreur lors de la récupération du bloc:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du bloc:', error);
    return null;
  }
}
export async function getBlocWithModules(blocId: number): Promise<BlocWithModules | null> {
  try {
    const supabase = getSupabaseClient();
    const { data: bloc, error: blocError } = await supabase
      .from('blocs_competences')
      .select('*')
      .eq('id', blocId)
      .eq('actif', true)
      .single();
    if (blocError || !bloc) {
      console.error('Erreur lors de la récupération du bloc:', blocError);
      return null;
    }
    const { data: modules, error: modulesError } = await supabase
      .from('cours_apprentissage')
      .select('*')
      .eq('bloc_id', blocId)
      .eq('actif', true)
      .order('numero_cours', { ascending: true });
    if (modulesError) {
      console.error('Erreur lors de la récupération des modules:', modulesError);
      return { ...bloc, modules: [] };
    }
    return { ...bloc, modules: modules || [] };
  } catch (error) {
    console.error('Erreur lors de la récupération du bloc avec modules:', error);
    return null;
  }
}
export async function getBlocStats(blocId: number): Promise<BlocStats | null> {
  try {
    const supabase = getSupabaseClient();
    const { data: modules, error } = await supabase
      .from('cours_apprentissage')
      .select('actif, duree_estimee')
      .eq('bloc_id', blocId);
    if (error) {
      console.error('Erreur lors de la récupération des stats du bloc:', error);
      return null;
    }
    const stats: BlocStats = {
      total_modules: modules?.length || 0,
      modules_actifs: modules?.filter(m => m.actif).length || 0,
      modules_inactifs: modules?.filter(m => !m.actif).length || 0,
      duree_totale: modules?.reduce((sum, m) => sum + (m.duree_estimee || 0), 0) || 0
    };
    return stats;
  } catch (error) {
    console.error('Erreur lors de la récupération des stats du bloc:', error);
    return null;
  }
}
// =============================================
// FONCTIONS UTILITAIRES
// =============================================
export async function getModulesByBlocId(blocId: number): Promise<CoursApprentissage[]> {
  try {
    const response = await fetch(`/api/blocs?blocId=${blocId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    if (!response.ok) {
      return [];
    }
    return result.modules || [];
  } catch (error) {
    return [];
  }
}
export async function searchBlocs(query: string, formationId?: number): Promise<BlocCompetence[]> {
  try {
    const supabase = getSupabaseClient();
    let queryBuilder = supabase
      .from('blocs_competences')
      .select('*')
      .eq('actif', true)
      .ilike('titre', `%${query}%`);
    if (formationId) {
      queryBuilder = queryBuilder.eq('formation_id', formationId);
    }
    const { data, error } = await queryBuilder.order('numero_bloc', { ascending: true });
    if (error) {
      console.error('Erreur lors de la recherche de blocs:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la recherche de blocs:', error);
    return [];
  }
}
// =============================================
// UTILITAIRES AUTHENTIFICATION (côté serveur)
// =============================================
export async function getUserProfileServer(userId: string): Promise<{ role: string } | null> {
  try {
    const supabase = getSupabaseServerClient();

    // Vérifier D'ABORD si l'utilisateur est un admin (priorité absolue)
    const { data: adminRecord, error: adminError } = await supabase
      .from('administrateurs')
      .select('user_id, niveau')
      .eq('user_id', userId)
      .maybeSingle();

    if (adminError) {
      console.error('Erreur récupération administrateur:', adminError);
    }

    if (adminRecord) {
      // Déterminer le rôle selon le niveau
      if (adminRecord.niveau === 'superadmin') {
        return { role: 'superadmin' };
      }
      return { role: 'admin' };
    }

    // Vérifier ensuite si l'utilisateur est un étudiant
    const { data: studentRecord, error: studentError } = await supabase
      .from('etudiants')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (studentError) {
      console.error('Erreur récupération étudiant:', studentError);
    }

    if (studentRecord) {
      return { role: 'etudiant' };
    }

    // Enfin, vérifier user_profiles (uniquement pour lead/candidat)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Erreur récupération profil utilisateur:', profileError);
    }

    if (profile?.role) {
      return { role: String(profile.role).toLowerCase() };
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du rôle utilisateur:', error);
    return null;
  }
}
// =============================================
// RÉCUPÉRATION DE BLOCS (côté serveur)
// =============================================
export async function getBlocsByFormationIdServer(formationId: number): Promise<BlocCompetence[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('blocs_competences')
      .select('*')
      .eq('formation_id', formationId)
      .eq('actif', true)
      .order('numero_bloc', { ascending: true });
    if (error) {
      return [];
    }
    return data || [];
  } catch (error) {
    return [];
  }
}
export async function getModulesByBlocIdServer(blocId: number): Promise<CoursApprentissage[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('cours_apprentissage')
      .select('*')
      .eq('bloc_id', blocId)
      .eq('actif', true)
      .order('numero_cours', { ascending: true });
    if (error) {
      return [];
    }
    return data || [];
  } catch (error) {
    return [];
  }
}
// =============================================
// MODIFICATION DE BLOCS (côté serveur)
// =============================================
export async function updateBlocServer(blocId: number, updates: UpdateBlocRequest, userId: string): Promise<{ success: boolean; bloc?: BlocCompetence; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('blocs_competences')
      .update({
        titre: updates.titre,
        description: updates.description,
        objectifs: updates.objectifs,
        duree_estimee: updates.duree_estimee,
        updated_at: new Date().toISOString()
      })
      .eq('id', blocId)
      .select()
      .single();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, bloc: data };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}
export async function deleteBlocServer(blocId: number, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    
    // 1. Récupérer tous les cours du bloc
    const { data: cours, error: coursFetchError } = await supabase
      .from('cours_apprentissage')
      .select('id')
      .eq('bloc_id', blocId);
    
    if (coursFetchError) {
      return { success: false, error: `Erreur lors de la récupération des cours: ${coursFetchError.message}` };
    }
    
    if (cours && cours.length > 0) {
      const coursIds = cours.map(c => c.id);
      
      // 2. Pour chaque cours, récupérer tous les chapitres
      const { data: chapitres, error: chapitresFetchError } = await supabase
        .from('chapitres_cours')
        .select('id')
        .in('cours_id', coursIds);
      
      if (chapitresFetchError) {
        return { success: false, error: `Erreur lors de la récupération des chapitres: ${chapitresFetchError.message}` };
      }
      
      if (chapitres && chapitres.length > 0) {
        const chapitreIds = chapitres.map(ch => ch.id);
        
        // 3. Supprimer les quiz et leurs éléments associés
        const { data: quizzes, error: quizzesFetchError } = await supabase
          .from('quiz_evaluations')
          .select('id')
          .in('chapitre_id', chapitreIds);
        
        if (quizzesFetchError) {
          console.error('Erreur lors de la récupération des quiz:', quizzesFetchError);
        } else if (quizzes && quizzes.length > 0) {
          const quizIds = quizzes.map(q => q.id);
          
          // Récupérer les questions des quiz
          const { data: questions, error: questionsFetchError } = await supabase
            .from('questions_quiz')
            .select('id')
            .in('quiz_id', quizIds);
          
          if (questionsFetchError) {
            console.error('Erreur lors de la récupération des questions de quiz:', questionsFetchError);
          } else if (questions && questions.length > 0) {
            const questionIds = questions.map(q => q.id);
            
            // Supprimer les réponses possibles des quiz
            const { error: reponsesDeleteError } = await supabase
              .from('reponses_possibles')
              .delete()
              .in('question_id', questionIds);
            
            if (reponsesDeleteError) {
              console.error('Erreur lors de la suppression des réponses de quiz:', reponsesDeleteError);
            }
            
            // Supprimer les questions de quiz
            const { error: questionsDeleteError } = await supabase
              .from('questions_quiz')
              .delete()
              .in('quiz_id', quizIds);
            
            if (questionsDeleteError) {
              console.error('Erreur lors de la suppression des questions de quiz:', questionsDeleteError);
            }
          }
          
          // Supprimer les quiz
          const { error: quizzesDeleteError } = await supabase
            .from('quiz_evaluations')
            .delete()
            .in('id', quizIds);
          
          if (quizzesDeleteError) {
            console.error('Erreur lors de la suppression des quiz:', quizzesDeleteError);
          }
        }
        
        // 4. Supprimer les études de cas et leurs éléments associés
        const { data: etudesCas, error: etudesCasFetchError } = await supabase
          .from('etudes_cas')
          .select('id')
          .in('chapitre_id', chapitreIds);
        
        if (etudesCasFetchError) {
          console.error('Erreur lors de la récupération des études de cas:', etudesCasFetchError);
        } else if (etudesCas && etudesCas.length > 0) {
          const etudeCasIds = etudesCas.map(ec => ec.id);
          
          // Récupérer les questions des études de cas
          const { data: questionsEtudeCas, error: questionsEtudeCasFetchError } = await supabase
            .from('questions_etude_cas')
            .select('id')
            .in('etude_cas_id', etudeCasIds);
          
          if (questionsEtudeCasFetchError) {
            console.error('Erreur lors de la récupération des questions d\'étude de cas:', questionsEtudeCasFetchError);
          } else if (questionsEtudeCas && questionsEtudeCas.length > 0) {
            const questionEtudeCasIds = questionsEtudeCas.map(q => q.id);
            
            // Supprimer les réponses possibles des études de cas
            const { error: reponsesEtudeCasDeleteError } = await supabase
              .from('reponses_possibles_etude_cas')
              .delete()
              .in('question_id', questionEtudeCasIds);
            
            if (reponsesEtudeCasDeleteError) {
              console.error('Erreur lors de la suppression des réponses d\'étude de cas:', reponsesEtudeCasDeleteError);
            }
            
            // Supprimer les questions d'étude de cas
            const { error: questionsEtudeCasDeleteError } = await supabase
              .from('questions_etude_cas')
              .delete()
              .in('etude_cas_id', etudeCasIds);
            
            if (questionsEtudeCasDeleteError) {
              console.error('Erreur lors de la suppression des questions d\'étude de cas:', questionsEtudeCasDeleteError);
            }
          }
          
          // Supprimer les études de cas
          const { error: etudesCasDeleteError } = await supabase
            .from('etudes_cas')
            .delete()
            .in('id', etudeCasIds);
          
          if (etudesCasDeleteError) {
            console.error('Erreur lors de la suppression des études de cas:', etudesCasDeleteError);
          }
        }
        
        // 5. Supprimer les chapitres
        const { error: chapitresDeleteError } = await supabase
          .from('chapitres_cours')
          .delete()
          .in('id', chapitreIds);
        
        if (chapitresDeleteError) {
          return { success: false, error: `Erreur lors de la suppression des chapitres: ${chapitresDeleteError.message}` };
        }
      }
      
      // 6. Supprimer les cours
      const { error: coursDeleteError } = await supabase
        .from('cours_apprentissage')
        .delete()
        .in('id', coursIds);
      
      if (coursDeleteError) {
        return { success: false, error: `Erreur lors de la suppression des cours: ${coursDeleteError.message}` };
      }
    }
    
    // 7. Supprimer le bloc
    const { error } = await supabase
      .from('blocs_competences')
      .delete()
      .eq('id', blocId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: `Erreur de traitement: ${error instanceof Error ? error.message : 'Erreur inconnue'}` };
  }
}
// =============================================
// MODIFICATION DE BLOCS (via API)
// =============================================
export async function updateBloc(blocId: number, updates: UpdateBlocRequest): Promise<{ success: boolean; bloc?: BlocCompetence; error?: string }> {
  try {
    const response = await fetch(`/api/blocs`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...updates, blocId }),
    });
    const result = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Erreur lors de la mise à jour du bloc'
      };
    }
    return result;
  } catch (error) {
    return {
      success: false,
      error: 'Erreur de traitement'
    };
  }
}
export async function deleteBloc(blocId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/blocs?blocId=${blocId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Erreur lors de la suppression du bloc'
      };
    }
    return result;
  } catch (error) {
    return {
      success: false,
      error: 'Erreur de traitement'
    };
  }
}
export async function duplicateBloc(blocId: number, newFormationId?: number): Promise<{ success: boolean; bloc?: BlocCompetence; error?: string }> {
  // TODO: Implémenter via API route
  return { success: false, error: 'Fonction non implémentée' };
}
export async function reorderBlocs(formationId: number, blocOrders: { id: number; numero_bloc: number }[]): Promise<{ success: boolean; error?: string }> {
  // TODO: Implémenter via API route
  return { success: false, error: 'Fonction non implémentée' };
}
export async function forceDeleteBloc(blocId: number): Promise<{ success: boolean; error?: string }> {
  // TODO: Implémenter via API route
  return { success: false, error: 'Fonction non implémentée' };
}