import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

import type { MediaType } from '@/types';
import { storage } from '@/lib/firebase';

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

/**
 * Upload post media to Firebase Storage.
 * Path: `posts/{userId}/{timestamp}.{ext}` — works on web (Blob) and native (fetch→blob).
 */
export async function uploadPostMedia(params: {
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

export async function deleteMediaByUrl(downloadUrl: string): Promise<void> {
  const storageRef = ref(storage, downloadUrl);
  await deleteObject(storageRef);
}
