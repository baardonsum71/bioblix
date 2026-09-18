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

  const response = await fetch(uri);
  const blob = await response.blob();

  await uploadBytes(storageRef, blob, {
    contentType: mimeType ?? (mediaType === 'video' ? 'video/mp4' : 'image/jpeg'),
  });

  return getDownloadURL(storageRef);
}

export async function deleteMediaByUrl(downloadUrl: string): Promise<void> {
  const storageRef = ref(storage, downloadUrl);
  await deleteObject(storageRef);
}
