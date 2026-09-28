import { useAuth, useSignIn, useSignUp } from '@clerk/expo';
import { useSSO } from '@clerk/expo/experimental';
import { Link, Redirect, type Href, useLocalSearchParams, useRouter } from 'expo-router';
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
import { CountryPicker } from '@/components/bioblix/CountryPicker';
import {
  isSignInReason,
  signInReasonBodyKey,
} from '@/lib/auth/signInGate';
import { useI18n } from '@/lib/i18n';
import { isAllowedCountry } from '@/lib/i18n/countries';
import { MIN_AGE, isAtLeastAge } from '@/lib/validation/age';

/** Bump when auth flow changes — visible on screen to confirm Vercel build. */
const AUTH_BUILD = 'auth-v15-free-profile';

type Step = 'form' | 'verify' | 'apple-continue';
type Mode = 'sign-up' | 'sign-in';
type VerifyKind = 'sign-up' | 'sign-in';

function clerkErrMessage(
  err: unknown,
  fields?: { code?: { message?: string } | null } | null,
  fallback = 'Invalid code. Try again.'
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

function ClerkNotConfigured() {
  const { t } = useI18n();
  return (
    <View style={styles.container}>
      <BioBlixText variant="display">{t('auth.notReady')}</BioBlixText>
      <BioBlixText variant="body" color={BioBlixPalette.muted}>
        {t('auth.clerkKeyMissing')}
      </BioBlixText>
    </View>
  );
}

export default function BioBlixSignInScreen() {
  if (!isClerkConfigured) {
    return <ClerkNotConfigured />;
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
  const { reason: reasonParam } = useLocalSearchParams<{ reason?: string }>();
  const signInReason = isSignInReason(reasonParam) ? reasonParam : null;
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { signIn, errors: signInErrors, fetchStatus: signInStatus } = useSignIn();
  const { signUp, errors: signUpErrors, fetchStatus: signUpStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const { t, setCountryCode: setI18nCountry } = useI18n();

  const [mode, setMode] = useState<Mode>('sign-up');
  const [nick, setNick] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [countryCode, setCountryCode] = useState<string | null>(null);
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
      setFormError(t('auth.acceptLegal'));
      return false;
    }
    return true;
  }, [acceptedLegal, t]);

  const finishAppleSignUp = useCallback(
    async (
      active: NonNullable<typeof appleSignUpRef.current>,
      opts?: {
        first?: string;
        last?: string;
        nickname?: string;
        birthDate?: string;
        countryCode?: string;
      }
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
        if (opts?.birthDate || opts?.nickname || opts?.countryCode) {
          await active.update({
            unsafeMetadata: {
              ...(typeof active.unsafeMetadata === 'object' &&
              active.unsafeMetadata
                ? active.unsafeMetadata
                : {}),
              ...(opts.nickname ? { nickname: opts.nickname } : {}),
              ...(opts.birthDate
                ? {
                    birthDate: opts.birthDate,
                    ageConfirmedAt: new Date().toISOString(),
                  }
                : {}),
              ...(opts.countryCode ? { countryCode: opts.countryCode } : {}),
            },
          });
        }
        const { error: finError } = await active.finalize({
          navigate: navigateAfterAuth,
        });
        if (!finError) {
          appleSignUpRef.current = null;
          return null;
        }
        // No session yet — do not clear ref; ask user to restart Apple (web uses redirect flow).
        return (
          clerkErrMessage(finError, null) +
           t('auth.appleRetry')
        );
      }

      const patch: {
        firstName?: string;
        lastName?: string;
        legalAccepted?: boolean;
        unsafeMetadata?: Record<string, unknown>;
      } = {};
      const m0 = missing();
      if (m0.has('first_name') && opts?.first) patch.firstName = opts.first;
      if (m0.has('last_name') && opts?.last) patch.lastName = opts.last;
      if (m0.has('legal_accepted')) patch.legalAccepted = true;
      if (opts?.birthDate || opts?.nickname || opts?.countryCode) {
        patch.unsafeMetadata = {
          ...(typeof active.unsafeMetadata === 'object' && active.unsafeMetadata
            ? (active.unsafeMetadata as Record<string, unknown>)
            : {}),
          ...(opts.nickname ? { nickname: opts.nickname } : {}),
          ...(opts.birthDate
            ? {
                birthDate: opts.birthDate,
                ageConfirmedAt: new Date().toISOString(),
              }
            : {}),
          ...(opts.countryCode ? { countryCode: opts.countryCode } : {}),
        };
      }

      if (Object.keys(patch).length > 0) {
        const { error } = await active.update(patch);
        if (error) {
          return clerkErrMessage(error, null, t('auth.appleUpdateFail'));
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
            t('auth.usernameRejected')
          );
        }
      }

      if (missing().has('password')) {
        return t('auth.clerkPasswordRequired');
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
          return clerkErrMessage(finError, null, t('auth.sessionFail'));
        }
        if (opts?.nickname) {
          // Metadata after session exists is best-effort via profile sync.
        }
        return null;
      }

      return (
        t('auth.stillMissing', { fields: missingList().join(', ') || String(active.status) })
      );
    },
    [navigateAfterAuth, t]
  );

  const onAppleSignIn = useCallback(async () => {
    setFormError(null);
    if (!requireLegal()) return;
    if (mode === 'sign-up') {
      if (!countryCode || !isAllowedCountry(countryCode)) {
        setFormError(t('auth.countryRequired'));
        return;
      }
    }

    setAppleBusy(true);
    appleSignUpRef.current = null;
    setAppleMissingFields([]);
    try {
      // Web: full-page OAuth via future API (reliable session + callback).
      if (Platform.OS === 'web') {
        const origin =
          typeof window !== 'undefined' ? window.location.origin : '';
        const { error } = await signIn.sso({
          strategy: 'oauth_apple',
          redirectUrl: origin ? `${origin}/profile` : '/profile',
          redirectCallbackUrl: origin
            ? `${origin}/sso-callback`
            : '/sso-callback',
        });
        if (error) {
          setFormError(
            clerkErrMessage(
              error,
              signInErrors.fields,
              t('auth.appleFail')
            )
          );
        }
        // On success the browser navigates away to Apple / sso-callback.
        return;
      }

      // Native: AuthSession browser flow.
      const { createdSessionId, signUp: ssoSignUp } = await startSSOFlow({
        strategy: 'oauth_apple',
        unsafeMetadata: {
          acceptedPrivacyAt: new Date().toISOString(),
          ...(countryCode ? { countryCode } : {}),
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

        if (!needsName) {
          const err = await finishAppleSignUp(activeSignUp, {
            nickname: nick.trim().toLowerCase().replace(/\s+/g, '') || undefined,
            countryCode: countryCode ?? undefined,
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
    } catch (err) {
      setFormError(
        clerkErrMessage(err, null, t('auth.appleFail'))
      );
    } finally {
      setAppleBusy(false);
    }
  }, [
    requireLegal,
    mode,
    countryCode,
    t,
    startSSOFlow,
    navigateAfterAuth,
    signUp,
    signIn,
    signInErrors.fields,
    finishAppleSignUp,
    nick,
  ]);

  const onCompleteAppleProfile = useCallback(async () => {
    setFormError(null);
    const first = firstName.trim();
    const last = lastName.trim();
    const nickname = nick.trim().toLowerCase().replace(/\s+/g, '');
    const ageCheck = isAtLeastAge(birthDate);
    if (!ageCheck.ok) {
      setFormError(
        ageCheck.code === 'auth.ageTooYoung'
          ? t(ageCheck.code, { age: ageCheck.age ?? MIN_AGE })
          : t(ageCheck.code)
      );
      return;
    }
    if (!countryCode || !isAllowedCountry(countryCode)) {
      setFormError(t('auth.countryRequired'));
      return;
    }
    const active = appleSignUpRef.current;
    const missing = new Set(
      (active?.missingFields ?? appleMissingFields).map((f) => String(f))
    );
    const needsName =
      missing.has('first_name') || missing.has('last_name');

    if (needsName && (!first || !last)) {
      setFormError(t('auth.fillName'));
      return;
    }

    if (!active) {
      setFormError(
        t('auth.appleSessionMissing')
      );
      return;
    }

    const statusBefore = String(active.status);
    if (statusBefore !== 'missing_requirements' && statusBefore !== 'complete') {
      setFormError(
        t('auth.appleSessionInvalid', { status: statusBefore })
      );
      return;
    }

    setAppleBusy(true);
    try {
      const err = await finishAppleSignUp(active, {
        first: needsName ? first : undefined,
        last: needsName ? last : undefined,
        nickname: nickname || undefined,
        birthDate: ageCheck.birthDate,
        countryCode,
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
    birthDate,
    countryCode,
    t,
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

    if (!countryCode || !isAllowedCountry(countryCode)) {
      setFormError(t('auth.countryRequired'));
      return;
    }

    const ageCheck = isAtLeastAge(birthDate);
    if (!ageCheck.ok) {
      setFormError(
        ageCheck.code === 'auth.ageTooYoung'
          ? t(ageCheck.code, { age: ageCheck.age ?? MIN_AGE })
          : t(ageCheck.code)
      );
      return;
    }

    if (!username || username.length < 3) {
      setFormError(t('auth.nicknameShort'));
      return;
    }
    if (!first || !last) {
      setFormError(t('auth.fillNames'));
      return;
    }
    if (!emailAddress || !password) {
      setFormError(t('auth.fillEmailPassword'));
      return;
    }
    if (password.length < 8) {
      setFormError(t('auth.passwordShort'));
      return;
    }

    const meta = {
      nickname: username,
      birthDate: ageCheck.birthDate,
      ageConfirmedAt: new Date().toISOString(),
      countryCode,
      acceptedPrivacyAt: new Date().toISOString(),
    };

    type SignUpPayload = {
      emailAddress: string;
      password: string;
      firstName?: string;
      lastName?: string;
      username?: string;
      unsafeMetadata: typeof meta;
    };

    const attempts: SignUpPayload[] = [
      {
        emailAddress,
        password,
        firstName: first,
        lastName: last,
        username,
        unsafeMetadata: meta,
      },
      {
        emailAddress,
        password,
        firstName: first,
        lastName: last,
        unsafeMetadata: meta,
      },
      {
        emailAddress,
        password,
        unsafeMetadata: meta,
      },
    ];

    let signUpError: { message?: string; code?: string; errors?: { code?: string; message?: string; meta?: { paramName?: string } }[] } | null =
      null;

    for (const payload of attempts) {
      const result = await signUp.password(payload);
      signUpError = result.error;
      if (!signUpError) break;

      const codeName =
        signUpError.code ?? signUpError.errors?.[0]?.code ?? '';
      const param = (
        signUpError.errors?.[0]?.meta?.paramName ?? ''
      ).toLowerCase();
      const msg = String(
        signUpError.errors?.[0]?.message ?? signUpError.message ?? ''
      ).toLowerCase();
      const isUnknownParam =
        codeName === 'form_param_unknown' ||
        codeName === 'form_param_nil' ||
        msg.includes('is unknown') ||
        msg.includes('username') ||
        param === 'username' ||
        param === 'first_name' ||
        param === 'lastname' ||
        param === 'last_name' ||
        param === 'firstName'.toLowerCase();

      if (!isUnknownParam) break;
    }

    if (signUpError) {
      const param = signUpError.errors?.[0]?.meta?.paramName;
      const detail = clerkErrMessage(signUpError, signUpErrors.fields);
      setFormError(
        param
          ? t('auth.clerkField', { param })
          : detail || t('auth.createFail')
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
    birthDate,
    countryCode,
    t,
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
      setFormError(t('auth.fillEmailPassword'));
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
        t('auth.loginStopped', { status: String(signIn.status) })
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
      setFormError(t('auth.enterCode'));
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
        `${clerkErrMessage(mfaError, signInErrors.fields)} ${t('auth.useLatestCode')}`
      );
      return;
    }
    if (signIn.status === 'complete') {
      await signIn.finalize({ navigate: navigateAfterAuth });
    } else {
      setFormError(
        t('auth.verifyIncomplete', { status: String(signIn.status) })
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
              ? t('auth.verifyEmailTitle')
              : step === 'apple-continue'
                ? t('auth.appleCompleteTitle')
                : mode === 'sign-up'
                  ? t('auth.createAccount')
                  : t('auth.signIn')}
          </BioBlixText>
          <BioBlixText variant="body" color={BioBlixPalette.muted} style={styles.copy}>
            {step === 'verify'
              ? t('auth.codeSent')
              : step === 'apple-continue'
                ? appleMissingFields.some((f) =>
                      f === 'first_name' || f === 'last_name'
                    )
                  ? t('auth.appleNameMissing')
                  : t('auth.appleOneStep')
                : signInReason
                  ? t(signInReasonBodyKey(signInReason))
                  : mode === 'sign-up'
                    ? t('auth.countryHint')
                    : t('auth.signInHint')}
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
                    {t('auth.signUp')}
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
                    {t('auth.signIn')}
                  </BioBlixText>
                </Pressable>
              </View>

              {mode === 'sign-up' ? (
                <>
                  <CountryPicker
                    label={t('auth.country')}
                    value={countryCode}
                    onChange={(code) => {
                      setCountryCode(code);
                      setI18nCountry(code);
                    }}
                  />
                  <BioBlixText
                    variant="caption"
                    color={BioBlixPalette.muted}
                    style={{ marginTop: -4, marginBottom: 4 }}
                  >
                    {t('auth.countryHint')}
                  </BioBlixText>
                  <Field label={t('auth.nickname')}>
                    <TextInput
                      autoCapitalize="none"
                      autoComplete="username"
                      placeholder="e.g. blekkulf"
                      placeholderTextColor={BioBlixPalette.muted}
                      style={styles.input}
                      value={nick}
                      onChangeText={setNick}
                    />
                  </Field>
                  <Field label={t('auth.firstName')}>
                    <TextInput
                      autoComplete="given-name"
                      placeholder={t('auth.firstName')}
                      placeholderTextColor={BioBlixPalette.muted}
                      style={styles.input}
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                  </Field>
                  <Field label={t('auth.lastName')}>
                    <TextInput
                      autoComplete="family-name"
                      placeholder={t('auth.lastName')}
                      placeholderTextColor={BioBlixPalette.muted}
                      style={styles.input}
                      value={lastName}
                      onChangeText={setLastName}
                    />
                  </Field>
                  <Field label={t('auth.birthDate', { age: MIN_AGE })}>
                    <TextInput
                      autoComplete="birthdate-full"
                      placeholder={t('auth.birthDateHint')}
                      placeholderTextColor={BioBlixPalette.muted}
                      style={styles.input}
                      value={birthDate}
                      onChangeText={setBirthDate}
                      autoCapitalize="none"
                      keyboardType="numbers-and-punctuation"
                    />
                  </Field>
                </>
              ) : null}

              <Field label={t('auth.email')}>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder="you@email.com"
                  placeholderTextColor={BioBlixPalette.muted}
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                />
              </Field>

              <Field label={t('auth.password')}>
                <View style={styles.passwordRow}>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete={
                      mode === 'sign-up' ? 'new-password' : 'password'
                    }
                    placeholder={t('auth.password')}
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
                      showPassword ? t('auth.hidePassword') : t('auth.showPassword')
                    }
                  >
                    <BioBlixText variant="caption" color={BioBlixPalette.cyan}>
                      {showPassword ? t('auth.hide') : t('auth.show')}
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
                    {t('auth.acceptPrefix')}{' '}
                  </BioBlixText>
                  <Link href="/privacy">
                    <BioBlixText
                      variant="caption"
                      color={BioBlixPalette.cyan}
                      style={styles.legalLink}
                    >
                      {t('account.privacyPolicy')}
                    </BioBlixText>
                  </Link>
                  <BioBlixText variant="caption" color={BioBlixPalette.fog}>
                    {' '}
                    {t('auth.termsAnd')}
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
                accessibilityLabel={t('auth.continueApple')}
              >
                {appleBusy ? (
                  <ActivityIndicator color={BioBlixPalette.fog} />
                ) : (
                  <BioBlixText variant="label" color={BioBlixPalette.fog}>
                    {t('auth.continueApple')}
                  </BioBlixText>
                )}
              </Pressable>

              <View style={styles.orRow}>
                <View style={styles.orLine} />
                <BioBlixText variant="caption" color={BioBlixPalette.muted}>
                  {t('auth.orEmail')}
                </BioBlixText>
                <View style={styles.orLine} />
              </View>

              <BioBlixGradientButton
                label={
                  mode === 'sign-up' ? t('auth.createAccount') : t('auth.signIn')
                }
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
                {t('auth.continueConfirm')}
              </BioBlixText>
            </>
          ) : step === 'apple-continue' ? (
            <>
              {(appleMissingFields.length > 0 ? (
                <BioBlixText variant="caption" color={BioBlixPalette.muted}>
                  {t('auth.clerkMissing', { fields: appleMissingFields.join(', ') })}
                </BioBlixText>
              ) : (
                <BioBlixText variant="caption" color={BioBlixPalette.muted}>
                  {t('auth.status', { status: String(appleSignUpRef.current?.status ?? '—') })}
                </BioBlixText>
              ))}
              <CountryPicker
                label={t('auth.country')}
                value={countryCode}
                onChange={(code) => {
                  setCountryCode(code);
                  setI18nCountry(code);
                }}
              />
              <Field label={t('auth.nickname')}>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="off"
                  placeholder="e.g. blekkulf"
                  placeholderTextColor={BioBlixPalette.muted}
                  style={styles.input}
                  value={nick}
                  onChangeText={setNick}
                />
              </Field>
              <Field label={t('auth.firstName')}>
                <TextInput
                  autoComplete="given-name"
                  autoCapitalize="words"
                  placeholder={t('auth.firstName')}
                  placeholderTextColor={BioBlixPalette.muted}
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </Field>
              <Field label={t('auth.lastName')}>
                <TextInput
                  autoComplete="family-name"
                  autoCapitalize="words"
                  placeholder={t('auth.lastName')}
                  placeholderTextColor={BioBlixPalette.muted}
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </Field>
              <Field label={t('auth.birthDate', { age: MIN_AGE })}>
                <TextInput
                  autoComplete="birthdate-full"
                  placeholder={t('auth.birthDateHint')}
                  placeholderTextColor={BioBlixPalette.muted}
                  style={styles.input}
                  value={birthDate}
                  onChangeText={setBirthDate}
                  autoCapitalize="none"
                  keyboardType="numbers-and-punctuation"
                />
              </Field>
              <BioBlixGradientButton
                label={t('auth.completeContinue')}
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
                  {t('auth.startOver')}
                </BioBlixText>
              </Pressable>
            </>
          ) : (
            <>
              <Field label={t('auth.codeFromEmail')}>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="number-pad"
                  placeholder="123456"
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
                  {t('auth.sendNewCode')}
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
                  {t('auth.startOver')}
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
