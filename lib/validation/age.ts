/** Minimum age to create a BioBlix account / use the service. */
export const MIN_AGE = 16;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type AgeErrorCode =
  | 'auth.birthInvalid'
  | 'auth.ageTooYoung'
  | 'auth.birthRange';

export function parseBirthDate(raw: string): Date | null {
  const trimmed = raw.trim();
  if (!ISO_DATE_RE.test(trimmed)) return null;
  const [y, m, d] = trimmed.split('-').map((n) => Number(n));
  if (!y || !m || !d) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  const now = new Date();
  if (date.getTime() > Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) {
    return null;
  }
  return date;
}

/** Age in full years as of today (UTC date parts). */
export function ageFromBirthDate(birthDate: Date, now = new Date()): number {
  let age = now.getFullYear() - birthDate.getUTCFullYear();
  const month = now.getMonth() - birthDate.getUTCMonth();
  if (
    month < 0 ||
    (month === 0 && now.getDate() < birthDate.getUTCDate())
  ) {
    age -= 1;
  }
  return age;
}

export function isAtLeastAge(
  birthDateRaw: string,
  minAge = MIN_AGE
):
  | { ok: true; birthDate: string; age: number }
  | { ok: false; code: AgeErrorCode; age?: number } {
  const parsed = parseBirthDate(birthDateRaw);
  if (!parsed) {
    return { ok: false, code: 'auth.birthInvalid' };
  }
  const age = ageFromBirthDate(parsed);
  if (age < minAge) {
    return { ok: false, code: 'auth.ageTooYoung', age: minAge };
  }
  if (age > 120) {
    return { ok: false, code: 'auth.birthRange' };
  }
  const birthDate = birthDateRaw.trim();
  return { ok: true, birthDate, age };
}
