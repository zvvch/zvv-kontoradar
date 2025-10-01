import { createClient } from '@supabase/supabase-js'
import { mockSupabase } from './mock-data'

// Check if we have Supabase configuration
const hasSupabaseConfig = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Prüfe ob die URL localhost:8000 ist (nicht erreichbar)
const isLocalSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost:8000')

// Create supabase client
let supabaseClient: any

if (!hasSupabaseConfig || isLocalSupabase) {
  console.log('🚀 Running with mock data - no Supabase connection available')
  supabaseClient = mockSupabase
} else {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = supabaseClient
