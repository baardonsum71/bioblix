import { apiUrl } from '@/lib/apiBase';

type PresignResponse = {
  uploadUrl: string;
  publicUrl: string;
  key: string;
};

export type MediaUploadKind = 'post' | 'avatar';

/**
 * Upload a local URI to Cloudflare R2 via presigned PUT.
 * Requires Vercel env R2_* + CLERK_SECRET_KEY; client sends Clerk Bearer token.
 */
export async function uploadToR2(params: {
  getClerkToken: () => Promise<string | null>;
  uri: string;
  contentType: string;
  kind: MediaUploadKind;
  extension?: string;
}): Promise<string> {
  const clerkJwt = await params.getClerkToken();
  if (!clerkJwt) {
    throw new Error('Mangler Clerk-sesjonstoken for opplasting');
  }

  const presignRes = await fetch(apiUrl('/api/r2-presign'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${clerkJwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      kind: params.kind,
      contentType: params.contentType,
      extension: params.extension,
    }),
  });

  if (presignRes.status === 503) {
    throw new Error('R2_NOT_CONFIGURED');
  }

  if (!presignRes.ok) {
    const raw = await presignRes.text();
    let message = `R2-presign feilet (${presignRes.status})`;
    try {
      const body = JSON.parse(raw) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      if (raw.trim()) message = `${message}: ${raw.slice(0, 160)}`;
    }
    throw new Error(message);
  }

  const signed = (await presignRes.json()) as PresignResponse;
  if (!signed.uploadUrl || !signed.publicUrl) {
    throw new Error('Ugyldig R2-presign-svar');
  }

  const fileRes = await fetch(params.uri);
  if (!fileRes.ok) {
    throw new Error(`Kunne ikke lese mediafil (${fileRes.status})`);
  }
  const blob = await fileRes.blob();
  if (!blob.size) {
    throw new Error('Mediafilen er tom — velg på nytt.');
  }

  const putRes = await fetch(signed.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': params.contentType,
    },
    body: blob,
  });

  if (!putRes.ok) {
    throw new Error(`R2-opplasting feilet (${putRes.status})`);
  }

  return signed.publicUrl;
}
