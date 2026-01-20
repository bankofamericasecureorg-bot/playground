import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getAdminSupabase();
    
    const { data, error } = await supabaseAdmin
      .from('withdrawal_requests')
      .select('*')
      .eq('user_id', session.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch withdrawals error:', error);
      return NextResponse.json({ success: true, data: [] });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { from_account, bank_name, account_number, routing_number, amount, memo } = await request.json();

    // Validation
    if (!from_account || !bank_name || !account_number || !routing_number || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (Number(amount) <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 });
    }

    const supabaseAdmin = getAdminSupabase();

    // Verify account belongs to user and has sufficient balance
    const { data: userAccount, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('account_number', from_account)
      .eq('user_id', session.id)
      .single();

    if (accountError || !userAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (Number(userAccount.balance) < Number(amount)) {
      return NextResponse.json({ 
        error: `Insufficient funds. Available: $${userAccount.balance}` 
      }, { status: 400 });
    }

    // Create withdrawal request
    const { data: withdrawal, error: insertError } = await supabaseAdmin
      .from('withdrawal_requests')
      .insert({
        user_id: session.id,
        from_account,
        bank_name,
        account_number,
        routing_number,
        amount: Number(amount),
        memo: memo || null,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert withdrawal error:', insertError);
      return NextResponse.json({ error: 'Failed to create withdrawal request' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: withdrawal });
  } catch (error) {
    console.error('Create withdrawal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
