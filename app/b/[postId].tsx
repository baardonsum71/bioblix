import { Image } from 'expo-image';
import { Link, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  bioBlixLinkCtaLabel,
  confirmAndOpenBioBlixLink,
} from '@/components/bioblix/bioBlixLinks';
import { BioBlixHead } from '@/components/bioblix/BioBlixHead';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixScreenShell } from '@/components/bioblix/BioBlixLogo';
import { BioBlixRadii } from '@/constants/bioblixTheme';
import { Colors } from '@/constants/Colors';
import { useI18n } from '@/lib/i18n';
import { notify } from '@/lib/platform';
import {
  blixImageAlt,
  buildBlixSeo,
  type SeoLocale,
} from '@/lib/seo/profileMeta';
import { shareBlix } from '@/lib/shareProfile';
import { getPostById } from '@/services/posts';
import { getUserById } from '@/services/users';
import type { Post, User } from '@/types';

/**
 * Mobile-first shareable blix page — shoppable media + growth watermark.
 */
export default function SharedBlixScreen() {
  const { postId: rawId } = useLocalSearchParams<{ postId: string }>();
  const postId = typeof rawId === 'string' ? decodeURIComponent(rawId) : '';
  const router = useRouter();
  const { t, locale } = useI18n();
  const seoLocale: SeoLocale = locale === 'en' ? 'en' : 'nb';
  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const p = await getPostById(postId);
      setPost(p);
      if (p) {
        try {
          setAuthor(await getUserById(p.userId));
        } catch {
          setAuthor(null);
        }
      }
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error')
      );
    } finally {
      setLoading(false);
    }
  }, [postId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!postId) {
    return (
      <BioBlixScreenShell style={styles.center}>
        <BioBlixText>{t('blix.notFound')}</BioBlixText>
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

  if (!post) {
    return (
      <BioBlixScreenShell style={styles.center}>
        <BioBlixText>{t('blix.notFound')}</BioBlixText>
      </BioBlixScreenShell>
    );
  }

  const hasLink = Boolean(post.linkUrl?.trim());
  const name = author?.displayName ?? 'BioBlix';
  const seo = buildBlixSeo({
    postId: post.id,
    title: post.title,
    description: post.description,
    mediaUrl: post.mediaUrl,
    authorName: author?.displayName,
    locale: seoLocale,
  });

  return (
    <BioBlixScreenShell style={styles.shell}>
      <BioBlixHead seo={seo} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable
          onPress={() =>
            router.push(`/u/${encodeURIComponent(post.userId)}` as Href)
          }
        >
          <BioBlixText variant="caption" color={Colors.lime}>
            @{name}
          </BioBlixText>
        </Pressable>

        <Pressable
          onPress={() => {
            if (hasLink) {
              confirmAndOpenBioBlixLink(post.linkUrl!.trim(), { locale });
            }
          }}
          style={styles.mediaWrap}
        >
          <Image
            source={{ uri: post.mediaUrl }}
            style={styles.media}
            contentFit="cover"
            alt={
              post.title?.trim()
                ? `${post.title} — ${blixImageAlt(name, seoLocale)}`
                : blixImageAlt(name, seoLocale)
            }
          />
          {hasLink ? (
            <View style={styles.linkBadge}>
              <BioBlixText variant="caption" color={Colors.ink}>
                ↗
              </BioBlixText>
            </View>
          ) : null}
        </Pressable>

        <BioBlixText variant="title">{post.title}</BioBlixText>
        {post.description ? (
          <BioBlixText variant="body" color={Colors.mistDim}>
            {post.description}
          </BioBlixText>
        ) : null}

        {hasLink ? (
          <Pressable
            style={styles.cta}
            onPress={() =>
              confirmAndOpenBioBlixLink(post.linkUrl!.trim(), { locale })
            }
          >
            <BioBlixText variant="label" color={Colors.ink}>
              {bioBlixLinkCtaLabel(post.linkUrl!, locale)}
            </BioBlixText>
          </Pressable>
        ) : null}

        <Pressable
          style={styles.shareBtn}
          onPress={() =>
            void shareBlix({
              postId: post.id,
              title: post.title,
              message: t('share.blix', { title: post.title }),
            }).then(() => notify(t('account.share'), t('blix.shared')))
          }
        >
          <BioBlixText variant="label" color={Colors.lime}>
            {t('blix.shareThis')}
          </BioBlixText>
        </Pressable>

        <Link href="/(auth)/sign-in?reason=publish" asChild>
          <Pressable style={styles.watermark}>
            <BioBlixText variant="caption" color={Colors.mistDim}>
              {t('profile.madeWithShoppable')}
            </BioBlixText>
          </Pressable>
        </Link>
      </ScrollView>
    </BioBlixScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, paddingTop: 16 },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BioBlixRadii.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  linkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    backgroundColor: Colors.lime,
    borderRadius: BioBlixRadii.md,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  shareBtn: {
    borderWidth: 1,
    borderColor: Colors.lime,
    borderRadius: BioBlixRadii.md,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermark: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
