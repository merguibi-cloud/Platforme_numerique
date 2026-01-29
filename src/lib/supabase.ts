import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Créer un client Supabase seulement si les variables d'environnement sont disponibles
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Server handles session via cookies
      autoRefreshToken: false, // Server handles refresh via /api/auth/refresh
      detectSessionInUrl: false,
    }
  })
  : null


// Fonction pour vérifier si Supabase est disponible
export const isSupabaseAvailable = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabase)
}

// Fonction pour obtenir le client Supabase dédié à l'authentification
export const getAuth = (): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variables d\'environnement Supabase manquantes pour l\'authentification')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Pas besoin de persistance côté serveur
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
}

// Fonction pour obtenir le client Supabase côté serveur (bypass RLS)
export const getSupabaseServerClient = (): SupabaseClient => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variables d\'environnement Supabase manquantes pour le serveur')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Fonction pour obtenir le client Supabase côté client (lecture seule)
export const getSupabaseClient = (): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variables d\'environnement Supabase manquantes pour le client')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Server handles session via cookies
      autoRefreshToken: false, // Server handles refresh via /api/auth/refresh
      detectSessionInUrl: false,
    }
  })
}




// Exporter les utilitaires de retry
export {
  withRetry,
  selectWithRetry,
  insertWithRetry,
  updateWithRetry,
  deleteWithRetry
} from './supabase-retry';