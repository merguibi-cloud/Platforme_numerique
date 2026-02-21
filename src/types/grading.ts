export interface SoumissionEtudeCas {
  id: string;
  etude_cas_id: string;
  etudiant_id: string;
  reponse_json: any;
  fichiers_joints?: string[];
  note?: number;
  commentaires?: string;
  statut: 'en_attente' | 'corrige' | 'en_revision';
  corrige_par?: string;
  date_correction?: string;
  created_at: string;
  updated_at: string;
  etudiant?: {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    photo_url?: string;
  };
  etude_cas?: {
    id: string;
    titre: string;
    description?: string;
    note_maximale: number;
    bloc_id: string;
  };
  correcteur?: {
    id: string;
    prenom: string;
    nom: string;
  };
}

export interface GradeSubmission {
  note: number;
  commentaires: string;
  statut: 'corrige' | 'en_revision';
}

export interface BulkGradeRequest {
  submission_ids: string[];
  note: number;
  commentaires: string;
  statut: 'corrige' | 'en_revision';
}
