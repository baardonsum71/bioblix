import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export type R2PresignInput = {
  key: string;
  contentType: string;
};

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID?.trim() &&
      process.env.R2_ACCESS_KEY_ID?.trim() &&
      process.env.R2_SECRET_ACCESS_KEY?.trim() &&
      process.env.R2_BUCKET_NAME?.trim() &&
      process.env.R2_PUBLIC_BASE_URL?.trim()
  );
}

function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID!.trim();
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!.trim(),
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!.trim(),
    },
  });
}

export function publicUrlForKey(key: string): string {
  const base = process.env.R2_PUBLIC_BASE_URL!.trim().replace(/\/$/, '');
  return `${base}/${key.replace(/^\//, '')}`;
}

/** Presigned PUT so the browser/app can upload directly to R2. */
export async function createR2PresignedPut(
  input: R2PresignInput
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  if (!isR2Configured()) {
    throw new Error('R2 is not configured');
  }

  const key = input.key.replace(/^\//, '');
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!.trim(),
    Key: key,
    ContentType: input.contentType,
  });

  const uploadUrl = await getSignedUrl(getR2Client(), command, {
    expiresIn: 60 * 5,
  });

  return {
    uploadUrl,
    publicUrl: publicUrlForKey(key),
    key,
  };
}
