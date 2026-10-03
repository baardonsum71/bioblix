import { BioBlixBrand } from '@/constants/bioblixTheme';
import { profileShareUrl, blixShareUrl } from '@/lib/shareProfile';
import { isValidHandle, sanitizeHandle } from '@/lib/validation/handle';

export type SeoLocale = 'nb' | 'en';

export type PageSeo = {
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  type?: 'website' | 'profile' | 'article';
};

const DEFAULT_OG_IMAGE = 'https://www.bioblix.com/favicon.png';

export function siteOrigin(): string {
  return 'https://www.bioblix.com';
}

export function defaultOgImage(): string {
  return DEFAULT_OG_IMAGE;
}

/** Display name used in titles — prefer vanity handle when valid. */
export function profilePublicName(displayName: string): string {
  const handle = sanitizeHandle(displayName);
  return isValidHandle(handle) ? handle : displayName.trim() || BioBlixBrand.name;
}

export function buildProfileSeo(params: {
  userId: string;
  displayName: string;
  imageUrl?: string | null;
  locale?: SeoLocale;
}): PageSeo {
  const name = profilePublicName(params.displayName);
  const locale = params.locale ?? 'nb';
  const description =
    locale === 'en'
      ? `See photos, videos and exclusive links from ${name} on BioBlix. Check out their vertical showcase!`
      : `Se bilder, videoer og eksklusive lenker fra ${name} på BioBlix. Sjekk ut den vertikale showcasen!`;

  return {
    title: `${name} (@${name}) | ${BioBlixBrand.name}`,
    description,
    url: profileShareUrl(params.userId, params.displayName),
    imageUrl: params.imageUrl?.trim() || DEFAULT_OG_IMAGE,
    type: 'profile',
  };
}

export function buildBlixSeo(params: {
  postId: string;
  title: string;
  description?: string | null;
  mediaUrl?: string | null;
  authorName?: string | null;
  locale?: SeoLocale;
}): PageSeo {
  const locale = params.locale ?? 'nb';
  const author = params.authorName?.trim();
  const name = author ? profilePublicName(author) : BioBlixBrand.name;
  const blixTitle = params.title.trim() || 'Blix';
  const description =
    params.description?.trim() ||
    (locale === 'en'
      ? `${blixTitle} by ${name} on BioBlix — photos, video and shoppable links.`
      : `${blixTitle} av ${name} på BioBlix — bilder, video og shoppable lenker.`);

  return {
    title: `${blixTitle} | ${name} | ${BioBlixBrand.name}`,
    description,
    url: blixShareUrl(params.postId),
    imageUrl: params.mediaUrl?.trim() || DEFAULT_OG_IMAGE,
    type: 'article',
  };
}

export function blixImageAlt(username: string, locale: SeoLocale = 'nb'): string {
  const name = profilePublicName(username);
  return locale === 'en'
    ? `BioBlix post by ${name}`
    : `BioBlix-innlegg av ${name}`;
}

export function profileAvatarAlt(username: string, locale: SeoLocale = 'nb'): string {
  const name = profilePublicName(username);
  return locale === 'en'
    ? `${name} profile photo on BioBlix`
    : `Profilbilde av ${name} på BioBlix`;
}
