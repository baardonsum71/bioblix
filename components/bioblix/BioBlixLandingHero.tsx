import { Link, useRouter, type Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
  type TextInput as TextInputType,
} from 'react-native';

import { BioBlixProgressBar } from '@/components/bioblix/BioBlixProgressBar';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import {
  BioBlixLogo,
  BioBlixScreenShell,
} from '@/components/bioblix/BioBlixLogo';
import {
  BioBlixGlow,
  BioBlixPalette,
  BioBlixRadii,
  BioBlixSpacing,
} from '@/constants/bioblixTheme';
import { Colors } from '@/constants/Colors';
import { useI18n } from '@/lib/i18n';
import type { MessageKey } from '@/lib/i18n/dictionaries';
import { sanitizeHandle } from '@/lib/validation/handle';
import { isUsernameAvailable } from '@/services/users';

type PersonaId = 'influencer' | 'gamer' | 'student' | 'business';

const PERSONAS: {
  id: PersonaId;
  labelKey: MessageKey;
  titleKey: MessageKey;
  bodyKey: MessageKey;
  linkA: MessageKey;
  linkB: MessageKey;
  shopKey: MessageKey;
}[] = [
  {
    id: 'influencer',
    labelKey: 'landing.persona.influencer',
    titleKey: 'landing.persona.influencerTitle',
    bodyKey: 'landing.persona.influencerBody',
    linkA: 'landing.persona.influencerLinkA',
    linkB: 'landing.persona.influencerLinkB',
    shopKey: 'landing.persona.influencerShop',
  },
  {
    id: 'gamer',
    labelKey: 'landing.persona.gamer',
    titleKey: 'landing.persona.gamerTitle',
    bodyKey: 'landing.persona.gamerBody',
    linkA: 'landing.persona.gamerLinkA',
    linkB: 'landing.persona.gamerLinkB',
    shopKey: 'landing.persona.gamerShop',
  },
  {
    id: 'student',
    labelKey: 'landing.persona.student',
    titleKey: 'landing.persona.studentTitle',
    bodyKey: 'landing.persona.studentBody',
    linkA: 'landing.persona.studentLinkA',
    linkB: 'landing.persona.studentLinkB',
    shopKey: 'landing.persona.studentShop',
  },
  {
    id: 'business',
    labelKey: 'landing.persona.business',
    titleKey: 'landing.persona.businessTitle',
    bodyKey: 'landing.persona.businessBody',
    linkA: 'landing.persona.businessLinkA',
    linkB: 'landing.persona.businessLinkB',
    shopKey: 'landing.persona.businessShop',
  },
];

const STEPS: { num: string; titleKey: MessageKey; bodyKey: MessageKey }[] = [
  {
    num: '1',
    titleKey: 'landing.step1Title',
    bodyKey: 'landing.step1Body',
  },
  {
    num: '2',
    titleKey: 'landing.step2Title',
    bodyKey: 'landing.step2Body',
  },
  {
    num: '3',
    titleKey: 'landing.step3Title',
    bodyKey: 'landing.step3Body',
  },
];

const INSPIRED: { handle: string; tint: string }[] = [
  { handle: 'nova.creates', tint: '#2EE6FF' },
  { handle: 'pixel.raid', tint: '#E93BFF' },
  { handle: 'mila.studies', tint: '#FF8C2E' },
  { handle: 'north.cafe', tint: '#7B5CFF' },
];

