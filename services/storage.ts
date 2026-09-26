import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

import type { MediaType } from '@/types';
import { storage } from '@/lib/firebase';
import { uploadToR2 } from '@/services/r2Upload';

function extensionFor(mediaType: MediaType, mimeType?: string): string {
  if (mimeType?.includes('png')) return 'png';
  if (mimeType?.includes('webp')) return 'webp';
  if (mimeType?.includes('gif')) return 'gif';
  if (mediaType === 'video') {
    if (mimeType?.includes('quicktime')) return 'mov';
    return 'mp4';
  }
  return 'jpg';
}

async function uploadViaFirebase(params: {
  userId: string;
  uri: string;
  mediaType: MediaType;
  mimeType?: string;
}): Promise<string> {
  const { userId, uri, mediaType, mimeType } = params;
  const ext = extensionFor(mediaType, mimeType);
  const path = `posts/${userId}/${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);

  let blob: Blob;
  try {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Kunne ikke lese mediafil (${response.status})`);
    }
    blob = await response.blob();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Ukjent feil';
    throw new Error(`Media klarte ikke å lastes: ${msg}`);
  }

  if (!blob.size) {
    throw new Error('Mediafilen er tom — velg bilde/video på nytt.');
  }

  try {
    await uploadBytes(storageRef, blob, {
      contentType:
        mimeType ?? (mediaType === 'video' ? 'video/mp4' : 'image/jpeg'),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Ukjent feil';
    throw new Error(`Opplasting til Storage feilet: ${msg}`);
  }

  return getDownloadURL(storageRef);
}

/**
 * Upload post media. Prefers Cloudflare R2 when configured on the server;
 * falls back to Firebase Storage.
 */
export async function uploadPostMedia(params: {
  userId: string;
  uri: string;
  mediaType: MediaType;
  mimeType?: string;
  getClerkToken?: () => Promise<string | null>;
}): Promise<string> {
  const contentType =
    params.mimeType ??
    (params.mediaType === 'video' ? 'video/mp4' : 'image/jpeg');
  const extension = extensionFor(params.mediaType, params.mimeType);

  if (params.getClerkToken) {
    try {
      return await uploadToR2({
        getClerkToken: params.getClerkToken,
        uri: params.uri,
        contentType,
        kind: 'post',
        extension,
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'R2_NOT_CONFIGURED') {
        // Fall through to Firebase.
      } else {
        throw err;
      }
    }
  }

  return uploadViaFirebase(params);
}

/** Upload a square-ish profile image (R2 preferred). */
export async function uploadAvatarMedia(params: {
  userId: string;
  uri: string;
  mimeType?: string;
  getClerkToken: () => Promise<string | null>;
}): Promise<string> {
  const contentType = params.mimeType ?? 'image/jpeg';
  const extension = extensionFor('image', params.mimeType);

  try {
    return await uploadToR2({
      getClerkToken: params.getClerkToken,
      uri: params.uri,
      contentType,
      kind: 'avatar',
      extension,
    });
  } catch (err) {
    if (!(err instanceof Error && err.message === 'R2_NOT_CONFIGURED')) {
      throw err;
    }
  }

  return uploadViaFirebase({
    userId: params.userId,
    uri: params.uri,
    mediaType: 'image',
    mimeType: contentType,
  });
}

export async function deleteMediaByUrl(downloadUrl: string): Promise<void> {
  // Firebase download URLs only — R2 objects are left in place (safe no-op).
  if (!downloadUrl.includes('firebasestorage')) return;
  const storageRef = ref(storage, downloadUrl);
  await deleteObject(storageRef);
}
