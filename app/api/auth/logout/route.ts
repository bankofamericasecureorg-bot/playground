import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST() {
  await auth.signOut();
  return NextResponse.json({ success: true });
}