function ShoppableTapDemo({ shopLabel }: { shopLabel: string }) {
  const { t } = useI18n();
  const fingerX = useRef(new Animated.Value(72)).current;
  const fingerY = useRef(new Animated.Value(28)).current;
  const fingerScale = useRef(new Animated.Value(1)).current;
  const ripple = useRef(new Animated.Value(0)).current;
  const shopOpacity = useRef(new Animated.Value(0)).current;
  const shopY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(400),
        Animated.parallel([
          Animated.timing(fingerX, {
            toValue: 118,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(fingerY, {
            toValue: 78,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(fingerScale, {
          toValue: 0.88,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(ripple, {
            toValue: 1,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.timing(fingerScale, {
            toValue: 1,
            duration: 160,
            useNativeDriver: true,
          }),
          Animated.timing(shopOpacity, {
            toValue: 1,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.timing(shopY, {
            toValue: 0,
            duration: 280,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(900),
        Animated.parallel([
          Animated.timing(shopOpacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(shopY, {
            toValue: 12,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(ripple, {
            toValue: 0,
            duration: 1,
            useNativeDriver: true,
          }),
          Animated.timing(fingerX, {
            toValue: 72,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.timing(fingerY, {
            toValue: 28,
            duration: 280,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(300),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [fingerX, fingerY, fingerScale, ripple, shopOpacity, shopY]);

  const rippleScale = ripple.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1.8],
  });
  const rippleOpacity = ripple.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.55, 0.35, 0],
  });

  return (
    <View
      style={styles.demoStage}
      accessibilityLabel={t('landing.demoTapHint')}
    >
      <View style={styles.phoneFrame}>
        <View style={styles.phoneNotch} />
        <View style={styles.demoPinned}>
          <View style={styles.demoPinnedBar}>
            <BioBlixText variant="caption" color={Colors.ink}>
              {t('landing.demoShop')}
            </BioBlixText>
          </View>
        </View>
        <View style={styles.demoGrid}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[
                styles.demoTile,
                i === 1 && styles.demoTileHot,
                { backgroundColor: i % 2 === 0 ? '#2a2f3a' : '#1e2430' },
              ]}
            >
              {i === 1 ? (
                <View style={styles.demoLinkBadge}>
                  <BioBlixText variant="caption" color={Colors.ink}>
                    ↗
                  </BioBlixText>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.ripple,
            {
              opacity: rippleOpacity,
              transform: [
                { translateX: 106 },
                { translateY: 66 },
                { scale: rippleScale },
              ],
            },
          ]}
        />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.finger,
            {
              transform: [
                { translateX: fingerX },
                { translateY: fingerY },
                { scale: fingerScale },
              ],
            },
          ]}
        >
          <View style={styles.fingerTip} />
        </Animated.View>

        <Animated.View
          style={[
            styles.shopToast,
            {
              opacity: shopOpacity,
              transform: [{ translateY: shopY }],
            },
          ]}
        >
          <BioBlixText variant="caption" color={Colors.ink} numberOfLines={1}>
            {shopLabel}
          </BioBlixText>
        </Animated.View>
      </View>
      <BioBlixText
        variant="caption"
        color={Colors.mistDim}
        style={styles.demoCaption}
      >
        {t('landing.demoTapHint')}
      </BioBlixText>
    </View>
  );
}

type Availability = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

function ClaimBox({
  handle,
  setHandle,
  error,
  onClaim,
  inputRef,
}: {
  handle: string;
  setHandle: (v: string) => void;
  error: string | null;
  onClaim: () => void;
  inputRef: RefObject<TextInputType | null>;
}) {
  const { t } = useI18n();
  const [availability, setAvailability] = useState<Availability>('idle');
  const checkGen = useRef(0);

  useEffect(() => {
    const nick = sanitizeHandle(handle);
    if (nick.length < 3) {
      setAvailability(nick.length === 0 ? 'idle' : 'invalid');
      return;
    }
    setAvailability('checking');
    const gen = ++checkGen.current;
    const timer = setTimeout(() => {
      void isUsernameAvailable(nick)
        .then((ok) => {
          if (gen !== checkGen.current) return;
          setAvailability(ok ? 'available' : 'taken');
        })
        .catch(() => {
          if (gen !== checkGen.current) return;
          setAvailability('idle');
        });
    }, 400);
    return () => clearTimeout(timer);
  }, [handle]);

  const canContinue = availability === 'available';
  const { width } = useWindowDimensions();
  const formWide = width >= 500;
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.claimBlock}>
      <BioBlixProgressBar step={1} />
      <View style={[styles.ctaForm, formWide && styles.ctaFormWide]}>
        <View
          style={[
            styles.inputWrapper,
            (focused || availability === 'available') && styles.inputWrapperFocus,
            availability === 'taken' && styles.inputWrapperError,
          ]}
        >
          <BioBlixText variant="label" color="#64748B" style={styles.domainPrefix}>
            {t('landing.domainPrefix')}
          </BioBlixText>
          <TextInput
            ref={inputRef}
            value={handle}
            onChangeText={(v) => setHandle(sanitizeHandle(v))}
            placeholder={t('landing.handlePlaceholder')}
            placeholderTextColor="#475569"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            autoComplete="username"
            style={styles.claimInput}
            maxLength={24}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={() => {
              if (canContinue) onClaim();
            }}
            returnKeyType="go"
          />
          {availability === 'checking' ? (
            <ActivityIndicator size="small" color={BioBlixPalette.aurora} />
          ) : availability === 'available' ? (
            <BioBlixText variant="label" color={BioBlixPalette.aurora}>
              ✓
            </BioBlixText>
          ) : null}
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            !canContinue && styles.primaryDisabled,
            pressed && canContinue && styles.ctaButtonPressed,
          ]}
          onPress={onClaim}
          disabled={!canContinue}
        >
          <BioBlixText variant="label" color={BioBlixPalette.night}>
            {t('landing.claimCta')}
          </BioBlixText>
        </Pressable>
      </View>
      {availability === 'available' ? (
        <BioBlixText variant="caption" color={BioBlixPalette.aurora} style={styles.micro}>
          {t('landing.nameAvailable')}
        </BioBlixText>
      ) : null}
      {availability === 'taken' ? (
        <BioBlixText variant="caption" color={BioBlixPalette.danger} style={styles.micro}>
          {t('landing.nameTaken')}
        </BioBlixText>
      ) : null}
      {error ? (
        <BioBlixText variant="caption" color={BioBlixPalette.danger} style={styles.micro}>
          {error}
        </BioBlixText>
      ) : null}
      <BioBlixText variant="caption" color="#64748B" style={styles.micro}>
        {t('landing.claimMicro')}
      </BioBlixText>
    </View>
  );
}

/**
 * Guest landing funnel — claim handle → how it works → personas → final CTA.
 */
export function BioBlixLandingHero({
  onBrowseFeed,
}: {
  onBrowseFeed?: () => void;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInputType>(null);
  const [handle, setHandle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [persona, setPersona] = useState<PersonaId>('influencer');

  const active = PERSONAS.find((p) => p.id === persona) ?? PERSONAS[0];

  const claim = async () => {
    const nick = sanitizeHandle(handle);
    if (nick.length < 3) {
      setError(t('landing.handleShort'));
      return;
    }
    try {
      const ok = await isUsernameAvailable(nick);
      if (!ok) {
        setError(t('landing.nameTaken'));
        return;
      }
    } catch {
      /* allow continue if check fails */
    }
    setError(null);
    if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('bioblix_claim_nick', nick);
    }
    // Pretty funnel URL → /registrer?username=… → Clerk sign-up
    router.push(
      `/registrer?username=${encodeURIComponent(nick)}` as Href
    );
  };

  const focusClaim = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    setTimeout(() => inputRef.current?.focus(), 280);
  };

  return (
    <BioBlixScreenShell>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={['#0a1624', BioBlixPalette.night, '#12081a']}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section 1 — Hero (mobile-first claim machine) */}
        <View style={styles.heroContainer}>
          <BioBlixLogo variant="wordmark" size={72} />
          <View style={styles.headlineWrap}>
            <BioBlixText
              variant="display"
              style={[styles.headline, width >= 500 && styles.headlineLg]}
            >
              {t('landing.headlineLine1')}
            </BioBlixText>
            <BioBlixText
              variant="display"
              color={BioBlixPalette.aurora}
              style={[styles.headline, width >= 500 && styles.headlineLg]}
            >
              {t('landing.headlineHighlight')}
            </BioBlixText>
          </View>
          <BioBlixText
            variant="body"
            color={BioBlixPalette.muted}
            style={styles.sub}
          >
            {t('landing.sub')}
          </BioBlixText>
          <ClaimBox
            handle={handle}
            setHandle={(v) => {
              setHandle(v);
              setError(null);
            }}
            error={error}
            onClaim={() => void claim()}
            inputRef={inputRef}
          />
          <View style={styles.heroVisual}>
            <ShoppableTapDemo shopLabel={t(active.shopKey)} />
          </View>
        </View>

        {/* Section 2 — How it works */}
        <View style={styles.section}>
          <BioBlixText variant="title" style={styles.sectionTitle}>
            {t('landing.howHeading')}
          </BioBlixText>
          <View style={[styles.stepsRow, wide && styles.stepsRowWide]}>
            {STEPS.map((step) => (
              <View key={step.num} style={[styles.stepCard, wide && styles.stepCardWide]}>
                <View style={styles.stepNum}>
                  <BioBlixText variant="label" color={Colors.ink}>
                    {step.num}
                  </BioBlixText>
                </View>
                <BioBlixText variant="label" color={Colors.lime}>
                  {t(step.titleKey)}
                </BioBlixText>
                <BioBlixText variant="caption" color={Colors.mistDim}>
                  {t(step.bodyKey)}
                </BioBlixText>
              </View>
            ))}
          </View>
        </View>

        {/* Section 3 — Audience */}
        <View style={styles.section}>
          <BioBlixText variant="title" style={styles.sectionTitle}>
            {t('landing.personaHeading')}
          </BioBlixText>
          <View style={styles.personaRow}>
            {PERSONAS.map((p) => {
              const on = p.id === persona;
              return (
                <Pressable
                  key={p.id}
                  style={[styles.personaChip, on && styles.personaChipOn]}
                  onPress={() => setPersona(p.id)}
                >
                  <BioBlixText
                    variant="caption"
                    color={on ? Colors.ink : Colors.lime}
                  >
                    {t(p.labelKey)}
                  </BioBlixText>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.demoCard}>
            <View style={styles.demoAvatar}>
              <BioBlixText variant="title" color={Colors.ink}>
                {t(active.labelKey).slice(0, 1)}
              </BioBlixText>
            </View>
            <View style={styles.demoBody}>
              <BioBlixText variant="label" color={Colors.lime}>
                {t(active.titleKey)}
              </BioBlixText>
              <BioBlixText variant="body" color={Colors.mist}>
                {t(active.bodyKey)}
              </BioBlixText>
              <View style={styles.demoLink}>
                <BioBlixText variant="caption" color={Colors.ink}>
                  {t(active.linkA)}
                </BioBlixText>
              </View>
              <View style={styles.demoLinkGhost}>
                <BioBlixText variant="caption" color={Colors.lime}>
                  {t(active.linkB)}
                </BioBlixText>
              </View>
            </View>
          </View>
        </View>

        {/* Inspired */}
        <View style={styles.section}>
          <BioBlixText variant="title" style={styles.sectionTitle}>
            {t('landing.inspiredHeading')}
          </BioBlixText>
          <BioBlixText variant="caption" color={Colors.mistDim} style={styles.inspiredSub}>
            {t('landing.inspiredSub')}
          </BioBlixText>
          <View style={styles.inspiredRow}>
            {INSPIRED.map((p) => (
              <View key={p.handle} style={styles.inspiredCard}>
                <View style={[styles.inspiredAvatar, { backgroundColor: p.tint }]}>
                  <BioBlixText variant="label" color={Colors.ink}>
                    {p.handle.slice(0, 1).toUpperCase()}
                  </BioBlixText>
                </View>
                <BioBlixText variant="caption" color={Colors.mist} numberOfLines={1}>
                  @{p.handle}
                </BioBlixText>
              </View>
            ))}
          </View>
        </View>

        {/* Section 4 — Bottom push */}
        <View style={styles.bottomPush}>
          <BioBlixText variant="title" style={styles.bottomTitle}>
            {t('landing.bottomHeadline')}
          </BioBlixText>
          <Pressable
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed,
            ]}
            onPress={focusClaim}
          >
            <BioBlixText variant="label" color={BioBlixPalette.night}>
              {t('landing.bottomCta')}
            </BioBlixText>
          </Pressable>
          <BioBlixText variant="caption" color="#64748B" style={styles.micro}>
            {t('landing.claimMicro')}
          </BioBlixText>
          <Link href="/(auth)/sign-in?reason=publish" asChild>
            <Pressable style={styles.secondaryBtn}>
              <BioBlixText variant="label" color={Colors.lime}>
                {t('auth.createFreeProfile')}
              </BioBlixText>
            </Pressable>
          </Link>
        </View>

        {onBrowseFeed ? (
          <Pressable onPress={onBrowseFeed} style={styles.browseBtn}>
            <BioBlixText variant="caption" color={Colors.mistDim}>
              {t('landing.browseFeed')}
            </BioBlixText>
          </Pressable>
        ) : null}
      </ScrollView>
    </BioBlixScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 56,
    gap: BioBlixSpacing.lg,
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },
  heroContainer: {
    width: '100%',
    maxWidth: 650,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  heroVisual: {
    alignItems: 'center',
    marginTop: 8,
  },
  headlineWrap: {
    alignItems: 'center',
    marginTop: 4,
  },
  headline: {
    textAlign: 'center',
    letterSpacing: -0.6,
    fontSize: 34,
    lineHeight: 40,
  },
  headlineLg: {
    fontSize: 48,
    lineHeight: 54,
  },
  sub: {
    textAlign: 'center',
    maxWidth: 560,
    marginBottom: 8,
    lineHeight: 26,
  },
  claimBlock: {
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  ctaForm: {
    width: '100%',
    flexDirection: 'column',
    gap: 12,
    backgroundColor: '#161B26',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  ctaFormWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: '#0B0F19',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'web' ? 14 : 12,
    gap: 2,
  },
  inputWrapperFocus: {
    borderColor: BioBlixPalette.aurora,
    shadowColor: BioBlixPalette.aurora,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  inputWrapperError: {
    borderColor: BioBlixPalette.danger,
  },
  domainPrefix: {
    fontWeight: '500',
    marginRight: 2,
  },
  claimInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0,
    minWidth: 80,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
  },
  ctaButton: {
    backgroundColor: BioBlixPalette.aurora,
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 28,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...BioBlixGlow.cta,
  },
  ctaButtonPressed: {
    backgroundColor: '#00D1B5',
    transform: [{ scale: 0.98 }],
  },
  primaryDisabled: {
    opacity: 0.45,
  },
  micro: {
    textAlign: 'center',
  },
  demoStage: {
    alignItems: 'center',
    gap: 10,
  },
  phoneFrame: {
    width: 220,
    height: 280,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.surfaceMuted,
    backgroundColor: '#0f1218',
    paddingTop: 18,
    paddingHorizontal: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  phoneNotch: {
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -28,
    width: 56,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.surfaceMuted,
  },
  demoPinned: {
    marginBottom: 8,
  },
  demoPinnedBar: {
    backgroundColor: Colors.lime,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  demoTile: {
    width: 62,
    height: 62,
    borderRadius: 4,
    position: 'relative',
  },
  demoTileHot: {
    borderWidth: 1,
    borderColor: Colors.lime,
  },
  demoLinkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finger: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 28,
    height: 28,
    zIndex: 3,
  },
  fingerTip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,220,180,0.92)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  ripple: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lime,
    zIndex: 2,
  },
  shopToast: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 14,
    backgroundColor: Colors.lime,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    zIndex: 4,
  },
  demoCaption: {
    textAlign: 'center',
    maxWidth: 280,
  },
  section: {
    gap: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceMuted,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  stepsRow: {
    gap: 12,
  },
  stepsRowWide: {
    flexDirection: 'row',
  },
  stepCard: {
    gap: 6,
    padding: 16,
    borderRadius: BioBlixRadii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
    backgroundColor: Colors.surface,
  },
  stepCardWide: {
    flex: 1,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  personaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  personaChip: {
    borderWidth: 1,
    borderColor: Colors.lime,
    borderRadius: BioBlixRadii.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  personaChipOn: {
    backgroundColor: Colors.lime,
  },
  demoCard: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    borderRadius: BioBlixRadii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
    backgroundColor: Colors.surface,
  },
  demoAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lime,
  },
  demoBody: {
    flex: 1,
    gap: 8,
  },
  demoLink: {
    backgroundColor: Colors.lime,
    borderRadius: BioBlixRadii.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  demoLinkGhost: {
    borderWidth: 1,
    borderColor: Colors.lime,
    borderRadius: BioBlixRadii.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  inspiredSub: {
    marginTop: -4,
  },
  inspiredRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  inspiredCard: {
    width: '47%',
    minWidth: 140,
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: BioBlixRadii.md,
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
    backgroundColor: Colors.surface,
  },
  inspiredAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPush: {
    gap: 12,
    paddingTop: 28,
    paddingBottom: 8,
    alignItems: 'stretch',
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceMuted,
  },
  bottomTitle: {
    textAlign: 'center',
    marginBottom: 4,
  },
  secondaryBtn: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.lime,
    borderRadius: BioBlixRadii.md,
  },
  browseBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});
