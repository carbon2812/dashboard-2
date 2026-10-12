import { NextResponse } from 'next/server';
import { uploadReceipt, isCloudinaryConfigured } from '@/lib/cloudinary';

// Supported bill attachment formats: JPG, PNG, PDF, DOCX
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided in form data' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum 15MB limit' },
        { status: 400 }
      );
    }

    const mimeType = file.type || 'application/octet-stream';
    const isAllowed = ALLOWED_MIME_TYPES.includes(mimeType) ||
      file.name.endsWith('.docx') ||
      file.name.endsWith('.pdf') ||
      file.name.endsWith('.png') ||
      file.name.endsWith('.jpg') ||
      file.name.endsWith('.jpeg');

    if (!isAllowed) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Please upload JPG, PNG, PDF, or DOCX documents.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const attachment = await uploadReceipt(buffer, file.name, mimeType);
    const storageProvider = isCloudinaryConfigured() ? 'Cloudinary CDN' : 'Local Storage';

    return NextResponse.json({
      success: true,
      data: attachment,
      message: `Bill uploaded to ${storageProvider} successfully`,
    });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to upload bill attachment' },
      { status: 500 }
    );
  }
}
