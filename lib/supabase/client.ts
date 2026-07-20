import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars')
}

// Browser client that persists the session in cookies so that
// server-side middleware and SSR can read the same session.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
