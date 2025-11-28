'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-api';

/**
 * Hook pour suivre le temps de connexion de l'utilisateur
 * Envoie périodiquement la durée de connexion au serveur
 * Ne fonctionne QUE dans l'espace étudiant pour éviter de tracker le temps passé dans la validation
 */
export function useSessionTracker() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Vérifier si on est dans l'espace étudiant
  const isInStudentSpace = pathname?.startsWith('/espace-etudiant') || false;

  // Charger l'utilisateur au montage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await getCurrentUser();
        if (result.success && result.user) {
          setUser(result.user);
        }
      } catch (error) {
        // Erreur silencieuse
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    // Ne tracker que si on est dans l'espace étudiant
    if (!isInStudentSpace) {
      // Nettoyer l'intervalle si on quitte l'espace étudiant
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (!user) {
      // Nettoyer l'intervalle si l'utilisateur se déconnecte
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initialiser le temps de début
    startTimeRef.current = Date.now();
    lastUpdateRef.current = Date.now();

    // Envoyer la durée toutes les 5 minutes (300000 ms)
    const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

    const trackSession = async () => {
      if (!startTimeRef.current) return;

      const now = Date.now();
      const dureeMinutes = Math.floor((now - lastUpdateRef.current) / (60 * 1000));
      
      if (dureeMinutes > 0) {
        try {
          await fetch('/api/sessions/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              duree_minutes: dureeMinutes
            }),
          });
          
          // Mettre à jour le temps de dernière mise à jour
          lastUpdateRef.current = now;
        } catch (error) {
          console.error('Erreur lors du suivi de session:', error);
        }
      }
    };

    // Démarrer l'intervalle
    intervalRef.current = setInterval(trackSession, UPDATE_INTERVAL);

    // Ne pas envoyer immédiatement, attendre le premier intervalle

    // Nettoyer lors du démontage ou de la déconnexion
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Envoyer le temps restant avant de nettoyer
      if (startTimeRef.current) {
        const finalDuree = Math.floor((Date.now() - lastUpdateRef.current) / (60 * 1000));
        if (finalDuree > 0) {
          fetch('/api/sessions/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              duree_minutes: finalDuree
            }),
          }).catch(() => {});
        }
      }
    };
  }, [user, isInStudentSpace]);

  return null;
}

