import { useAuth } from '@clerk/expo';
import { Image } from 'expo-image';
import { Link, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { confirmAndOpenBioBlixLink } from '@/components/bioblix/bioBlixLinks';
import { BioBlixHead } from '@/components/bioblix/BioBlixHead';
import { BioBlixSpotifyEmbed } from '@/components/bioblix/BioBlixSpotifyEmbed';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixScreenShell } from '@/components/bioblix/BioBlixLogo';
import {
  BioBlixGlow,
  BioBlixPalette,
  BioBlixRadii,
} from '@/constants/bioblixTheme';
import { Colors } from '@/constants/Colors';
import { signInHref } from '@/lib/auth/signInGate';
import { useI18n } from '@/lib/i18n';
import { notify } from '@/lib/platform';
import {
  blixImageAlt,
  buildProfileSeo,
  profileAvatarAlt,
  type SeoLocale,
} from '@/lib/seo/profileMeta';
import { isValidSpotifyUrl, normalizeSpotifyUrl } from '@/lib/spotify/embed';
import { isValidHandle, sanitizeHandle } from '@/lib/validation/handle';
import {
  newProfileLinkId,
  validateProfileLinkInput,
} from '@/lib/validation/profileLink';
import { shareProfile } from '@/lib/shareProfile';
import {
  countFollowers,
  countFollowing,
  followUser,
  isFollowing,
  unfollowUser,
} from '@/services/follows';
import { listPostsByUser } from '@/services/posts';
import { getUserById, updateUser } from '@/services/users';
import type { Post, ProfileLink, User } from '@/types';

const GRID_GAP = 12;
const GRID_COLS = 2;

type Props = {
  userId: string;
};

/**
 * Public BioBlix profile — links + shoppable blix grid.
 * Owner sees an admin panel (add link / publish blix). Visitors only see content.
 * Used by both `/{handle}` and `/u/{userId}` so vanity URLs stay indexable.
 */
