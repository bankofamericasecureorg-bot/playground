import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
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
    const supabase = getServerSupabase();

    // Fetch account details
    const { data: account, error: accError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.id)
      .single();

    if (accError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Fetch transactions for this account
    const { data: transactions, error: txsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('account_id', id)
      .order('date', { ascending: false });

    if (txsError) throw txsError;

    return NextResponse.json({
      success: true,
      data: {
        account,
        transactions
      }
    });
  } catch (error) {
    console.error('Fetch account details error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
