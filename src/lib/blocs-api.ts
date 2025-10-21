import { supabase } from './supabase';
import { BlocCompetence, ModuleApprentissage } from '@/types/formation-detailed';
import { isSupabaseAvailable } from './supabase';

// =============================================
// API POUR LES BLOCS DE COMPÉTENCES
// =============================================

export interface CreateBlocRequest {
  formation_id: number;
  numero_bloc: number;
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
// FONCTIONS UTILITAIRES POUR LES PERMISSIONS
// =============================================

export async function createBlocWithModules(data: CreateBlocRequest): Promise<CreateBlocResponse> {
  if (!isSupabaseAvailable() || !supabase) {
    return { success: false, error: 'Service temporairement indisponible' };
  }

  try {
    // Vérifier les permissions en utilisant la fonction SQL définie dans la base
    const { data: hasPermission, error: permissionError } = await supabase.rpc('is_admin');
    
    if (permissionError) {
      return { success: false, error: 'Opération non autorisée' };
    }

    if (!hasPermission) {
      return { success: false, error: 'Permissions insuffisantes. Seuls les administrateurs peuvent créer des blocs.' };
    }

    // Vérifier que la formation existe
    const { data: formation, error: formationError } = await supabase
      .from('formations')
      .select('id')
      .eq('id', data.formation_id)
      .single();

    if (formationError || !formation) {
      return { success: false, error: 'Formation non trouvée' };
    }

    // Vérifier que le numéro de bloc n'existe pas déjà
    const { data: existingBloc } = await supabase
      .from('blocs_competences')
      .select('id')
      .eq('formation_id', data.formation_id)
      .eq('numero_bloc', data.numero_bloc)
      .eq('actif', true)
      .single();

    if (existingBloc) {
      return { success: false, error: 'Un bloc avec ce numéro existe déjà' };
    }

    // Créer le bloc de compétences
    const { data: bloc, error: blocError } = await supabase
      .from('blocs_competences')
      .insert({
        formation_id: data.formation_id,
        numero_bloc: data.numero_bloc,
        titre: data.titre,
        description: data.description,
        objectifs: data.objectifs,
        duree_estimee: data.duree_estimee,
        ordre_affichage: data.numero_bloc
      })
      .select()
      .single();

    if (blocError) {
      return { success: false, error: 'Erreur lors de la création du bloc' };
    }

    // Créer les modules associés
    const modulesToCreate = data.modules
      .filter(module => module.trim())
      .map((moduleTitre, index) => ({
        bloc_id: bloc.id,
        numero_module: index + 1,
        titre: moduleTitre.trim(),
        type_module: 'cours' as const,
        ordre_affichage: index + 1
      }));

    if (modulesToCreate.length > 0) {
      const { data: modules, error: modulesError } = await supabase
        .from('modules_apprentissage')
        .insert(modulesToCreate)
        .select();

      if (modulesError) {
        
        // Le bloc a été créé mais pas les modules, on peut considérer cela comme un succès partiel
        return { 
          success: true, 
          bloc, 
          error: 'Bloc créé mais erreur lors de la création des modules' 
        };
      }

      return { success: true, bloc, modules };
    }

    return { success: true, bloc };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}

// =============================================
// LECTURE DE BLOCS
// =============================================

export async function getBlocsByFormationId(formationId: number): Promise<BlocCompetence[]> {
  if (!isSupabaseAvailable() || !supabase) {
    return [];
  }

  try {
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

export async function getBlocById(blocId: number): Promise<BlocCompetence | null> {
  if (!isSupabaseAvailable() || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('blocs_competences')
      .select('*')
      .eq('id', blocId)
      .eq('actif', true)
      .single();

    if (error) {
      
      return null;
    }

    return data;
  } catch (error) {
    
    return null;
  }
}

export async function getBlocWithModules(blocId: number): Promise<BlocWithModules | null> {
  if (!isSupabaseAvailable() || !supabase) {
    return null;
  }

  try {
    const { data: bloc, error: blocError } = await supabase
      .from('blocs_competences')
      .select('*')
      .eq('id', blocId)
      .eq('actif', true)
      .single();

    if (blocError || !bloc) {
      
      return null;
    }

    const { data: modules, error: modulesError } = await supabase
      .from('modules_apprentissage')
      .select('*')
      .eq('bloc_id', blocId)
      .eq('actif', true)
      .order('numero_module', { ascending: true });

    if (modulesError) {
      
      return { ...bloc, modules: [] };
    }

    return { ...bloc, modules: modules || [] };
  } catch (error) {
    
    return null;
  }
}

export async function getBlocStats(blocId: number): Promise<BlocStats | null> {
  if (!isSupabaseAvailable() || !supabase) {
    return null;
  }

  try {
    const { data: modules, error } = await supabase
      .from('modules_apprentissage')
      .select('actif, duree_estimee')
      .eq('bloc_id', blocId);

    if (error) {
      
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
    
    return null;
  }
}

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

export async function getModulesByBlocId(blocId: number): Promise<ModuleApprentissage[]> {
  if (!isSupabaseAvailable() || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('modules_apprentissage')
      .select('*')
      .eq('bloc_id', blocId)
      .eq('actif', true)
      .order('numero_module', { ascending: true });

    if (error) {
      
      return [];
    }

    return data || [];
  } catch (error) {
    
    return [];
  }
}

export async function searchBlocs(query: string, formationId?: number): Promise<BlocCompetence[]> {
  if (!isSupabaseAvailable() || !supabase) {
    return [];
  }

  try {
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
      
      return [];
    }

    return data || [];
  } catch (error) {
    
    return [];
  }
}

export async function reorderBlocs(formationId: number, blocOrders: { id: number; numero_bloc: number }[]): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseAvailable() || !supabase) {
    return { success: false, error: 'Service temporairement indisponible' };
  }

  try {
    // Vérifier les permissions en utilisant la fonction SQL définie dans la base
    const { data: hasPermission, error: permissionError } = await supabase.rpc('is_admin');
    
    if (permissionError) {
      
      return { success: false, error: 'Opération non autorisée' };
    }

    if (!hasPermission) {
      return { success: false, error: 'Permissions insuffisantes. Seuls les administrateurs peuvent réorganiser des blocs.' };
    }
    // Mettre à jour l'ordre de chaque bloc
    for (const blocOrder of blocOrders) {
      const { error } = await supabase
        .from('blocs_competences')
        .update({ 
          numero_bloc: blocOrder.numero_bloc,
          ordre_affichage: blocOrder.numero_bloc,
          updated_at: new Date().toISOString()
        })
        .eq('id', blocOrder.id)
        .eq('formation_id', formationId);

      if (error) {
        
        return { success: false, error: 'Erreur lors de la réorganisation des blocs' };
      }
    }

    return { success: true };
  } catch (error) {
    
    return { success: false, error: 'Erreur de traitement' };
  }
}

export async function duplicateBloc(blocId: number, newFormationId?: number): Promise<{ success: boolean; bloc?: BlocCompetence; error?: string }> {
  if (!isSupabaseAvailable() || !supabase) {
    return { success: false, error: 'Service temporairement indisponible' };
  }

  try {
    // Vérifier les permissions en utilisant la fonction SQL définie dans la base
    const { data: hasPermission, error: permissionError } = await supabase.rpc('is_admin');
    
    if (permissionError) {
      
      return { success: false, error: 'Opération non autorisée' };
    }

    if (!hasPermission) {
      return { success: false, error: 'Permissions insuffisantes. Seuls les administrateurs peuvent dupliquer des blocs.' };
    }
    // Récupérer le bloc original avec ses modules
    const originalBloc = await getBlocWithModules(blocId);
    if (!originalBloc) {
      return { success: false, error: 'Bloc original non trouvé' };
    }

    // Déterminer la formation de destination
    const targetFormationId = newFormationId || originalBloc.formation_id;

    // Trouver le prochain numéro de bloc disponible
    const { data: existingBlocs } = await supabase
      .from('blocs_competences')
      .select('numero_bloc')
      .eq('formation_id', targetFormationId)
      .eq('actif', true)
      .order('numero_bloc', { ascending: false })
      .limit(1);

    const nextBlocNumber = existingBlocs && existingBlocs.length > 0 
      ? existingBlocs[0].numero_bloc + 1 
      : 1;

    // Créer le nouveau bloc
    const { data: newBloc, error: blocError } = await supabase
      .from('blocs_competences')
      .insert({
        formation_id: targetFormationId,
        numero_bloc: nextBlocNumber,
        titre: `${originalBloc.titre} (Copie)`,
        description: originalBloc.description,
        objectifs: originalBloc.objectifs,
        duree_estimee: originalBloc.duree_estimee,
        ordre_affichage: nextBlocNumber
      })
      .select()
      .single();

    if (blocError || !newBloc) {
      
      return { success: false, error: 'Erreur lors de la duplication du bloc' };
    }

    // Dupliquer les modules
    if (originalBloc.modules && originalBloc.modules.length > 0) {
      const modulesToCreate = originalBloc.modules.map((module, index) => ({
        bloc_id: newBloc.id,
        numero_module: index + 1,
        titre: module.titre,
        description: module.description,
        type_module: module.type_module,
        duree_estimee: module.duree_estimee,
        ordre_affichage: index + 1
      }));

      const { error: modulesError } = await supabase
        .from('modules_apprentissage')
        .insert(modulesToCreate);

      if (modulesError) {
        
        return { 
          success: true, 
          bloc: newBloc, 
          error: 'Bloc dupliqué mais erreur lors de la duplication des modules' 
        };
      }
    }

    return { success: true, bloc: newBloc };
  } catch (error) {
    
    return { success: false, error: 'Erreur de traitement' };
  }
}

// =============================================
// MISE À JOUR DE BLOCS
// =============================================

export async function updateBloc(blocId: number, updates: UpdateBlocRequest): Promise<{ success: boolean; bloc?: BlocCompetence; error?: string }> {
  if (!isSupabaseAvailable() || !supabase) {
    return { success: false, error: 'Service temporairement indisponible' };
  }

  try {
    // Vérifier les permissions en utilisant la fonction SQL définie dans la base
    const { data: hasPermission, error: permissionError } = await supabase.rpc('is_admin');
    
    if (permissionError) {
      
      return { success: false, error: 'Opération non autorisée' };
    }

    if (!hasPermission) {
      return { success: false, error: 'Permissions insuffisantes. Seuls les administrateurs peuvent modifier des blocs.' };
    }
    // Vérifier que le bloc existe
    const { data: existingBloc, error: checkError } = await supabase
      .from('blocs_competences')
      .select('id, formation_id, numero_bloc')
      .eq('id', blocId)
      .eq('actif', true)
      .single();

    if (checkError || !existingBloc) {
      return { success: false, error: 'Bloc non trouvé' };
    }

    // Si le numéro de bloc est modifié, vérifier qu'il n'existe pas déjà
    if (updates.ordre_affichage && updates.ordre_affichage !== existingBloc.numero_bloc) {
      const { data: duplicateBloc } = await supabase
        .from('blocs_competences')
        .select('id')
        .eq('formation_id', existingBloc.formation_id)
        .eq('numero_bloc', updates.ordre_affichage)
        .eq('actif', true)
        .neq('id', blocId)
        .single();

      if (duplicateBloc) {
        return { success: false, error: 'Un bloc avec ce numéro existe déjà' };
      }
    }

    // Mettre à jour le bloc
    const { data, error } = await supabase
      .from('blocs_competences')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', blocId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du bloc:', error);
      return { success: false, error: 'Erreur lors de la mise à jour du bloc' };
    }

    console.log('Bloc mis à jour avec succès:', data);
    return { success: true, bloc: data };
  } catch (error) {
    
    return { success: false, error: 'Erreur de traitement' };
  }
}

