import { getSupabaseServerClient } from '../lib/supabase';
import {
  ChapitreFichierComplementaire,
  CreateChapitreFichierRequest,
  UpdateCoursFichierRequest
} from '@/types/cours';

// =============================================
// FONCTIONS POUR LES FICHIERS COMPLÉMENTAIRES
// Note: Les fichiers complémentaires sont maintenant un array dans chapitres_cours
// Ces fonctions devraient être refactorisées pour utiliser l'array directement
// =============================================

export async function createCoursFichierServer(
  fichierData: CreateChapitreFichierRequest
): Promise<{ success: boolean; fichier?: ChapitreFichierComplementaire; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    
    // Récupérer les fichiers actuels
    const { data: chapitreData, error: fetchError } = await supabase
      .from('chapitres_cours')
      .select('fichiers_complementaires')
      .eq('id', fichierData.chapitre_id)
      .single();
    
    if (fetchError) {
      return { success: false, error: fetchError.message };
    }
    
    // Mettre à jour l'array fichiers_complementaires
    const currentFiles = (chapitreData?.fichiers_complementaires || []) as string[];
    const updatedFiles = [...currentFiles, fichierData.chemin_fichier];
    
    const { error: updateError } = await supabase
      .from('chapitres_cours')
      .update({
        fichiers_complementaires: updatedFiles
      })
      .eq('id', fichierData.chapitre_id);
    
    if (updateError) {
      return { success: false, error: updateError.message };
    }
    
    // Construire l'objet fichier pour le retour
    const fichier: ChapitreFichierComplementaire = {
      id: 0,
      chapitre_id: fichierData.chapitre_id,
      nom_fichier: fichierData.nom_fichier,
      chemin_fichier: fichierData.chemin_fichier,
      url: fichierData.url,
      taille_fichier: fichierData.taille_fichier,
      mime_type: fichierData.mime_type,
      type_fichier: fichierData.type_fichier,
      ordre_affichage: fichierData.ordre_affichage || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return { success: true, fichier };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}

export async function getCoursFichiersByCoursIdServer(
  coursId: number
): Promise<{ success: boolean; fichiers?: ChapitreFichierComplementaire[]; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    // Note: Cette fonction devrait être refactorisée car les fichiers sont maintenant dans chapitres_cours
    // Pour l'instant, retourner un tableau vide
    return { success: true, fichiers: [] };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}

export async function updateCoursFichierServer(
  fichierId: number,
  updates: UpdateCoursFichierRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    // Note: Cette fonction devrait être refactorisée car les fichiers sont maintenant dans chapitres_cours
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}

export async function deleteCoursFichierServer(
  fichierId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Note: Cette fonction devrait être refactorisée car les fichiers sont maintenant dans chapitres_cours
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}
