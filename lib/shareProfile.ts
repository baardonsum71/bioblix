import { Platform, Share } from 'react-native';

import { getApiBaseUrl } from '@/lib/apiBase';

function originBase(): string {
  const base =
    getApiBaseUrl() ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  return base.replace(/\/$/, '') || 'https://www.bioblix.com';
}

/** Absolute public profile URL for sharing. */
export function profileShareUrl(userId: string): string {
  return `${originBase()}/u/${encodeURIComponent(userId)}`;
}

/** Absolute shareable URL for a single blix (shoppable media page). */
export function blixShareUrl(postId: string): string {
  return `${originBase()}/b/${encodeURIComponent(postId)}`;
}

async function shareUrl(params: {
  url: string;
  title: string;
  message: string;
}): Promise<void> {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
    await navigator.share({
      title: params.title,
      text: params.message,
      url: params.url,
    });
    return;
  }

  if (
    Platform.OS === 'web' &&
    typeof navigator !== 'undefined' &&
    navigator.clipboard
  ) {
    await navigator.clipboard.writeText(params.url);
    return;
  }

  await Share.share(
    Platform.OS === 'ios'
      ? { url: params.url, message: `${params.message}\n${params.url}` }
      : { message: `${params.message}\n${params.url}`, title: params.title }
  );
}

export async function shareProfile(params: {
  userId: string;
  displayName: string;
  /** Localized share text, e.g. from t('share.checkOut', { name }). */
  message?: string;
}): Promise<void> {
  const url = profileShareUrl(params.userId);
  const message =
    params.message ?? `Check out ${params.displayName} on BioBlix`;
  await shareUrl({ url, title: 'BioBlix', message });
}

export async function shareBlix(params: {
  postId: string;
  title: string;
  message?: string;
}): Promise<void> {
  const url = blixShareUrl(params.postId);
  const message = params.message ?? `${params.title} — BioBlix`;
  await shareUrl({ url, title: params.title, message });
}
