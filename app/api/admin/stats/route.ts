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

    // Fetch total users
    const { count: totalUsers, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Fetch total balance across all accounts
    const { data: accounts, error: accountError } = await supabase
      .from('accounts')
      .select('balance');

    const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;

    // Fetch pending transfers
    const { count: pendingTransfers, error: transferError } = await supabase
      .from('transfer_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Fetch recent transactions
    const { data: recentTransactions, error: transactionError } = await supabase
      .from('transactions')
      .select('*, account:accounts(account_number, user:users(first_name, last_name))')
      .order('date', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers: totalUsers || 0,
          totalBalance: totalBalance,
          pendingTransfers: pendingTransfers || 0,
        },
        recentTransactions: recentTransactions || []
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
