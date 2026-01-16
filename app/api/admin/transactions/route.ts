import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServerSupabase();
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*, account:accounts(account_number, user:users(first_name, last_name, email))')
      .order('date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Fetch global transactions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
