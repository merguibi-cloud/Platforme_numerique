// Type definitions for the Tutor Dashboard

export interface Tuteur {
  id: string;
  user_id: string;
  bio?: string;
  specialites?: string[];
  disponibilite?: any;
  statut?: string;
  created_at: string;
  updated_at: string;
  // From auth user_metadata
  prenom?: string;
  nom?: string;
  email?: string;
}

export interface TuteurEtudiant {
  id: string;
  tuteur_id: string;
  etudiant_id: string;
  date_debut: string;
  date_fin?: string;
  statut: 'actif' | 'inactif' | 'termine';
  created_at: string;
  // Relations
  etudiant?: {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    photo_url?: string;
  };
}

export interface TuteurCours {
  id: string;
  tuteur_id: string;
  cours_id: string;
  created_at: string;
  // Relations
  cours?: {
    id: string;
    titre: string;
    description?: string;
  };
}

export interface ProgressionEtudiant {
  id: string;
  etudiant_id: string;
  cours_id: string;
  chapitre_id?: string;
  bloc_id?: string;
  statut: 'non_commence' | 'en_cours' | 'termine';
  progression: number;
  date_derniere_activite?: string;
  created_at: string;
  updated_at: string;
  // Relations
  etudiant?: {
    id: string;
    prenom: string;
    nom: string;
    email: string;
  };
  cours?: {
    id: string;
    titre: string;
  };
  chapitre?: {
    id: string;
    titre: string;
  };
  bloc?: {
    id: string;
    titre: string;
  };
}

export interface TutorDashboardStats {
  total_etudiants: number;
  total_cours: number;
  total_soumissions_en_attente: number;
  taux_reussite_moyen: number;
  derniere_activite?: string;
}

export interface StudentProgress {
  etudiant_id: string;
  prenom: string;
  nom: string;
  email: string;
  photo_url?: string;
  cours_id: string;
  cours_titre: string;
  progression: number;
  statut: 'non_commence' | 'en_cours' | 'termine';
  date_derniere_activite?: string;
  total_chapitres: number;
  chapitres_termines: number;
}
