import Head from 'expo-router/head';

import { BioBlixBrand } from '@/constants/bioblixTheme';
import { defaultOgImage, type PageSeo } from '@/lib/seo/profileMeta';

type Props = {
  seo: PageSeo;
};

/**
 * Per-route document title + meta/Open Graph for web SEO and social previews.
 * Updates the shared shell from app/+html.tsx once profile/blix data loads.
 */
export function BioBlixHead({ seo }: Props) {
  const image = seo.imageUrl?.trim() || defaultOgImage();
  const ogType = seo.type === 'profile' ? 'profile' : seo.type === 'article' ? 'article' : 'website';

  return (
    <Head>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.url} />

      <meta property="og:site_name" content={BioBlixBrand.name} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
}
