export interface Cours {
  id: number;
  module_id: number;
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

export interface CreateCoursRequest {
  module_id: number;
  titre: string;
  contenu?: string;
}

export interface UpdateCoursRequest {
  titre?: string;
  contenu?: string;
  statut?: 'brouillon' | 'en_cours_examen' | 'en_ligne';
}

export interface CoursValidationRequest {
  cours_id: number;
  action: 'accepter' | 'rejeter';
  commentaire?: string;
}
