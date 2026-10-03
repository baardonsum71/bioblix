/**
 * BioBlix design system — "Clean Slate with a Pop of Color"
 * Rich Dark base + electric teal CTA for influencers, gamers, students & business.
 */
export const BioBlixBrand = {
  name: 'BioBlix',
  tagline: 'Share your everyday. Click the moments.',
  shortDescription:
    'BioBlix is where creators share photos and videos with direct links — gather followers in one living profile, free.',
  scheme: 'bioblix',
  bundleId: 'com.bioblix.app',
  supportUrl: 'https://bioblix.app/support',
  privacyUrl: '/privacy',
  privacyEmail: 'privacy@bioblix.app',
} as const;

/** Brand gradient stops (teal → violet → magenta → blaze). */
export const BioBlixGradient = {
  colors: ['#00F5D4', '#7B2CBF', '#E93BFF', '#FF8C2E'] as const,
  soft: ['#00F5D455', '#7B2CBF44', '#FF8C2E33'] as const,
  locations: [0, 0.4, 0.7, 1] as const,
  start: { x: 0, y: 0 } as const,
  end: { x: 1, y: 1 } as const,
};

/** Core palette — Rich Dark + electric teal. */
export const BioBlixPalette = {
  /** #0B0F19 Rich Dark background */
  night: '#0B0F19',
  nightElevated: '#0F141F',
  /** #161B26 cards / panels */
  panel: '#161B26',
  raised: '#1C2433',
  hairline: '#2A3344',
  /** #00F5D4 electric teal — primary CTA */
  aurora: '#00F5D4',
  auroraDeep: '#7B2CBF',
  cyan: '#00F5D4',
  violet: '#7B2CBF',
  magenta: '#E93BFF',
  blaze: '#FF8C2E',
  ember: '#FF6B5C',
  saffron: '#FFB347',
  /** Primary text */
  ice: '#FFFFFF',
  fog: '#E2E8F0',
  /** #94A3B8 body / secondary */
  muted: '#94A3B8',
  danger: '#FF5A5F',
  success: '#00F5D4',
  black: '#000000',
  white: '#FFFFFF',
  overlay: 'rgba(11,15,25,0.82)',
  scrim: 'rgba(11,15,25,0.66)',
  /** Subtle neon glow for clickable media */
  glowTeal: 'rgba(0,245,212,0.45)',
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
  sm: 12,
  md: 16,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Plus Jakarta Sans when loaded; falls back to system geometric sans. */
const fontRegular = 'PlusJakartaSans_400Regular';
const fontBold = 'PlusJakartaSans_700Bold';
const fontDisplay = 'PlusJakartaSans_700Bold';

export const BioBlixType = {
  display: {
    fontFamily: fontDisplay,
    fontSize: 34,
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  title: {
    fontFamily: fontBold,
    fontSize: 22,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  body: {
    fontFamily: fontRegular,
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 24,
  },
  label: {
    fontFamily: fontBold,
    fontSize: 15,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontRegular,
    fontSize: 13,
    letterSpacing: 0.1,
    lineHeight: 18,
  },
} as const;

/** Soft neon glow for shoppable / CTA elements. */
export const BioBlixGlow = {
  cta: {
    shadowColor: BioBlixPalette.aurora,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  linkBadge: {
    shadowColor: BioBlixPalette.aurora,
    shadowOpacity: 0.55,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
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
  glow: BioBlixGlow,
  components: {
    tabBar: {
      background: BioBlixPalette.night,
      border: BioBlixPalette.hairline,
      active: BioBlixPalette.cyan,
      inactive: BioBlixPalette.muted,
    },
    cta: {
      background: BioBlixPalette.cyan,
      backgroundPressed: BioBlixPalette.auroraDeep,
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
