import { getSupabaseServerClient } from '../lib/supabase';
import { 
  CoursFichierComplementaire,
  CreateCoursFichierRequest,
  UpdateCoursFichierRequest
} from '@/types/cours';

// =============================================
// FONCTIONS POUR LES FICHIERS COMPLÉMENTAIRES
// =============================================

export async function createCoursFichierServer(
  fichierData: CreateCoursFichierRequest
): Promise<{ success: boolean; fichier?: CoursFichierComplementaire; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('cours_fichiers_complementaires')
      .insert({
        cours_id: fichierData.cours_id,
        nom_fichier: fichierData.nom_fichier,
        chemin_fichier: fichierData.chemin_fichier,
        url: fichierData.url,
        taille_fichier: fichierData.taille_fichier,
        mime_type: fichierData.mime_type,
        type_fichier: fichierData.type_fichier,
        ordre_affichage: fichierData.ordre_affichage || 0
      })
      .select()
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, fichier: data };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}

export async function getCoursFichiersByCoursIdServer(
  coursId: number
): Promise<{ success: boolean; fichiers?: CoursFichierComplementaire[]; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('cours_fichiers_complementaires')
      .select('*')
      .eq('cours_id', coursId)
      .order('ordre_affichage', { ascending: true });
    
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, fichiers: data || [] };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}

export async function updateCoursFichierServer(
  fichierId: number,
  updates: UpdateCoursFichierRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from('cours_fichiers_complementaires')
      .update({
        nom_fichier: updates.nom_fichier,
        chemin_fichier: updates.chemin_fichier,
        url: updates.url,
        taille_fichier: updates.taille_fichier,
        mime_type: updates.mime_type,
        type_fichier: updates.type_fichier,
        ordre_affichage: updates.ordre_affichage,
        updated_at: new Date().toISOString()
      })
      .eq('id', fichierId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}

export async function deleteCoursFichierServer(
  fichierId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from('cours_fichiers_complementaires')
      .delete()
      .eq('id', fichierId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}

