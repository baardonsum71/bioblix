import { useAuth, useSignIn, useSignUp } from '@clerk/expo';
import { useSSO } from '@clerk/expo/experimental';
import { Link, Redirect, type Href, useRouter } from 'expo-router';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import {
  BioBlixGradientButton,
  BioBlixLogo,
  BioBlixScreenShell,
} from '@/components/bioblix/BioBlixLogo';
import { isClerkConfigured } from '@/components/bioblix/BioBlixProviders';
import {
  BioBlixPalette,
  BioBlixRadii,
  BioBlixSpacing,
} from '@/constants/bioblixTheme';

/** Bump when auth flow changes — visible on screen to confirm Vercel build. */
const AUTH_BUILD = 'auth-v10-apple';

type Step = 'form' | 'verify' | 'apple-continue';
type Mode = 'sign-up' | 'sign-in';
type VerifyKind = 'sign-up' | 'sign-in';

function clerkErrMessage(
  err: unknown,
  fields?: { code?: { message?: string } | null } | null,
  fallback = 'Ugyldig kode. Prøv igjen.'
): string {
  if (fields?.code?.message) return fields.code.message;
  if (err && typeof err === 'object') {
    const e = err as {
      message?: string;
      errors?: {
        longMessage?: string;
        message?: string;
        code?: string;
        meta?: { paramName?: string };
      }[];
    };
    const first = e.errors?.[0];
    const param = first?.meta?.paramName;
    if (first?.longMessage) {
      return param ? `${first.longMessage} (${param})` : first.longMessage;
    }
    if (first?.message) {
      return param ? `${first.message} (${param})` : first.message;
    }
    if (e.message) return e.message;
  }
  return fallback;
}

export default function BioBlixSignInScreen() {
  if (!isClerkConfigured) {
    return (
      <View style={styles.container}>
        <BioBlixText variant="display">Auth ikke klar</BioBlixText>
        <BioBlixText variant="body" color={BioBlixPalette.muted}>
          Sett EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY i .env (og CLERK_SECRET_KEY på
          server) for å opprette profil.
        </BioBlixText>
      </View>
    );
  }

  return <BioBlixSignInForm />;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <BioBlixText variant="label" color={BioBlixPalette.fog}>
        {label}
      </BioBlixText>
      {children}
    </View>
  );
}

