import { NextResponse } from 'next/server';
import { getServerSupabase, getAdminSupabase } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { session_id, code } = await request.json();

    if (!session_id || !code) {
      return NextResponse.json(
        { success: false, error: 'Session ID and code are required' },
        { status: 400 }
      );
    }

    const supabase = await getServerSupabase();
    const supabaseAdmin = getAdminSupabase();

    // 1. Find the login token
    const { data: token, error: tokenError } = await supabaseAdmin
      .from('login_tokens')
      .select('*')
      .eq('id', session_id)
      .single();

    if (tokenError || !token) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // 2. Check if token is already used
    if (token.used) {
      return NextResponse.json(
        { success: false, error: 'This code has already been used' },
        { status: 401 }
      );
    }

    // 3. Check if token is expired
    if (new Date(token.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Verification code has expired. Please login again.' },
        { status: 401 }
      );
    }

    // 4. Verify the code
    if (token.code !== code) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 401 }
      );
    }

    // 5. Mark token as used
    await supabaseAdmin
      .from('login_tokens')
      .update({ used: true })
      .eq('id', session_id);

    // 6. Get user details for the session
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, passcode')
      .eq('id', token.user_id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // 7. Complete the actual login with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userProfile.email,
      password: userProfile.passcode
    });

    if (authError || !authData.user) {
      console.error('Auth completion error:', authError);
      return NextResponse.json(
        { success: false, error: 'Failed to complete login' },
        { status: 500 }
      );
    }

    // 8. Return success with user data
    return NextResponse.json({
      success: true,
      data: {
        id: authData.user.id,
        email: authData.user.email,
        name: `${userProfile.first_name} ${userProfile.last_name}`
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
