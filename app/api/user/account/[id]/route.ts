import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabaseAdmin = getAdminSupabase();

    // Fetch account details - must belong to this user
    const { data: account, error: accError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.id)
      .single();

    if (accError || !account) {
      console.error('Account fetch error:', accError);
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Fetch transactions for this account
    const { data: transactions, error: txsError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('account_id', id)
      .order('date', { ascending: false })
      .limit(50);

    if (txsError) {
      console.error('Transactions fetch error:', txsError);
    }

    return NextResponse.json({
      success: true,
      data: {
        account,
        transactions: transactions || []
      }
    });
  } catch (error) {
    console.error('Fetch account details error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