function BioBlixSignInForm() {
  const router = useRouter();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { signIn, errors: signInErrors, fetchStatus: signInStatus } = useSignIn();
  const { signUp, errors: signUpErrors, fetchStatus: signUpStatus } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [mode, setMode] = useState<Mode>('sign-up');
  const [nick, setNick] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [code, setCode] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [verifyKind, setVerifyKind] = useState<VerifyKind>('sign-up');
  const [formError, setFormError] = useState<string | null>(null);
  const [appleBusy, setAppleBusy] = useState(false);
  const [appleMissingFields, setAppleMissingFields] = useState<string[]>([]);
  const codeSentRef = useRef(false);
  /** SSO returns its own signUp instance — keep it for the continue step. */
  const appleSignUpRef = useRef<typeof signUp | null>(null);

  const busy =
    appleBusy ||
    signInStatus === 'fetching' ||
    signUpStatus === 'fetching';
  const canSubmit = acceptedLegal && !busy;

  /** Prefer live Clerk status over React state (avoids stale sign-up verify). */
  const activeVerifyKind: VerifyKind =
    signIn.status === 'needs_client_trust' ||
    signIn.status === 'needs_second_factor'
      ? 'sign-in'
      : verifyKind;

  const beginSignInEmailVerify = useCallback(async () => {
    const { error } = await signIn.mfa.sendEmailCode();
    if (error) {
      setFormError(clerkErrMessage(error, signInErrors.fields));
      return false;
    }
    codeSentRef.current = true;
    setVerifyKind('sign-in');
    setStep('verify');
    setCode('');
    return true;
  }, [signIn, signInErrors.fields]);

  const navigateAfterAuth = useCallback(
    ({
      session,
      decorateUrl,
    }: {
      session?: { currentTask?: unknown } | null;
      decorateUrl: (url: string) => string;
    }) => {
      if (session?.currentTask) return;
      const url = decorateUrl('/(tabs)/profile');
      if (url.startsWith('http') && Platform.OS === 'web') {
        window.location.href = url;
        return;
      }
      router.replace('/(tabs)/profile' as Href);
    },
    [router]
  );

  const requireLegal = useCallback(() => {
    if (!acceptedLegal) {
      setFormError('Du må godta vilkår og personvernerklæring først.');
      return false;
    }
    return true;
  }, [acceptedLegal]);

  const finishAppleSignUp = useCallback(
    async (
      active: NonNullable<typeof appleSignUpRef.current>,
      opts?: { first?: string; last?: string; nickname?: string }
    ): Promise<string | null> => {
      const missingList = () =>
        (active.missingFields ?? []).map((f) => String(f));
      const missing = () => new Set(missingList());

      // If Clerk reports no missing fields, only finalize — do not PATCH
      // (legalAccepted/firstName on disabled attrs → "expected pattern").
      if (
        String(active.status) === 'missing_requirements' &&
        missingList().length === 0
      ) {
        appleSignUpRef.current = null;
        const { error: finError } = await active.finalize({
          navigate: navigateAfterAuth,
        });
        if (finError) {
          // One more try: accept legal only if finalize hinted at it.
          const { error: legalError } = await active.update({
            legalAccepted: true,
          });
          if (!legalError) {
            const { error: fin2 } = await active.finalize({
              navigate: navigateAfterAuth,
            });
            if (!fin2) return null;
            return clerkErrMessage(fin2, null, 'Kunne ikke fullføre sesjon.');
          }
          return clerkErrMessage(
            finError,
            null,
            'Kunne ikke fullføre Apple-sesjon. Prøv «Start på nytt» eller e-post-innlogging.'
          );
        }
        return null;
      }

      const patch: {
        firstName?: string;
        lastName?: string;
        legalAccepted?: boolean;
      } = {};
      const m0 = missing();
      if (m0.has('first_name') && opts?.first) patch.firstName = opts.first;
      if (m0.has('last_name') && opts?.last) patch.lastName = opts.last;
      if (m0.has('legal_accepted')) patch.legalAccepted = true;

      if (Object.keys(patch).length > 0) {
        const { error } = await active.update(patch);
        if (error) {
          return clerkErrMessage(error, null, 'Kunne ikke oppdatere Apple-profil.');
        }
      }

      if (missing().has('username')) {
        const fromEmail = (active.emailAddress ?? '')
          .split('@')[0]
          ?.toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .slice(0, 20);
        const nickSafe = (opts?.nickname ?? '')
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '')
          .slice(0, 20);
        const candidate = (
          nickSafe ||
          fromEmail ||
          `user${Date.now().toString(36)}`
        ).slice(0, 20);
        const { error: userError } = await active.update({
          username: candidate.length >= 4 ? candidate : `${candidate}11`,
        });
        if (userError) {
          return clerkErrMessage(
            userError,
            null,
            'Brukernavn avvist. Hold Username av i Clerk.'
          );
        }
      }

      if (missing().has('password')) {
        return 'Clerk krever passord etter Apple. Slå av Passord som påkrevd, eller bruk e-post.';
      }

      setAppleMissingFields(missingList());

      if (
        String(active.status) === 'complete' ||
        missingList().length === 0
      ) {
        appleSignUpRef.current = null;
        const { error: finError } = await active.finalize({
          navigate: navigateAfterAuth,
        });
        if (finError) {
          return clerkErrMessage(finError, null, 'Kunne ikke fullføre sesjon.');
        }
        if (opts?.nickname) {
          // Metadata after session exists is best-effort via profile sync.
        }
        return null;
      }

      return (
        `Mangler fortsatt: ${missingList().join(', ') || String(active.status)}.`
      );
    },
    [navigateAfterAuth]
  );

  const onAppleSignIn = useCallback(async () => {
    setFormError(null);
    if (!requireLegal()) return;

    setAppleBusy(true);
    appleSignUpRef.current = null;
    setAppleMissingFields([]);
    try {
      const { createdSessionId, signUp: ssoSignUp } = await startSSOFlow({
        strategy: 'oauth_apple',
        unsafeMetadata: {
          acceptedPrivacyAt: new Date().toISOString(),
        },
      });

      if (createdSessionId) {
        navigateAfterAuth({
          session: null,
          decorateUrl: (url) => url,
        });
        return;
      }

      const activeSignUp = ssoSignUp ?? signUp;
      if (activeSignUp?.status === 'missing_requirements') {
        appleSignUpRef.current = activeSignUp;
        const missing = (activeSignUp.missingFields ?? []).map((f) => String(f));
        setAppleMissingFields(missing);

        const needsName =
          missing.includes('first_name') || missing.includes('last_name');

        // Names disabled in Clerk → finish without the name form.
        if (!needsName) {
          const err = await finishAppleSignUp(activeSignUp, {
            nickname: nick.trim().toLowerCase().replace(/\s+/g, '') || undefined,
          });
          if (err) {
            setFormError(err);
            setStep('apple-continue');
          }
          return;
        }

        setStep('apple-continue');
        setFormError(null);
        return;
      }
      // User cancelled or closed the sheet — silent.
    } catch (err) {
      setFormError(
        clerkErrMessage(err, null, 'Apple-innlogging feilet. Sjekk at Apple er på i Clerk.')
      );
    } finally {
      setAppleBusy(false);
    }
  }, [
    requireLegal,
    startSSOFlow,
    navigateAfterAuth,
    signUp,
    finishAppleSignUp,
    nick,
  ]);

  const onCompleteAppleProfile = useCallback(async () => {
    setFormError(null);
    const first = firstName.trim();
    const last = lastName.trim();
    const nickname = nick.trim().toLowerCase().replace(/\s+/g, '');
    const active = appleSignUpRef.current;
    const missing = new Set(
      (active?.missingFields ?? appleMissingFields).map((f) => String(f))
    );
    const needsName =
      missing.has('first_name') || missing.has('last_name');

    if (needsName && (!first || !last)) {
      setFormError('Fyll inn fornavn og etternavn for å fullføre Apple-innlogging.');
      return;
    }

    if (!active) {
      setFormError(
        'Apple-sesjonen mangler. Trykk «Start på nytt» og prøv igjen.'
      );
      return;
    }

    const statusBefore = String(active.status);
    if (statusBefore !== 'missing_requirements' && statusBefore !== 'complete') {
      setFormError(
        `Apple-sesjonen er ugyldig (${statusBefore}). Trykk «Start på nytt» og prøv igjen.`
      );
      return;
    }

    setAppleBusy(true);
    try {
      const err = await finishAppleSignUp(active, {
        first: needsName ? first : undefined,
        last: needsName ? last : undefined,
        nickname: nickname || undefined,
      });
      if (err) setFormError(err);
    } catch (err) {
      setFormError(clerkErrMessage(err, null));
    } finally {
      setAppleBusy(false);
    }
  }, [
    firstName,
    lastName,
    nick,
    appleMissingFields,
    finishAppleSignUp,
  ]);

  const onCreateAccount = useCallback(async () => {
    setFormError(null);
    codeSentRef.current = false;
    if (!requireLegal()) return;

    const emailAddress = email.trim().toLowerCase();
    const username = nick.trim().toLowerCase().replace(/\s+/g, '');
    const first = firstName.trim();
    const last = lastName.trim();

    if (!username || username.length < 3) {
      setFormError('Kallenavn må være minst 3 tegn (uten mellomrom).');
      return;
    }
    if (!first || !last) {
      setFormError('Fyll inn fornavn og etternavn.');
      return;
    }
    if (!emailAddress || !password) {
      setFormError('Skriv inn e-post og passord.');
      return;
    }
    if (password.length < 8) {
      setFormError('Passord må være minst 8 tegn.');
      return;
    }

    const payload = {
      emailAddress,
      password,
      firstName: first,
      lastName: last,
      username,
      unsafeMetadata: {
        nickname: username,
        acceptedPrivacyAt: new Date().toISOString(),
      },
    };

    let { error: signUpError } = await signUp.password(payload);

    // Username may be disabled in Clerk Dashboard — retry without it.
    if (signUpError) {
      const msg = String(signUpError.message ?? '').toLowerCase();
      const codeName =
        (signUpError as { code?: string; errors?: { code?: string }[] }).code ??
        (signUpError as { errors?: { code?: string }[] }).errors?.[0]?.code;
      const usernameNotSupported =
        codeName === 'form_param_unknown' ||
        codeName === 'form_param_nil' ||
        msg.includes('username');

      if (usernameNotSupported) {
        const retry = await signUp.password({
          emailAddress,
          password,
          firstName: first,
          lastName: last,
          unsafeMetadata: {
            nickname: username,
            acceptedPrivacyAt: new Date().toISOString(),
          },
        });
        signUpError = retry.error;
      }
    }

    if (signUpError) {
      setFormError(
        signUpErrors.fields?.username?.message ??
          signUpErrors.fields?.emailAddress?.message ??
          signUpErrors.fields?.password?.message ??
          signUpErrors.fields?.firstName?.message ??
          signUpError.message ??
          'Kunne ikke opprette konto.'
      );
      return;
    }

    await signUp.verifications.sendEmailCode();
    codeSentRef.current = true;
    if (signUp.unverifiedFields?.includes('email_address')) {
      setVerifyKind('sign-up');
      setStep('verify');
      setCode('');
    } else {
      await signUp.finalize({ navigate: navigateAfterAuth });
    }
  }, [
    requireLegal,
    email,
    password,
    nick,
    firstName,
    lastName,
    signUp,
    signUpErrors,
    navigateAfterAuth,
  ]);

  const onSignIn = useCallback(async () => {
    setFormError(null);
    codeSentRef.current = false;
    if (!requireLegal()) return;

    const emailAddress = email.trim().toLowerCase();
    if (!emailAddress || !password) {
      setFormError('Skriv inn e-post og passord.');
      return;
    }

    const { error } = await signIn.password({ emailAddress, password });
    if (error) {
      setFormError(
        signInErrors.fields?.identifier?.message ??
          signInErrors.fields?.password?.message ??
          error.message ??
          'Innlogging feilet.'
      );
      return;
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({ navigate: navigateAfterAuth });
    } else if (
      signIn.status === 'needs_client_trust' ||
      signIn.status === 'needs_second_factor'
    ) {
      // Always send via MFA email for device trust / 2FA (don't rely on factor list).
      if (!codeSentRef.current) {
        await beginSignInEmailVerify();
      } else {
        setVerifyKind('sign-in');
        setStep('verify');
      }
    } else {
      setFormError(
        `Innlogging stoppet (status: ${String(signIn.status)}). Prøv Start på nytt.`
      );
    }
  }, [
    requireLegal,
    email,
    password,
    signIn,
    signInErrors,
    navigateAfterAuth,
    beginSignInEmailVerify,
  ]);

  const onVerify = useCallback(async () => {
    setFormError(null);
    const trimmed = code.trim().replace(/\s+/g, '');
    if (!trimmed) {
      setFormError('Skriv inn koden fra e-posten.');
      return;
    }

    if (activeVerifyKind === 'sign-up') {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({
        code: trimmed,
      });
      if (verifyError) {
        setFormError(clerkErrMessage(verifyError, signUpErrors.fields));
        return;
      }
      await signUp.finalize({ navigate: navigateAfterAuth });
      return;
    }

    const { error: mfaError } = await signIn.mfa.verifyEmailCode({
      code: trimmed,
    });
    if (mfaError) {
      setFormError(
        `${clerkErrMessage(mfaError, signInErrors.fields)} Bruk den nyeste koden, eller trykk «Send ny kode».`
      );
      return;
    }
    if (signIn.status === 'complete') {
      await signIn.finalize({ navigate: navigateAfterAuth });
    } else {
      setFormError(
        `Bekreftelse ikke fullført (status: ${String(signIn.status)}). Send ny kode.`
      );
    }
  }, [
    code,
    activeVerifyKind,
    signIn,
    signUp,
    signInErrors,
    signUpErrors,
    navigateAfterAuth,
  ]);

  const onResendCode = useCallback(async () => {
    setFormError(null);
    setCode('');
    if (activeVerifyKind === 'sign-up') {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) {
        setFormError(clerkErrMessage(error, signUpErrors.fields));
        return;
      }
    } else {
      const { error } = await signIn.mfa.sendEmailCode();
      if (error) {
        setFormError(clerkErrMessage(error, signInErrors.fields));
        return;
      }
    }
    codeSentRef.current = true;
    setFormError(null);
  }, [
    activeVerifyKind,
    signIn,
    signUp,
    signInErrors.fields,
    signUpErrors.fields,
  ]);

  if (!authLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={BioBlixPalette.aurora} />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)/profile" />;
  }

  return (
    <BioBlixScreenShell>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <BioBlixLogo variant="wordmark" size={108} style={styles.logo} />
          <BioBlixText variant="display">
            {step === 'verify'
              ? 'Bekreft e-post'
              : step === 'apple-continue'
                ? 'Fullfør Apple-konto'
                : mode === 'sign-up'
                  ? 'Opprett konto'
                  : 'Logg inn'}
          </BioBlixText>
          <BioBlixText variant="body" color={BioBlixPalette.muted} style={styles.copy}>
            {step === 'verify'
              ? 'Vi sendte en kode til e-posten din.'
              : step === 'apple-continue'
                ? appleMissingFields.some((f) =>
                      f === 'first_name' || f === 'last_name'
                    )
                  ? 'Apple delte ikke navn. Fyll inn fornavn og etternavn for å fortsette.'
                  : 'Ett steg igjen for å aktivere Apple-kontoen. Trykk Fullfør.'
                : mode === 'sign-up'
                  ? 'Velg kallenavn og fyll inn navn for å komme i gang.'
                  : 'Logg inn med e-post og passord.'}
          </BioBlixText>

          <View nativeID="clerk-captcha" />

          {step === 'form' ? (
            <>
              <View style={styles.modeRow}>
                <Pressable
                  onPress={() => {
                    setMode('sign-up');
                    setFormError(null);
                  }}
                  style={[
                    styles.modeChip,
                    mode === 'sign-up' && styles.modeChipActive,
                  ]}
                >
                  <BioBlixText
                    variant="label"
                    color={
                      mode === 'sign-up'
                        ? BioBlixPalette.night
                        : BioBlixPalette.muted
                    }
                  >
                    Ny konto
                  </BioBlixText>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setMode('sign-in');
                    setFormError(null);
                  }}
                  style={[
                    styles.modeChip,
                    mode === 'sign-in' && styles.modeChipActive,
                  ]}
                >
                  <BioBlixText
                    variant="label"
                    color={
                      mode === 'sign-in'
                        ? BioBlixPalette.night
                        : BioBlixPalette.muted
                    }
                  >
                    Logg inn
                  </BioBlixText>
                </Pressable>
              </View>

              {mode === 'sign-up' ? (
                <>
                  <Field label="Kallenavn / nick">
                    <TextInput
                      autoCapitalize="none"
                      autoComplete="username"
                      placeholder="f.eks. blekkulf"
                      placeholderTextColor={BioBlixPalette.muted}
                      style={styles.input}
                      value={nick}
                      onChangeText={setNick}
                    />
                  </Field>
                  <Field label="Fornavn">
                    <TextInput
                      autoComplete="given-name"
                      placeholder="Fornavn"
                      placeholderTextColor={BioBlixPalette.muted}
                      style={styles.input}
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                  </Field>
                  <Field label="Etternavn">
                    <TextInput
                      autoComplete="family-name"
                      placeholder="Etternavn"
                      placeholderTextColor={BioBlixPalette.muted}
                      style={styles.input}
                      value={lastName}
                      onChangeText={setLastName}
                    />
                  </Field>
                </>
              ) : null}

              <Field label="E-post">
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder="deg@epost.no"
                  placeholderTextColor={BioBlixPalette.muted}
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                />
              </Field>

              <Field label="Passord">
                <View style={styles.passwordRow}>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete={
                      mode === 'sign-up' ? 'new-password' : 'password'
                    }
                    placeholder="Passord"
                    placeholderTextColor={BioBlixPalette.muted}
                    secureTextEntry={!showPassword}
                    style={[styles.input, styles.passwordInput]}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    style={styles.eyeBtn}
                    accessibilityLabel={
                      showPassword ? 'Skjul passord' : 'Vis passord'
                    }
                  >
                    <BioBlixText variant="caption" color={BioBlixPalette.cyan}>
                      {showPassword ? 'Skjul' : 'Vis'}
                    </BioBlixText>
                  </Pressable>
                </View>
              </Field>

              <Pressable
                onPress={() => {
                  setAcceptedLegal((v) => !v);
                  setFormError(null);
                }}
                style={styles.legalRow}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: acceptedLegal }}
              >
                <View
                  style={[
                    styles.checkbox,
                    acceptedLegal && styles.checkboxChecked,
                  ]}
                >
                  {acceptedLegal ? (
                    <BioBlixText
                      variant="caption"
                      color={BioBlixPalette.night}
                      style={styles.checkMark}
                    >
                      ✓
                    </BioBlixText>
                  ) : null}
                </View>
                <View style={styles.legalTextWrap}>
                  <BioBlixText variant="caption" color={BioBlixPalette.fog}>
                    Jeg godtar{' '}
                  </BioBlixText>
                  <Link href="/privacy">
                    <BioBlixText
                      variant="caption"
                      color={BioBlixPalette.cyan}
                      style={styles.legalLink}
                    >
                      personvernerklæringen
                    </BioBlixText>
                  </Link>
                  <BioBlixText variant="caption" color={BioBlixPalette.fog}>
                    {' '}
                    og vilkårene for bruk
                  </BioBlixText>
                </View>
              </Pressable>

              <Pressable
                disabled={!canSubmit}
                onPress={() => void onAppleSignIn()}
                style={[
                  styles.appleBtn,
                  !canSubmit && styles.appleBtnDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Fortsett med Apple"
              >
                {appleBusy ? (
                  <ActivityIndicator color={BioBlixPalette.fog} />
                ) : (
                  <BioBlixText variant="label" color={BioBlixPalette.fog}>
                    Fortsett med Apple
                  </BioBlixText>
                )}
              </Pressable>

              <View style={styles.orRow}>
                <View style={styles.orLine} />
                <BioBlixText variant="caption" color={BioBlixPalette.muted}>
                  eller e-post
                </BioBlixText>
                <View style={styles.orLine} />
              </View>

              <BioBlixGradientButton
                label={mode === 'sign-up' ? 'Opprett konto' : 'Logg inn'}
                disabled={!canSubmit}
                loading={busy && !appleBusy}
                onPress={() =>
                  void (mode === 'sign-up' ? onCreateAccount() : onSignIn())
                }
                style={styles.cta}
              />

              <BioBlixText
                variant="caption"
                color={BioBlixPalette.muted}
                style={styles.legalFoot}
              >
                Ved å fortsette bekrefter du at du har lest vår personvernpolicy.
              </BioBlixText>
            </>
          ) : step === 'apple-continue' ? (
            <>
              {(appleMissingFields.length > 0 ? (
                <BioBlixText variant="caption" color={BioBlixPalette.muted}>
                  Clerk mangler: {appleMissingFields.join(', ')}
                </BioBlixText>
              ) : (
                <BioBlixText variant="caption" color={BioBlixPalette.muted}>
                  Status: {String(appleSignUpRef.current?.status ?? 'ukjent')}
                </BioBlixText>
              ))}
              <Field label="Kallenavn / nick (valgfritt)">
                <TextInput
                  autoCapitalize="none"
                  autoComplete="off"
                  placeholder="f.eks. blekkulf"
                  placeholderTextColor={BioBlixPalette.muted}
                  style={styles.input}
                  value={nick}
                  onChangeText={setNick}
                />
              </Field>
              <Field label="Fornavn">
                <TextInput
                  autoComplete="given-name"
                  autoCapitalize="words"
                  placeholder="Fornavn"
                  placeholderTextColor={BioBlixPalette.muted}
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </Field>
              <Field label="Etternavn">
                <TextInput
                  autoComplete="family-name"
                  autoCapitalize="words"
                  placeholder="Etternavn"
                  placeholderTextColor={BioBlixPalette.muted}
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </Field>
              <BioBlixGradientButton
                label="Fullfør og fortsett"
                disabled={busy}
                loading={appleBusy}
                onPress={() => void onCompleteAppleProfile()}
                style={styles.cta}
              />
              <Pressable
                onPress={() => {
                  signIn.reset();
                  signUp.reset();
                  appleSignUpRef.current = null;
                  setAppleMissingFields([]);
                  setStep('form');
                  setFormError(null);
                }}
                style={styles.linkBtn}
              >
                <BioBlixText variant="caption" color={BioBlixPalette.cyan}>
                  Start på nytt
                </BioBlixText>
              </Pressable>
            </>
          ) : (
            <>
              <Field label="Kode fra e-post">
                <TextInput
                  autoCapitalize="none"
                  keyboardType="number-pad"
                  placeholder="6-sifret kode"
                  placeholderTextColor={BioBlixPalette.muted}
                  style={styles.input}
                  value={code}
                  onChangeText={setCode}
                />
              </Field>
              <BioBlixGradientButton
                label="Bekreft og fortsett"
                disabled={busy}
                loading={busy}
                onPress={() => void onVerify()}
                style={styles.cta}
              />
              <Pressable
                disabled={busy}
                onPress={() => void onResendCode()}
                style={styles.linkBtn}
              >
                <BioBlixText variant="caption" color={BioBlixPalette.cyan}>
                  Send ny kode
                </BioBlixText>
              </Pressable>
              <Pressable
                onPress={() => {
                  signIn.reset();
                  signUp.reset();
                  codeSentRef.current = false;
                  setStep('form');
                  setVerifyKind('sign-up');
                  setCode('');
                  setFormError(null);
                }}
                style={styles.linkBtn}
              >
                <BioBlixText variant="caption" color={BioBlixPalette.cyan}>
                  Start på nytt
                </BioBlixText>
              </Pressable>
              <BioBlixText variant="caption" color={BioBlixPalette.muted}>
                Bruk kun den nyeste koden i innboksen ({activeVerifyKind}).
              </BioBlixText>
            </>
          )}

          {formError ? (
            <BioBlixText variant="caption" color={BioBlixPalette.danger}>
              {formError}
            </BioBlixText>
          ) : null}

          <BioBlixText variant="caption" color={BioBlixPalette.muted} style={styles.build}>
            {AUTH_BUILD}
          </BioBlixText>
        </ScrollView>
      </KeyboardAvoidingView>
    </BioBlixScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 28,
    paddingVertical: 48,
    gap: 12,
  },
  logo: {
    marginBottom: 4,
  },
  copy: {
    maxWidth: 400,
    marginBottom: 4,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BioBlixRadii.pill,
    borderWidth: 1,
    borderColor: BioBlixPalette.hairline,
    backgroundColor: BioBlixPalette.panel,
  },
  modeChipActive: {
    backgroundColor: BioBlixPalette.cyan,
    borderColor: BioBlixPalette.cyan,
  },
  field: {
    gap: 6,
  },
  input: {
    backgroundColor: BioBlixPalette.panel,
    borderWidth: 1,
    borderColor: BioBlixPalette.hairline,
    borderRadius: BioBlixRadii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: BioBlixPalette.fog,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
  },
  passwordRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 64,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 4,
    paddingVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: BioBlixPalette.cyan,
    backgroundColor: BioBlixPalette.panel,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: BioBlixPalette.cyan,
  },
  checkMark: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'DMSans_700Bold',
  },
  legalTextWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  legalLink: {
    textDecorationLine: 'underline',
  },
  cta: {
    marginTop: BioBlixSpacing.sm,
  },
  appleBtn: {
    marginTop: BioBlixSpacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: BioBlixRadii.md,
    borderWidth: 1,
    borderColor: BioBlixPalette.hairline,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
  },
  appleBtnDisabled: {
    opacity: 0.45,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: BioBlixPalette.hairline,
  },
  legalFoot: {
    textAlign: 'center',
    marginTop: 4,
  },
  linkBtn: {
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  build: {
    marginTop: 16,
    opacity: 0.5,
  },
});
