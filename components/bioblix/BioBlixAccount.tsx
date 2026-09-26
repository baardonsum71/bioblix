import { useAuth, useClerk, useUser } from '@clerk/expo';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { BioBlixEditPostModal } from '@/components/bioblix/BioBlixEditPostModal';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import {
  BioBlixLogo,
  BioBlixScreenShell,
} from '@/components/bioblix/BioBlixLogo';
import { isClerkConfigured } from '@/components/bioblix/BioBlixProviders';
import { BioBlixVerticalFeed } from '@/components/bioblix/BioBlixVerticalFeed';
import {
  BioBlixGradient,
  BioBlixPalette,
  BioBlixRadii,
} from '@/constants/bioblixTheme';
import { Brand, Colors } from '@/constants/Colors';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { useProYearlyEntitlement } from '@/hooks/useProYearlyEntitlement';
import { syncFirebaseAuthFromClerk } from '@/lib/clerk/firebaseSession';
import { notify } from '@/lib/platform';
import { shareProfile } from '@/lib/shareProfile';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription';
import { countFollowers, countFollowing } from '@/services/follows';
import { listPostsByUser } from '@/services/posts';
import { uploadAvatarMedia } from '@/services/storage';
import { updateUser } from '@/services/users';
import type { Post } from '@/types';

export default function BioBlixAccount() {
  if (!isClerkConfigured) {
    return (
      <BioBlixScreenShell style={styles.shellPad}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <BioBlixLogo variant="wordmark" size={96} />
          <BioBlixText variant="display">Din konto</BioBlixText>
          <BioBlixText variant="body" color={Colors.mistDim}>
            Clerk er ikke konfigurert. Sett EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.
          </BioBlixText>
        </ScrollView>
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
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);

  const loadMyPosts = useCallback(async () => {
    if (!userId || !isSignedIn) {
      setMyPosts([]);
      return;
    }
    setPostsLoading(true);
    try {
      setMyPosts(await listPostsByUser(userId, 40));
    } catch {
      setMyPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, [userId, isSignedIn]);

  useEffect(() => {
    if (!userId || !isSignedIn) return;
    void Promise.all([countFollowers(userId), countFollowing(userId)])
      .then(([a, b]) => {
        setFollowers(a);
        setFollowing(b);
      })
      .catch(() => {
        setFollowers(0);
        setFollowing(0);
      });
  }, [userId, isSignedIn, profile?.imageUrl]);

  useEffect(() => {
    void loadMyPosts();
  }, [loadMyPosts]);

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
      await syncFirebaseAuthFromClerk(() => getToken());
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
      <BioBlixScreenShell>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, styles.shellPad]}
          keyboardShouldPersistTaps="handled"
        >
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
        </ScrollView>
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
    <BioBlixScreenShell>
      <View style={styles.accountRoot}>
        <View style={styles.profileHeader}>
          <Pressable
            onPress={() => void onPickAvatar()}
            style={styles.avatarWrap}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <BioBlixText variant="title" color={Colors.mistDim}>
                  {displayName.slice(0, 1).toUpperCase()}
                </BioBlixText>
              </View>
            )}
            {uploadingAvatar ? (
              <ActivityIndicator color={Colors.lime} />
            ) : (
              <BioBlixText variant="caption" color={Colors.lime}>
                Bytt bilde
              </BioBlixText>
            )}
          </Pressable>

          <View style={styles.headerText}>
            <BioBlixText variant="title" numberOfLines={1}>
              {displayName}
            </BioBlixText>
            <BioBlixText variant="caption" color={Colors.mistDim}>
              {followers} følgere · {following} følger
            </BioBlixText>
            {profileLoading || entitlementLoading ? (
              <ActivityIndicator color={Colors.lime} />
            ) : (
              <BioBlixText variant="caption" color={Colors.mistDim}>
                {isOwner
                  ? 'Eier · Pro'
                  : isProYearly || profile?.isProYearly
                    ? 'Pro Årlig'
                    : 'Standard'}
              </BioBlixText>
            )}
            {profileError ? (
              <BioBlixText variant="caption" color={BioBlixPalette.danger}>
                {profileError.message}
              </BioBlixText>
            ) : null}
          </View>
        </View>

        <View style={styles.rowActions}>
          {userId ? (
            <Pressable
              style={styles.secondaryBtn}
              onPress={() =>
                router.push(`/u/${encodeURIComponent(userId)}` as Href)
              }
            >
              <BioBlixText variant="caption" color={Colors.lime}>
                Offentlig
              </BioBlixText>
            </Pressable>
          ) : null}
          <Pressable style={styles.secondaryBtn} onPress={() => void onShare()}>
            <BioBlixText variant="caption" color={Colors.lime}>
              Del
            </BioBlixText>
          </Pressable>
          <Pressable
            style={styles.secondaryBtn}
            onPress={() => void loadMyPosts()}
          >
            <BioBlixText variant="caption" color={Colors.lime}>
              Oppdater
            </BioBlixText>
          </Pressable>
          <Pressable onPress={() => void signOut()} style={styles.secondaryBtn}>
            <BioBlixText variant="caption" color={BioBlixPalette.magenta}>
              Logg ut
            </BioBlixText>
          </Pressable>
        </View>

        <View style={styles.postsHeader}>
          <BioBlixText variant="label" color={Colors.mistDim}>
            Mine blix ({myPosts.length})
          </BioBlixText>
          <BioBlixText variant="caption" color={Colors.mistDim}>
            Sveip · Rediger / ···
          </BioBlixText>
        </View>

        <View style={styles.feedWrap}>
          <BioBlixVerticalFeed
            posts={myPosts}
            loading={postsLoading}
            viewerUserId={userId}
            usernameFor={() => displayName}
            emptyMessage="Ingen blix ennå. Publiser fra Publiser-fanen."
            onDeleted={(id) =>
              setMyPosts((prev) => prev.filter((p) => p.id !== id))
            }
            onEdit={(post) => setEditing(post)}
            requireFocus
          />
        </View>

        <View style={styles.footerLinks}>
          <Link href="/privacy" asChild>
            <Pressable>
              <BioBlixText variant="caption" color={Colors.lime}>
                Personvern
              </BioBlixText>
            </Pressable>
          </Link>
          <BioBlixText variant="caption" color={Colors.mistDim}>
            {SUBSCRIPTION_PLANS.pro.label} snart · 59/mnd · 399/år
          </BioBlixText>
        </View>
      </View>

      <BioBlixEditPostModal
        post={editing}
        visible={Boolean(editing)}
        canUseLinks={Boolean(isProYearly || isOwner)}
        onClose={() => setEditing(null)}
        onSaved={(updated) => {
          setMyPosts((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p))
          );
        }}
      />
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
          {SUBSCRIPTION_PLANS.pro.label} · 59 kr/mnd · 399 kr/år
        </BioBlixText>
        <BioBlixText variant="caption" color={Colors.inkElevated}>
          Klikkbare butikklenker på hvert blix
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
  accountRoot: {
    flex: 1,
    paddingTop: 48,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 48,
    gap: 12,
  },
  shellPad: {
    padding: 24,
    paddingTop: 56,
  },
  shellCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lead: {
    marginBottom: 8,
    maxWidth: 420,
  },
  profileHeader: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  avatarWrap: {
    alignItems: 'center',
    gap: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  rowActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: Colors.lime,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  postsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  feedWrap: {
    flex: 1,
    minHeight: 320,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
    marginTop: 8,
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
});
