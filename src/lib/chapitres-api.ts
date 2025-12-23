import { getSupabaseServerClient, withRetry } from '../lib/supabase';
import { Chapitre, CreateChapitreRequest, UpdateChapitreRequest, ChapitreValidationRequest } from '@/types/cours';

// Fonctions côté serveur pour les chapitres
export async function createChapitreServer(chapitreData: CreateChapitreRequest, userId: string): Promise<{ success: boolean; chapitre?: Chapitre; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('chapitres_cours')
      .insert({
        cours_id: chapitreData.cours_id,
        titre: chapitreData.titre,
        contenu: chapitreData.contenu || '',
        statut: 'brouillon',
        created_by: userId
      })
      .select()
      .single();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, chapitre: data };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}

export async function getChapitresByCoursIdServer(coursId: number): Promise<{ success: boolean; chapitres?: Chapitre[]; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await withRetry(
      async () => {
        const result = await supabase
          .from('chapitres_cours')
          .select('*')
          .eq('cours_id', coursId)
          .order('ordre_affichage', { ascending: true });
        return result;
      }
    );
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, chapitres: data || [] };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}

export async function getChapitreByIdServer(chapitreId: number): Promise<{ success: boolean; chapitre?: Chapitre; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await withRetry(
      async () => {
        const result = await supabase
          .from('chapitres_cours')
          .select('*')
          .eq('id', chapitreId)
          .single();
        return result;
      }
    );
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, chapitre: data };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}

// Fonction pour obtenir un chapitre avec ses fichiers complémentaires
export async function getChapitreWithDetailsServer(
  chapitreId: number
): Promise<{ 
  success: boolean; 
  chapitre?: Chapitre; 
  fichiers?: any[]; 
  error?: string 
}> {
  try {
    const supabase = getSupabaseServerClient();
    
    // Récupérer le chapitre
    const { data: chapitre, error: chapitreError } = await supabase
      .from('chapitres_cours')
      .select('*')
      .eq('id', chapitreId)
      .single();
    
    if (chapitreError) {
      return { success: false, error: chapitreError.message };
    }

    // Les fichiers complémentaires sont maintenant dans le champ ARRAY fichiers_complementaires
    const fichiers = Array.isArray(chapitre.fichiers_complementaires) 
      ? chapitre.fichiers_complementaires.filter(Boolean)
      : [];

    return { 
      success: true, 
      chapitre, 
      fichiers: fichiers || [] 
    };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}

export async function updateChapitreServer(chapitreId: number, updates: UpdateChapitreRequest, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    
    // Construire l'objet de mise à jour avec seulement les champs fournis
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // Ajouter seulement les champs présents dans updates
    if (updates.titre !== undefined) updateData.titre = updates.titre;
    if (updates.contenu !== undefined) updateData.contenu = updates.contenu;
    if (updates.statut !== undefined) updateData.statut = updates.statut;
    
    const { data, error } = await supabase
      .from('chapitres_cours')
      .update(updateData)
      .eq('id', chapitreId)
      .select();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erreur de traitement' };
  }
}

export async function deleteChapitreServer(chapitreId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    // Soft delete : désactiver au lieu de supprimer
    const { error } = await supabase
      .from('chapitres_cours')
      .update({ actif: false, updated_at: new Date().toISOString() })
      .eq('id', chapitreId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}

export async function validateChapitreServer(chapitreId: number, action: 'accepter' | 'rejeter', commentaire: string | undefined, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const updateData: any = {
      validated_by: userId,
      validated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (action === 'accepter') {
      updateData.statut = 'en_ligne';
    } else if (action === 'rejeter') {
      updateData.statut = 'brouillon';
    }
    
    const { error } = await supabase
      .from('chapitres_cours')
      .update(updateData)
      .eq('id', chapitreId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}

// Alias pour compatibilité (à supprimer progressivement)
export const getCoursByModuleIdServer = getChapitresByCoursIdServer;
export const getCoursByIdServer = getChapitreByIdServer;
export const getCoursWithDetailsServer = getChapitreWithDetailsServer;
export const createCoursServer = createChapitreServer;
export const updateCoursServer = updateChapitreServer;
export const deleteCoursServer = deleteChapitreServer;
export const validateCoursServer = validateChapitreServer;

