import { getServerSupabase } from '@/lib/supabase/server';
import { User as SupabaseAuthUser } from '@supabase/supabase-js';

// Mock user for development without Supabase
const MOCK_USER = {
  id: 'mock-user-id',
  email: 'demo@bankofamerica.com',
  role: 'user' as const,
  name: 'Demo User',
  is_admin: false
};

export const auth = {
  /**
   * Get current authenticated user session
   * Returns mock user if MOCK_AUTH=true or if Supabase is not configured
   */
  async getSession() {
    // Enable mock mode for development without Supabase
    if (process.env.MOCK_AUTH === 'true' || 
        !process.env.NEXT_PUBLIC_SUPABASE_URL || 
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('[Auth] Using mock authentication mode');
      return MOCK_USER;
    }

    try {
      const supabase = await getServerSupabase();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }

      // Enhance user object with custom metadata if needed
      return {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'user',
        name: user.user_metadata?.name || user.email?.split('@')[0],
        is_admin: user.user_metadata?.role === 'admin'
      };
    } catch (error) {
      console.error('[Auth] Supabase error:', error);
      return null;
    }
  },

  /**
   * Sign out
   */
  async signOut() {
    if (process.env.MOCK_AUTH === 'true' || 
        !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return; // No-op in mock mode
    }
    
    const supabase = await getServerSupabase();
    await supabase.auth.signOut();
  }
};
