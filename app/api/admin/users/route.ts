import { NextResponse } from 'next/server';
import { getServerSupabase, getAdminSupabase } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';
import { generateOnlineId, generatePasscode } from '@/lib/utils';
import { emailService } from '@/lib/email';

export async function GET() {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await getServerSupabase();
    const { data: users, error } = await supabase
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
    const { first_name, last_name, email, phone, address } = body;

    if (!first_name || !last_name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const onlineId = generateOnlineId();
    const passcode = generatePasscode();
    
    // Admin client for user creation
    const supabaseAdmin = getAdminSupabase();

    // 1. Create Supabase Auth User
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: passcode,
      email_confirm: true,
      user_metadata: {
        name: `${first_name} ${last_name}`,
        role: 'user'
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return NextResponse.json({ error: 'Failed to create user authentication' }, { status: 400 });
    }

    if (!authUser.user) {
        return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 });
    }

    const supabase = await getServerSupabase();

    // 2. Create User Profile linked by ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id, // Critical: Link to Auth ID
        first_name,
        last_name,
        email,
        phone,
        address,
        online_id: onlineId,
        passcode: passcode, // Storing raw passcode for reference (demo only) - In prod use hash
        created_by: session.id
      })
      .select()
      .single();

    if (userError) {
        // Rollback auth user if profile creation fails?
        // For now just error out
        console.error('Profile creation error:', userError);
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
    }

    // Send Welcome Email
    await emailService.sendWelcomeEmail(
      email,
      `${first_name} ${last_name}`,
      onlineId,
      passcode
    );

    return NextResponse.json({ 
      success: true, 
      data: { 
        ...user, 
        raw_online_id: onlineId, 
        raw_passcode: passcode 
      } 
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
