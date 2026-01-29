/**
 * Utilitaires pour la gestion de l'authentification côté client
 */

// Mutex for concurrent refresh requests
let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempts to refresh the session
 * Uses a mutex to prevent concurrent refresh calls
 */
async function tryRefreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  })
    .then(res => res.ok)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/**
 * Vérifie si une réponse API indique une session expirée (401)
 * et redirige vers la page d'accueil avec le paramètre session_expired
 */
export function handleAuthError(response: Response, router: any): boolean {
  if (response.status === 401) {
    // Session expirée - rediriger avec le paramètre
    router.replace('/?session_expired=true');
    return true;
  }
  return false;
}

/**
 * Wrapper pour fetch qui gère automatiquement les erreurs d'authentification
 * avec retry après refresh du token
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  router?: any
): Promise<Response> {
  let response = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  // If 401, try to refresh and retry once
  if (response.status === 401) {
    const refreshed = await tryRefreshSession();

    if (refreshed) {
      // Retry the original request with new cookies
      response = await fetch(url, {
        ...options,
        credentials: 'include',
      });
    }

    // If still 401 after refresh attempt, redirect
    if (response.status === 401 && router) {
      handleAuthError(response, router);
    }
  }

  return response;
}
