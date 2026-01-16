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

    // Fetch accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', session.id);

    if (accountsError) throw accountsError;

    // Fetch credit cards
    const { data: cards, error: cardsError } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', session.id);

    // Fetch recent transactions (global for this user's accounts)
    // First get account IDs
    const accountIds = accounts?.map(a => a.id) || [];
    
    let recentTransactions = [];
    if (accountIds.length > 0) {
      const { data: txs, error: txsError } = await supabase
        .from('transactions')
        .select('*, account:accounts(account_type, account_number)')
        .in('account_id', accountIds)
        .order('date', { ascending: false })
        .limit(10);
      
      if (txsError) throw txsError;
      recentTransactions = txs;
    }

    const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;

    return NextResponse.json({
      success: true,
      data: {
        accounts: accounts || [],
        cards: cards || [],
        recentTransactions: recentTransactions || [],
        summary: {
          totalBalance,
          accountCount: accounts?.length || 0,
          cardCount: cards?.length || 0
        }
      }
    });
  } catch (error) {
    console.error('User dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
