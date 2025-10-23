import { getSupabaseClient, getSupabaseServerClient } from './supabase';
import { BlocCompetence, ModuleApprentissage } from '@/types/formation-detailed';

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
  modules: ModuleApprentissage[];
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
  modules?: ModuleApprentissage[];
  error?: string;
}

// =============================================
// CRÉATION DE BLOCS (via API)
// =============================================

export async function createBlocWithModules(data: CreateBlocRequest): Promise<CreateBlocResponse> {
  try {
    console.log('🔨 Création d\'un nouveau bloc via API:', data);
    
    const response = await fetch('/api/blocs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erreur API:', result.error);
      return {
        success: false,
        error: result.error || 'Erreur lors de la création du bloc'
      };
    }

    console.log('✅ Bloc créé avec succès via API');
    return result;
  } catch (error) {
    console.error('💥 Erreur lors de la création du bloc:', error);
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
    console.log('🔍 Récupération des blocs pour la formation via API:', formationId);
    
    const response = await fetch(`/api/blocs?formationId=${formationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erreur API:', result.error);
      return [];
    }

    console.log('✅ Blocs récupérés via API:', result.blocs?.length || 0, 'blocs');
    return result.blocs || [];
  } catch (error) {
    console.error('💥 Erreur lors de la récupération des blocs:', error);
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
      .from('modules_apprentissage')
      .select('*')
      .eq('bloc_id', blocId)
      .eq('actif', true)
      .order('numero_module', { ascending: true });

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
      .from('modules_apprentissage')
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

export async function getModulesByBlocId(blocId: number): Promise<ModuleApprentissage[]> {
  try {
    console.log('🔍 Récupération des modules du bloc via API:', blocId);
    
    const response = await fetch(`/api/blocs?blocId=${blocId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erreur API:', result.error);
      return [];
    }

    console.log('✅ Modules récupérés via API:', result.modules?.length || 0, 'modules');
    return result.modules || [];
  } catch (error) {
    console.error('💥 Erreur lors de la récupération des modules:', error);
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
    console.log('👤 Récupération du profil utilisateur côté serveur:', userId);
    const supabase = getSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Erreur lors de la récupération du profil:', error);
      return null;
    }

    console.log('✅ Profil utilisateur récupéré côté serveur:', data?.role);
    return data;
  } catch (error) {
    console.error('💥 Erreur lors de la récupération du profil:', error);
    return null;
  }
}

// =============================================
// RÉCUPÉRATION DE BLOCS (côté serveur)
// =============================================

export async function getBlocsByFormationIdServer(formationId: number): Promise<BlocCompetence[]> {
  try {
    console.log('🔍 Récupération des blocs côté serveur pour la formation:', formationId);
    const supabase = getSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('blocs_competences')
      .select('*')
      .eq('formation_id', formationId)
      .eq('actif', true)
      .order('numero_bloc', { ascending: true });

    if (error) {
      console.error('❌ Erreur lors de la récupération des blocs:', error);
      return [];
    }

    console.log('✅ Blocs récupérés côté serveur:', data?.length || 0, 'blocs');
    return data || [];
  } catch (error) {
    console.error('💥 Erreur lors de la récupération des blocs:', error);
    return [];
  }
}

export async function getModulesByBlocIdServer(blocId: number): Promise<ModuleApprentissage[]> {
  try {
    console.log('🔍 Récupération des modules côté serveur pour le bloc:', blocId);
    const supabase = getSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('modules_apprentissage')
      .select('*')
      .eq('bloc_id', blocId)
      .eq('actif', true)
      .order('numero_module', { ascending: true });

    if (error) {
      console.error('❌ Erreur lors de la récupération des modules:', error);
      return [];
    }

    console.log('✅ Modules récupérés côté serveur:', data?.length || 0, 'modules');
    return data || [];
  } catch (error) {
    console.error('💥 Erreur lors de la récupération des modules:', error);
    return [];
  }
}

// =============================================
// MODIFICATION DE BLOCS (côté serveur)
// =============================================

export async function updateBlocServer(blocId: number, updates: UpdateBlocRequest, userId: string): Promise<{ success: boolean; bloc?: BlocCompetence; error?: string }> {
  try {
    console.log('✏️ Mise à jour du bloc côté serveur:', blocId, updates);
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
      console.error('❌ Erreur lors de la mise à jour du bloc:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Bloc mis à jour avec succès côté serveur');
    return { success: true, bloc: data };
  } catch (error) {
    console.error('💥 Erreur lors de la mise à jour du bloc:', error);
    return { success: false, error: 'Erreur de traitement' };
  }
}

export async function deleteBlocServer(blocId: number, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ Suppression du bloc côté serveur:', blocId);
    const supabase = getSupabaseServerClient();
    
    // Supprimer d'abord les modules associés
    const { error: modulesError } = await supabase
      .from('modules_apprentissage')
      .delete()
      .eq('bloc_id', blocId);

    if (modulesError) {
      console.error('❌ Erreur lors de la suppression des modules:', modulesError);
      return { success: false, error: modulesError.message };
    }

    // Puis supprimer le bloc
    const { error } = await supabase
      .from('blocs_competences')
      .delete()
      .eq('id', blocId);

    if (error) {
      console.error('❌ Erreur lors de la suppression du bloc:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Bloc et modules supprimés avec succès côté serveur');
    return { success: true };
  } catch (error) {
    console.error('💥 Erreur lors de la suppression du bloc:', error);
    return { success: false, error: 'Erreur de traitement' };
  }
}

// =============================================
// MODIFICATION DE BLOCS (via API)
// =============================================

export async function updateBloc(blocId: number, updates: UpdateBlocRequest): Promise<{ success: boolean; bloc?: BlocCompetence; error?: string }> {
  try {
    console.log('✏️ Mise à jour du bloc via API:', blocId, updates);
    console.log('🔗 URL appelée:', `/api/blocs`);
    
    const response = await fetch(`/api/blocs`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...updates, blocId }),
    });

    console.log('📡 Status de la réponse:', response.status);
    console.log('📡 Headers de la réponse:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log('📋 Résultat de l\'API:', result);

    if (!response.ok) {
      console.error('❌ Erreur API:', result.error);
      return {
        success: false,
        error: result.error || 'Erreur lors de la mise à jour du bloc'
      };
    }

    console.log('✅ Bloc mis à jour avec succès via API');
    return result;
  } catch (error) {
    console.error('💥 Erreur lors de la mise à jour du bloc:', error);
    return {
      success: false,
      error: 'Erreur de traitement'
    };
  }
}

export async function deleteBloc(blocId: number): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ Suppression du bloc via API:', blocId);
    console.log('🔗 URL appelée:', `/api/blocs?blocId=${blocId}`);
    
    const response = await fetch(`/api/blocs?blocId=${blocId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Status de la réponse:', response.status);
    console.log('📡 Headers de la réponse:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log('📋 Résultat de l\'API:', result);

    if (!response.ok) {
      console.error('❌ Erreur API:', result.error);
      return {
        success: false,
        error: result.error || 'Erreur lors de la suppression du bloc'
      };
    }

    console.log('✅ Bloc supprimé avec succès via API');
    return result;
  } catch (error) {
    console.error('💥 Erreur lors de la suppression du bloc:', error);
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