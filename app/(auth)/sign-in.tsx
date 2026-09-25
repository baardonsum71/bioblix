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
const AUTH_BUILD = 'auth-v5-apple';

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
      errors?: { longMessage?: string; message?: string; code?: string }[];
    };
    const first = e.errors?.[0];
    if (first?.longMessage) return first.longMessage;
    if (first?.message) return first.message;
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
  const codeSentRef = useRef(false);

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

  const onAppleSignIn = useCallback(async () => {
    setFormError(null);
    if (!requireLegal()) return;

    setAppleBusy(true);
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

      // Apple often omits name — collect missing required fields, then finalize.
      if (
        ssoSignUp?.status === 'missing_requirements' ||
        signUp.status === 'missing_requirements'
      ) {
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
  }, [requireLegal, startSSOFlow, navigateAfterAuth, signUp.status]);

  const onCompleteAppleProfile = useCallback(async () => {
    setFormError(null);
    const first = firstName.trim();
    const last = lastName.trim();
    const username = nick.trim().toLowerCase().replace(/\s+/g, '');

    if (!first || !last) {
      setFormError('Fyll inn fornavn og etternavn for å fullføre Apple-innlogging.');
      return;
    }

    setAppleBusy(true);
    try {
      const patch: {
        firstName: string;
        lastName: string;
        username?: string;
        unsafeMetadata?: Record<string, string>;
      } = {
        firstName: first,
        lastName: last,
        unsafeMetadata: {
          acceptedPrivacyAt: new Date().toISOString(),
          ...(username ? { nickname: username } : {}),
        },
      };
      if (username.length >= 3) {
        patch.username = username;
      }

      const { error } = await signUp.update(patch);
      if (error) {
        // Username may be disabled — retry without it.
        const { error: retryError } = await signUp.update({
          firstName: first,
          lastName: last,
          unsafeMetadata: patch.unsafeMetadata,
        });
        if (retryError) {
          setFormError(clerkErrMessage(retryError, signUpErrors.fields));
          return;
        }
      }

      if (signUp.status === 'complete') {
        await signUp.finalize({ navigate: navigateAfterAuth });
        return;
      }

      setFormError(
        `Mangler fortsatt felt (${(signUp.missingFields ?? []).join(', ') || signUp.status}).`
      );
    } catch (err) {
      setFormError(clerkErrMessage(err, signUpErrors.fields));
    } finally {
      setAppleBusy(false);
    }
  }, [
    firstName,
    lastName,
    nick,
    signUp,
    signUpErrors.fields,
    navigateAfterAuth,
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
                ? 'Apple delte ikke navn. Fyll inn fornavn og etternavn for å fortsette.'
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
              <Field label="Kallenavn / nick (valgfritt)">
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
