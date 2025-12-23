'use client';

import { useSessionTracker } from '@/hooks/useSessionTracker';

/**
 * Composant pour suivre les sessions de connexion
 * À placer dans les layouts pour tous les utilisateurs authentifiés
 */
export function SessionTracker() {
  useSessionTracker();
  return null; // Ce composant ne rend rien
}

