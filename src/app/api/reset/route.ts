import { NextResponse } from 'next/server';
import { resetDemoData } from '@/lib/db';

export async function POST() {
  try {
    await resetDemoData();
    return NextResponse.json({ success: true, message: 'Sample dataset reset successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to reset demo data' },
      { status: 500 }
    );
  }
}
