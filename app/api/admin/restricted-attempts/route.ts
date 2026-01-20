import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getAdminSupabase();

    // Fetch all restricted attempts with user information
    const { data: attempts, error } = await supabaseAdmin
      .from('restricted_attempts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching restricted attempts:', error);
      return NextResponse.json({ error: 'Failed to fetch restricted attempts' }, { status: 500 });
    }

    // Get user information for each attempt
    const userIds = [...new Set(attempts.map((a: any) => a.user_id))];
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, email')
      .in('id', userIds);

    // Map users to attempts
    const userMap = new Map(users?.map((u: any) => [u.id, u]) || []);
    const attemptsWithUsers = attempts.map((a: any) => ({
      ...a,
      user: userMap.get(a.user_id) || null
    }));

    return NextResponse.json({ success: true, data: attemptsWithUsers });
  } catch (error) {
    console.error('Restricted attempts API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
