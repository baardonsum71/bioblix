import { MAX_PROFILE_LINKS, type ProfileLink } from '@/types';
import { validateProLinkUrl } from '@/lib/validation/proLink';

export const MAX_PROFILE_LINK_TITLE = 40;

export type ProfileLinkValidation =
  | { ok: true; link: Omit<ProfileLink, 'id'> }
  | { ok: false; message: string };

function normalizeHttpsUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (/^https:\/\//i.test(trimmed)) return trimmed;
  if (/^http:\/\//i.test(trimmed)) {
    return `https://${trimmed.slice('http://'.length)}`;
  }
  return `https://${trimmed}`;
}

export function validateProfileLinkInput(
  titleRaw: string,
  urlRaw: string
): ProfileLinkValidation {
  const title = titleRaw.trim().replace(/\s+/g, ' ');
  if (!title) {
    return { ok: false, message: 'Enter a short label for the link.' };
  }
  if (title.length > MAX_PROFILE_LINK_TITLE) {
    return {
      ok: false,
      message: `Label must be at most ${MAX_PROFILE_LINK_TITLE} characters.`,
    };
  }

  const urlCheck = validateProLinkUrl(normalizeHttpsUrl(urlRaw));
  if (!urlCheck.ok) {
    return urlCheck;
  }

  return { ok: true, link: { title, url: urlCheck.url } };
}

export function newProfileLinkId(): string {
  return `pl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function parseProfileLinks(raw: unknown): ProfileLink[] {
  if (!Array.isArray(raw)) return [];
  const out: ProfileLink[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const id = typeof row.id === 'string' ? row.id.trim() : '';
    const title = typeof row.title === 'string' ? row.title.trim() : '';
    const url = typeof row.url === 'string' ? row.url.trim() : '';
    if (!id || !title || !url) continue;
    out.push({ id, title: title.slice(0, MAX_PROFILE_LINK_TITLE), url });
    if (out.length >= MAX_PROFILE_LINKS) break;
  }
  return out;
}

export { MAX_PROFILE_LINKS };
