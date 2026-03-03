export interface Tuteur {
  id: string;
  user_id: string;
  nom?: string;
  prenom?: string;
  email?: string;
  bio?: string;
  specialites?: string[];
  statut: string;
  created_at: string;
  updated_at?: string;
}

export interface TuteurEtudiant {
  id: string;
  tuteur_id: string;
  etudiant_id: string;
  statut: 'actif' | 'inactif' | 'termine';
  date_debut: string;
  date_fin?: string;
  created_at: string;
  etudiant?: {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    photo_url?: string;
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
  cours_id: string;
  cours_titre: string;
  progression: number;
  statut: 'non_commence' | 'en_cours' | 'termine';
  date_derniere_activite: string | null;
  total_chapitres: number;
  chapitres_termines: number;
}
