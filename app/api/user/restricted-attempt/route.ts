import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, amount, details } = await request.json();

    if (!type || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['withdrawal', 'transfer'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const supabaseAdmin = getAdminSupabase();

    const { error } = await supabaseAdmin.from('restricted_attempts').insert({
      user_id: session.id,
      type,
      amount,
      details: details || null
    });

    if (error) {
      console.error('Failed to log restricted attempt:', error);
      return NextResponse.json({ error: 'Failed to log attempt' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Restricted attempt API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
