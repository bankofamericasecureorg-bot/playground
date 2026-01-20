import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';
import { emailService } from '@/lib/email';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { balance, account_type, reason } = await request.json();
    
    // Validate balance
    if (balance === undefined || balance === null || isNaN(Number(balance))) {
      return NextResponse.json({ error: 'Invalid balance value' }, { status: 400 });
    }

    if (Number(balance) < 0) {
      return NextResponse.json({ error: 'Balance cannot be negative' }, { status: 400 });
    }

    const supabaseAdmin = getAdminSupabase();

    // Fetch existing account to get user email and current balance
    const { data: existingAccount, error: fetchError } = await supabaseAdmin
      .from('accounts')
      .select('*, user:users(email, first_name, last_name)')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Fetch account error:', fetchError);
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const oldBalance = existingAccount.balance;
    const newBalance = Number(balance);
    const difference = newBalance - oldBalance;

    // Update balance
    const { data: account, error } = await supabaseAdmin
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', id)
      .select('*, user:users(first_name, last_name, email)')
      .single();

    if (error) {
      console.error('Update balance error:', error);
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
    }

    // Create audit transaction record
    if (difference !== 0) {
      const transactionType = difference > 0 ? 'credit' : 'debit';
      const { error: txError } = await supabaseAdmin
        .from('transactions')
        .insert({
          account_id: id,
          amount: Math.abs(difference),
          type: transactionType,
          description: reason || `Admin balance adjustment`,
          category: 'Admin Adjustment',
          date: new Date().toISOString()
        });

      if (txError) {
        console.error('Transaction record error:', txError);
        // Don't fail the request, just log
      }
    }

    // Send Balance Update Email
    try {
      await emailService.sendBalanceUpdateEmail(
        existingAccount.user.email,
        account_type || existingAccount.account_type,
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(newBalance)
      );
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Don't fail the request for email errors
    }

    return NextResponse.json({ 
      success: true, 
      data: account,
      adjustment: {
        previous: oldBalance,
        new: newBalance,
        difference: difference
      }
    });
  } catch (error) {
    console.error('Update account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabaseAdmin = getAdminSupabase();

    // First delete all transactions for this account
    await supabaseAdmin
      .from('transactions')
      .delete()
      .eq('account_id', id);

    // Then delete the account
    const { error } = await supabaseAdmin
      .from('accounts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete account error:', error);
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
