/**
 * Pro link validation — full https URLs only, no known shorteners (UGC / spam).
 */

const URL_SHORTENER_HOSTS = [
  'bit.ly',
  'bitly.com',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'rebrand.ly',
  'cutt.ly',
  'shorturl.at',
  'tiny.cc',
  'rb.gy',
  'clck.ru',
  'v.gd',
  'lnkd.in',
  'amzn.to',
  'adf.ly',
  'bl.ink',
  'trib.al',
  'soo.gd',
  'short.io',
  't.ly',
  'tiny.one',
] as const;

export type ProLinkValidation =
  | { ok: true; url: string }
  | { ok: false; message: string };

/** Requires https:// and rejects common URL shorteners. */
export function validateProLinkUrl(raw: string): ProLinkValidation {
  const trimmed = raw.trim();

  if (!trimmed) {
    return { ok: false, message: 'Skriv inn en nettadresse.' };
  }

  if (!/^https:\/\//i.test(trimmed)) {
    return {
      ok: false,
      message: 'Lenken må starte med https:// (full adresse, ikke forkortet).',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, message: 'Ugyldig nettadresse.' };
  }

  if (parsed.protocol !== 'https:') {
    return { ok: false, message: 'Kun https:// er tillatt.' };
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const isShortener = URL_SHORTENER_HOSTS.some(
    (short) => host === short || host.endsWith(`.${short}`)
  );

  if (isShortener) {
    return {
      ok: false,
      message:
        'Link-forkortere (bit.ly, tinyurl, t.co m.fl.) er ikke tillatt. Lim inn den fulle, ekte nettadressen.',
    };
  }

  return { ok: true, url: trimmed };
}

/** Hostname for disclaimer copy, e.g. "apps.apple.com". */
export function extractLinkDomain(url: string): string {
  try {
    const normalized = /^https?:\/\//i.test(url.trim())
      ? url.trim()
      : `https://${url.trim()}`;
    return new URL(normalized).hostname.replace(/^www\./, '');
  } catch {
    return url.trim();
  }
}
