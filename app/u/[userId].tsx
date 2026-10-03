import { useAuth } from '@clerk/expo';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixProfileLinks } from '@/components/bioblix/BioBlixProfileLinks';
import { BioBlixScreenShell } from '@/components/bioblix/BioBlixLogo';
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
import { getUserById } from '@/services/users';
import type { User } from '@/types';

export default function PublicProfileScreen() {
  const { userId: rawId } = useLocalSearchParams<{ userId: string }>();
  const userId = typeof rawId === 'string' ? decodeURIComponent(rawId) : '';
  const { userId: viewerId, isSignedIn } = useAuth();
  const router = useRouter();
  const { t } = useI18n();

  const [profile, setProfile] = useState<User | null>(null);
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

        <View style={styles.linksWrap}>
          <BioBlixProfileLinks
            links={profile.profileLinks ?? []}
            editableUserId={isSelf ? userId : undefined}
            onSaved={(next) =>
              setProfile((prev) =>
                prev ? { ...prev, profileLinks: next } : prev
              )
            }
          />
        </View>

        <Link href="/(auth)/sign-in?reason=publish" asChild>
          <Pressable style={styles.watermark}>
            <BioBlixText variant="caption" color={Colors.mistDim}>
              {t('profile.madeWith')}
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
    paddingBottom: 40,
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
  linksWrap: {
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  watermark: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 16,
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
