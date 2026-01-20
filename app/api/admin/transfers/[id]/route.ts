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

    // 1. Fetch the transfer request
    const { data: transfer, error: fetchError } = await supabaseAdmin
      .from('transfer_requests')
      .select('*, user:users(email, first_name, last_name)')
      .eq('id', id)
      .single();

    if (fetchError || !transfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    if (transfer.status !== 'pending') {
      return NextResponse.json({ error: 'Transfer already processed' }, { status: 400 });
    }

    // 2. Handle Approval
    if (status === 'approved') {
      // Find the source account to check balance first
      const { data: sourceAccount, error: sourceError } = await supabaseAdmin
        .from('accounts')
        .select('*')
        .eq('account_number', transfer.from_account)
        .single();

      if (sourceError || !sourceAccount) {
        return NextResponse.json({ error: 'Source account not found' }, { status: 400 });
      }

      if (Number(sourceAccount.balance) < Number(transfer.amount)) {
        return NextResponse.json({ 
          error: `Insufficient funds. Balance: $${sourceAccount.balance}, Request: $${transfer.amount}` 
        }, { status: 400 });
      }

      // *** CRITICAL FIX: Update status FIRST before touching balance ***
      // Use only guaranteed columns (status) first, then try extended columns
      const { error: statusError } = await supabaseAdmin
        .from('transfer_requests')
        .update({ status: 'approved' })
        .eq('id', id);

      if (statusError) {
        console.error('Failed to update transfer status:', statusError);
        return NextResponse.json({ error: 'Failed to update transfer status' }, { status: 500 });
      }

      // Now deduct balance (status is already saved, so we won't double-deduct)
      const { error: updSourceErr } = await supabaseAdmin
        .from('accounts')
        .update({ balance: Number(sourceAccount.balance) - Number(transfer.amount) })
        .eq('id', sourceAccount.id);

      if (updSourceErr) {
        console.error('Failed to update balance:', updSourceErr);
        // Rollback status
        await supabaseAdmin.from('transfer_requests').update({ status: 'pending' }).eq('id', id);
        return NextResponse.json({ error: 'Failed to deduct balance' }, { status: 500 });
      }

      // Create Debit Transaction
      const { error: txnError } = await supabaseAdmin.from('transactions').insert({
        account_id: sourceAccount.id,
        type: 'debit',
        amount: transfer.amount,
        description: `External Transfer to ${transfer.to_account}`,
        category: 'Transfer',
        date: new Date().toISOString()
      });

      if (txnError) {
        console.error('Failed to create transaction record:', txnError);
        // Non-critical - balance already deducted, log but don't fail
      }

      // Try to update optional fields (admin_notes, reviewed_by, reviewed_at)
      // This is non-critical and should not cause failure
      try {
        await supabaseAdmin.from('transfer_requests').update({
          admin_notes: admin_notes || null,
          reviewed_by: session.id,
          reviewed_at: new Date().toISOString()
        }).eq('id', id);
      } catch (optionalError) {
        console.warn('Could not save optional fields (admin_notes, reviewed_by):', optionalError);
      }

      try {
        await emailService.sendTransferStatusEmail(
          transfer.user.email,
          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(transfer.amount),
          'approved',
          admin_notes
        );
      } catch (emailError) {
        console.error('Email send error:', emailError);
      }

      // Create in-app notification
      const { error: notifError } = await supabaseAdmin.from('notifications').insert({
        user_id: transfer.user_id,
        type: 'transfer_approved',
        title: 'Transfer Approved',
        message: `Your transfer of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(transfer.amount)} has been approved.${admin_notes ? ` Note: "${admin_notes}"` : ''}`,
        is_read: false
      });

      if (notifError) {
        console.error('[Notification Insert Error - Transfer Approved]', notifError.message, notifError.details, notifError.hint);
      } else {
        console.log('[Notification Insert Success - Transfer Approved] for user:', transfer.user_id);
      }

    } else {
      // 3. Handle Rejection - simpler, just update status
      const { error: rejectError } = await supabaseAdmin
        .from('transfer_requests')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (rejectError) {
        console.error('Failed to reject transfer:', rejectError);
        return NextResponse.json({ error: 'Failed to reject transfer' }, { status: 500 });
      }

      // Try to update optional fields
      try {
        await supabaseAdmin.from('transfer_requests').update({
          admin_notes: admin_notes || null,
          reviewed_by: session.id,
          reviewed_at: new Date().toISOString()
        }).eq('id', id);
      } catch (optionalError) {
        console.warn('Could not save optional fields:', optionalError);
      }

      try {
        await emailService.sendTransferStatusEmail(
          transfer.user.email,
          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(transfer.amount),
          'rejected',
          admin_notes
        );
      } catch (emailError) {
        console.error('Email send error:', emailError);
      }

      // Create in-app notification
      const { error: notifRejectError } = await supabaseAdmin.from('notifications').insert({
        user_id: transfer.user_id,
        type: 'transfer_rejected',
        title: 'Transfer Rejected',
        message: `Your transfer of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(transfer.amount)} was rejected.${admin_notes ? ` Reason: "${admin_notes}"` : ''}`,
        is_read: false
      });

      if (notifRejectError) {
        console.error('[Notification Insert Error - Transfer Rejected]', notifRejectError.message, notifRejectError.details, notifRejectError.hint);
      } else {
        console.log('[Notification Insert Success - Transfer Rejected] for user:', transfer.user_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Process transfer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
