import { NextResponse } from 'next/server';
import { getServerSupabase, getAdminSupabase } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { onlineId, passcode } = await request.json();

    if (!onlineId || !passcode) {
      return NextResponse.json(
        { success: false, error: 'Online ID and passcode are required' },
        { status: 400 }
      );
    }

    const supabase = await getServerSupabase();
    const supabaseAdmin = getAdminSupabase();

    // 1. Find the user email by online_id using Admin client (bypasses RLS)
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('email, first_name, last_name')
      .eq('online_id', onlineId)
      .single();

    if (profileError || !userProfile) {
      // Don't reveal account existence
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 2. Sign in with Supabase Auth using the found email
    // Use the comprehensive cookies client here to ensure session is set on response
    const { data: { user, session }, error: authError } = await supabase.auth.signInWithPassword({
      email: userProfile.email,
      password: passcode
    });

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 3. Return success
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: `${userProfile.first_name} ${userProfile.last_name}`
      }
    });

  } catch (error) {
    console.error('User login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
