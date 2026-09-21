import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { Brand } from '@/constants/theme';

type OnboardingCtaProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
};

export function OnboardingCta({ label, disabled, ...props }: OnboardingCtaProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      style={({ pressed }) => [
        styles.cta,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      {...props}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cta: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: 600,
    color: '#FFFFFF',
  },
});
