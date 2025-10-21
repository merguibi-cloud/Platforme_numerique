import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Créer un client Supabase seulement si les variables d'environnement sont disponibles
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'sb-auth-token'
      }
    })
  : null

// Fonction pour vérifier si Supabase est disponible
export const isSupabaseAvailable = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabase)
}

// Fonction pour obtenir le client Supabase avec vérification (client-side)
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    throw new Error('Supabase n\'est pas configuré. Vérifiez vos variables d\'environnement.')
  }
  return supabase
}

// Fonction pour synchroniser la session avec les cookies
export const syncSessionWithCookies = async () => {
  if (!supabase || typeof window === 'undefined') return;

  try {
    // Récupérer les cookies
    const accessToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('sb-access-token='))
      ?.split('=')[1];

    const refreshToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('sb-refresh-token='))
      ?.split('=')[1];

    if (accessToken && refreshToken) {
      // Définir la session dans Supabase
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
    }
  } catch (error) {
    // Erreur silencieuse pour éviter l'exposition d'informations
  }
};
