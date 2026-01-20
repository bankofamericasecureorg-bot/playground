import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAdminSupabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getAdminSupabase();
    
    // Fetch user profile from the users table
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('User profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
