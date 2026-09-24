import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { BioBlixText } from '@/components/bioblix/BioBlixText';
import {
  BioBlixGradient,
  BioBlixPalette,
  BioBlixRadii,
} from '@/constants/bioblixTheme';

const wordmark = require('../../assets/images/logo-wordmark.jpg');
const mark = require('../../assets/images/logo-mark.jpg');

type LogoVariant = 'wordmark' | 'mark';

type BioBlixLogoProps = {
  /** Full BioBlix lockup on auth/hero; B-mark for tabs/compact chrome. */
  variant?: LogoVariant;
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

/**
 * Brand logo.
 * Use `wordmark` on login / account heroes; `mark` in tab bar and tight spaces.
 */
export function BioBlixLogo({
  variant = 'wordmark',
  size = variant === 'wordmark' ? 112 : 32,
  style,
  imageStyle,
}: BioBlixLogoProps) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Image
        source={variant === 'wordmark' ? wordmark : mark}
        style={[
          {
            width: size,
            height: size,
            borderRadius: variant === 'mark' ? BioBlixRadii.lg : BioBlixRadii.xl,
          },
          imageStyle,
        ]}
        contentFit="cover"
        accessibilityLabel={
          variant === 'wordmark' ? 'BioBlix' : 'BioBlix merke'
        }
      />
    </View>
  );
}

type ScreenShellProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Dark canvas with soft neon wash — used on auth / account. */
export function BioBlixScreenShell({ children, style }: ScreenShellProps) {
  return (
    <View style={[styles.shell, style]}>
      <LinearGradient
        colors={[...BioBlixGradient.soft]}
        locations={[0, 0.45, 1]}
        start={BioBlixGradient.start}
        end={BioBlixGradient.end}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

type GradientButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function BioBlixGradientButton({
  label,
  onPress,
  disabled,
  loading,
  style,
}: GradientButtonProps) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={[styles.ctaPress, (disabled || loading) && styles.ctaDisabled, style]}
    >
      <LinearGradient
        colors={[...BioBlixGradient.colors]}
        locations={[...BioBlixGradient.locations]}
        start={BioBlixGradient.start}
        end={BioBlixGradient.end}
        style={styles.ctaGradient}
      >
        {loading ? (
          <ActivityIndicator color={BioBlixPalette.night} />
        ) : (
          <BioBlixText variant="label" color={BioBlixPalette.night}>
            {label}
          </BioBlixText>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: BioBlixPalette.night,
    overflow: 'hidden',
  },
  ctaPress: {
    borderRadius: BioBlixRadii.md,
    overflow: 'hidden',
  },
  ctaDisabled: {
    opacity: 0.45,
  },
  ctaGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
