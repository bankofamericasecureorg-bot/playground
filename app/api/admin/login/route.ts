import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = await getServerSupabase();

    // 1. Sign in with Supabase Auth
    const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !user) {
      console.error('Sign in error:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 2. Check metadata to ensure user is an admin
    // Note: The role is set in user_metadata during creation/seeding
    const role = user.user_metadata?.role;
    
    if (role !== 'admin') {
      // Sign out immediately if not authorized
      await supabase.auth.signOut();
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // 3. Return success (cookie is set automatically by @supabase/ssr)
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || 'Administrator'
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
