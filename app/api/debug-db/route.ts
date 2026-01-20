import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabaseAdmin = getAdminSupabase();

    // 1. Check if table exists by selecting
    const { data, error: selectError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (selectError) {
      return NextResponse.json({ 
        step: 'select',
        error: selectError, 
        message: selectError.message,
        details: selectError.details,
        hint: selectError.hint
      });
    }

    // 2. Check Insert permissions and columns
    const testId = '00000000-0000-0000-0000-000000000000'; // Invalid UUID? No, needs to be valid.
    // actually, let's use a random uuid if we can import it, or just a hardcoded valid-looking one.
    // Supabase auth.users usually creates the ID. But public.users ID references it.
    // If public.users.id REFERENCES auth.users.id, then we CANNOT insert into public.users unless the ID exists in auth.users!

    // This is likely the issue!
    // If the Admin User creation (Step 1) failed? No, we check for that error.
    // But if it succeeded, we have a valid ID.

    // Let's try to insert assuming NO foreign key constraint for a moment, OR realizing we can't test insert easily without creating an auth user first.
    
    // Instead of random insert, let's just inspect the error from the REAL route.
    // But I can't trigger the real route easily without browser.
    
    // Let's try to select ONE row and see its keys!
     const { data: rows, error: selectRowsError } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(1);

    if (selectRowsError) {
        return NextResponse.json({ error: selectRowsError });
    }

    const firstRow = rows?.[0];
    const columns = firstRow ? Object.keys(firstRow) : 'No rows found to inspect columns';

    // If no row found (count was 1 though?), we can't see columns.
    
    return NextResponse.json({ 
        success: true, 
        message: 'Table exists.', 
        columns: columns,
        data: rows
    });

  } catch (err: any) {
    return NextResponse.json({ 
      step: 'catch', 
      error: err.message,
      stack: err.stack 
    });
  }
}
