import { StyleSheet, Text, type TextProps } from 'react-native';

import { BioBlixPalette, BioBlixType } from '@/constants/bioblixTheme';

type Variant = keyof typeof BioBlixType;

type BioBlixTextProps = TextProps & {
  variant?: Variant;
  color?: string;
};

export function BioBlixText({
  variant = 'body',
  color = BioBlixPalette.ice,
  style,
  ...props
}: BioBlixTextProps) {
  return (
    <Text {...props} style={[BioBlixType[variant], { color }, style]} />
  );
}

export const bioBlixShadows = StyleSheet.create({
  soft: {
    shadowColor: BioBlixPalette.night,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
});
