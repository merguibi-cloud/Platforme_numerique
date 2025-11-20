// Fonctions utilitaires pour les appels API d'authentification
export interface SignUpData {
  email: string;
  password: string;
  formation_id?: number;
  telephone: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: any;
  profile_completed?: boolean;
  role?: string;
  redirectTo?: string;
  message?: string;
  error?: string;
  requiresPasswordChange?: boolean;
}

export interface ProfileData {
  nom: string;
  prenom: string;
  telephone: string;
  date_naissance: string;
  adresse: string;
  ville: string;
  code_postal: string;
  pays: string;
  photo_profil_url: string;
  piece_identite_url: string;
  cv_url: string;
  autres_documents_urls: string[];
  formation_id?: number;
}

// Fonction d'inscription
export async function signUp(data: SignUpData): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Erreur lors de l\'inscription');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'inscription'
    };
  }
}

// Fonction de connexion
export async function signIn(data: SignInData): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Erreur lors de la connexion');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la connexion'
    };
  }
}

// Fonction de déconnexion
export async function signOut(): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Erreur lors de la déconnexion');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la déconnexion'
    };
  }
}

// Fonction pour obtenir l'utilisateur actuel
export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/user', {
      method: 'GET',
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Erreur lors de la récupération de l\'utilisateur');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la récupération de l\'utilisateur'
    };
  }
}

// Fonction pour obtenir le profil utilisateur
export async function getUserProfile(): Promise<{ success: boolean; profile?: any; error?: string }> {
  try {
    const response = await fetch('/api/profile', {
      method: 'GET',
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Erreur lors de la récupération du profil');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la récupération du profil'
    };
  }
}

export async function getSessionRole(): Promise<{ success: boolean; role?: string; redirectTo?: string; error?: string }> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Erreur lors de la récupération du rôle');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la récupération du rôle',
    };
  }
}

// Fonction pour mettre à jour le profil utilisateur
export async function updateUserProfile(data: ProfileData): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch('/api/profile/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Erreur lors de la mise à jour du profil');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil'
    };
  }
}
