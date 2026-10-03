import { useAuth } from '@clerk/expo';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { confirmAndOpenBioBlixLink } from '@/components/bioblix/bioBlixLinks';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixProfileLinks } from '@/components/bioblix/BioBlixProfileLinks';
import { BioBlixScreenShell } from '@/components/bioblix/BioBlixLogo';
import { BioBlixGlow, BioBlixRadii } from '@/constants/bioblixTheme';
import { Colors } from '@/constants/Colors';
import { signInHref } from '@/lib/auth/signInGate';
import { useI18n } from '@/lib/i18n';
import { notify } from '@/lib/platform';
import { shareProfile } from '@/lib/shareProfile';
import {
  countFollowers,
  countFollowing,
  followUser,
  isFollowing,
  unfollowUser,
} from '@/services/follows';
import { listPostsByUser } from '@/services/posts';
import { getUserById } from '@/services/users';
import type { Post, User } from '@/types';

type ProfileTab = 'links' | 'blix';

const PINNED_MAX = 5;
const GRID_GAP = 2;
const GRID_COLS = 3;

/**
 * Mobile-first public profile: pinned top links + Instagram-style shoppable grid.
 */
export default function PublicProfileScreen() {
  const { userId: rawId } = useLocalSearchParams<{ userId: string }>();
  const userId = typeof rawId === 'string' ? decodeURIComponent(rawId) : '';
  const { userId: viewerId, isSignedIn } = useAuth();
  const router = useRouter();
  const { t, locale } = useI18n();
  const { width } = useWindowDimensions();

  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [followingThem, setFollowingThem] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<ProfileTab>('blix');

  const cellSize = useMemo(() => {
    const contentWidth = Math.min(width, 560) - 40;
    return Math.floor((contentWidth - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS);
  }, [width]);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const user = await getUserById(userId);
      setProfile(user);

      try {
        setPosts(await listPostsByUser(userId, 60));
      } catch {
        setPosts([]);
      }

      try {
        const [fol, fing] = await Promise.all([
          countFollowers(userId),
          countFollowing(userId),
        ]);
        setFollowers(fol);
        setFollowing(fing);
      } catch {
        setFollowers(0);
        setFollowing(0);
      }

      if (isSignedIn && viewerId && viewerId !== userId) {
        try {
          setFollowingThem(await isFollowing(viewerId, userId));
        } catch {
          setFollowingThem(false);
        }
      } else {
        setFollowingThem(false);
      }
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error')
      );
    } finally {
      setLoading(false);
    }
  }, [userId, isSignedIn, viewerId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const onToggleFollow = async () => {
    if (!isSignedIn || !viewerId) {
      notify(t('auth.createFreeProfile'), t('social.signInToFollow'));
      router.push(signInHref('follow'));
      return;
    }
    if (viewerId === userId) return;
    setBusy(true);
    try {
      if (followingThem) {
        await unfollowUser(viewerId, userId);
        setFollowingThem(false);
        setFollowers((n) => Math.max(0, n - 1));
      } else {
        await followUser(viewerId, userId);
        setFollowingThem(true);
        setFollowers((n) => n + 1);
      }
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error')
      );
    } finally {
      setBusy(false);
    }
  };

  const onShare = async () => {
    if (!profile) return;
    try {
      await shareProfile({
        userId: profile.id,
        displayName: profile.displayName,
        message: t('share.checkOut', { name: profile.displayName }),
      });
      notify(t('account.share'), t('account.shared'));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('account.shareFail')
      );
    }
  };

  if (!userId) {
    return (
      <BioBlixScreenShell style={styles.center}>
        <BioBlixText>{t('profile.invalid')}</BioBlixText>
      </BioBlixScreenShell>
    );
  }

  if (loading) {
    return (
      <BioBlixScreenShell style={styles.center}>
        <ActivityIndicator color={Colors.lime} />
      </BioBlixScreenShell>
    );
  }

  if (!profile) {
    return (
      <BioBlixScreenShell style={styles.center}>
        <BioBlixText>{t('profile.notFound')}</BioBlixText>
      </BioBlixScreenShell>
    );
  }

  const isSelf = Boolean(viewerId && viewerId === userId);
  const allLinks = profile.profileLinks ?? [];
  const pinned = allLinks.slice(0, PINNED_MAX);

  return (
    <BioBlixScreenShell style={styles.shell}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          {profile.imageUrl ? (
            <Image
              source={{ uri: profile.imageUrl }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <BioBlixText variant="title" color={Colors.mistDim}>
                {profile.displayName.slice(0, 1).toUpperCase()}
              </BioBlixText>
            </View>
          )}
          <View style={styles.headerText}>
            <BioBlixText variant="title">{profile.displayName}</BioBlixText>
            <BioBlixText variant="caption" color={Colors.mistDim}>
              {t('profile.followersFollowing', { followers, following })}
            </BioBlixText>
          </View>
        </View>

        <View style={styles.actions}>
          {!isSelf && isSignedIn ? (
            <Pressable
              style={[
                styles.btn,
                followingThem ? styles.btnGhost : styles.btnFill,
              ]}
              onPress={() => void onToggleFollow()}
              disabled={busy}
            >
              <BioBlixText
                variant="label"
                color={followingThem ? Colors.lime : Colors.ink}
              >
                {followingThem ? t('profile.following') : t('profile.follow')}
              </BioBlixText>
            </Pressable>
          ) : null}
          <Pressable
            style={[styles.btn, styles.btnGhost]}
            onPress={() => void onShare()}
          >
            <BioBlixText variant="label" color={Colors.lime}>
              {t('profile.share')}
            </BioBlixText>
          </Pressable>
        </View>

        {pinned.length > 0 ? (
          <View style={styles.pinnedWrap}>
            <BioBlixText variant="caption" color={Colors.mistDim}>
              {t('profile.pinnedLinks')}
            </BioBlixText>
            {pinned.map((link) => (
              <Pressable
                key={link.id}
                style={styles.pinnedLink}
                onPress={() => confirmAndOpenBioBlixLink(link.url, { locale })}
                accessibilityRole="link"
                accessibilityLabel={link.title}
              >
                <BioBlixText variant="label" color={Colors.ink} numberOfLines={1}>
                  {link.title}
                </BioBlixText>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.tabRow}>
          <Pressable
            style={[styles.tab, tab === 'blix' && styles.tabActive]}
            onPress={() => setTab('blix')}
          >
            <BioBlixText
              variant="label"
              color={tab === 'blix' ? Colors.ink : Colors.mistDim}
            >
              {t('profile.tabBlix', { count: posts.length })}
            </BioBlixText>
          </Pressable>
          <Pressable
            style={[styles.tab, tab === 'links' && styles.tabActive]}
            onPress={() => setTab('links')}
          >
            <BioBlixText
              variant="label"
              color={tab === 'links' ? Colors.ink : Colors.mistDim}
            >
              {t('profile.tabLinks')}
            </BioBlixText>
          </Pressable>
        </View>

        {tab === 'links' ? (
          <View style={styles.linksWrap}>
            <BioBlixProfileLinks
              links={allLinks}
              editableUserId={isSelf ? userId : undefined}
              onSaved={(next) =>
                setProfile((prev) =>
                  prev ? { ...prev, profileLinks: next } : prev
                )
              }
            />
          </View>
        ) : (
          <View style={styles.gridWrap}>
            {posts.length === 0 ? (
              <BioBlixText variant="caption" color={Colors.mistDim}>
                {t('profile.noBlix')}
              </BioBlixText>
            ) : (
              <View style={styles.grid}>
                {posts.map((post) => {
                  const hasLink = Boolean(post.linkUrl?.trim());
                  return (
                    <Pressable
                      key={post.id}
                      style={[
                        styles.gridCell,
                        { width: cellSize, height: cellSize },
                      ]}
                      onPress={() =>
                        router.push(
                          `/b/${encodeURIComponent(post.id)}` as Href
                        )
                      }
                      accessibilityRole="button"
                      accessibilityLabel={post.title}
                    >
                      <Image
                        source={{ uri: post.mediaUrl }}
                        style={styles.gridImage}
                        contentFit="cover"
                      />
                      {hasLink ? (
                        <View style={styles.linkBadge}>
                          <BioBlixText variant="caption" color={Colors.ink}>
                            ↗
                          </BioBlixText>
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        )}

        <Link href="/(auth)/sign-in?reason=publish" asChild>
          <Pressable style={styles.watermark}>
            <BioBlixText variant="label" color={Colors.lime} style={styles.watermarkTitle}>
              {t('profile.madeWithShoppable')}
            </BioBlixText>
            <BioBlixText variant="caption" color={Colors.mistDim}>
              {t('profile.madeWithCta')}
            </BioBlixText>
          </Pressable>
        </Link>
      </ScrollView>
    </BioBlixScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    paddingTop: 16,
  },
  scroll: {
    paddingBottom: 48,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: BioBlixRadii.md,
    backgroundColor: 'rgba(22,27,38,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(42,51,68,0.8)',
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(10px)' } as object)
      : {}),
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  pinnedWrap: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  pinnedLink: {
    backgroundColor: Colors.lime,
    borderRadius: BioBlixRadii.md,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: BioBlixRadii.md,
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
    backgroundColor: Colors.surface,
  },
  tabActive: {
    backgroundColor: Colors.lime,
    borderColor: Colors.lime,
  },
  linksWrap: {
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  gridWrap: {
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  gridCell: {
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  linkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    ...BioBlixGlow.linkBadge,
  },
  watermark: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 28,
    marginTop: 20,
    marginHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceMuted,
  },
  watermarkTitle: {
    textAlign: 'center',
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnFill: {
    backgroundColor: Colors.lime,
  },
  btnGhost: {
    borderWidth: 1,
    borderColor: Colors.lime,
  },
});
