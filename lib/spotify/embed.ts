/**
 * Convert a Spotify share link / URI into an official embed player URL.
 * Streams via Spotify — no audio files stored on BioBlix.
 */

const RESOURCE =
  'track|album|playlist|episode|show|artist' as const;

const OPEN_PATH = new RegExp(
  `^(?:https?:\\/\\/)?(?:open\\.)?spotify\\.com(?:\\/intl-[a-z]{2})?\\/(embed\\/)?(${RESOURCE})\\/([a-zA-Z0-9]+)(?:[/?#].*)?$`,
  'i'
);

const SPOTIFY_URI = new RegExp(
  `^spotify:(${RESOURCE}):([a-zA-Z0-9]+)$`,
  'i'
);

export type SpotifyResourceType =
  | 'track'
  | 'album'
  | 'playlist'
  | 'episode'
  | 'show'
  | 'artist';

export type SpotifyParsed = {
  type: SpotifyResourceType;
  id: string;
  /** Canonical open.spotify.com page URL (for “open in Spotify”). */
  pageUrl: string;
  /** Official compact embed URL. */
  embedUrl: string;
};

function build(type: SpotifyResourceType, id: string): SpotifyParsed {
  return {
    type,
    id,
    pageUrl: `https://open.spotify.com/${type}/${id}`,
    embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
  };
}

/** Parse a pasted Spotify share link or `spotify:` URI. */
export function parseSpotifyUrl(raw: string): SpotifyParsed | null {
  const input = raw.trim();
  if (!input) return null;

  const uri = input.match(SPOTIFY_URI);
  if (uri) {
    return build(uri[1].toLowerCase() as SpotifyResourceType, uri[2]);
  }

  const path = input.match(OPEN_PATH);
  if (path) {
    return build(path[2].toLowerCase() as SpotifyResourceType, path[3]);
  }

  return null;
}

/** True when the string is a supported Spotify track/album/playlist/etc. link. */
export function isValidSpotifyUrl(raw: string): boolean {
  return parseSpotifyUrl(raw) !== null;
}

/** Embed src for iframe, or null if invalid. */
export function toSpotifyEmbedUrl(raw: string): string | null {
  return parseSpotifyUrl(raw)?.embedUrl ?? null;
}

/** Normalize to a clean open.spotify.com URL for storage. */
export function normalizeSpotifyUrl(raw: string): string | null {
  return parseSpotifyUrl(raw)?.pageUrl ?? null;
}
