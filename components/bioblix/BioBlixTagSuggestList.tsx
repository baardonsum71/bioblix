import { Pressable, StyleSheet, View } from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixPalette, BioBlixRadii } from '@/constants/bioblixTheme';
import { Colors } from '@/constants/Colors';
import { useI18n } from '@/lib/i18n';
import { formatTagPostCount } from '@/lib/i18n/formatTagCount';
import type { Tag } from '@/types';

type BioBlixTagSuggestListProps = {
  suggestions: Tag[];
  onSelect: (slug: string) => void;
  /** Hide tags already added to the post. */
  exclude?: string[];
};

/**
 * Instagram-style tag autocomplete: #name · popularity on the right.
 */
export function BioBlixTagSuggestList({
  suggestions,
  onSelect,
  exclude = [],
}: BioBlixTagSuggestListProps) {
  const { t, locale } = useI18n();
  const rows = suggestions.filter((s) => !exclude.includes(s.name));
  if (rows.length === 0) return null;

  return (
    <View style={styles.list}>
      {rows.map((tag) => {
        const countLabel = formatTagPostCount(tag.postCount, locale);
        const postsLabel = t('tags.postCount', { count: countLabel });
        return (
          <Pressable
            key={tag.id}
            onPress={() => onSelect(tag.name)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            accessibilityRole="button"
            accessibilityLabel={`#${tag.name}, ${postsLabel}`}
          >
            <BioBlixText variant="title" color={Colors.white} numberOfLines={1}>
              #{tag.name}
            </BioBlixText>
            <BioBlixText variant="caption" color={Colors.mistDim}>
              {postsLabel}
            </BioBlixText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: 4,
    marginBottom: 8,
    borderRadius: BioBlixRadii.md,
    borderWidth: 1,
    borderColor: BioBlixPalette.hairline,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BioBlixPalette.hairline,
  },
  rowPressed: {
    backgroundColor: BioBlixPalette.nightElevated,
  },
});
