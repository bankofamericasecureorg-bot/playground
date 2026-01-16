import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
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
    const { balance, account_type } = await request.json();
    
    const supabase = getServerSupabase();

    // Fetch existing account to get user email
    const { data: existingAccount, error: fetchError } = await supabase
      .from('accounts')
      .select('*, user:users(email)')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Update balance
    const { data: account, error } = await supabase
      .from('accounts')
      .update({ balance })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Send Balance Update Email
    await emailService.sendBalanceUpdateEmail(
      existingAccount.user.email,
      account_type || existingAccount.account_type,
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(balance)
    );

    return NextResponse.json({ success: true, data: account });
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
    const supabase = getServerSupabase();

    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
