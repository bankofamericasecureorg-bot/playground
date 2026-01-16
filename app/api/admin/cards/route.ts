import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';
import { generateCardNumber, generateExpiryDate } from '@/lib/utils';

export async function GET() {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServerSupabase();
    const { data: cards, error } = await supabase
      .from('credit_cards')
      .select('*, user:users(first_name, last_name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: cards });
  } catch (error) {
    console.error('Fetch cards error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { user_id, card_type, credit_limit } = body;

    if (!user_id || !card_type || !credit_limit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cardNumber = generateCardNumber();
    const expiryDate = generateExpiryDate();

    const supabase = getServerSupabase();

    const { data: card, error: cardError } = await supabase
      .from('credit_cards')
      .insert({
        user_id,
        card_number: cardNumber,
        card_type,
        credit_limit: Number(credit_limit),
        available_credit: Number(credit_limit),
        expiry_date: expiryDate,
        current_balance: 0,
        rewards_points: 0,
        is_locked: false
      })
      .select('*, user:users(first_name, last_name, email)')
      .single();

    if (cardError) throw cardError;

    return NextResponse.json({ success: true, data: card });
  } catch (error) {
    console.error('Issue card error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
