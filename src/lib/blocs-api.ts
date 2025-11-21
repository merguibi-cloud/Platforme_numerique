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
    // Supprimer d'abord les cours associés
    const { error: modulesError } = await supabase
      .from('cours_apprentissage')
      .delete()
      .eq('bloc_id', blocId);
    if (modulesError) {
      return { success: false, error: modulesError.message };
    }
    // Puis supprimer le bloc
    const { error } = await supabase
      .from('blocs_competences')
      .delete()
      .eq('id', blocId);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
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