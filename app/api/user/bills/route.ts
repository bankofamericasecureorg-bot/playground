import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export async function GET() {
    const supabase = await getServerSupabase();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get transactions that are labeled as 'bill_payment'
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
            *,
            account:accounts(account_number, account_type)
        `)
        .eq('type', 'debit')
        .ilike('description', 'Bill Pay:%')
        .order('date', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error fetching bills:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch bills' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: transactions });
}

export async function POST(request: Request) {
    const supabase = await getServerSupabase();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { accountId, payee, amount, date } = body;

        if (!accountId || !payee || !amount) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Verify account ownership and balance
        const { data: account, error: accError } = await supabase
            .from('accounts')
            .select('balance')
            .eq('id', accountId)
            .eq('user_id', user.id)
            .single();

        if (accError || !account) {
            return NextResponse.json({ success: false, error: 'Invalid account' }, { status: 400 });
        }

        if (account.balance < amount) {
            return NextResponse.json({ success: false, error: 'Insufficient funds' }, { status: 400 });
        }

        // 2. Deduct balance
        const { error: updateError } = await supabase
            .from('accounts')
            .update({ balance: account.balance - amount })
            .eq('id', accountId);

        if (updateError) throw updateError;

        // 3. Create transaction record
        const { data: transaction, error: txError } = await supabase
            .from('transactions')
            .insert({
                account_id: accountId,
                amount: amount,
                type: 'debit',
                description: `Bill Pay: ${payee}`,
                date: new Date().toISOString(),
                status: 'posted' // Instant for demo
            })
            .select()
            .single();

        if (txError) throw txError;

        return NextResponse.json({ success: true, data: transaction });

    } catch (error) {
        console.error('Bill Pay error:', error);
        return NextResponse.json({ success: false, error: 'Payment failed' }, { status: 500 });
    }
}
