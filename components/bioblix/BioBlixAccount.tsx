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
import { CountryPicker } from '@/components/bioblix/CountryPicker';
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
import { syncFirebaseAuthFromClerk } from '@/lib/clerk/firebaseSession';
import { useI18n } from '@/lib/i18n';
import { formatPlanPricesFallback } from '@/lib/i18n/countryLocale';
import {
  NSFW_REJECT_MESSAGE,
  assertMediaAllowed,
} from '@/lib/moderation/nsfw';
import { confirmAction, notify } from '@/lib/platform';
import { presentProYearlyPaywall } from '@/lib/revenuecat/paywall';
import { syncProToFirestore } from '@/lib/revenuecat/web';
import { shareProfile } from '@/lib/shareProfile';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription';
import { countFollowers, countFollowing } from '@/services/follows';
import { deletePost, listPostsByUser } from '@/services/posts';
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
  const { t, setCountryCode, countryCode } = useI18n();
  const {
    user: profile,
    loading: profileLoading,
    error: profileError,
    refresh,
  } = useCurrentUserProfile(isSignedIn ? userId : null);
  const { isProYearly, isOwner, loading: entitlementLoading, refresh: refreshEntitlement } =
    useProYearlyEntitlement(isSignedIn ? userId : null);

  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [savingCountry, setSavingCountry] = useState(false);

  const hasPro = Boolean(isOwner || isProYearly || profile?.isProYearly);
  const priceSummary = formatPlanPricesFallback(
    countryCode ?? profile?.countryCode
  ).summary;

  useEffect(() => {
    const code = profile?.countryCode;
    if (code) setCountryCode(code);
  }, [profile?.countryCode, setCountryCode]);

  const onChangeCountry = useCallback(
    async (code: string) => {
      if (!userId || !user) return;
      setCountryCode(code);
      setSavingCountry(true);
      try {
        await user.update({
          unsafeMetadata: {
            ...(typeof user.unsafeMetadata === 'object' && user.unsafeMetadata
              ? user.unsafeMetadata
              : {}),
            countryCode: code,
          },
        });
        await updateUser(userId, { countryCode: code });
        await refresh();
      } catch (err) {
        notify(
          t('common.error'),
          err instanceof Error ? err.message : t('common.error')
        );
      } finally {
        setSavingCountry(false);
      }
    },
    [userId, user, setCountryCode, refresh, t]
  );

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
      notify(t('common.error'), t('account.avatarPermission'));
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
    try {
      await assertMediaAllowed(asset.uri, 'image');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : NSFW_REJECT_MESSAGE;
      notify(t('common.notAllowed'), message);
      return;
    }

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
      notify(t('account.title'), t('account.avatarUpdated'));
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('account.avatarUploadFail')
      );
    } finally {
      setUploadingAvatar(false);
    }
  }, [userId, getToken, refresh, t]);

  const onShare = useCallback(async () => {
    if (!userId) return;
    const name =
      profile?.displayName ??
      user?.fullName ??
      user?.primaryEmailAddress?.emailAddress ??
      'BioBlix';
    try {
      await shareProfile({ userId, displayName: name });
      notify(t('account.share'), t('account.shared'));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('account.shareFail')
      );
    }
  }, [userId, profile?.displayName, user, t]);

  const onUpgrade = useCallback(async () => {
    if (hasPro) {
      notify(t('account.proActive'), t('account.proAlready'));
      return;
    }
    setUpgrading(true);
    try {
      const entitled = await presentProYearlyPaywall({
        appUserId: userId,
        customerEmail: user?.primaryEmailAddress?.emailAddress ?? null,
        countryCode: countryCode ?? profile?.countryCode ?? null,
      });
      // Always try to mirror RC → Firestore (webhook may be missing).
      let mirrored = false;
      try {
        mirrored = await syncProToFirestore(() => getToken());
      } catch {
        mirrored = false;
      }
      await refreshEntitlement();
      await refresh();
      if (entitled || mirrored) {
        notify(t('account.proActivated'), t('account.proActivatedBody'));
      }
    } catch (err) {
      notify(
        t('account.payment'),
        err instanceof Error ? err.message : t('account.paymentFail')
      );
    } finally {
      setUpgrading(false);
    }
  }, [
    hasPro,
    userId,
    user,
    getToken,
    refresh,
    refreshEntitlement,
    countryCode,
    profile?.countryCode,
    t,
  ]);

  const onDeletePost = useCallback(
    async (post: Post) => {
      const ok = await confirmAction(
        'Slett blix?',
        `«${post.title}» fjernes permanent.`,
        { confirmLabel: 'Slett', destructive: true }
      );
      if (!ok) return;
      try {
        await syncFirebaseAuthFromClerk(() => getToken());
        await deletePost(post.id);
        setMyPosts((prev) => prev.filter((p) => p.id !== post.id));
        notify('Slettet', 'Blixet er fjernet.');
      } catch (err) {
        notify(
          'Feil',
          err instanceof Error ? err.message : 'Kunne ikke slette'
        );
      }
    },
    [getToken]
  );

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
          <PlansBlock priceSummary={priceSummary} />
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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.accountScroll}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
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
                {isOwner ? 'Eier · Pro' : hasPro ? 'Pro' : 'Standard'}
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
              {t('account.signOut')}
            </BioBlixText>
          </Pressable>
        </View>

        {!hasPro ? (
          <Pressable
            style={styles.upgradeWrap}
            onPress={() => void onUpgrade()}
            disabled={upgrading}
          >
            <LinearGradient
              colors={[...BioBlixGradient.colors]}
              locations={[...BioBlixGradient.locations]}
              start={BioBlixGradient.start}
              end={BioBlixGradient.end}
              style={styles.upgradeBtn}
            >
              {upgrading ? (
                <ActivityIndicator color={Colors.ink} />
              ) : (
                <>
                  <BioBlixText variant="label" color={Colors.ink}>
                    {t('account.becomePro')}
                  </BioBlixText>
                  <BioBlixText variant="caption" color={Colors.inkElevated}>
                    {t('account.becomeProSub', { prices: priceSummary })}
                  </BioBlixText>
                </>
              )}
            </LinearGradient>
          </Pressable>
        ) : (
          <View style={styles.proActiveBanner}>
            <BioBlixText variant="caption" color={Colors.lime}>
              {t('account.proActive')} · {t('account.proActiveSub')}
            </BioBlixText>
          </View>
        )}

        <View style={styles.countryBlock}>
          <CountryPicker
            label={t('account.country')}
            value={countryCode ?? profile?.countryCode ?? null}
            onChange={(code) => void onChangeCountry(code)}
          />
          {savingCountry ? (
            <ActivityIndicator color={Colors.lime} style={{ marginTop: 8 }} />
          ) : null}
        </View>

        <View style={styles.postsHeader}>
          <BioBlixText variant="label" color={Colors.mistDim}>
            {t('account.myBlix')} ({myPosts.length})
          </BioBlixText>
          <BioBlixText variant="caption" color={Colors.mistDim}>
            Rediger · Slett
          </BioBlixText>
        </View>

        {postsLoading ? (
          <ActivityIndicator
            color={Colors.lime}
            style={{ marginHorizontal: 16, alignSelf: 'flex-start' }}
          />
        ) : myPosts.length === 0 ? (
          <BioBlixText
            variant="body"
            color={Colors.mistDim}
            style={styles.emptyPosts}
          >
            Ingen blix ennå. Publiser fra Publiser-fanen.
          </BioBlixText>
        ) : (
          <View style={styles.postsList}>
            {myPosts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <Image
                  source={{ uri: post.mediaUrl }}
                  style={styles.postThumb}
                  contentFit="cover"
                />
                <View style={styles.postMeta}>
                  <BioBlixText variant="body" numberOfLines={2}>
                    {post.title}
                  </BioBlixText>
                  <BioBlixText
                    variant="caption"
                    color={Colors.mistDim}
                    numberOfLines={1}
                  >
                    {post.description || post.mediaType}
                  </BioBlixText>
                  <View style={styles.postActions}>
                    <Pressable
                      onPress={() => setEditing(post)}
                      hitSlop={8}
                      style={styles.postActionBtn}
                    >
                      <BioBlixText variant="caption" color={Colors.lime}>
                        Rediger
                      </BioBlixText>
                    </Pressable>
                    <Pressable
                      onPress={() => void onDeletePost(post)}
                      hitSlop={8}
                      style={styles.postActionBtn}
                    >
                      <BioBlixText
                        variant="caption"
                        color={BioBlixPalette.magenta}
                      >
                        Slett
                      </BioBlixText>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footerLinks}>
          <Link href="/privacy" asChild>
            <Pressable>
              <BioBlixText variant="caption" color={Colors.lime}>
                {t('account.privacy')}
              </BioBlixText>
            </Pressable>
          </Link>
          {!hasPro ? (
            <Pressable onPress={() => void onUpgrade()} disabled={upgrading}>
              <BioBlixText variant="caption" color={Colors.lime}>
                Oppgrader til Pro
              </BioBlixText>
            </Pressable>
          ) : (
            <BioBlixText variant="caption" color={Colors.mistDim}>
              {SUBSCRIPTION_PLANS.pro.label}
            </BioBlixText>
          )}
        </View>
      </ScrollView>

      <BioBlixEditPostModal
        post={editing}
        visible={Boolean(editing)}
        canUseLinks={hasPro}
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

function PlansBlock({ priceSummary }: { priceSummary: string }) {
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
          {SUBSCRIPTION_PLANS.pro.label} · {priceSummary}
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
  accountScroll: {
    paddingTop: 48,
    paddingBottom: 28,
    flexGrow: 1,
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
  countryBlock: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  postsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 4,
  },
  emptyPosts: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postsList: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  postCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
    paddingRight: 10,
  },
  postThumb: {
    width: 72,
    height: 72,
  },
  postMeta: {
    flex: 1,
    gap: 2,
    paddingVertical: 8,
  },
  postActions: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 4,
  },
  postActionBtn: {
    paddingVertical: 2,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  upgradeWrap: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: BioBlixRadii.md,
    overflow: 'hidden',
  },
  upgradeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 2,
    alignItems: 'flex-start',
  },
  proActiveBanner: {
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.lime,
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
