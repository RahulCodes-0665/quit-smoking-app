import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { ONBOARDING_STEPS } from '@/lib/onboarding';

type OnboardingHeaderProps = {
  step: number;
  editing?: boolean;
};

export function OnboardingHeader({ step, editing = false }: OnboardingHeaderProps) {
  const router = useRouter();

  return (
    <View style={[styles.row, editing && styles.rowEditing]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={12}
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <View style={styles.chevron} />
      </Pressable>

      {editing ? null : (
        <View style={styles.progress}>
          <View style={styles.progressTrack} />
          <View style={styles.progressArc} />
          <Text style={styles.progressLabel}>
            {step}/{ONBOARDING_STEPS}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowEditing: {
    justifyContent: 'flex-start',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  chevron: {
    width: 12,
    height: 12,
    marginLeft: 4,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: Brand.ink,
    transform: [{ rotate: '45deg' }],
  },
  pressed: {
    opacity: 0.6,
  },
  progress: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: Brand.goldSoft,
  },
  progressArc: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: Brand.gold,
    transform: [{ rotate: '18deg' }],
  },
  progressLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: 600,
    color: Brand.ink,
    fontVariant: ['tabular-nums'],
  },
});
