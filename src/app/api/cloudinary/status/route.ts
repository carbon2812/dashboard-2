import { NextResponse } from 'next/server';
import { getCloudinaryStatus } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = getCloudinaryStatus();
    return NextResponse.json({ success: true, data: status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to check Cloudinary status' },
      { status: 500 }
    );
  }
}
