import { getServerSupabase } from '@/lib/supabase/server';
import { User as SupabaseAuthUser } from '@supabase/supabase-js';

export const auth = {
  /**
   * Get current authenticated user session
   */
  async getSession() {
    const supabase = await getServerSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // Enhance user object with custom metadata if needed
    // For now, return a normalized object that resembles our previous structure
    // but backed by Supabase Auth
    return {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'user',
      name: user.user_metadata?.name || user.email?.split('@')[0],
      is_admin: user.user_metadata?.role === 'admin'
    };
  },

  /**
   * Sign out
   */
  async signOut() {
    const supabase = await getServerSupabase();
    await supabase.auth.signOut();
  }
};
