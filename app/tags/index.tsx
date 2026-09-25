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
import { listAllTags } from '@/services/tags';
import type { Tag } from '@/types';

export default function TagsScreen() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTags(await listAllTags(200));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke hente tags');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <BioBlixScreenShell style={styles.shell}>
      <BioBlixText variant="display">Alle tags</BioBlixText>
      <BioBlixText variant="body" color={Colors.mistDim} style={styles.lead}>
        Sortert etter popularitet (antall blix).
      </BioBlixText>

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
          Ingen tags ennå. Legg til tags når du publiserer et blix.
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
              <BioBlixText variant="caption" color={Colors.lime}>
                {item.postCount}{' '}
                {item.postCount === 1 ? 'blix' : 'blix'}
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
    padding: 20,
    paddingTop: 56,
    gap: 8,
    flex: 1,
  },
  lead: {
    marginBottom: 8,
    maxWidth: 420,
  },
  spinner: {
    marginVertical: 16,
    alignSelf: 'flex-start',
  },
  list: {
    paddingBottom: 48,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
    marginBottom: 8,
  },
  name: {
    flex: 1,
  },
});
