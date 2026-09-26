import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixPalette, BioBlixRadii } from '@/constants/bioblixTheme';
import { Colors } from '@/constants/Colors';
import type { Post } from '@/types';

type BioBlixPostCardProps = {
  post: Post;
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
};

/**
 * Profile/account post card — same 9:16 framing as feed preview (full image via contain).
 */
export function BioBlixPostCard({
  post,
  onEdit,
  onDelete,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
}: BioBlixPostCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.mediaWrap}>
        <Image
          source={{ uri: post.mediaUrl }}
          style={styles.media}
          contentFit="contain"
        />
      </View>
      <View style={styles.meta}>
        <BioBlixText variant="body" numberOfLines={2}>
          {post.title}
        </BioBlixText>
        <BioBlixText variant="caption" color={Colors.mistDim} numberOfLines={2}>
          {post.description || post.mediaType}
        </BioBlixText>
        {onEdit || onDelete ? (
          <View style={styles.actions}>
            {onEdit ? (
              <Pressable onPress={onEdit} hitSlop={8} style={styles.actionBtn}>
                <BioBlixText variant="caption" color={Colors.lime}>
                  {editLabel}
                </BioBlixText>
              </Pressable>
            ) : null}
            {onDelete ? (
              <Pressable onPress={onDelete} hitSlop={8} style={styles.actionBtn}>
                <BioBlixText variant="caption" color={BioBlixPalette.magenta}>
                  {deleteLabel}
                </BioBlixText>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  mediaWrap: {
    width: 108,
    aspectRatio: 9 / 16,
    borderRadius: BioBlixRadii.sm,
    overflow: 'hidden',
    backgroundColor: BioBlixPalette.night,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  meta: {
    flex: 1,
    gap: 4,
    paddingTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  actionBtn: {
    paddingVertical: 4,
  },
});
