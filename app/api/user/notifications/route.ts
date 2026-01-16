import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServerSupabase();
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, is_read } = await request.json();
    const supabase = getServerSupabase();

    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ is_read })
      .eq('id', id)
      .eq('user_id', session.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: notification });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
