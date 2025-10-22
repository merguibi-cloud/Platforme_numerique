import { getSupabaseServerClient } from './supabase';
import { ModuleApprentissage, CoursContenu } from '@/types/formation-detailed';

// =============================================
// API POUR LES MODULES D'APPRENTISSAGE
// =============================================

export interface CreateModuleRequest {
  bloc_id: number;
  numero_module?: number;
  titre: string;
  description?: string;
  type_module: 'cours' | 'etude_cas' | 'quiz' | 'projet';
  cours: string[];
  created_by?: string;
}

export interface CreateModuleResponse {
  success: boolean;
  module?: ModuleApprentissage;
  cours?: CoursContenu[];
  error?: string;
}

export async function createModuleWithCours(data: CreateModuleRequest): Promise<CreateModuleResponse> {
  try {
    const supabase = getSupabaseServerClient();
    
    // Calculer le prochain numéro de module pour ce bloc
    const { data: existingModules } = await supabase
      .from('modules_apprentissage')
      .select('numero_module')
      .eq('bloc_id', data.bloc_id)
      .order('numero_module', { ascending: false })
      .limit(1);
    
    const nextModuleNumber = existingModules && existingModules.length > 0 
      ? existingModules[0].numero_module + 1 
      : 1;
    
    // Créer le module
    const { data: module, error: moduleError } = await supabase
      .from('modules_apprentissage')
      .insert({
        bloc_id: data.bloc_id,
        numero_module: nextModuleNumber,
        titre: data.titre,
        description: data.description,
        type_module: data.type_module,
        ordre_affichage: nextModuleNumber,
        duree_estimee: 0,
        actif: true,
        created_by: data.created_by || null
      })
      .select()
      .single();

    if (moduleError) {
      return { success: false, error: 'Erreur lors de la création du module' };
    }

    // Créer les cours associés
    const coursToCreate = data.cours
      .filter(coursTitre => coursTitre.trim())
      .map((coursTitre, index) => ({
        module_id: module.id,
        titre: coursTitre.trim(),
        type_contenu: 'texte' as const,
        ordre_affichage: index + 1,
        actif: false
      }));

    if (coursToCreate.length > 0) {
      const { data: cours, error: coursError } = await supabase
        .from('cours_contenu')
        .insert(coursToCreate)
        .select();

      if (coursError) {
        return { 
          success: true, 
          module, 
          error: 'Module créé mais erreur lors de la création des cours' 
        };
      }

      return { success: true, module, cours };
    }

    return { success: true, module };
  } catch (error) {
    return { success: false, error: 'Erreur interne du serveur' };
  }
}

export async function getModulesByBlocId(blocId: number): Promise<ModuleApprentissage[]> {
  try {
    const supabase = getSupabaseServerClient();
    
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

export async function getCoursByModuleId(moduleId: number): Promise<CoursContenu[]> {
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

export async function updateModule(moduleId: number, updates: Partial<ModuleApprentissage>): Promise<boolean> {
  try {
    const supabase = getSupabaseServerClient();
    
    const { error } = await supabase
      .from('modules_apprentissage')
      .update(updates)
      .eq('id', moduleId);

    if (error) {
      
      return false;
    }

    return true;
  } catch (error) {
    
    return false;
  }
}

export async function deleteModule(moduleId: number): Promise<boolean> {
  try {
    const supabase = getSupabaseServerClient();
    
    // Désactiver le module au lieu de le supprimer (soft delete)
    const { error } = await supabase
      .from('modules_apprentissage')
      .update({ actif: false })
      .eq('id', moduleId);

    if (error) {
      
      return false;
    }

    return true;
  } catch (error) {
    
    return false;
  }
}

// Fonction pour déterminer le statut d'un module
export function getModuleStatus(module: ModuleApprentissage, cours: CoursContenu[]): 'en_ligne' | 'brouillon' | 'manquant' {
  if (cours.length === 0) {
    return 'manquant';
  }
  
  // Logique pour déterminer si le module est en ligne ou en brouillon
  // Pour l'instant, on considère qu'un module avec des cours est "en ligne"
  // Vous pouvez ajuster cette logique selon vos besoins
  return 'en_ligne';
}
