/**
 * Owner / founder emails — always treated as Pro (gratis full tilgang).
 * Mirrored to Firestore `isProYearly` via `/api/ensure-owner-pro` (Admin SDK).
 */
export const OWNER_EMAILS = [
  'baardonsum@hotmail.no',
  'baardonsum@gmail.com',
] as const;

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? '').trim().toLowerCase();
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  return (OWNER_EMAILS as readonly string[]).includes(normalized);
}
