"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCandidature, CandidatureData } from '@/lib/candidature-api';

interface CandidatureContextType {
  candidatureData: CandidatureData | null;
  isLoading: boolean;
  error: string | null;
  refreshCandidature: () => Promise<void>;
  updateLocalData: (data: Partial<CandidatureData>) => void;
  clearData: () => void;
}

const CandidatureContext = createContext<CandidatureContextType | undefined>(undefined);

export function CandidatureProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  const [candidatureData, setCandidatureData] = useState<CandidatureData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(userId);

  const loadCandidature = async (forceReload = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await getCandidature(forceReload); // Passer le paramètre à la fonction
      
      if (result.success && result.data) {
        setCandidatureData(result.data);
      } else {
        // Pas de candidature existante, ce n'est pas une erreur
        setCandidatureData(null);
      }
    } catch (err) {
      setError('Erreur lors du chargement de la candidature');
      setCandidatureData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger au montage initial
  useEffect(() => {
    loadCandidature(true); // Force reload au démarrage
  }, []);

  // Détecter le changement d'utilisateur et recharger
  useEffect(() => {
    if (userId) {
      if (userId !== currentUserId) {
        // Nouvel utilisateur détecté - vider les données et recharger
        setCandidatureData(null);
        setError(null);
        setCurrentUserId(userId);
        loadCandidature(true); // Force reload avec nouvel utilisateur
      } else if (candidatureData && candidatureData.user_id && candidatureData.user_id !== userId) {
        // Sécurité : Les données chargées ne correspondent pas à l'utilisateur actuel
        setCandidatureData(null);
        loadCandidature(true);
      }
    }
  }, [userId, candidatureData]);

  const refreshCandidature = async () => {
    await loadCandidature(true); // Force reload pour éviter le cache
  };

  // Permet de mettre à jour les données localement sans recharger
  // Utile pour l'optimistic update
  const updateLocalData = (data: Partial<CandidatureData>) => {
    setCandidatureData(prev => prev ? { ...prev, ...data } : null);
  };

  // Vider les données (utile lors de la déconnexion)
  const clearData = () => {
    setCandidatureData(null);
    setError(null);
    setCurrentUserId(undefined);
  };

  return (
    <CandidatureContext.Provider
      value={{
        candidatureData,
        isLoading,
        error,
        refreshCandidature,
        updateLocalData,
        clearData,
      }}
    >
      {children}
    </CandidatureContext.Provider>
  );
}

export function useCandidature() {
  const context = useContext(CandidatureContext);
  
  if (context === undefined) {
    throw new Error('useCandidature doit être utilisé dans un CandidatureProvider');
  }
  
  return context;
}

