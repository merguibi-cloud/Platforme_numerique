export interface Chapitre {
  id: number;
  cours_id: number;
  titre: string;
  contenu: string;
  statut: 'brouillon' | 'en_cours_examen' | 'en_ligne';
  created_at: string;
  updated_at: string;
  created_by: string;
  validated_by?: string;
  validated_at?: string;
}

export interface CoursContenu {
  texte: string;
  medias: MediaElement[];
  liens: LienElement[];
  fichiers: FichierElement[];
}

export interface MediaElement {
  id: string;
  type: 'image' | 'video';
  url: string;
  alt?: string;
  caption?: string;
}

export interface LienElement {
  id: string;
  url: string;
  titre: string;
  description?: string;
}

export interface FichierElement {
  id: string;
  nom: string;
  url: string;
  taille: number;
  type: string;
}

// Nouveau type pour les fichiers complémentaires en base de données
export interface ChapitreFichierComplementaire {
  id: number;
  chapitre_id: number;
  nom_fichier: string;
  chemin_fichier: string;
  url?: string;
  taille_fichier: number;
  mime_type?: string;
  type_fichier?: string;
  ordre_affichage: number;
  created_at: string;
  updated_at: string;
}

export interface CreateChapitreRequest {
  cours_id: number;
  titre: string;
  contenu?: string;
}

export interface UpdateChapitreRequest {
  titre?: string;
  contenu?: string;
  statut?: 'brouillon' | 'en_cours_examen' | 'en_ligne';
}

export interface ChapitreValidationRequest {
  chapitre_id: number;
  action: 'accepter' | 'rejeter';
  commentaire?: string;
}

// Requêtes pour les fichiers complémentaires
export interface CreateChapitreFichierRequest {
  chapitre_id: number;
  nom_fichier: string;
  chemin_fichier: string;
  url?: string;
  taille_fichier: number;
  mime_type?: string;
  type_fichier?: string;
  ordre_affichage?: number;
}

export interface UpdateCoursFichierRequest {
  nom_fichier?: string;
  chemin_fichier?: string;
  url?: string;
  taille_fichier?: number;
  mime_type?: string;
  type_fichier?: string;
  ordre_affichage?: number;
}
