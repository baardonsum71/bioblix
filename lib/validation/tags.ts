/** Max tags per post. */
export const MAX_TAGS_PER_POST = 5;
export const TAG_MIN_LEN = 2;
export const TAG_MAX_LEN = 24;

const TAG_RE = /^[a-z0-9æøå_-]+$/;

/**
 * Normalize a raw tag: strip #, lowercase, trim.
 * Returns null if invalid after normalize.
 */
export function normalizeTag(raw: string): string | null {
  const slug = raw
    .trim()
    .replace(/^#+/, '')
    .toLowerCase()
    .replace(/\s+/g, '_');
  if (slug.length < TAG_MIN_LEN || slug.length > TAG_MAX_LEN) return null;
  if (!TAG_RE.test(slug)) return null;
  return slug;
}

/** Parse free text (comma / space / Enter chunks) into unique valid tags. */
export function parseTagInput(
  raw: string,
  existing: string[] = []
): string[] {
  const parts = raw.split(/[,;\s]+/).filter(Boolean);
  const out = [...existing];
  for (const part of parts) {
    const slug = normalizeTag(part);
    if (!slug) continue;
    if (out.includes(slug)) continue;
    if (out.length >= MAX_TAGS_PER_POST) break;
    out.push(slug);
  }
  return out;
}

export function sanitizeTags(tags: string[] | undefined | null): string[] {
  if (!tags?.length) return [];
  const out: string[] = [];
  for (const t of tags) {
    const slug = normalizeTag(t);
    if (!slug || out.includes(slug)) continue;
    out.push(slug);
    if (out.length >= MAX_TAGS_PER_POST) break;
  }
  return out;
}
