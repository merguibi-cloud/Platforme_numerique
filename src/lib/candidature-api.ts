// Fonctions pour gérer les candidatures via l'API

export interface CandidatureData {
  id?: string;
  user_id?: string;
  formation_id?: number;
  status?: 'draft' | 'submitted' | 'pending' | 'validated' | 'approved' | 'rejected';
  current_step?: string;
  civilite?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  code_postal?: string;
  ville?: string;
  pays?: string;
  situation_actuelle?: string;
  type_formation?: string;
  a_une_entreprise?: string;
  etudiant_etranger?: string;
  accepte_donnees?: boolean;
  photo_identite_path?: string;
  cv_path?: string;
  diplome_path?: string;
  releves_paths?: string[];
  piece_identite_paths?: string[];
  lettre_motivation_path?: string;
  entreprise_accueil?: string;
  accept_conditions?: boolean;
  attest_correct?: boolean;
  created_at?: string;
  updated_at?: string;
  submitted_at?: string;
  paid_at?: string;
  airtable_form_etudiant_completed?: boolean;
  airtable_form_entreprise_completed?: boolean;
  airtable_forms_submitted_at?: string;
}

export interface InformationsStepData {
  civilite: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  codePostal: string;
  ville: string;
  pays: string;
  situationActuelle: string;
}

/**
 * Récupérer la candidature de l'utilisateur connecté
 */
export async function getCandidature(forceReload = false): Promise<{ success: boolean; data?: CandidatureData; error?: string }> {
  try {
    // Ajouter un timestamp pour bypass le cache si nécessaire
    const url = forceReload ? `/api/candidature?t=${Date.now()}` : '/api/candidature';
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Bypass le cache du navigateur si forceReload
      cache: forceReload ? 'no-store' : 'default',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Erreur lors de la récupération de la candidature');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: 'Erreur lors de la récupération de la candidature'
    };
  }
}

/**
 * Sauvegarder ou mettre à jour les données d'une étape de la candidature
 */
export async function saveCandidatureStep(
  step: string,
  data: InformationsStepData | any
): Promise<{ success: boolean; data?: CandidatureData; error?: string; details?: string }> {
  try {
    const response = await fetch('/api/candidature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ step, data }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Erreur lors de la sauvegarde de la candidature'
      };
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: 'Erreur lors de la sauvegarde de la candidature'
    };
  }
}

