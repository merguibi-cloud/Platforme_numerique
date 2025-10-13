import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Créer un client Supabase seulement si les variables d'environnement sont disponibles
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null

// Fonction pour vérifier si Supabase est disponible
export const isSupabaseAvailable = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Fonction pour obtenir le client Supabase avec vérification (client-side)
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    throw new Error('Supabase n\'est pas configuré. Vérifiez vos variables d\'environnement.')
  }
  return supabase
}
