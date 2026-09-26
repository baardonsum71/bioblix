import { useAuth } from '@clerk/expo';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixVerticalFeed } from '@/components/bioblix/BioBlixVerticalFeed';
import { BioBlixScreenShell } from '@/components/bioblix/BioBlixLogo';
import { BioBlixPalette } from '@/constants/bioblixTheme';
import { Colors } from '@/constants/Colors';
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

export default function PublicProfileScreen() {
  const { userId: rawId } = useLocalSearchParams<{ userId: string }>();
  const userId = typeof rawId === 'string' ? decodeURIComponent(rawId) : '';
  const { userId: viewerId, isSignedIn } = useAuth();
  const router = useRouter();
  const { t } = useI18n();

  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [followingThem, setFollowingThem] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const user = await getUserById(userId);
      setProfile(user);

      try {
        setPosts(await listPostsByUser(userId, 30));
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
      notify(t('social.signInRequired'), t('social.signInRequiredBody'));
      router.push('/(auth)/sign-in' as Href);
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

  return (
    <BioBlixScreenShell style={styles.shell}>
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
            style={[styles.btn, followingThem ? styles.btnGhost : styles.btnFill]}
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
        <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => void onShare()}>
          <BioBlixText variant="label" color={Colors.lime}>
            {t('profile.share')}
          </BioBlixText>
        </Pressable>
      </View>

      <BioBlixText variant="label" color={Colors.mistDim} style={styles.section}>
        {t('profile.blixSection', { count: posts.length })}
      </BioBlixText>

      <View style={styles.feedWrap}>
        <BioBlixVerticalFeed
          posts={posts}
          loading={false}
          viewerUserId={viewerId ?? null}
          usernameFor={() => profile.displayName}
          emptyMessage={t('profile.noBlix')}
          onDeleted={(postId) =>
            setPosts((prev) => prev.filter((p) => p.id !== postId))
          }
          requireFocus={false}
        />
      </View>
    </BioBlixScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    paddingTop: 16,
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
    paddingHorizontal: 20,
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
    marginBottom: 12,
    paddingHorizontal: 20,
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  feedWrap: {
    flex: 1,
    minHeight: 360,
  },
});
