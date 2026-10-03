import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

import { BioBlixBrand, BioBlixPalette } from '@/constants/bioblixTheme';

export default function BioBlixHtml({ children }: { children: ReactNode }) {
  return (
    <html lang="nb">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>
          {BioBlixBrand.name} — {BioBlixBrand.tagline}
        </title>
        <meta name="description" content={BioBlixBrand.shortDescription} />
        <meta name="application-name" content={BioBlixBrand.name} />
        <meta name="theme-color" content={BioBlixPalette.night} />
        <meta
          name="trustpilot-one-time-domain-verification-id"
          content="be14ee4d-87fe-4db0-a2e5-a6fa556e8218"
        />
        <meta property="og:site_name" content={BioBlixBrand.name} />
        <meta property="og:title" content={BioBlixBrand.name} />
        <meta property="og:description" content={BioBlixBrand.shortDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.bioblix.com" />
        <meta property="og:image" content="https://www.bioblix.com/favicon.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={BioBlixBrand.name} />
        <meta name="twitter:description" content={BioBlixBrand.shortDescription} />
        <meta name="twitter:image" content="https://www.bioblix.com/favicon.png" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: bioblixWebChrome }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const bioblixWebChrome = `
html, body {
  background-color: ${BioBlixPalette.night};
  color: ${BioBlixPalette.ice};
}
* { box-sizing: border-box; }
`;
