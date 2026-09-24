import { useAuth, useClerk, useUser } from '@clerk/expo';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import {
  BioBlixLogo,
  BioBlixScreenShell,
} from '@/components/bioblix/BioBlixLogo';
import { isClerkConfigured } from '@/components/bioblix/BioBlixProviders';
import {
  BioBlixGradient,
  BioBlixPalette,
  BioBlixRadii,
} from '@/constants/bioblixTheme';
import { Brand, Colors } from '@/constants/Colors';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription';

export default function BioBlixAccount() {
  if (!isClerkConfigured) {
    return (
      <BioBlixScreenShell style={styles.shellPad}>
        <BioBlixLogo variant="wordmark" size={96} />
        <BioBlixText variant="display">Din konto</BioBlixText>
        <BioBlixText variant="body" color={Colors.mistDim}>
          Clerk er ikke konfigurert. Sett EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.
        </BioBlixText>
      </BioBlixScreenShell>
    );
  }

  return <BioBlixAccountSigned />;
}

function BioBlixAccountSigned() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { user: profile, loading: profileLoading, error: profileError } =
    useCurrentUserProfile(isSignedIn ? userId : null);

  if (!isLoaded) {
    return (
      <BioBlixScreenShell style={styles.shellCenter}>
        <ActivityIndicator color={Colors.lime} />
      </BioBlixScreenShell>
    );
  }

  if (!isSignedIn) {
    return (
      <BioBlixScreenShell style={styles.shellPad}>
        <BioBlixLogo variant="wordmark" size={96} />
        <BioBlixText variant="display">Din konto</BioBlixText>
        <BioBlixText variant="body" color={Colors.mistDim} style={styles.lead}>
          Opprett profil for å publisere blix og synce Pro-status.
        </BioBlixText>
        <Link href="/(auth)/sign-in" asChild>
          <Pressable style={styles.primaryWrap}>
            <LinearGradient
              colors={[...BioBlixGradient.colors]}
              locations={[...BioBlixGradient.locations]}
              start={BioBlixGradient.start}
              end={BioBlixGradient.end}
              style={styles.primaryLink}
            >
              <BioBlixText variant="label" color={Colors.ink}>
                Opprett profil / logg inn
              </BioBlixText>
            </LinearGradient>
          </Pressable>
        </Link>
        <PlansBlock />
        <AboutLinks />
      </BioBlixScreenShell>
    );
  }

  const displayName =
    profile?.displayName ??
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress ??
    '…';

  return (
    <BioBlixScreenShell style={styles.shellPad}>
      <BioBlixLogo variant="mark" size={56} />
      <BioBlixText variant="display">Din konto</BioBlixText>
      <BioBlixText variant="body" color={Colors.mistDim} style={styles.lead}>
        {displayName}
        {user?.primaryEmailAddress?.emailAddress
          ? `\n${user.primaryEmailAddress.emailAddress}`
          : ''}
      </BioBlixText>

      {profileLoading ? (
        <ActivityIndicator color={Colors.lime} style={{ alignSelf: 'flex-start' }} />
      ) : null}
      {profileError ? (
        <BioBlixText variant="caption" color={BioBlixPalette.danger}>
          Profil: {profileError.message}
        </BioBlixText>
      ) : null}
      {profile ? (
        <BioBlixText variant="caption" color={Colors.mistDim}>
          Plan: {profile.isProYearly ? 'Pro Årlig' : 'Standard'} · id{' '}
          {profile.id.slice(0, 8)}…
        </BioBlixText>
      ) : null}

      <PlansBlock />

      <Pressable onPress={() => void signOut()} style={styles.signOut}>
        <BioBlixText variant="label" color={BioBlixPalette.magenta}>
          Logg ut
        </BioBlixText>
      </Pressable>

      <AboutLinks />
    </BioBlixScreenShell>
  );
}

function PlansBlock() {
  return (
    <>
      <View style={styles.planCard}>
        <BioBlixText variant="title">{SUBSCRIPTION_PLANS.standard.label}</BioBlixText>
        <BioBlixText variant="caption" color={Colors.mistDim}>
          Månedlig · publiser video/bilde uten utgående lenke
        </BioBlixText>
      </View>

      <LinearGradient
        colors={[...BioBlixGradient.colors]}
        locations={[...BioBlixGradient.locations]}
        start={BioBlixGradient.start}
        end={BioBlixGradient.end}
        style={styles.planPro}
      >
        <BioBlixText variant="title" color={Colors.ink}>
          {SUBSCRIPTION_PLANS.pro.label} Årlig
        </BioBlixText>
        <BioBlixText variant="caption" color={Colors.inkElevated}>
          Entitlement {SUBSCRIPTION_PLANS.pro.entitlementId} · klikkbare
          butikklenker på hvert blix
        </BioBlixText>
      </LinearGradient>
    </>
  );
}

function AboutLinks() {
  return (
    <>
      <Link href="/modal" style={styles.aboutLink}>
        <BioBlixText variant="label" color={Colors.lime}>
          Om {Brand.name}
        </BioBlixText>
      </Link>
      <Link href="/privacy" style={styles.aboutLink}>
        <BioBlixText variant="label" color={Colors.lime}>
          Personvernerklæring
        </BioBlixText>
      </Link>
    </>
  );
}

const styles = StyleSheet.create({
  shellPad: {
    padding: 24,
    paddingTop: 56,
    gap: 12,
  },
  shellCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lead: {
    marginBottom: 8,
    maxWidth: 420,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
  },
  planPro: {
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  aboutLink: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  primaryWrap: {
    alignSelf: 'flex-start',
    borderRadius: BioBlixRadii.md,
    overflow: 'hidden',
    marginBottom: 8,
  },
  primaryLink: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  signOut: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
  },
});
