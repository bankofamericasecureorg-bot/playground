import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';

export async function GET(
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
    
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Fetch user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const body = await request.json();
    const supabaseAdmin = getAdminSupabase();

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Update user error:', error);
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

    // Step 1: Delete all transactions for user's accounts
    const { data: accounts } = await supabaseAdmin
      .from('accounts')
      .select('id')
      .eq('user_id', id);

    if (accounts && accounts.length > 0) {
      const accountIds = accounts.map((a: { id: string }) => a.id);
      
      // Delete transactions for these accounts
      await supabaseAdmin
        .from('transactions')
        .delete()
        .in('account_id', accountIds);
    }

    // Step 2: Delete all credit cards for this user
    await supabaseAdmin
      .from('credit_cards')
      .delete()
      .eq('user_id', id);

    // Step 3: Delete all accounts for this user
    await supabaseAdmin
      .from('accounts')
      .delete()
      .eq('user_id', id);

    // Step 4: Delete the user profile from the users table
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (profileError) {
      console.error('Profile deletion error:', profileError);
      return NextResponse.json({ 
        error: 'Failed to delete user profile',
        details: profileError.message 
      }, { status: 500 });
    }

    // Step 5: Delete the user from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      console.error('Auth deletion error:', authError);
      // Profile already deleted, so we just warn
      return NextResponse.json({ 
        success: true, 
        warning: 'User profile deleted but Auth record may still exist',
        authError: authError.message
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User completely deleted from system'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
