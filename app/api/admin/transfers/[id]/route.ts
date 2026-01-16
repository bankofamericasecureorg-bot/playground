import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
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

    const supabase = getServerSupabase();

    // 1. Fetch the transfer request
    const { data: transfer, error: fetchError } = await supabase
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
      // Find the source account to decrement balance
      const { data: sourceAccount, error: sourceError } = await supabase
        .from('accounts')
        .select('*')
        .eq('account_number', transfer.from_account)
        .single();

      if (sourceError || !sourceAccount) {
        return NextResponse.json({ error: 'Source account not found or internal error' }, { status: 400 });
      }

      if (Number(sourceAccount.balance) < Number(transfer.amount)) {
        return NextResponse.json({ error: 'Insufficient funds in source account' }, { status: 400 });
      }

      // Perform updates in a flat manner (Supabase doesn't support complex client-side transactions easily, so we do it step by step)
      
      // Update Source Account
      const { error: updSourceErr } = await supabase
        .from('accounts')
        .update({ balance: Number(sourceAccount.balance) - Number(transfer.amount) })
        .eq('id', sourceAccount.id);

      if (updSourceErr) throw updSourceErr;

      // Create Debit Transaction
      await supabase.from('transactions').insert({
        account_id: sourceAccount.id,
        type: 'debit',
        amount: transfer.amount,
        description: `External Transfer to ${transfer.to_account}`,
        category: 'Transfer',
        created_by: session.id
      });

      // Update Transfer Status
      await supabase.from('transfer_requests').update({
        status: 'approved',
        reviewed_by: session.id,
        reviewed_at: new Date().toISOString(),
        admin_notes
      }).eq('id', id);

      // Send Success Email
      await emailService.sendTransferStatusEmail(
        transfer.user.email,
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(transfer.amount),
        'approved',
        admin_notes
      );

    } else {
      // 3. Handle Rejection
      await supabase.from('transfer_requests').update({
        status: 'rejected',
        reviewed_by: session.id,
        reviewed_at: new Date().toISOString(),
        admin_notes
      }).eq('id', id);

      // Send Rejection Email
      await emailService.sendTransferStatusEmail(
        transfer.user.email,
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(transfer.amount),
        'rejected',
        admin_notes
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Process transfer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
