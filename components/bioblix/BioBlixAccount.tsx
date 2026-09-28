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
import { BioBlixVerticalFeed } from '@/components/bioblix/BioBlixVerticalFeed';
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
import {
  COIN_REDEEM,
  COIN_REWARDS,
  type CoinRedeemPlan,
} from '@/constants/coins';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { useProYearlyEntitlement } from '@/hooks/useProYearlyEntitlement';
import { syncFirebaseAuthFromClerk } from '@/lib/clerk/firebaseSession';
import { useI18n } from '@/lib/i18n';
import { formatPlanPricesFallback } from '@/lib/i18n/countryLocale';
import {
  NSFW_REJECT_CODE,
  assertMediaAllowed,
} from '@/lib/moderation/nsfw';
import { notify } from '@/lib/platform';
import { presentProYearlyPaywall } from '@/lib/revenuecat/paywall';
import { syncProToFirestore } from '@/lib/revenuecat/web';
import { shareProfile } from '@/lib/shareProfile';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription';
import { redeemCoins } from '@/services/coins';
import { countFollowers, countFollowing } from '@/services/follows';
import { listPostsByUser } from '@/services/posts';
import { uploadAvatarMedia } from '@/services/storage';
import { isCoinProActive, updateUser } from '@/services/users';
import type { Post } from '@/types';

