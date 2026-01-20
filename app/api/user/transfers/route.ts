import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getAdminSupabase();
    const { data: transfers, error } = await supabaseAdmin
      .from('transfer_requests')
      .select('*')
      .eq('user_id', session.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: transfers || [] });
  } catch (error) {
    console.error('Fetch transfers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { from_account, to_account, to_routing, amount, memo, description } = body;

    // Validate required fields (to_routing is optional)
    if (!from_account || !to_account || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseAdmin = getAdminSupabase();

    // Verify user owns the "from_account"
    const { data: account, error: accError } = await supabaseAdmin
      .from('accounts')
      .select('id, account_number, balance')
      .eq('account_number', from_account)
      .eq('user_id', session.id)
      .single();

    if (accError || !account) {
      return NextResponse.json({ error: 'Invalid source account' }, { status: 400 });
    }

    if (Number(account.balance) < Number(amount)) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // Build the transfer object with only the fields we know exist
    // Combine routing number into the description if provided
    const memoText = memo || description || '';
    const routingInfo = to_routing ? ` (Routing: ${to_routing})` : '';

    const transferData: Record<string, unknown> = {
      user_id: session.id,
      from_account,
      to_account,
      amount: Number(amount),
      status: 'pending'
    };

    // Try to include description/memo field (check which column name is used)
    // The table may use 'description' or 'memo' - we'll try 'description' as that's common
    transferData.description = memoText + routingInfo;

    // Create transfer request (pending admin approval)
    const { data: transfer, error: transferError } = await supabaseAdmin
      .from('transfer_requests')
      .insert(transferData)
      .select()
      .single();

    if (transferError) {
      console.error('Transfer insert error:', transferError);
      
      // Return more specific error message
      if (transferError.message?.includes('column')) {
        return NextResponse.json({ 
          error: 'Database schema error. Please contact support.',
          details: transferError.message 
        }, { status: 500 });
      }
      throw transferError;
    }

    return NextResponse.json({ success: true, data: transfer });
  } catch (error) {
    console.error('Create transfer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
