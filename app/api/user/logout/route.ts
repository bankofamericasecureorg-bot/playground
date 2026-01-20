import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// GET handler for link-based logout
export async function GET() {
  await auth.signOut();
  return NextResponse.redirect(new URL('/user/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
}

// POST handler for programmatic logout
export async function POST() {
  await auth.signOut();
  return NextResponse.json({ success: true });
}
