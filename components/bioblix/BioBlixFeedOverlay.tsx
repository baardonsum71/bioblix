import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { confirmAndOpenBioBlixLink, bioBlixLinkCtaLabel } from '@/components/bioblix/bioBlixLinks';
import { BioBlixTagChips } from '@/components/bioblix/BioBlixTagChips';
import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { Colors } from '@/constants/Colors';

type BioBlixFeedOverlayProps = {
  title: string;
  description: string;
  username: string;
  tags?: string[];
  linkUrl?: string | null;
};

export function BioBlixFeedOverlay({
  title,
  description,
  username,
  tags = [],
  linkUrl,
}: BioBlixFeedOverlayProps) {
  const router = useRouter();
  const hasLink = Boolean(linkUrl?.trim());

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.scrim} pointerEvents="none" />
      <View style={styles.content}>
        <BioBlixText variant="caption" color={Colors.lime}>
          @{username}
        </BioBlixText>
        <BioBlixText variant="title" numberOfLines={2}>
          {title}
        </BioBlixText>
        {description ? (
          <BioBlixText variant="body" color={Colors.mist} numberOfLines={3}>
            {description}
          </BioBlixText>
        ) : null}

        {tags.length > 0 ? (
          <BioBlixTagChips
            tags={tags}
            compact
            onPressTag={(tag) =>
              router.push(`/tags/${encodeURIComponent(tag)}` as Href)
            }
          />
        ) : null}

        {hasLink ? (
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            onPress={() => confirmAndOpenBioBlixLink(linkUrl!.trim())}
          >
            <BioBlixText variant="title" color={Colors.ink}>
              {bioBlixLinkCtaLabel(linkUrl!)}
            </BioBlixText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    top: '42%',
    backgroundColor: Colors.scrim,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 48,
    gap: 8,
  },
  cta: {
    marginTop: 12,
    alignSelf: 'stretch',
    backgroundColor: Colors.lime,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  ctaPressed: {
    backgroundColor: Colors.limePressed,
    transform: [{ scale: 0.99 }],
  },
});
