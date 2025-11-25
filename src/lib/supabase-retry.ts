import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Codes d'erreur PostgREST qui indiquent des erreurs transitoires pouvant être réessayées
 */
const RETRYABLE_ERROR_CODES = [
  'PGRST002', // Could not query the database for the schema cache
  'PGRST301', // Too many requests
  'PGRST116', // Not found (parfois transitoire)
];

/**
 * Délai initial avant le premier retry (en millisecondes)
 */
const INITIAL_RETRY_DELAY = 500;

/**
 * Nombre maximum de tentatives
 */
const MAX_RETRIES = 3;

/**
 * Calcule le délai avant le prochain retry (backoff exponentiel)
 */
function getRetryDelay(attempt: number): number {
  return INITIAL_RETRY_DELAY * Math.pow(2, attempt);
}

/**
 * Vérifie si une erreur est réessayable
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  // Vérifier le code d'erreur
  if (error.code && RETRYABLE_ERROR_CODES.includes(error.code)) {
    return true;
  }
  
  // Vérifier le message d'erreur pour PGRST002
  if (error.message && error.message.includes('schema cache')) {
    return true;
  }
  
  // Erreurs réseau (timeout, connection reset, etc.)
  if (error.message && (
    error.message.includes('timeout') ||
    error.message.includes('ECONNRESET') ||
    error.message.includes('ETIMEDOUT') ||
    error.message.includes('network')
  )) {
    return true;
  }
  
  return false;
}

/**
 * Exécute une requête Supabase avec retry automatique en cas d'erreur transitoire
 * 
 * @param queryFn - Fonction qui exécute la requête Supabase
 * @param options - Options de retry
 * @returns Le résultat de la requête
 */
export async function withRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<{ data: T | null; error: any }> {
  const maxRetries = options.maxRetries ?? MAX_RETRIES;
  const baseDelay = options.retryDelay ?? INITIAL_RETRY_DELAY;
  
  let lastError: any = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await queryFn();
      
      // Si pas d'erreur, retourner le résultat
      if (!result.error) {
        return result;
      }
      
      // Si l'erreur n'est pas réessayable, retourner immédiatement
      if (!isRetryableError(result.error)) {
        return result;
      }
      
      // Si c'est la dernière tentative, retourner l'erreur
      if (attempt === maxRetries) {
        return result;
      }
      
      // Enregistrer l'erreur pour le log
      lastError = result.error;
      
      // Calculer le délai avant le prochain retry
      const delay = attempt === 0 ? baseDelay : getRetryDelay(attempt - 1);
      
      // Logger le retry si une fonction de callback est fournie
      if (options.onRetry) {
        options.onRetry(attempt + 1, result.error);
      } else {
        console.warn(
          `[Supabase Retry] Tentative ${attempt + 1}/${maxRetries} échouée (${result.error.code || 'unknown'}). Nouvelle tentative dans ${delay}ms...`
        );
      }
      
      // Attendre avant de réessayer
      await new Promise(resolve => setTimeout(resolve, delay));
      
    } catch (error: any) {
      // Si ce n'est pas une erreur réessayable, la propager immédiatement
      if (!isRetryableError(error)) {
        throw error;
      }
      
      // Si c'est la dernière tentative, propager l'erreur
      if (attempt === maxRetries) {
        throw error;
      }
      
      lastError = error;
      
      // Calculer le délai avant le prochain retry
      const delay = attempt === 0 ? baseDelay : getRetryDelay(attempt - 1);
      
      // Logger le retry
      if (options.onRetry) {
        options.onRetry(attempt + 1, error);
      } else {
        console.warn(
          `[Supabase Retry] Tentative ${attempt + 1}/${maxRetries} échouée (exception). Nouvelle tentative dans ${delay}ms...`
        );
      }
      
      // Attendre avant de réessayer
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Ne devrait jamais arriver ici, mais au cas où
  return { data: null, error: lastError };
}

/**
 * Wrapper pour les requêtes SELECT avec retry
 */
export async function selectWithRetry<T>(
  client: SupabaseClient,
  table: string,
  query: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
  options?: {
    maxRetries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number, error: any) => void;
  }
): Promise<{ data: T | null; error: any }> {
  return withRetry(() => query(client), options);
}

/**
 * Wrapper pour les requêtes INSERT avec retry
 */
export async function insertWithRetry<T>(
  client: SupabaseClient,
  table: string,
  query: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
  options?: {
    maxRetries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number, error: any) => void;
  }
): Promise<{ data: T | null; error: any }> {
  return withRetry(() => query(client), options);
}

/**
 * Wrapper pour les requêtes UPDATE avec retry
 */
export async function updateWithRetry<T>(
  client: SupabaseClient,
  table: string,
  query: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
  options?: {
    maxRetries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number, error: any) => void;
  }
): Promise<{ data: T | null; error: any }> {
  return withRetry(() => query(client), options);
}

/**
 * Wrapper pour les requêtes DELETE avec retry
 */
export async function deleteWithRetry<T>(
  client: SupabaseClient,
  table: string,
  query: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
  options?: {
    maxRetries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number, error: any) => void;
  }
): Promise<{ data: T | null; error: any }> {
  return withRetry(() => query(client), options);
}

