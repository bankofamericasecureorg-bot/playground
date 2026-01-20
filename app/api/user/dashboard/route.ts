import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAdminSupabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client to bypass RLS while still filtering by user_id for security
    const supabaseAdmin = getAdminSupabase();

    // Fetch accounts for this specific user
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('user_id', session.id)
      .order('created_at', { ascending: false });

    if (accountsError) {
      console.error('Accounts fetch error:', accountsError);
      throw accountsError;
    }

    // Fetch credit cards for this specific user
    const { data: cards, error: cardsError } = await supabaseAdmin
      .from('credit_cards')
      .select('*')
      .eq('user_id', session.id)
      .order('created_at', { ascending: false });

    if (cardsError) {
      console.error('Cards fetch error:', cardsError);
    }

    // Fetch recent transactions for user's accounts
    const accountIds = accounts?.map((a: { id: string }) => a.id) || [];
    
    let recentTransactions: any[] = [];
    if (accountIds.length > 0) {
      const { data: txs, error: txsError } = await supabaseAdmin
        .from('transactions')
        .select('*, account:accounts(account_type, account_number)')
        .in('account_id', accountIds)
        .order('date', { ascending: false })
        .limit(10);
      
      if (txsError) {
        console.error('Transactions fetch error:', txsError);
      } else {
        recentTransactions = txs || [];
      }
    }

    const totalBalance = accounts?.reduce((sum: number, acc: { balance: number }) => sum + Number(acc.balance), 0) || 0;

    return NextResponse.json({
      success: true,
      data: {
        accounts: accounts || [],
        cards: cards || [],
        recentTransactions: recentTransactions,
        summary: {
          totalBalance,
          accountCount: accounts?.length || 0,
          cardCount: cards?.length || 0
        }
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('User dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
