import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from './env'

const supabaseUrl = SUPABASE_CONFIG.url
const supabaseAnonKey = SUPABASE_CONFIG.anonKey

console.log('Supabase config:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing config:', { supabaseUrl, supabaseAnonKey })
  throw new Error('Missing Supabase configuration')
}

let supabase

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  })
} catch (error) {
  console.error('Supabase initialization error:', error)
  console.error('URL used:', supabaseUrl)
  throw error
}

export { supabase }
