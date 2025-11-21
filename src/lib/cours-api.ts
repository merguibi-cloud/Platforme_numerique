import { getSupabaseServerClient } from './supabase';
import { CoursApprentissage, ChapitreCours } from '@/types/formation-detailed';

// =============================================
// API POUR LES COURS D'APPRENTISSAGE
// =============================================

export interface CreateCoursRequest {
  bloc_id: number;
  numero_cours?: number;
  titre: string;
  description?: string;
  type_module: 'cours' | 'etude_cas' | 'quiz' | 'projet';
  chapitres: string[];
  created_by?: string;
}

export interface CreateCoursResponse {
  success: boolean;
  cours?: CoursApprentissage;
  chapitres?: ChapitreCours[];
  error?: string;
}

export async function createCoursWithChapitres(data: CreateCoursRequest): Promise<CreateCoursResponse> {
  try {
    const supabase = getSupabaseServerClient();
    
    // Calculer le prochain numéro de cours pour ce bloc
    const { data: existingCours } = await supabase
      .from('cours_apprentissage')
      .select('numero_cours')
      .eq('bloc_id', data.bloc_id)
      .order('numero_cours', { ascending: false })
      .limit(1);
    
    const nextCoursNumber = existingCours && existingCours.length > 0 
      ? existingCours[0].numero_cours + 1 
      : 1;
    
    // Créer le cours
    const { data: cours, error: coursError } = await supabase
      .from('cours_apprentissage')
      .insert({
        bloc_id: data.bloc_id,
        numero_cours: nextCoursNumber,
        titre: data.titre,
        description: data.description,
        type_module: data.type_module,
        ordre_affichage: nextCoursNumber,
        duree_estimee: 0,
        actif: true,
        created_by: data.created_by || null
      })
      .select()
      .single();

    if (coursError) {
      return { success: false, error: 'Erreur lors de la création du cours' };
    }

    // Créer les chapitres associés
    const chapitresToCreate = data.chapitres
      .filter(chapitreTitre => chapitreTitre.trim())
      .map((chapitreTitre, index) => ({
        cours_id: cours.id,
        titre: chapitreTitre.trim(),
        type_contenu: 'texte' as const,
        ordre_affichage: index + 1,
        actif: false
      }));

    if (chapitresToCreate.length > 0) {
      const { data: chapitres, error: chapitresError } = await supabase
        .from('chapitres_cours')
        .insert(chapitresToCreate)
        .select();

      if (chapitresError) {
        return { 
          success: true, 
          cours, 
          error: 'Cours créé mais erreur lors de la création des chapitres' 
        };
      }

      return { success: true, cours, chapitres };
    }

    return { success: true, cours };
  } catch (error) {
    return { success: false, error: 'Erreur interne du serveur' };
  }
}

export async function getCoursByBlocId(blocId: number): Promise<CoursApprentissage[]> {
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

export async function getChapitresByCoursId(coursId: number): Promise<ChapitreCours[]> {
  try {
    const supabase = getSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('chapitres_cours')
      .select('*')
      .eq('cours_id', coursId)
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

export async function updateCours(coursId: number, updates: Partial<CoursApprentissage>): Promise<boolean> {
  try {
    const supabase = getSupabaseServerClient();
    
    const { error } = await supabase
      .from('cours_apprentissage')
      .update(updates)
      .eq('id', coursId);

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

export async function deleteCours(coursId: number): Promise<boolean> {
  try {
    const supabase = getSupabaseServerClient();
    
    // Désactiver le cours au lieu de le supprimer (soft delete)
    const { error } = await supabase
      .from('cours_apprentissage')
      .update({ actif: false })
      .eq('id', coursId);

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

// Fonction pour déterminer le statut d'un cours
export function getCoursStatus(cours: CoursApprentissage, chapitres: ChapitreCours[]): 'en_ligne' | 'brouillon' | 'manquant' {
  if (chapitres.length === 0) {
    return 'manquant';
  }
  
  // Logique pour déterminer si le cours est en ligne ou en brouillon
  // Pour l'instant, on considère qu'un cours avec des chapitres est "en ligne"
  // Vous pouvez ajuster cette logique selon vos besoins
  return 'en_ligne';
}

// Fonction pour récupérer un cours par son ID
export async function getCoursByIdServer(coursId: number): Promise<{ success: boolean; cours?: CoursApprentissage; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('cours_apprentissage')
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
