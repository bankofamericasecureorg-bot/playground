import { createBrowserClient } from '@supabase/ssr';

// Create a new Supabase browser client on each call
// This avoids hydration issues from module-level initialization
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

