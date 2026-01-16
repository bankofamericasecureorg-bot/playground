import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getServerSupabase();

    // Fetch card details
    const { data: card, error: cardError } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.id)
      .single();

    if (cardError || !card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Fetch transactions for this card (assuming card_id exists in transactions)
    // If not, we'll return an empty list for now to avoid crashes
    const { data: transactions, error: txsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('card_id', id)
      .order('date', { ascending: false });

    return NextResponse.json({
      success: true,
      data: {
        card,
        transactions: transactions || []
      }
    });
  } catch (error) {
    console.error('Fetch card details error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { is_locked } = await request.json();
    const supabase = getServerSupabase();

    const { data: card, error } = await supabase
      .from('credit_cards')
      .update({ is_locked })
      .eq('id', id)
      .eq('user_id', session.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: card });
  } catch (error) {
    console.error('Update card status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
