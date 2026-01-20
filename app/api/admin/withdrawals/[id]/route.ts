import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';
import { emailService } from '@/lib/email';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status, admin_notes } = await request.json();

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabaseAdmin = getAdminSupabase();

    // 1. Fetch the withdrawal request (try with join first, fallback to manual)
    let withdrawal: any = null;
    
    const { data: withdrawalData, error: fetchError } = await supabaseAdmin
      .from('withdrawal_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !withdrawalData) {
      console.error('Fetch withdrawal error:', fetchError);
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }
    
    withdrawal = withdrawalData;
    
    // Fetch user info separately
    if (withdrawal.user_id) {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('email, first_name, last_name')
        .eq('id', withdrawal.user_id)
        .single();
      withdrawal.user = userData;
    }

    if (withdrawal.status !== 'pending') {
      return NextResponse.json({ error: 'Withdrawal already processed' }, { status: 400 });
    }

    // 2. Handle Approval
    if (status === 'approved') {
      // Find the source account
      const { data: sourceAccount, error: sourceError } = await supabaseAdmin
        .from('accounts')
        .select('*')
        .eq('account_number', withdrawal.from_account)
        .single();

      if (sourceError || !sourceAccount) {
        return NextResponse.json({ error: 'Source account not found' }, { status: 400 });
      }

      if (Number(sourceAccount.balance) < Number(withdrawal.amount)) {
        return NextResponse.json({ 
          error: `Insufficient funds. Balance: $${sourceAccount.balance}, Request: $${withdrawal.amount}` 
        }, { status: 400 });
      }

      // Update status FIRST (transaction safety)
      const { error: statusError } = await supabaseAdmin
        .from('withdrawal_requests')
        .update({ status: 'approved' })
        .eq('id', id);

      if (statusError) {
        console.error('Failed to update withdrawal status:', statusError);
        return NextResponse.json({ error: 'Failed to update withdrawal status' }, { status: 500 });
      }

      // Deduct balance
      const { error: balanceError } = await supabaseAdmin
        .from('accounts')
        .update({ balance: Number(sourceAccount.balance) - Number(withdrawal.amount) })
        .eq('id', sourceAccount.id);

      if (balanceError) {
        console.error('Failed to update balance:', balanceError);
        // Rollback status
        await supabaseAdmin.from('withdrawal_requests').update({ status: 'pending' }).eq('id', id);
        return NextResponse.json({ error: 'Failed to deduct balance' }, { status: 500 });
      }

      // Create Debit Transaction
      await supabaseAdmin.from('transactions').insert({
        account_id: sourceAccount.id,
        type: 'debit',
        amount: withdrawal.amount,
        description: `Withdrawal to ${withdrawal.bank_name} (****${withdrawal.account_number?.slice(-4)})`,
        category: 'Withdrawal',
        date: new Date().toISOString()
      });

      // Update optional fields
      try {
        await supabaseAdmin.from('withdrawal_requests').update({
          admin_notes: admin_notes || null,
          reviewed_by: session.id,
          reviewed_at: new Date().toISOString()
        }).eq('id', id);
      } catch (e) {
        console.warn('Could not save optional fields:', e);
      }

      // Send Email
      try {
        await emailService.sendWithdrawalStatusEmail(
          withdrawal.user.email,
          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(withdrawal.amount),
          'approved',
          admin_notes
        );
      } catch (emailError) {
        console.error('Email send error:', emailError);
      }

      // Create in-app notification
      const { error: notifError } = await supabaseAdmin.from('notifications').insert({
        user_id: withdrawal.user_id,
        type: 'withdrawal_approved',
        title: 'Withdrawal Approved',
        message: `Your withdrawal of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(withdrawal.amount)} to ${withdrawal.bank_name} has been approved.${admin_notes ? ` Note: "${admin_notes}"` : ''}`,
        is_read: false
      });

      if (notifError) {
        console.error('[Notification Insert Error - Approved]', notifError.message, notifError.details, notifError.hint);
      } else {
        console.log('[Notification Insert Success - Approved] for user:', withdrawal.user_id);
      }

    } else {
      // 3. Handle Rejection
      const { error: rejectError } = await supabaseAdmin
        .from('withdrawal_requests')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (rejectError) {
        console.error('Failed to reject withdrawal:', rejectError);
        return NextResponse.json({ error: 'Failed to reject withdrawal' }, { status: 500 });
      }

      // Update optional fields
      try {
        await supabaseAdmin.from('withdrawal_requests').update({
          admin_notes: admin_notes || null,
          reviewed_by: session.id,
          reviewed_at: new Date().toISOString()
        }).eq('id', id);
      } catch (e) {
        console.warn('Could not save optional fields:', e);
      }

      // Send Email
      try {
        await emailService.sendWithdrawalStatusEmail(
          withdrawal.user.email,
          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(withdrawal.amount),
          'rejected',
          admin_notes
        );
      } catch (emailError) {
        console.error('Email send error:', emailError);
      }

      // Create in-app notification
      const { error: notifRejectError } = await supabaseAdmin.from('notifications').insert({
        user_id: withdrawal.user_id,
        type: 'withdrawal_rejected',
        title: 'Withdrawal Rejected',
        message: `Your withdrawal of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(withdrawal.amount)} to ${withdrawal.bank_name} was rejected.${admin_notes ? ` Reason: "${admin_notes}"` : ''}`,
        is_read: false
      });

      if (notifRejectError) {
        console.error('[Notification Insert Error - Rejected]', notifRejectError.message, notifRejectError.details, notifRejectError.hint);
      } else {
        console.log('[Notification Insert Success - Rejected] for user:', withdrawal.user_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Process withdrawal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
