// Fonctions pour les appels directs à la base de données pour les formations utilisateur
import { getSupabaseClient } from './supabase';
import { SupabaseClient } from '@supabase/supabase-js';

export interface UserFormationData {
  formation_id: number;
  formation_titre: string;
  formation_ecole: string;
  formation_prix: number;
}

// Fonction pour récupérer les données de formation de l'utilisateur connecté depuis la DB (utilisée par l'API)
export async function getUserFormationDataFromDB(userId: string, supabaseClient?: SupabaseClient): Promise<{ success: boolean; data?: UserFormationData; error?: string }> {
  try {
    const supabase = supabaseClient || getSupabaseClient();

    // Étape 1: Récupérer le profil utilisateur
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, user_id, formation_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      return {
        success: false,
        error: 'Erreur lors de la récupération du profil'
      };
    }

    if (!profileData) {
      return {
        success: false,
        error: 'Profil non trouvé'
      };
    }

    if (!profileData.formation_id) {
      return {
        success: true,
        data: {
          formation_id: 0,
          formation_titre: 'Aucune formation assignée',
          formation_ecole: '',
          formation_prix: 0,
        }
      };
    }

    // Étape 2: Récupérer les données de la formation
    const { data: formationData, error: formationError } = await supabase
      .from('formations')
      .select('id, titre, ecole, prix')
      .eq('id', profileData.formation_id)
      .maybeSingle();

    if (formationError) {
      return {
        success: false,
        error: 'Erreur lors de la récupération de la formation'
      };
    }

    if (!formationData) {
      return {
        success: false,
        error: 'Formation non trouvée'
      };
    }

    // Structurer les données de formation
    const formationResult = {
      formation_id: profileData.formation_id,
      formation_titre: formationData.titre || 'Formation non spécifiée',
      formation_ecole: formationData.ecole || '',
      formation_prix: formationData.prix || 0,
    };

    return {
      success: true,
      data: formationResult
    };

  } catch (error) {
    return {
      success: false,
      error: 'Erreur lors de la récupération des données de formation'
    };
  }
}

// Fonction pour appeler l'API depuis le frontend
export async function getUserFormationData(): Promise<{ success: boolean; data?: UserFormationData; error?: string }> {
  try {
    const response = await fetch('/api/user/formation', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Erreur lors de la récupération des données de formation');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: 'Erreur lors de la récupération des données de formation'
    };
  }
}
