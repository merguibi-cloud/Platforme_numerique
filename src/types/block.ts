// =============================================
// TYPES POUR LES BLOCS DE COMPÉTENCES
// =============================================

export interface Block {
  id: string;
  title: string;
  description?: string;
  formationId: string;
  numeroBloc: number;
  objectifs?: string[];
  dureeEstimee?: number;
  ordreAffichage: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormationInfo {
  id: string;
  title: string;
  level: string;
  levelCode: string;
}

export interface Cours {
  id: string;
  blocId: string;
  numeroCours: number;
  titre: string;
  description?: string;
  typeModule: 'cours' | 'etude_cas' | 'quiz' | 'projet';
  dureeEstimee?: number;
  ordreAffichage: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBlocData {
  titre: string;
  cours: string[];
}

export interface BlocWithCours extends Block {
  cours: Cours[];
}