// =============================================
// SUPPRESSION DE BLOCS
// =============================================

export async function deleteBloc(blocId: number): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseAvailable() || !supabase) {
    return { success: false, error: 'Service temporairement indisponible' };
  }

  try {
    // Vérifier les permissions en utilisant la fonction SQL définie dans la base
    const { data: hasPermission, error: permissionError } = await supabase.rpc('is_admin');
    
    if (permissionError) {
      
      return { success: false, error: 'Opération non autorisée' };
    }

    if (!hasPermission) {
      return { success: false, error: 'Permissions insuffisantes. Seuls les administrateurs peuvent supprimer des blocs.' };
    }
    // Vérifier que le bloc existe
    const { data: existingBloc, error: checkError } = await supabase
      .from('blocs_competences')
      .select('id')
      .eq('id', blocId)
      .eq('actif', true)
      .single();

    if (checkError || !existingBloc) {
      return { success: false, error: 'Bloc non trouvé' };
    }

    // Vérifier s'il y a des modules actifs dans ce bloc
    const { data: activeModules, error: modulesError } = await supabase
      .from('modules_apprentissage')
      .select('id')
      .eq('bloc_id', blocId)
      .eq('actif', true);

    if (modulesError) {
      
      return { success: false, error: 'Erreur lors de la vérification des modules' };
    }

    if (activeModules && activeModules.length > 0) {
      return { 
        success: false, 
        error: `Impossible de supprimer le bloc car il contient ${activeModules.length} module(s) actif(s)` 
      };
    }

    // Désactiver le bloc (soft delete)
    const { error } = await supabase
      .from('blocs_competences')
      .update({ 
        actif: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', blocId);

    if (error) {
      
      return { success: false, error: 'Erreur lors de la suppression du bloc' };
    }

    return { success: true };
  } catch (error) {
    
    return { success: false, error: 'Erreur de traitement' };
  }
}

// =============================================
// SUPPRESSION FORCÉE (avec modules)
// =============================================

export async function forceDeleteBloc(blocId: number): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseAvailable() || !supabase) {
    return { success: false, error: 'Service temporairement indisponible' };
  }

  // Vérifier les permissions (seuls les superadmins peuvent forcer la suppression)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Utilisateur non authentifié' };
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'superadmin') {
    return { success: false, error: 'Permissions insuffisantes pour la suppression forcée' };
  }

  try {
    // Désactiver tous les modules du bloc
    await supabase
      .from('modules_apprentissage')
      .update({ 
        actif: false,
        updated_at: new Date().toISOString()
      })
      .eq('bloc_id', blocId);

    // Désactiver le bloc
    const { error } = await supabase
      .from('blocs_competences')
      .update({ 
        actif: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', blocId);

    if (error) {
      
      return { success: false, error: 'Erreur lors de la suppression forcée du bloc' };
    }

    return { success: true };
  } catch (error) {
    
    return { success: false, error: 'Erreur de traitement' };
  }
}
