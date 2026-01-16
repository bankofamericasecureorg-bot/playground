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
    const { data: transfers, error } = await supabase
      .from('transfer_requests')
      .select('*')
      .eq('user_id', session.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: transfers });
  } catch (error) {
    console.error('Fetch user transfers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { from_account, to_account, amount, description } = await request.json();

    if (!from_account || !to_account || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getServerSupabase();

    // Verify user owns the "from_account"
    const { data: account, error: accError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('account_number', from_account)
      .eq('user_id', session.id)
      .single();

    if (accError || !account) {
      return NextResponse.json({ error: 'Invalid source account' }, { status: 400 });
    }

    if (Number(account.balance) < Number(amount)) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // Create transfer request
    const { data: transfer, error: transferError } = await supabase
      .from('transfer_requests')
      .insert({
        user_id: session.id,
        from_account,
        to_account,
        amount,
        description,
        status: 'pending'
      })
      .select()
      .single();

    if (transferError) throw transferError;

    return NextResponse.json({ success: true, data: transfer });
  } catch (error) {
    console.error('Create transfer request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
