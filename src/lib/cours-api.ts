import { getSupabaseServerClient } from '../lib/supabase';
import { Cours, CreateCoursRequest, UpdateCoursRequest, CoursValidationRequest } from '@/types/cours';
// Fonctions côté serveur pour les cours
export async function createCoursServer(coursData: CreateCoursRequest, userId: string): Promise<{ success: boolean; cours?: Cours; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('cours_contenu')
      .insert({
        module_id: coursData.module_id,
        titre: coursData.titre,
        contenu: coursData.contenu || '',
        statut: 'brouillon',
        created_by: userId
      })
      .select()
      .single();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, cours: data };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}
export async function getCoursByModuleIdServer(moduleId: number): Promise<{ success: boolean; cours?: Cours[]; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('cours_contenu')
      .select('*')
      .eq('module_id', moduleId)
      .order('created_at', { ascending: false });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, cours: data || [] };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}
export async function getCoursByIdServer(coursId: number): Promise<{ success: boolean; cours?: Cours; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('cours_contenu')
      .select('*')
      .eq('id', coursId)
      .single();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, cours: data };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}
export async function updateCoursServer(coursId: number, updates: UpdateCoursRequest, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from('cours_contenu')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', coursId);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}
export async function deleteCoursServer(coursId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from('cours_contenu')
      .delete()
      .eq('id', coursId);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}
export async function validateCoursServer(validationData: CoursValidationRequest, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const statut = validationData.action === 'accepter' ? 'en_ligne' : 'brouillon';
    const { error } = await supabase
      .from('cours_contenu')
      .update({
        statut,
        validated_by: userId,
        validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', validationData.cours_id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}
export async function getUserProfileServer(userId: string): Promise<{ success: boolean; role?: string; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', userId)
      .single();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, role: data.role };
  } catch (error) {
    return { success: false, error: 'Erreur de traitement' };
  }
}