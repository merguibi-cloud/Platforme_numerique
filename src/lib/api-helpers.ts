import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

/**
 * Résultat de l'authentification
 */
export type AuthResult = 
  | { user: User }
  | { error: NextResponse };

/**
 * Récupère l'utilisateur authentifié depuis le token dans les cookies
 * 
 * @param request - La requête Next.js
 * @returns L'utilisateur authentifié ou une erreur NextResponse
 * 
 * @example
 * ```typescript
 * const authResult = await getAuthenticatedUser(request);
 * if ('error' in authResult) {
 *   return authResult.error;
 * }
 * const { user } = authResult;
 * ```
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return {
        error: NextResponse.json(
          { success: false, error: 'Non authentifié' },
          { status: 401 }
        ),
      };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        error: NextResponse.json(
          { success: false, error: 'Configuration serveur invalide' },
          { status: 500 }
        ),
      };
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser(accessToken);

    if (authError || !user) {
      return {
        error: NextResponse.json(
          { success: false, error: 'Non authentifié' },
          { status: 401 }
        ),
      };
    }

    return { user };
  } catch (error) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Erreur lors de l\'authentification' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Exige un utilisateur authentifié, retourne une erreur 401 sinon
 * 
 * Alias de getAuthenticatedUser() pour plus de clarté sémantique
 * 
 * @param request - La requête Next.js
 * @returns L'utilisateur authentifié ou une erreur NextResponse
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthResult> {
  return getAuthenticatedUser(request);
}

