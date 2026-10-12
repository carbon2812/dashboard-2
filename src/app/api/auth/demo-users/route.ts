import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/db';

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch demo users' },
      { status: 500 }
    );
  }
}
