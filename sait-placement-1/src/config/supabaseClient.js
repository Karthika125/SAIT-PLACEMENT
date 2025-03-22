import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vixnsgybrepnynbedylk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeG5zZ3licmVwbnluYmVkeWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTkzNTgsImV4cCI6MjA1ODE5NTM1OH0.upHZVBWw7WRp5WKrpxHFwk7D8Ae8_u7rMaFf0fZPDmI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
