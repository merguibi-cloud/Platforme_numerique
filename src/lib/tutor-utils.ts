// Utility functions for tutor operations

/**
 * Calculate the completion percentage for a student's progress
 */
export function calculateProgressPercentage(
  completed: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Get status badge color based on submission status
 */
export function getSubmissionStatusColor(
  statut: 'en_attente' | 'corrige' | 'en_revision'
): string {
  switch (statut) {
    case 'en_attente':
      return 'bg-yellow-100 text-yellow-800';
    case 'corrige':
      return 'bg-green-100 text-green-800';
    case 'en_revision':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get status text in French
 */
export function getSubmissionStatusText(
  statut: 'en_attente' | 'corrige' | 'en_revision'
): string {
  switch (statut) {
    case 'en_attente':
      return 'En attente';
    case 'corrige':
      return 'Corrigé';
    case 'en_revision':
      return 'En révision';
    default:
      return 'Inconnu';
  }
}

/**
 * Get progress status badge color
 */
export function getProgressStatusColor(
  statut: 'non_commence' | 'en_cours' | 'termine' | 'en_retard'
): string {
  switch (statut) {
    case 'non_commence':
      return 'bg-gray-100 text-gray-800';
    case 'en_cours':
      return 'bg-blue-100 text-blue-800';
    case 'termine':
      return 'bg-green-100 text-green-800';
    case 'en_retard':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get progress status text in French
 */
export function getProgressStatusText(
  statut: 'non_commence' | 'en_cours' | 'termine' | 'en_retard'
): string {
  switch (statut) {
    case 'non_commence':
      return 'Non commencé';
    case 'en_cours':
      return 'En cours';
    case 'termine':
      return 'Terminé';
    case 'en_retard':
      return 'En retard';
    default:
      return 'Inconnu';
  }
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Get relative time (e.g., "il y a 2 heures")
 */
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  return 'à l\'instant';
}
