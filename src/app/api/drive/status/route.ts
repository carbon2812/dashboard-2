import { NextResponse } from 'next/server';
import { getDriveStatus } from '@/lib/drive';

export async function GET() {
  try {
    const status = await getDriveStatus();
    return NextResponse.json({ success: true, data: status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to check Google Drive status' },
      { status: 500 }
    );
  }
}