export function BioBlixPublicProfile({ userId }: Props) {
  const { userId: viewerId, isSignedIn } = useAuth();
  const router = useRouter();
  const { t, locale } = useI18n();
  const seoLocale: SeoLocale = locale === 'en' ? 'en' : 'nb';
  const { width } = useWindowDimensions();

  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [followingThem, setFollowingThem] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkBusy, setLinkBusy] = useState(false);
  const [spotifyDraft, setSpotifyDraft] = useState('');
  const [spotifyBusy, setSpotifyBusy] = useState(false);

  const cellSize = useMemo(() => {
    const contentWidth = Math.min(width, 600) - 40;
    return Math.floor((contentWidth - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS);
  }, [width]);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const user = await getUserById(userId);
      setProfile(user);
      setSpotifyDraft(user?.spotifyUrl ?? '');

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

  const isSelf = Boolean(viewerId && viewerId === userId);

  const onPublishLink = async () => {
    if (!isSelf || !userId) return;
    const result = validateProfileLinkInput(linkTitle, linkUrl);
    if (!result.ok) {
      notify(
        t('common.error'),
        result.message === 'Enter a short label for the link.'
          ? t('profile.linksTitleRequired')
          : result.message
      );
      return;
    }
    const links = profile?.profileLinks ?? [];
    if (links.length >= 10) {
      notify(t('common.error'), t('profile.linksMax', { max: 10 }));
      return;
    }
    setLinkBusy(true);
    try {
      const next: ProfileLink[] = [
        ...links,
        {
          id: newProfileLinkId(),
          title: result.link.title,
          url: result.link.url,
        },
      ];
      await updateUser(userId, { profileLinks: next });
      setProfile((prev) => (prev ? { ...prev, profileLinks: next } : prev));
      setLinkTitle('');
      setLinkUrl('');
      notify(t('profile.linksTitle'), t('profile.linkPublished'));
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('profile.linksSaveFail')
      );
    } finally {
      setLinkBusy(false);
    }
  };

  const onSaveSpotify = async () => {
    if (!isSelf || !userId) return;
    const trimmed = spotifyDraft.trim();
    if (trimmed && !isValidSpotifyUrl(trimmed)) {
      notify(t('common.error'), t('profile.spotifyInvalid'));
      return;
    }
    const next = trimmed ? normalizeSpotifyUrl(trimmed) : null;
    setSpotifyBusy(true);
    try {
      await updateUser(userId, { spotifyUrl: next });
      setProfile((prev) => (prev ? { ...prev, spotifyUrl: next } : prev));
      setSpotifyDraft(next ?? '');
      notify(
        t('profile.spotifyTitle'),
        next ? t('profile.spotifySaved') : t('profile.spotifyRemoved')
      );
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('profile.spotifySaveFail')
      );
    } finally {
      setSpotifyBusy(false);
    }
  };

  const onClearSpotify = async () => {
    if (!isSelf || !userId) return;
    setSpotifyBusy(true);
    try {
      await updateUser(userId, { spotifyUrl: null });
      setProfile((prev) => (prev ? { ...prev, spotifyUrl: null } : prev));
      setSpotifyDraft('');
      notify(t('profile.spotifyTitle'), t('profile.spotifyRemoved'));
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('profile.spotifySaveFail')
      );
    } finally {
      setSpotifyBusy(false);
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

  const handle = sanitizeHandle(profile.displayName);
  const showHandle = isValidHandle(handle);
  const allLinks = profile.profileLinks ?? [];
  const seo = buildProfileSeo({
    userId: profile.id,
    displayName: profile.displayName,
    imageUrl: profile.imageUrl,
    locale: seoLocale,
  });
  const creatorLabel = showHandle ? handle : profile.displayName;

  return (
    <BioBlixScreenShell style={styles.shell}>
      <BioBlixHead seo={seo} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroName}>
          {profile.imageUrl ? (
            <Image
              source={{ uri: profile.imageUrl }}
              style={styles.avatar}
              contentFit="cover"
              alt={profileAvatarAlt(creatorLabel, seoLocale)}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <BioBlixText variant="title" color={Colors.mistDim}>
                {profile.displayName.slice(0, 1).toUpperCase()}
              </BioBlixText>
            </View>
          )}
          {showHandle ? (
            <View style={styles.handleWrap}>
              <BioBlixText variant="display" style={styles.handleLine}>
                ://bioblix.com/
              </BioBlixText>
              <BioBlixText
                variant="display"
                color={BioBlixPalette.aurora}
                style={styles.handleLine}
              >
                {handle}
              </BioBlixText>
            </View>
          ) : (
            <BioBlixText variant="display" style={styles.handleLine}>
              {profile.displayName}
            </BioBlixText>
          )}
          <BioBlixText variant="caption" color={BioBlixPalette.muted}>
            {t('profile.welcomeEveryday')}
          </BioBlixText>
          <BioBlixText variant="caption" color={BioBlixPalette.muted}>
            {t('profile.followersFollowing', { followers, following })}
          </BioBlixText>
        </View>

        <View style={styles.actions}>
          {!isSelf && isSignedIn ? (
            <Pressable
              style={[
                styles.actionBtn,
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
            style={[styles.actionBtn, styles.btnGhost]}
            onPress={() => void onShare()}
          >
            <BioBlixText variant="label" color={Colors.lime}>
              {t('profile.share')}
            </BioBlixText>
          </Pressable>
        </View>

        {isSelf ? (
          <View style={styles.adminPanel}>
            <BioBlixText variant="label" color={BioBlixPalette.aurora}>
              {t('profile.adminTitle')}
            </BioBlixText>

            <View style={styles.inputGroup}>
              <BioBlixText variant="label">{t('profile.publishLink')}</BioBlixText>
              <TextInput
                value={linkTitle}
                onChangeText={setLinkTitle}
                placeholder={t('profile.linksLabelPlaceholder')}
                placeholderTextColor="#475569"
                style={styles.input}
              />
              <TextInput
                value={linkUrl}
                onChangeText={setLinkUrl}
                placeholder={t('profile.linksUrlPlaceholder')}
                placeholderTextColor="#475569"
                autoCapitalize="none"
                keyboardType="url"
                style={styles.input}
              />
              <Pressable
                style={[styles.ctaBtn, linkBusy && styles.ctaDisabled]}
                onPress={() => void onPublishLink()}
                disabled={linkBusy}
              >
                <BioBlixText variant="label" color={BioBlixPalette.night}>
                  {t('profile.publishLinkCta')}
                </BioBlixText>
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <BioBlixText variant="label">{t('profile.spotifyTitle')}</BioBlixText>
              <BioBlixText variant="caption" color={BioBlixPalette.muted}>
                {t('profile.spotifyHint')}
              </BioBlixText>
              <TextInput
                value={spotifyDraft}
                onChangeText={setSpotifyDraft}
                placeholder={t('profile.spotifyPlaceholder')}
                placeholderTextColor="#475569"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={styles.input}
              />
              <View style={styles.spotifyActions}>
                <Pressable
                  style={[styles.ctaBtn, styles.spotifySave, spotifyBusy && styles.ctaDisabled]}
                  onPress={() => void onSaveSpotify()}
                  disabled={spotifyBusy}
                >
                  <BioBlixText variant="label" color={BioBlixPalette.night}>
                    {t('profile.spotifySave')}
                  </BioBlixText>
                </Pressable>
                {profile.spotifyUrl ? (
                  <Pressable
                    style={[styles.ctaBtn, styles.ctaBlix, spotifyBusy && styles.ctaDisabled]}
                    onPress={() => void onClearSpotify()}
                    disabled={spotifyBusy}
                  >
                    <BioBlixText variant="label" color={BioBlixPalette.ice}>
                      {t('profile.spotifyRemove')}
                    </BioBlixText>
                  </Pressable>
                ) : null}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <BioBlixText variant="label">{t('profile.publishBlix')}</BioBlixText>
              <BioBlixText variant="caption" color={BioBlixPalette.muted}>
                {t('profile.publishBlixHint')}
              </BioBlixText>
              <Pressable
                style={[styles.ctaBtn, styles.ctaBlix]}
                onPress={() => router.push('/(tabs)/create' as Href)}
              >
                <BioBlixText variant="label" color={BioBlixPalette.ice}>
                  {t('profile.publishBlixCta')}
                </BioBlixText>
              </Pressable>
            </View>
          </View>
        ) : null}

        {profile.spotifyUrl ? (
          <View style={styles.spotifySection}>
            <BioBlixText variant="label" style={styles.sectionTitle}>
              {t('profile.spotifyNowPlaying')}
            </BioBlixText>
            <BioBlixSpotifyEmbed url={profile.spotifyUrl} />
          </View>
        ) : null}

        <BioBlixText variant="label" style={styles.sectionTitle}>
          {t('profile.linksTitle')}
        </BioBlixText>
        <View style={styles.linksDisplay}>
          {allLinks.length === 0 ? (
            <BioBlixText variant="caption" color={BioBlixPalette.muted}>
              {isSelf ? t('profile.linksEmpty') : t('profile.noLinksPublic')}
            </BioBlixText>
          ) : (
            allLinks.map((link) => (
              <Pressable
                key={link.id}
                style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                  styles.linkCard,
                  (hovered || pressed) && styles.linkCardLive,
                ]}
                onPress={() => confirmAndOpenBioBlixLink(link.url, { locale })}
              >
                <BioBlixText variant="label" numberOfLines={1}>
                  {link.title}
                </BioBlixText>
              </Pressable>
            ))
          )}
        </View>

        <BioBlixText variant="label" style={styles.sectionTitle}>
          {t('profile.everydayHeading')}
        </BioBlixText>
        {posts.length === 0 ? (
          <BioBlixText variant="caption" color={BioBlixPalette.muted}>
            {t('profile.noBlix')}
          </BioBlixText>
        ) : (
          <View style={styles.blixGrid}>
            {posts.map((post) => {
              const hasLink = Boolean(post.linkUrl?.trim());
              return (
                <Pressable
                  key={post.id}
                  style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                    styles.blixCard,
                    hasLink && styles.blixCardShoppable,
                    { width: cellSize, height: cellSize },
                    (hovered || pressed) &&
                      (hasLink ? styles.blixCardLive : styles.blixCardPressed),
                  ]}
                  onPress={() => {
                    if (hasLink) {
                      confirmAndOpenBioBlixLink(post.linkUrl!.trim(), {
                        locale,
                      });
                    } else {
                      router.push(
                        `/b/${encodeURIComponent(post.id)}` as Href
                      );
                    }
                  }}
                >
                  <Image
                    source={{ uri: post.mediaUrl }}
                    style={styles.blixImage}
                    contentFit="cover"
                    alt={
                      post.title?.trim()
                        ? `${post.title} — ${blixImageAlt(creatorLabel, seoLocale)}`
                        : blixImageAlt(creatorLabel, seoLocale)
                    }
                  />
                  {hasLink ? (
                    <View style={[styles.linkTag, BioBlixGlow.linkBadge]}>
                      <BioBlixText variant="caption" color={BioBlixPalette.night}>
                        {t('profile.linkTag')}
                      </BioBlixText>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}

        {!isSelf ? (
          <Link href="/(auth)/sign-in?reason=publish" asChild>
            <Pressable style={styles.watermark}>
              <BioBlixText
                variant="label"
                color={Colors.lime}
                style={styles.watermarkTitle}
              >
                {t('profile.madeWithShoppable')}
              </BioBlixText>
              <BioBlixText variant="caption" color={Colors.mistDim}>
                {t('profile.madeWithCta')}
              </BioBlixText>
            </Pressable>
          </Link>
        ) : null}
      </ScrollView>
    </BioBlixScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, paddingTop: 16 },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    gap: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroName: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.surface,
    marginBottom: 4,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
  },
  handleWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  handleLine: {
    textAlign: 'center',
    fontSize: 26,
    lineHeight: 32,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnFill: { backgroundColor: Colors.lime },
  btnGhost: {
    borderWidth: 1,
    borderColor: Colors.lime,
  },
  adminPanel: {
    gap: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(22, 27, 38, 0.7)',
    marginVertical: 8,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        } as object)
      : {}),
  },
  inputGroup: {
    gap: 8,
    backgroundColor: 'rgba(22, 27, 38, 0.7)',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        } as object)
      : {}),
  },
  input: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
    backgroundColor: '#0B0F19',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#FFFFFF',
    fontSize: 15,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
  },
  spotifySection: {
    gap: 8,
    marginTop: 4,
  },
  spotifyActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  spotifySave: {
    backgroundColor: BioBlixPalette.aurora,
    flexGrow: 1,
  },
  ctaBtn: {
    backgroundColor: BioBlixPalette.aurora,
    borderRadius: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    ...BioBlixGlow.cta,
  },
  ctaBlix: {
    backgroundColor: BioBlixPalette.violet,
  },
  ctaDisabled: { opacity: 0.5 },
  sectionTitle: {
    marginTop: 16,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  linksDisplay: { gap: 12 },
  linkCard: {
    backgroundColor: 'rgba(22, 27, 38, 0.7)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          transition:
            'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease',
          cursor: 'pointer',
        } as object)
      : {}),
  },
  linkCardLive: {
    borderColor: BioBlixPalette.aurora,
    transform: [{ translateY: -4 }, { scale: 1.01 }],
    shadowColor: BioBlixPalette.aurora,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  blixGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  blixCard: {
    position: 'relative',
    backgroundColor: '#161B26',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    ...(Platform.OS === 'web'
      ? ({
          transition: 'transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
          cursor: 'pointer',
        } as object)
      : {}),
  },
  /** Subtle always-on hint that the media is shoppable. */
  blixCardShoppable: {
    borderColor: 'rgba(123, 44, 191, 0.55)',
    shadowColor: BioBlixPalette.violet,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  blixCardLive: {
    borderColor: BioBlixPalette.violet,
    shadowColor: BioBlixPalette.violet,
    shadowOpacity: 0.55,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
    transform: [{ scale: 1.02 }],
  },
  blixCardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  blixImage: { width: '100%', height: '100%' },
  linkTag: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: BioBlixPalette.aurora,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  watermark: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 28,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceMuted,
  },
  watermarkTitle: { textAlign: 'center' },
});
