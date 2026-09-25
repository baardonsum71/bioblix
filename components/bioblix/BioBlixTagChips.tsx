import { Pressable, StyleSheet, View } from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixPalette, BioBlixRadii, Colors } from '@/constants/bioblixTheme';

type BioBlixTagChipsProps = {
  tags: string[];
  onPressTag?: (tag: string) => void;
  onRemoveTag?: (tag: string) => void;
  /** Show count next to name when provided as map slug -> count */
  counts?: Record<string, number>;
  compact?: boolean;
};

export function BioBlixTagChips({
  tags,
  onPressTag,
  onRemoveTag,
  counts,
  compact,
}: BioBlixTagChipsProps) {
  if (!tags.length) return null;

  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      {tags.map((tag) => {
        const count = counts?.[tag];
        const label =
          count != null ? `#${tag} · ${count}` : `#${tag}`;
        return (
          <Pressable
            key={tag}
            onPress={() => onPressTag?.(tag)}
            onLongPress={() => onRemoveTag?.(tag)}
            style={({ pressed }) => [
              styles.chip,
              compact && styles.chipCompact,
              pressed && styles.chipPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            <BioBlixText
              variant="caption"
              color={Colors.lime}
              numberOfLines={1}
            >
              {label}
            </BioBlixText>
            {onRemoveTag ? (
              <Pressable
                onPress={() => onRemoveTag(tag)}
                hitSlop={8}
                accessibilityLabel={`Fjern ${tag}`}
              >
                <BioBlixText variant="caption" color={BioBlixPalette.muted}>
                  {' '}
                  ×
                </BioBlixText>
              </Pressable>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  rowCompact: {
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BioBlixPalette.hairline,
    backgroundColor: Colors.surface,
    borderRadius: BioBlixRadii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipCompact: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipPressed: {
    opacity: 0.75,
  },
});
