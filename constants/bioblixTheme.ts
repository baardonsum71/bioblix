/**
 * BioBlix design system — "Neon Blix"
 * Cyan → magenta → orange, matching the official B / BioBlix marks.
 */
export const BioBlixBrand = {
  name: 'BioBlix',
  tagline: 'Vis frem apper og produkter i korte blix',
  shortDescription:
    'BioBlix er en vertikal showcase der skapere deler korte videoer og bilder av egne apper og produkter — med valgfri Pro-lenke rett til butikk eller landingsside.',
  scheme: 'bioblix',
  bundleId: 'com.bioblix.app',
  supportUrl: 'https://bioblix.app/support',
  privacyUrl: '/privacy',
  privacyEmail: 'privacy@bioblix.app',
} as const;

/** Brand gradient stops (left → right / top-left → bottom-right). */
export const BioBlixGradient = {
  colors: ['#2EE6FF', '#7B5CFF', '#E93BFF', '#FF8C2E'] as const,
  soft: ['#2EE6FF55', '#E93BFF44', '#FF8C2E33'] as const,
  locations: [0, 0.35, 0.65, 1] as const,
  start: { x: 0, y: 0 } as const,
  end: { x: 1, y: 1 } as const,
};

/** Core palette tokens (use these everywhere instead of hex literals). */
export const BioBlixPalette = {
  night: '#050508',
  nightElevated: '#0C0B12',
  panel: '#12101A',
  raised: '#1C1830',
  hairline: '#2E2748',
  /** Primary accent — electric cyan from the B mark */
  aurora: '#2EE6FF',
  auroraDeep: '#E93BFF',
  cyan: '#2EE6FF',
  violet: '#7B5CFF',
  magenta: '#E93BFF',
  blaze: '#FF8C2E',
  ember: '#FF6B5C',
  saffron: '#FFB347',
  ice: '#F2F4FF',
  fog: '#B8B4D0',
  muted: '#8A84A8',
  danger: '#FF5A5F',
  success: '#2EE6FF',
  black: '#000000',
  white: '#FFFFFF',
  overlay: 'rgba(5,5,8,0.82)',
  scrim: 'rgba(5,5,8,0.66)',
} as const;

export const BioBlixSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  screen: 20,
} as const;

export const BioBlixRadii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const BioBlixType = {
  display: {
    fontFamily: 'Syne_700Bold',
    fontSize: 34,
    letterSpacing: -0.9,
    lineHeight: 38,
  },
  title: {
    fontFamily: 'Syne_700Bold',
    fontSize: 22,
    letterSpacing: -0.35,
    lineHeight: 28,
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
  },
} as const;

/** Semantic aliases used by screens. */
export const BioBlixTheme = {
  brand: BioBlixBrand,
  colors: BioBlixPalette,
  gradient: BioBlixGradient,
  space: BioBlixSpacing,
  radii: BioBlixRadii,
  type: BioBlixType,
  components: {
    tabBar: {
      background: BioBlixPalette.night,
      border: BioBlixPalette.hairline,
      active: BioBlixPalette.cyan,
      inactive: BioBlixPalette.muted,
    },
    cta: {
      background: BioBlixPalette.cyan,
      backgroundPressed: BioBlixPalette.magenta,
      text: BioBlixPalette.night,
    },
    dangerCta: {
      background: BioBlixPalette.ember,
      text: BioBlixPalette.night,
    },
    input: {
      background: BioBlixPalette.panel,
      border: BioBlixPalette.hairline,
      text: BioBlixPalette.ice,
      placeholder: BioBlixPalette.muted,
    },
  },
} as const;

/** @deprecated Prefer BioBlixPalette / BioBlixTheme — kept for gradual migration. */
export const Brand = BioBlixBrand;
export const Colors = {
  ink: BioBlixPalette.night,
  inkElevated: BioBlixPalette.nightElevated,
  surface: BioBlixPalette.panel,
  surfaceMuted: BioBlixPalette.raised,
  mist: BioBlixPalette.ice,
  mistDim: BioBlixPalette.muted,
  lime: BioBlixPalette.aurora,
  limePressed: BioBlixPalette.auroraDeep,
  coral: BioBlixPalette.ember,
  danger: BioBlixPalette.danger,
  white: BioBlixPalette.ice,
  black: BioBlixPalette.black,
  overlay: BioBlixPalette.overlay,
  scrim: BioBlixPalette.scrim,
} as const;

export default {
  light: {
    text: BioBlixPalette.night,
    background: BioBlixPalette.ice,
    tint: BioBlixPalette.magenta,
    tabIconDefault: BioBlixPalette.muted,
    tabIconSelected: BioBlixPalette.cyan,
  },
  dark: {
    text: BioBlixPalette.ice,
    background: BioBlixPalette.night,
    tint: BioBlixPalette.cyan,
    tabIconDefault: BioBlixPalette.muted,
    tabIconSelected: BioBlixPalette.cyan,
  },
};
