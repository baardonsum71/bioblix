/**
 * BioBlix design system — "Night Aurora"
 * Intentionally unlike Expo defaults (blue tint), purple AI themes, or cream/serif stacks.
 */
export const BioBlixBrand = {
  name: 'BioBlix',
  tagline: 'Vis frem apper og produkter i korte blix',
  shortDescription:
    'BioBlix er en vertikal showcase der skapere deler korte videoer og bilder av egne apper og produkter — med valgfri Pro-lenke rett til butikk eller landingsside.',
  scheme: 'bioblix',
  bundleId: 'com.bioblix.app',
  supportUrl: 'https://bioblix.app/support',
  privacyUrl: 'https://bioblix.app/privacy',
} as const;

/** Core palette tokens (use these everywhere instead of hex literals). */
export const BioBlixPalette = {
  night: '#050B12',
  nightElevated: '#0A1420',
  panel: '#0E1A24',
  raised: '#162636',
  hairline: '#243648',
  aurora: '#3DDC97',
  auroraDeep: '#2BB87C',
  ember: '#F07167',
  saffron: '#F4C95D',
  ice: '#E6F1F5',
  fog: '#A8BCCB',
  muted: '#7A93A7',
  danger: '#FF5A5F',
  success: '#3DDC97',
  black: '#000000',
  white: '#FFFFFF',
  overlay: 'rgba(5,11,18,0.78)',
  scrim: 'rgba(5,11,18,0.62)',
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
  space: BioBlixSpacing,
  radii: BioBlixRadii,
  type: BioBlixType,
  components: {
    tabBar: {
      background: BioBlixPalette.night,
      border: BioBlixPalette.hairline,
      active: BioBlixPalette.aurora,
      inactive: BioBlixPalette.muted,
    },
    cta: {
      background: BioBlixPalette.aurora,
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
    tint: BioBlixPalette.auroraDeep,
    tabIconDefault: BioBlixPalette.muted,
    tabIconSelected: BioBlixPalette.auroraDeep,
  },
  dark: {
    text: BioBlixPalette.ice,
    background: BioBlixPalette.night,
    tint: BioBlixPalette.aurora,
    tabIconDefault: BioBlixPalette.muted,
    tabIconSelected: BioBlixPalette.aurora,
  },
};
