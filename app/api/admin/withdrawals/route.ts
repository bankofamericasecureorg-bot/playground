import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getAdminSupabase();
    
    // First try with user join
    let { data, error } = await supabaseAdmin
      .from('withdrawal_requests')
      .select('*, user:users(first_name, last_name, email)')
      .order('created_at', { ascending: false });

    // If join fails, try without join
    if (error) {
      console.error('Fetch withdrawals with join error:', error);
      const result = await supabaseAdmin
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (result.error) {
        console.error('Fetch withdrawals error:', result.error);
        return NextResponse.json({ success: false, error: result.error.message, data: [] });
      }
      
      // Manually fetch user info
      const withdrawals = result.data || [];
      const enrichedData = await Promise.all(withdrawals.map(async (w: any) => {
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', w.user_id)
          .single();
        return { ...w, user: userData };
      }));
      
      return NextResponse.json({ success: true, data: enrichedData });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Get admin withdrawals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

