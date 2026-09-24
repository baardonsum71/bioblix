import { Platform } from 'react-native';

/**
 * Base URL for Vercel `/api/*` routes.
 * Web (same origin): empty string → relative `/api/...`
 * Native: set EXPO_PUBLIC_API_BASE_URL (e.g. https://bioblix.app)
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';
  if (fromEnv) return fromEnv;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}
