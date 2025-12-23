import { useCandidature } from '@/contexts/CandidatureContext';

export type Step = 'informations' | 'contrat' | 'inscription' | 'documents' | 'recap' | 'validation';

interface StepValidationResult {
  isValid: boolean;
  missingStep?: Step;
  message?: string;
}

/**
 * Vérifie que toutes les étapes précédentes sont complétées avant d'accéder à une étape
 */
export const validatePreviousSteps = (
  currentStep: Step,
  candidatureData: any
): StepValidationResult => {
  if (!candidatureData) {
    return {
      isValid: false,
      missingStep: 'informations',
      message: 'Veuillez d\'abord compléter l\'étape INFORMATIONS avant de continuer.'
    };
  }

  // Ordre des étapes sans contrat (temporairement retiré)
  const stepOrder: Step[] = ['informations', 'inscription', 'documents', 'recap', 'validation'];
  const currentStepIndex = stepOrder.indexOf(currentStep);

  // Vérifier chaque étape précédente
  for (let i = 0; i < currentStepIndex; i++) {
    const step = stepOrder[i];
    const isStepCompleted = checkStepCompletion(step, candidatureData);

    if (!isStepCompleted) {
      const stepNames: Record<Step, string> = {
        informations: 'INFORMATIONS',
        contrat: 'CONTRAT',
        inscription: 'INSCRIPTION',
        documents: 'DOCUMENTS',
        recap: 'DOSSIER',
        validation: 'VALIDATION'
      };

      return {
        isValid: false,
        missingStep: step,
        message: `Veuillez d'abord compléter l'étape ${stepNames[step]} avant de passer à cette étape.`
      };
    }
  }

  return { isValid: true };
};

/**
 * Vérifie si une étape est complétée
 */
const checkStepCompletion = (step: Step, candidatureData: any): boolean => {
  switch (step) {
    case 'informations':
      return !!(
        candidatureData.nom &&
        candidatureData.prenom &&
        candidatureData.email &&
        candidatureData.telephone &&
        candidatureData.adresse &&
        candidatureData.code_postal &&
        candidatureData.ville &&
        candidatureData.pays &&
        candidatureData.type_formation &&
        candidatureData.etudiant_etranger &&
        candidatureData.accepte_donnees &&
        (candidatureData.piece_identite_paths && candidatureData.piece_identite_paths.length > 0) &&
        (candidatureData.type_formation !== 'alternance' || candidatureData.a_une_entreprise)
      );

    case 'contrat':
      // CONTRAT est considéré comme complété si on a payé (inscription) ou si on est à une étape ultérieure
      return !!(
        candidatureData.paid_at ||
        checkStepCompletion('inscription', candidatureData) ||
        checkStepCompletion('documents', candidatureData) ||
        checkStepCompletion('recap', candidatureData) ||
        checkStepCompletion('validation', candidatureData)
      );

    case 'inscription':
      // Vérifier que paid_at existe et n'est pas une chaîne vide ou null
      const paidAt = candidatureData.paid_at;
      return !!(paidAt && paidAt !== null && paidAt !== '');

    case 'documents':
      return !!(
        candidatureData.cv_path &&
        candidatureData.diplome_path &&
        candidatureData.lettre_motivation_path &&
        (candidatureData.releves_paths && candidatureData.releves_paths.length > 0)
      );

    case 'recap':
      return !!(
        candidatureData.accept_conditions &&
        candidatureData.attest_correct &&
        checkStepCompletion('documents', candidatureData)
      );

    case 'validation':
      return candidatureData.status === 'validated';

    default:
      return false;
  }
};