export default function BioBlixAccount() {
  const { t } = useI18n();
  if (!isClerkConfigured) {
    return (
      <BioBlixScreenShell style={styles.shellPad}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <BioBlixLogo variant="wordmark" size={96} />
          <BioBlixText variant="display">{t('account.title')}</BioBlixText>
          <BioBlixText variant="body" color={Colors.mistDim}>
            Clerk is not configured. Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.
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
  const [redeeming, setRedeeming] = useState<CoinRedeemPlan | null>(null);

  const coinPro = isCoinProActive(profile);
  const hasPro = Boolean(
    isOwner || isProYearly || profile?.isProYearly || coinPro
  );
  const coins = profile?.coins ?? 0;
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
      const code = err instanceof Error ? err.message : NSFW_REJECT_CODE;
      const message =
        code === NSFW_REJECT_CODE
          ? t('moderation.nsfw')
          : code === 'MODERATION_CHECK_FAIL'
            ? t('moderation.checkFail')
            : code;
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
      await shareProfile({
        userId,
        displayName: name,
        message: t('share.checkOut', { name }),
      });
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
        err instanceof Error && err.message === 'PAYWALL_OPEN_FAIL'
          ? t('paywall.openFail')
          : err instanceof Error
            ? err.message
            : t('account.paymentFail')
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

  const onRedeemCoins = useCallback(
    async (plan: CoinRedeemPlan) => {
      if (!userId) return;
      const offer = COIN_REDEEM[plan];
      if (coins < offer.cost) {
        notify(
          t('coins.notEnoughTitle'),
          t('coins.notEnoughBody', { need: offer.cost, have: coins })
        );
        return;
      }
      setRedeeming(plan);
      try {
        await redeemCoins(() => getToken(), plan);
        await refresh();
        await refreshEntitlement();
        notify(
          t('coins.redeemedTitle'),
          t('coins.redeemedBody', {
            days: offer.days,
            cost: offer.cost,
          })
        );
      } catch (err) {
        notify(
          t('common.error'),
          err instanceof Error ? err.message : t('coins.redeemFail')
        );
      } finally {
        setRedeeming(null);
      }
    },
    [userId, coins, getToken, refresh, refreshEntitlement, t]
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
          <BioBlixText variant="display">{t('account.title')}</BioBlixText>
          <BioBlixText variant="body" color={Colors.mistDim} style={styles.lead}>
            {t('account.createProfileHint')}
          </BioBlixText>
          <Link href="/(auth)/sign-in?reason=publish" asChild>
            <Pressable style={styles.primaryWrap}>
              <LinearGradient
                colors={[...BioBlixGradient.colors]}
                locations={[...BioBlixGradient.locations]}
                start={BioBlixGradient.start}
                end={BioBlixGradient.end}
                style={styles.primaryLink}
              >
                <BioBlixText variant="label" color={Colors.ink}>
                  {t('auth.createFreeProfile')}
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
    <BioBlixScreenShell style={styles.accountRoot}>
      <ScrollView
        style={styles.accountTopScroll}
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
                {t('edit.changeMedia')}
              </BioBlixText>
            )}
          </Pressable>

          <View style={styles.headerText}>
            <BioBlixText variant="title" numberOfLines={1}>
              {displayName}
            </BioBlixText>
            <BioBlixText variant="caption" color={Colors.mistDim}>
              {t('profile.followersFollowing', { followers, following })}
            </BioBlixText>
            {profileLoading || entitlementLoading ? (
              <ActivityIndicator color={Colors.lime} />
            ) : (
              <BioBlixText variant="caption" color={Colors.mistDim}>
                {isOwner
                  ? 'Owner · Pro'
                  : hasPro
                    ? 'Pro'
                    : SUBSCRIPTION_PLANS.standard.label}
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
                {t('account.public')}
              </BioBlixText>
            </Pressable>
          ) : null}
          <Pressable style={styles.secondaryBtn} onPress={() => void onShare()}>
            <BioBlixText variant="caption" color={Colors.lime}>
              {t('account.share')}
            </BioBlixText>
          </Pressable>
          <Pressable
            style={styles.secondaryBtn}
            onPress={() => router.push('/live/go' as Href)}
          >
            <BioBlixText variant="caption" color={Colors.lime}>
              {t('live.goLive')}
            </BioBlixText>
          </Pressable>
          <Pressable
            style={styles.secondaryBtn}
            onPress={() => void loadMyPosts()}
          >
            <BioBlixText variant="caption" color={Colors.lime}>
              {t('account.refresh')}
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

        <View style={styles.coinsCard}>
          <BioBlixText variant="label" color={Colors.lime}>
            {t('coins.balance', { coins })}
          </BioBlixText>
          <BioBlixText variant="caption" color={Colors.mistDim}>
            {t('coins.earnHint', {
              signup: COIN_REWARDS.signup,
              publish: COIN_REWARDS.publishBlix,
            })}
          </BioBlixText>
          <View style={styles.coinsRow}>
            <Pressable
              style={[
                styles.coinRedeemBtn,
                coins < COIN_REDEEM.month.cost && styles.coinRedeemDisabled,
              ]}
              disabled={redeeming != null || coins < COIN_REDEEM.month.cost}
              onPress={() => void onRedeemCoins('month')}
            >
              {redeeming === 'month' ? (
                <ActivityIndicator color={Colors.ink} />
              ) : (
                <BioBlixText variant="caption" color={Colors.ink}>
                  {t('coins.redeemMonth', { cost: COIN_REDEEM.month.cost })}
                </BioBlixText>
              )}
            </Pressable>
            <Pressable
              style={[
                styles.coinRedeemBtn,
                coins < COIN_REDEEM.year.cost && styles.coinRedeemDisabled,
              ]}
              disabled={redeeming != null || coins < COIN_REDEEM.year.cost}
              onPress={() => void onRedeemCoins('year')}
            >
              {redeeming === 'year' ? (
                <ActivityIndicator color={Colors.ink} />
              ) : (
                <BioBlixText variant="caption" color={Colors.ink}>
                  {t('coins.redeemYear', { cost: COIN_REDEEM.year.cost })}
                </BioBlixText>
              )}
            </Pressable>
          </View>
        </View>

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
            {t('account.editDelete')}
          </BioBlixText>
        </View>

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
                {t('account.upgradePro')}
              </BioBlixText>
            </Pressable>
          ) : (
            <BioBlixText variant="caption" color={Colors.mistDim}>
              {SUBSCRIPTION_PLANS.pro.label}
            </BioBlixText>
          )}
        </View>
      </ScrollView>

      <View style={styles.feedWrap}>
        <BioBlixVerticalFeed
          posts={myPosts}
          loading={postsLoading}
          viewerUserId={userId}
          usernameFor={() => displayName}
          emptyMessage={t('account.emptyPosts')}
          onDeleted={(postId) =>
            setMyPosts((prev) => prev.filter((p) => p.id !== postId))
          }
          onEdit={(post) => setEditing(post)}
          requireFocus={false}
        />
      </View>

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
  const { t } = useI18n();
  return (
    <>
      <View style={styles.planCard}>
        <BioBlixText variant="title">{SUBSCRIPTION_PLANS.standard.label}</BioBlixText>
        <BioBlixText variant="caption" color={Colors.mistDim}>
          {t('account.planStandard')}
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
          {t('account.planProFeature')}
        </BioBlixText>
      </LinearGradient>
    </>
  );
}

function AboutLinks() {
  const { t } = useI18n();
  return (
    <>
      <Link href="/modal" style={styles.aboutLink}>
        <BioBlixText variant="label" color={Colors.lime}>
          {t('account.about', { name: Brand.name })}
        </BioBlixText>
      </Link>
      <Link href="/privacy" style={styles.aboutLink}>
        <BioBlixText variant="label" color={Colors.lime}>
          {t('account.privacyPolicy')}
        </BioBlixText>
      </Link>
    </>
  );
}

const styles = StyleSheet.create({
  accountRoot: {
    flex: 1,
  },
  accountTopScroll: {
    flexGrow: 0,
    flexShrink: 0,
    maxHeight: '42%',
  },
  accountScroll: {
    paddingTop: 48,
    paddingBottom: 12,
  },
  feedWrap: {
    flex: 1,
    minHeight: 360,
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
    width: '100%',
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
  coinsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    gap: 8,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
  },
  coinsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  coinRedeemBtn: {
    backgroundColor: Colors.lime,
    borderRadius: BioBlixRadii.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  coinRedeemDisabled: {
    opacity: 0.45,
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
