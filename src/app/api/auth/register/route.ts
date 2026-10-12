import { NextResponse } from 'next/server';
import { createUser } from '@/lib/db';
import { UserRole } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, department } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Full name is required' },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const newUser = await createUser({
      name: name.trim(),
      email: email.trim(),
      password,
      role: (role as UserRole) || 'Finance Director',
      department: department?.trim() || 'Finance & Treasury',
    });

    // Generate token
    const tokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      issuedAt: Date.now(),
    };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    const response = NextResponse.json(
      {
        success: true,
        user: newUser,
        token,
        message: 'Account created successfully',
      },
      { status: 201 }
    );

    response.cookies.set('nova_auth_session', token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    const status = error?.message?.includes('already exists') ? 409 : 500;
    return NextResponse.json(
      { success: false, error: error?.message || 'Registration failed' },
      { status }
    );
  }
}
