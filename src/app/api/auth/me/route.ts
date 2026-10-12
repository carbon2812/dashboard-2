import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserById, getUserByEmail } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Check cookie fallback
    if (!token) {
      const cookieStore = cookies();
      token = cookieStore.get('nova_auth_session')?.value;
    }

    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    // Decode token
    try {
      const decodedStr = Buffer.from(token, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedStr);

      let user = await getUserById(payload.userId);
      if (!user && payload.email) {
        const stored = await getUserByEmail(payload.email);
        if (stored) {
          const { passwordHash: _h, ...clean } = stored;
          user = clean;
        }
      }

      if (!user) {
        return NextResponse.json({ success: false, user: null }, { status: 401 });
      }

      return NextResponse.json({ success: true, user });
    } catch {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Session verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify session', user: null },
      { status: 500 }
    );
  }
}
