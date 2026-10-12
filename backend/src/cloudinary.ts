import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { ExpenseAttachment, CloudinaryStatus } from './types';

export function getCloudinaryCredentials() {
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'rgukte0l';
  let apiKey = process.env.CLOUDINARY_API_KEY || '773645529246291';
  let apiSecret = process.env.CLOUDINARY_API_SECRET || '';

  if ((!apiSecret || apiSecret === 'your_api_secret_here' || apiSecret === '<your_api_secret>') && process.env.CLOUDINARY_URL) {
    try {
      const match = process.env.CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
      if (match) {
        apiKey = match[1];
        apiSecret = match[2];
        cloudName = match[3];
      }
    } catch {}
  }

  return { cloudName, apiKey, apiSecret };
}

// Initial Cloudinary Configuration
const initCreds = getCloudinaryCredentials();
cloudinary.config({
  cloud_name: initCreds.cloudName,
  api_key: initCreds.apiKey,
  api_secret: initCreds.apiSecret,
  secure: true,
});

export function isCloudinaryConfigured(): boolean {
  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();
  return Boolean(
    cloudName &&
    apiKey &&
    apiSecret &&
    apiSecret !== '<your_api_secret>' &&
    apiSecret !== 'your_api_secret_here'
  );
}

export function getCloudinaryStatus(): CloudinaryStatus {
  const { cloudName, apiKey } = getCloudinaryCredentials();
  const configured = isCloudinaryConfigured();
  return {
    connected: configured,
    cloudName,
    apiKey: apiKey ? '••••••••' + apiKey.slice(-4) : '7736...6291',
    message: configured
      ? 'Live Cloudinary media storage is connected and active.'
      : 'Cloudinary cloud credentials active (Add CLOUDINARY_API_SECRET in .env to activate live CDN uploads).',
  };
}

/**
 * Uploads an expense bill/receipt. Uses live Cloudinary if configured,
 * otherwise saves locally so testing works without failure.
 */
export async function uploadReceipt(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  folder: string = 'expense-tracker/receipts'
): Promise<ExpenseAttachment> {
  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(buffer, fileName, mimeType, folder);
  }

  // Graceful local fallback if Cloudinary API Secret is pending
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const cleanName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const localFilePath = path.join(uploadsDir, cleanName);
    fs.writeFileSync(localFilePath, buffer);

    const localUrl = `/uploads/${cleanName}`;
    const isImage = mimeType.startsWith('image/');

    return {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: fileName,
      mimeType,
      size: buffer.length,
      cloudinaryUrl: localUrl,
      driveViewLink: localUrl,
      driveDownloadLink: localUrl,
      thumbnailUrl: isImage ? localUrl : undefined,
      localUrl,
    };
  } catch {
    // In-memory base64 fallback for serverless environments
    const base64 = `data:${mimeType};base64,${buffer.toString('base64')}`;
    return {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: fileName,
      mimeType,
      size: buffer.length,
      cloudinaryUrl: base64,
      driveViewLink: base64,
      driveDownloadLink: base64,
      thumbnailUrl: mimeType.startsWith('image/') ? base64 : undefined,
      localUrl: base64,
    };
  }
}

/**
 * Uploads a file buffer directly to Cloudinary
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  folder: string = 'expense-tracker/receipts'
): Promise<ExpenseAttachment> {
  const creds = getCloudinaryCredentials();
  cloudinary.config({
    cloud_name: creds.cloudName,
    api_key: creds.apiKey,
    api_secret: creds.apiSecret,
    secure: true,
  });

  const isImage = mimeType.startsWith('image/');
  const resourceType = isImage ? 'image' : 'raw';

  // Sanitized public_id filename
  const cleanBaseName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const publicId = `${folder}/${Date.now()}_${cleanBaseName}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${Date.now()}_${cleanBaseName}`,
        resource_type: resourceType,
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          console.error('Cloudinary upload error:', error);
          return reject(error || new Error('Cloudinary upload failed'));
        }

        // Generate auto-optimized URL
        const optimizedUrl = isImage
          ? cloudinary.url(result.public_id, {
              fetch_format: 'auto',
              quality: 'auto',
              secure: true,
            })
          : result.secure_url;

        // Generate thumbnail preview URL
        const thumbnailUrl = isImage
          ? cloudinary.url(result.public_id, {
              width: 400,
              height: 400,
              crop: 'fill',
              gravity: 'auto',
              fetch_format: 'auto',
              quality: 'auto',
              secure: true,
            })
          : undefined;

        const attachment: ExpenseAttachment = {
          id: `att_${result.asset_id || Date.now()}`,
          name: fileName,
          mimeType,
          size: result.bytes || buffer.length,
          cloudinaryPublicId: result.public_id,
          cloudinaryUrl: optimizedUrl,
          // Map to driveViewLink and driveDownloadLink so all existing UI modals work seamlessly!
          driveViewLink: optimizedUrl,
          driveDownloadLink: result.secure_url,
          thumbnailUrl,
          localUrl: optimizedUrl,
        };

        resolve(attachment);
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Deletes an uploaded asset from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === 'ok';
  } catch (err) {
    console.error('Failed to delete asset from Cloudinary:', err);
    return false;
  }
}
