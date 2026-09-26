import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import {
  BioBlixPalette,
  BioBlixRadii,
  BioBlixSpacing,
} from '@/constants/bioblixTheme';
import { COUNTRIES, getCountryName } from '@/lib/i18n/countries';
import { useI18n } from '@/lib/i18n';

type CountryPickerProps = {
  value: string | null;
  onChange: (code: string) => void;
  /** Compact field used in forms */
  label?: string;
};

export function CountryPicker({ value, onChange, label }: CountryPickerProps) {
  const { t, setCountryCode } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [query]);

  const display = getCountryName(value) ?? t('auth.country');

  return (
    <View style={styles.wrap}>
      {label ? (
        <BioBlixText variant="caption" color={BioBlixPalette.muted} style={styles.label}>
          {label}
        </BioBlixText>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.field}
        accessibilityRole="button"
      >
        <BioBlixText variant="body" color={BioBlixPalette.fog}>
          {value ? display : t('auth.country')}
        </BioBlixText>
        <BioBlixText variant="caption" color={BioBlixPalette.cyan}>
          {value ?? '▼'}
        </BioBlixText>
      </Pressable>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <BioBlixText variant="title">{t('auth.country')}</BioBlixText>
            <Pressable onPress={() => setOpen(false)}>
              <BioBlixText variant="caption" color={BioBlixPalette.cyan}>
                {t('common.cancel')}
              </BioBlixText>
            </Pressable>
          </View>
          <TextInput
            autoFocus
            placeholder={t('auth.countrySearch')}
            placeholderTextColor={BioBlixPalette.muted}
            style={styles.search}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.row,
                  value === item.code && styles.rowSelected,
                ]}
                onPress={() => {
                  onChange(item.code);
                  setCountryCode(item.code);
                  setOpen(false);
                  setQuery('');
                }}
              >
                <BioBlixText variant="body">{item.name}</BioBlixText>
                <BioBlixText variant="caption" color={BioBlixPalette.muted}>
                  {item.code}
                </BioBlixText>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { marginBottom: 2 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BioBlixPalette.nightElevated,
    borderRadius: BioBlixRadii.md,
    paddingHorizontal: BioBlixSpacing.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: BioBlixPalette.hairline,
  },
  modal: {
    flex: 1,
    backgroundColor: BioBlixPalette.night,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: BioBlixSpacing.lg,
    marginBottom: 12,
  },
  search: {
    marginHorizontal: BioBlixSpacing.lg,
    marginBottom: 8,
    backgroundColor: BioBlixPalette.nightElevated,
    borderRadius: BioBlixRadii.md,
    paddingHorizontal: BioBlixSpacing.md,
    paddingVertical: 12,
    color: BioBlixPalette.fog,
    borderWidth: 1,
    borderColor: BioBlixPalette.hairline,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: BioBlixSpacing.lg,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BioBlixPalette.hairline,
  },
  rowSelected: {
    backgroundColor: BioBlixPalette.nightElevated,
  },
});
