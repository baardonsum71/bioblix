import { useAuth, useClerk, useUser } from '@clerk/expo';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

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
import { useProYearlyEntitlement } from '@/hooks/useProYearlyEntitlement';
import { notify } from '@/lib/platform';
import { shareProfile } from '@/lib/shareProfile';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription';
import { countFollowers, countFollowing } from '@/services/follows';
import { uploadAvatarMedia } from '@/services/storage';
import { updateUser } from '@/services/users';

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
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const {
    user: profile,
    loading: profileLoading,
    error: profileError,
    refresh,
  } = useCurrentUserProfile(isSignedIn ? userId : null);
  const { isProYearly, isOwner, loading: entitlementLoading } =
    useProYearlyEntitlement(isSignedIn ? userId : null);

  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!userId || !isSignedIn) return;
    void Promise.all([countFollowers(userId), countFollowing(userId)])
      .then(([a, b]) => {
        setFollowers(a);
        setFollowing(b);
      })
      .catch(() => undefined);
  }, [userId, isSignedIn, profile?.imageUrl]);

  const onPickAvatar = useCallback(async () => {
    if (!userId) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      notify('Tilgang', 'Gi tilgang til bilder for profilbilde.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploadingAvatar(true);
    try {
      const url = await uploadAvatarMedia({
        userId,
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
        getClerkToken: () => getToken(),
      });
      await updateUser(userId, { imageUrl: url });
      await refresh();
      notify('Profilbilde', 'Bildet er oppdatert.');
    } catch (err) {
      notify(
        'Feil',
        err instanceof Error ? err.message : 'Kunne ikke laste opp bilde'
      );
    } finally {
      setUploadingAvatar(false);
    }
  }, [userId, getToken, refresh]);

  const onShare = useCallback(async () => {
    if (!userId) return;
    const name =
      profile?.displayName ??
      user?.fullName ??
      user?.primaryEmailAddress?.emailAddress ??
      'BioBlix';
    try {
      await shareProfile({ userId, displayName: name });
      notify('Delt', 'Profillenken er delt eller kopiert.');
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      notify(
        'Feil',
        err instanceof Error ? err.message : 'Kunne ikke dele'
      );
    }
  }, [userId, profile?.displayName, user]);

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
  const avatarUrl = profile?.imageUrl ?? user?.imageUrl ?? null;

  return (
    <BioBlixScreenShell style={styles.shellPad}>
      <Pressable onPress={() => void onPickAvatar()} style={styles.avatarWrap}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <BioBlixText variant="title" color={Colors.mistDim}>
              {displayName.slice(0, 1).toUpperCase()}
            </BioBlixText>
          </View>
        )}
        {uploadingAvatar ? (
          <ActivityIndicator style={styles.avatarSpinner} color={Colors.lime} />
        ) : (
          <BioBlixText variant="caption" color={Colors.lime} style={styles.avatarHint}>
            Bytt profilbilde
          </BioBlixText>
        )}
      </Pressable>

      <BioBlixText variant="display">Din konto</BioBlixText>
      <BioBlixText variant="body" color={Colors.mistDim} style={styles.lead}>
        {displayName}
        {user?.primaryEmailAddress?.emailAddress
          ? `\n${user.primaryEmailAddress.emailAddress}`
          : ''}
      </BioBlixText>

      <BioBlixText variant="caption" color={Colors.mistDim}>
        {followers} følgere · {following} følger
      </BioBlixText>

      {profileLoading || entitlementLoading ? (
        <ActivityIndicator color={Colors.lime} style={{ alignSelf: 'flex-start' }} />
      ) : null}
      {profileError ? (
        <BioBlixText variant="caption" color={BioBlixPalette.danger}>
          Profil: {profileError.message}
        </BioBlixText>
      ) : null}
      {profile || isProYearly ? (
        <BioBlixText variant="caption" color={Colors.mistDim}>
          Plan:{' '}
          {isOwner
            ? 'Eier · Pro (gratis)'
            : isProYearly || profile?.isProYearly
              ? 'Pro Årlig'
              : 'Standard'}
        </BioBlixText>
      ) : null}

      <View style={styles.rowActions}>
        {userId ? (
          <Pressable
            style={styles.secondaryBtn}
            onPress={() =>
              router.push(`/u/${encodeURIComponent(userId)}` as Href)
            }
          >
            <BioBlixText variant="label" color={Colors.lime}>
              Offentlig profil
            </BioBlixText>
          </Pressable>
        ) : null}
        <Pressable style={styles.secondaryBtn} onPress={() => void onShare()}>
          <BioBlixText variant="label" color={Colors.lime}>
            Del profil
          </BioBlixText>
        </Pressable>
      </View>

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
  avatarWrap: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.surface,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
  },
  avatarHint: {
    alignSelf: 'center',
  },
  avatarSpinner: {
    marginTop: 4,
  },
  rowActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: Colors.lime,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
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
