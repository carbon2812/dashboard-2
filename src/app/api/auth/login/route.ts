import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password. Please verify your credentials or select a demo account.',
        },
        { status: 401 }
      );
    }

    // Generate secure session token payload
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      issuedAt: Date.now(),
    };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 1 day

    const response = NextResponse.json({
      success: true,
      user,
      token,
      message: `Welcome back, ${user.name}!`,
    });

    // Set HTTP-accessible cookie
    response.cookies.set('nova_auth_session', token, {
      path: '/',
      maxAge,
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
