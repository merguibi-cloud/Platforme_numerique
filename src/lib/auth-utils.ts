/**
 * Utilitaires pour la gestion de l'authentification côté client
 */

/**
 * Vérifie si une réponse API indique une session expirée (401)
 * et redirige vers la page d'accueil avec le paramètre session_expired
 */
export function handleAuthError(response: Response, router: any): boolean {
  if (response.status === 401) {
    // Vérifier si un token existe (session expirée) ou pas de token (non authentifié)
    const hasToken = typeof document !== 'undefined' && 
      document.cookie.includes('sb-access-token=');
    
    if (hasToken) {
      // Session expirée - rediriger avec le paramètre
      router.replace('/?session_expired=true');
      return true;
    } else {
      // Pas de token - simple redirection
      router.replace('/');
      return true;
    }
  }
  return false;
}

/**
 * Wrapper pour fetch qui gère automatiquement les erreurs d'authentification
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  router?: any
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  // Si on a un router et que c'est une erreur 401, rediriger
  if (router && response.status === 401) {
    handleAuthError(response, router);
  }

  return response;
}

