// =============================================
// TYPES TYPESCRIPT POUR LES FORMATIONS
// =============================================

export interface Formation {
  id: number;
  titre: string;
  description: string;
  redirection: string;
  icon: string;
  image: string;
  theme: 'DIGITAL' | 'BUSINESS' | 'FINANCE' | 'CRÉATIVITÉ' | 'MANAGEMENT';
  ecole: 'DIGITAL LEGACY' | 'KEOS' | '1001' | 'AFRICAN BUSINESS SCHOOL' | 'CREATIVE NATION' | 'CSAM' |
          'EDIFICE' | 'FINANCE SOCIETY' | 'LEADER SOCIETY' | 'STUDIO CAMPUS' | 'TALENT BUSINESS SCHOOL' |
           'ELITE SOCIETY ONLINE';
  niveau?: 'BAC' | 'BAC+2' | 'BAC+3' | 'BAC+5';
  rythme?: 'TEMPS PLEIN' | 'TEMPS PARTIEL' | 'ALTERNANCE' | 'DISTANCIEL';
  prix: number;
  description_detaille?: string;
  duree_totale?: number;
  niveau_requis?: string;
  prerequis?: string;
  objectifs?: string[];
  competences_acquises?: string[];
}

export interface BlocCompetence {
  id: number;
  formation_id: number;
  numero_bloc: number;
  titre: string;
  description?: string;
  objectifs?: string[];
  duree_estimee?: number;
  ordre_affichage: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  modules?: ModuleApprentissage[];
  formation?: Formation;
}

export interface ModuleApprentissage {
  id: number;
  bloc_id: number;
  numero_module: number;
  titre: string;
  description?: string;
  type_module: 'cours' | 'etude_cas' | 'quiz' | 'projet';
  duree_estimee?: number;
  ordre_affichage: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  bloc?: BlocCompetence;
  cours?: CoursContenu[];
  etude_cas?: EtudeCas[];
  quiz?: QuizEvaluation[];
}

export interface CoursContenu {
  id: number;
  module_id: number;
  titre: string;
  description?: string;
  type_contenu: 'video' | 'texte' | 'presentation' | 'ressource';
  contenu?: string;
  url_video?: string;
  duree_video?: number;
  fichiers_complementaires?: string[];
  ordre_affichage: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  module?: ModuleApprentissage;
}

export interface EtudeCas {
  id: number;
  module_id: number;
  titre: string;
  description?: string;
  consigne: string;
  fichier_consigne?: string;
  date_limite?: string;
  points_max: number;
  criteres_evaluation?: string[];
  actif: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  module?: ModuleApprentissage;
  soumissions?: SoumissionEtudeCas[];
}

export interface QuizEvaluation {
  id: number;
  module_id: number;
  cours_id?: number;
  titre: string;
  description?: string;
  duree_minutes: number;
  nombre_tentatives_max: number;
  seuil_reussite: number;
  questions_aleatoires: boolean;
  actif: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  module?: ModuleApprentissage;
  questions?: QuestionQuiz[];
  tentatives?: TentativeQuiz[];
}

export interface QuestionQuiz {
  id: number;
  quiz_id: number;
  question: string;
  type_question: 'choix_unique' | 'choix_multiple' | 'vrai_faux' | 'texte_libre';
  points: number;
  ordre_affichage: number;
  explication?: string;
  justification?: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  quiz?: QuizEvaluation;
  reponses_possibles?: ReponsePossible[];
  reponses_donnees?: ReponseQuiz[];
}

export interface ReponsePossible {
  id: number;
  question_id: number;
  reponse: string;
  est_correcte: boolean;
  ordre_affichage: number;
  created_at: string;
  
  // Relations
  question?: QuestionQuiz;
}

export interface SoumissionEtudeCas {
  id: number;
  etude_cas_id: number;
  user_id: string;
  fichier_soumis: string;
  commentaire_etudiant?: string;
  note?: number;
  commentaire_correcteur?: string;
  statut: 'en_attente' | 'corrige' | 'retourne';
  date_soumission: string;
  date_correction?: string;
  correcteur_id?: string;
  
  // Relations
  etude_cas?: EtudeCas;
  user?: any; // User profile
  correcteur?: any; // User profile
}

export interface TentativeQuiz {
  id: number;
  quiz_id: number;
  user_id: string;
  numero_tentative: number;
  score?: number;
  temps_passe?: number;
  termine: boolean;
  date_debut: string;
  date_fin?: string;
  
  // Relations
  quiz?: QuizEvaluation;
  user?: any; // User profile
  reponses?: ReponseQuiz[];
}

export interface ReponseQuiz {
  id: number;
  tentative_id: number;
  question_id: number;
  reponse_donnee?: string;
  reponse_correcte_id?: number;
  points_obtenus: number;
  date_reponse: string;
  
