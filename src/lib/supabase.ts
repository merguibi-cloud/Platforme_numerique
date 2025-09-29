import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Créer un client Supabase seulement si les variables d'environnement sont disponibles
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Fonction pour vérifier si Supabase est disponible
export const isSupabaseAvailable = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}
