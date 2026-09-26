/** Minimum age to create a BioBlix account / use the service. */
export const MIN_AGE = 16;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

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
): { ok: true; birthDate: string; age: number } | { ok: false; message: string } {
  const parsed = parseBirthDate(birthDateRaw);
  if (!parsed) {
    return {
      ok: false,
      message: 'Oppgi fødselsdato som ÅÅÅÅ-MM-DD (f.eks. 2005-03-15).',
    };
  }
  const age = ageFromBirthDate(parsed);
  if (age < minAge) {
    return {
      ok: false,
      message: `BioBlix er bare for personer som er ${minAge} år eller eldre.`,
    };
  }
  if (age > 120) {
    return { ok: false, message: 'Ugyldig fødselsdato.' };
  }
  const birthDate = birthDateRaw.trim();
  return { ok: true, birthDate, age };
}
