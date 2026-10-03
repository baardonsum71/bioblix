/**
 * BioBlix public handle rules — Instagram/TikTok-bio friendly.
 * Allows a–z, 0–9, underscore, dot, hyphen. Normalizes Nordic letters.
 */
export const HANDLE_MIN = 3;
export const HANDLE_MAX = 24;

const RESERVED_HANDLES = new Set([
  'api',
  'u',
  'b',
  'tags',
  'tag',
  'live',
  'privacy',
  'modal',
  'onboarding',
  'registrer',
  'register',
  'sign-in',
  'signin',
  'signup',
  'sso-callback',
  'create',
  'profile',
  'account',
  'publish',
  'about',
  'admin',
  'www',
  'app',
  'help',
  'support',
  'bioblix',
]);

export function isReservedHandle(handle: string): boolean {
  return RESERVED_HANDLES.has(handle.trim().toLowerCase());
}

/** Sanitize raw input into a valid handle (or empty if nothing left). */
export function sanitizeHandle(raw: string): string {
  let value = raw.toLowerCase();
  value = value
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u');
  value = value.replace(/[^a-z0-9_.-]/g, '');
  return value.slice(0, HANDLE_MAX);
}

export function isValidHandle(handle: string): boolean {
  const h = handle.trim().toLowerCase();
  if (h.length < HANDLE_MIN || h.length > HANDLE_MAX) return false;
  if (isReservedHandle(h)) return false;
  // Must start and end with alphanumeric; middle may include _ . -
  return /^[a-z0-9](?:[a-z0-9_.-]*[a-z0-9])?$/.test(h);
}
