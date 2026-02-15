import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';
import { generateOnlineId, generatePasscode } from '@/lib/utils';
import { emailService } from '@/lib/email';

export async function GET() {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getAdminSupabase();
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { first_name, last_name, email, phone, address, onlineId, password } = body;

    if (!first_name || !last_name || !email || !onlineId || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use provided credentials
    // const onlineId = generateOnlineId(); // Removed auto-generation
    // const passcode = password; // Map password to passcode for storage/usage
    
    // Admin client for user creation
    const supabaseAdmin = getAdminSupabase();

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: `${first_name} ${last_name}`,
        role: 'user'
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return NextResponse.json({ 
        error: authError.message || 'Failed to create user authentication',
        details: authError
      }, { status: 400 });
    }

    if (!authUser.user) {
        return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 });
    }


    // 2. Create User Profile linked by ID
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: authUser.user.id, // Critical: Link to Auth ID
        first_name,
        last_name,
        email,
        phone,
        address,
        online_id: onlineId,
        passcode: password, // Storing raw passcode for reference (demo only) - In prod use hash
      })
      .select()
      .single();

    if (userError) {
        // Rollback auth user if profile creation fails?
        // For    if (userError) {
        console.error('Profile creation error:', userError);
        return NextResponse.json({ 
          error: 'Failed to create user profile',
          details: userError,
          message: userError.message,
          code: userError.code,
          hint: userError.hint
        }, { status: 500 });
    }

    // Send Welcome Email
    await emailService.sendWelcomeEmail(
      email,
      `${first_name} ${last_name}`,
      onlineId,
      password
    );

    return NextResponse.json({ 
      success: true, 
      data: { 
        ...user, 
        raw_online_id: onlineId, 
        raw_passcode: password 
      } 
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
