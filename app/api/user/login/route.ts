import { NextResponse } from 'next/server';
import { getServerSupabase, getAdminSupabase } from '@/lib/supabase/server';
import { emailService } from '@/lib/email';

// Generate a 6-digit OTP code
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    // 1. Find the user by online_id using Admin client (bypasses RLS)
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('online_id', onlineId)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 2. Validate credentials with Supabase Auth (but don't complete sign-in yet)
    // We test the password by attempting sign-in, then immediately sign out
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userProfile.email,
      password: passcode
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Sign out immediately - we'll complete login after OTP verification
    await supabase.auth.signOut();

    // 3. Generate OTP and store in database
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing unused tokens for this user
    await supabaseAdmin
      .from('login_tokens')
      .delete()
      .eq('user_id', userProfile.id)
      .eq('used', false);

    // Insert new token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('login_tokens')
      .insert({
        user_id: userProfile.id,
        email: userProfile.email,
        code: otpCode,
        expires_at: expiresAt.toISOString(),
        used: false
      })
      .select('id')
      .single();

    if (tokenError || !tokenData) {
      console.error('Failed to create login token:', tokenError);
      return NextResponse.json(
        { success: false, error: 'Failed to initiate verification' },
        { status: 500 }
      );
    }

    // 4. Send OTP email
    const userName = `${userProfile.first_name} ${userProfile.last_name}`;
    console.log('[OTP] Attempting to send email to:', userProfile.email, 'Code:', otpCode);
    
    try {
      const emailResult = await emailService.sendLoginOTPEmail(userProfile.email, otpCode, userName);
      if (emailResult.success) {
        console.log('[OTP] Email sent successfully:', emailResult.data);
      } else {
        console.error('[OTP] Email send failed:', emailResult.error);
      }
    } catch (emailError) {
      console.error('[OTP] Failed to send OTP email (exception):', emailError);
      // Continue anyway - user can request resend
    }

    // 5. Return pending verification status
    return NextResponse.json({
      success: true,
      pending_verification: true,
      session_id: tokenData.id,
      email_hint: userProfile.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
      message: 'Verification code sent to your email'
    });

  } catch (error) {
    console.error('User login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