  // Relations
  tentative?: TentativeQuiz;
  question?: QuestionQuiz;
  reponse_correcte?: ReponsePossible;
}

export interface ProgressionEtudiant {
  id: number;
  user_id: string;
  formation_id: number;
  bloc_id?: number;
  module_id?: number;
  cours_id?: number;
  etude_cas_id?: number;
  quiz_id?: number;
  statut: 'non_commence' | 'en_cours' | 'termine' | 'abandonne';
  pourcentage_completion: number;
  date_debut?: string;
  date_fin?: string;
  derniere_activite: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: any; // User profile
  formation?: Formation;
  bloc?: BlocCompetence;
  module?: ModuleApprentissage;
  cours?: CoursContenu;
  etude_cas?: EtudeCas;
  quiz?: QuizEvaluation;
}

// =============================================
// TYPES POUR LES STATISTIQUES ET ANALYSES
// =============================================

export interface FormationStats {
  total_blocs: number;
  total_modules: number;
  total_cours: number;
  total_etudes_cas: number;
  total_quiz: number;
  duree_totale: number;
}

export interface ProgressionFormation {
  formation_id: number;
  formation_titre: string;
  progression_pourcentage: number;
  elements_termines: number;
  elements_totaux: number;
  derniere_activite?: string;
}

export interface StatistiquesEtudiant {
  formations_inscrites: number;
  formations_terminees: number;
  cours_termines: number;
  etudes_cas_soumises: number;
  quiz_reussis: number;
  moyenne_generale: number;
  temps_total_formation: number; // en heures
}

// =============================================
// TYPES POUR LES FORMULAIRES ET CRÉATION
// =============================================

export interface CreateFormationData {
  titre: string;
  description: string;
  theme: Formation['theme'];
  ecole: Formation['ecole'];
  niveau?: Formation['niveau'];
  rythme?: Formation['rythme'];
  prix: number;
  description_detaille?: string;
  duree_totale?: number;
  niveau_requis?: string;
  prerequis?: string;
  objectifs?: string[];
  competences_acquises?: string[];
}

export interface CreateBlocData {
  formation_id: number;
  numero_bloc: number;
  titre: string;
  description?: string;
  objectifs?: string[];
  duree_estimee?: number;
}

export interface CreateModuleData {
  bloc_id: number;
  numero_module: number;
  titre: string;
  description?: string;
  type_module: ModuleApprentissage['type_module'];
  duree_estimee?: number;
}

export interface CreateCoursData {
  module_id: number;
  titre: string;
  description?: string;
  type_contenu: CoursContenu['type_contenu'];
  contenu?: string;
  url_video?: string;
  duree_video?: number;
}

export interface CreateEtudeCasData {
  module_id: number;
  titre: string;
  description?: string;
  consigne: string;
  fichier_consigne?: string;
  date_limite?: string;
  points_max: number;
  criteres_evaluation?: string[];
}

export interface CreateQuizData {
  module_id: number;
  cours_id?: number;
  titre: string;
  description?: string;
  duree_minutes: number;
  nombre_tentatives_max: number;
  seuil_reussite: number;
  questions_aleatoires: boolean;
}

export interface CreateQuestionData {
  quiz_id: number;
  question: string;
  type_question: QuestionQuiz['type_question'];
  points: number;
  explication?: string;
  justification?: string;
  reponses_possibles?: Omit<ReponsePossible, 'id' | 'question_id' | 'created_at'>[];
}

// =============================================
// TYPES POUR LES RÉPONSES API
// =============================================

export interface FormationWithStats extends Formation {
  stats: FormationStats;
  blocs: BlocCompetence[];
}

export interface BlocWithModules extends BlocCompetence {
  modules: ModuleApprentissage[];
}

export interface ModuleWithContent extends ModuleApprentissage {
  cours: CoursContenu[];
  etude_cas: EtudeCas[];
  quiz: QuizEvaluation[];
}

export interface QuizWithQuestions extends QuizEvaluation {
  questions: QuestionQuiz[];
}

export interface QuestionWithReponses extends QuestionQuiz {
  reponses_possibles: ReponsePossible[];
}

// =============================================
// TYPES POUR LES FILTRES ET RECHERCHE
// =============================================

export interface FormationFilters {
  theme?: Formation['theme'];
  ecole?: Formation['ecole'];
  niveau?: Formation['niveau'];
  rythme?: Formation['rythme'];
  prix_min?: number;
  prix_max?: number;
  duree_min?: number;
  duree_max?: number;
  search?: string;
}

export interface ProgressionFilters {
  user_id?: string;
  formation_id?: number;
  statut?: ProgressionEtudiant['statut'];
  date_debut?: string;
  date_fin?: string;
}
