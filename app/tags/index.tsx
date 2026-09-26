import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Link, type Href } from 'expo-router';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import { BioBlixScreenShell } from '@/components/bioblix/BioBlixLogo';
import { BioBlixPalette, Colors } from '@/constants/bioblixTheme';
import { useI18n } from '@/lib/i18n';
import { listAllTags } from '@/services/tags';
import type { Tag } from '@/types';

export default function TagsScreen() {
  const { t } = useI18n();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTags(await listAllTags(200));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <BioBlixScreenShell style={styles.shell}>
      <BioBlixText variant="display">{t('nav.tags')}</BioBlixText>

      {loading ? (
        <ActivityIndicator color={Colors.lime} style={styles.spinner} />
      ) : null}
      {error ? (
        <BioBlixText variant="caption" color={BioBlixPalette.danger}>
          {error}
        </BioBlixText>
      ) : null}

      {!loading && tags.length === 0 ? (
        <BioBlixText variant="body" color={Colors.mistDim}>
          {t('tags.empty')}
        </BioBlixText>
      ) : null}

      <FlatList
        data={tags}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <Link href={`/tags/${encodeURIComponent(item.name)}` as Href} asChild>
            <Pressable style={styles.row}>
              <BioBlixText variant="caption" color={Colors.mistDim}>
                #{index + 1}
              </BioBlixText>
              <BioBlixText variant="title" style={styles.name}>
                #{item.name}
              </BioBlixText>
              <BioBlixText variant="caption" color={Colors.mistDim}>
                {item.postCount}
              </BioBlixText>
            </Pressable>
          </Link>
        )}
      />
    </BioBlixScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  spinner: {
    marginVertical: 16,
  },
  list: {
    gap: 8,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BioBlixPalette.hairline,
  },
  name: {
    flex: 1,
  },
});
