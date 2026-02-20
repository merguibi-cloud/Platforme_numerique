// Validation functions for grading
import type { GradeValidationResult } from '@/types/grading';

/**
 * Validate a grade submission
 */
export function validateGrade(
  note: number,
  noteMaximale: number,
  commentaires: string
): GradeValidationResult {
  const errors: string[] = [];

  // Validate note
  if (typeof note !== 'number' || isNaN(note)) {
    errors.push('La note doit être un nombre valide');
  } else if (note < 0) {
    errors.push('La note ne peut pas être négative');
  } else if (note > noteMaximale) {
    errors.push(`La note ne peut pas dépasser ${noteMaximale}`);
  }

  // Validate commentaires
  if (!commentaires || commentaires.trim().length === 0) {
    errors.push('Les commentaires sont obligatoires');
  } else if (commentaires.trim().length < 10) {
    errors.push('Les commentaires doivent contenir au moins 10 caractères');
  } else if (commentaires.length > 2000) {
    errors.push('Les commentaires ne peuvent pas dépasser 2000 caractères');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate bulk grading request
 */
export function validateBulkGrade(
  submissionIds: string[],
  note: number,
  noteMaximale: number,
  commentaires: string
): GradeValidationResult {
  const errors: string[] = [];

  // Validate submission IDs
  if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
    errors.push('Aucune soumission sélectionnée');
  } else if (submissionIds.length > 50) {
    errors.push('Vous ne pouvez pas corriger plus de 50 soumissions à la fois');
  }

  // Validate grade
  const gradeValidation = validateGrade(note, noteMaximale, commentaires);
  if (!gradeValidation.isValid) {
    errors.push(...gradeValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize comments to prevent XSS
 */
export function sanitizeComments(commentaires: string): string {
  return commentaires
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}
