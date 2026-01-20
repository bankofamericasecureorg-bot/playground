import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';
import { generateAccountNumber, generateRoutingNumber } from '@/lib/utils';
import { emailService } from '@/lib/email';

export async function GET() {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getAdminSupabase();
    const { data: accounts, error } = await supabaseAdmin
      .from('accounts')
      .select('*, user:users(first_name, last_name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: accounts });
  } catch (error) {
    console.error('Fetch accounts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { user_id, account_type, initial_balance } = body;

    if (!user_id || !account_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const accountNumber = generateAccountNumber();
    const routingNumber = generateRoutingNumber();

    const supabaseAdmin = getAdminSupabase();

    // Create account
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .insert({
        user_id,
        account_type,
        account_number: accountNumber,
        routing_number: routingNumber,
        balance: initial_balance || 0
      })
      .select('*, user:users(first_name, last_name, email)')
      .single();

    if (accountError) throw accountError;

    // Send Balance Update Email (as a proxy for account creation notice)
    await emailService.sendBalanceUpdateEmail(
      account.user.email,
      account_type === 'checking' ? 'Checking' : 'Savings',
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(initial_balance || 0)
    );

    return NextResponse.json({ success: true, data: account });
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
