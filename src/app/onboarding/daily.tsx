import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OnboardingCta } from '@/components/onboarding-cta';
import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { SproutIcon } from '@/components/sprout-icon';
import { Brand, Fonts, Spacing } from '@/constants/theme';
import { saveOnboardingDailyCigarettes } from '@/lib/onboarding';

const DEFAULT_COUNT = 10;
const MIN_COUNT = 1;
const MAX_COUNT = 80;
const CIGARETTES_PER_PACK = 20;

export default function DailyScreen() {
  const router = useRouter();
  const [count, setCount] = useState(DEFAULT_COUNT);

  return (
    <OnboardingScreen
      footer={
        <View style={styles.footer}>
          <OnboardingCta
            label="Continue"
            onPress={() => {
              void saveOnboardingDailyCigarettes(count);
              router.push('/onboarding/triggers');
            }}
          />
          <Text style={styles.fineTune}>You can fine-tune this anytime in your journal settings</Text>
        </View>
      }>
      <OnboardingHeader step={4} />

      <Text style={styles.title}>How many cigarettes do you smoke each day?</Text>
      <Text style={styles.subtitle}>An estimate is enough. This helps shape your gentle pace.</Text>

      <View style={styles.stepperCard}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Decrease daily cigarettes"
          disabled={count <= MIN_COUNT}
          onPress={() => setCount((current) => Math.max(MIN_COUNT, current - 1))}
          style={({ pressed }) => [
            styles.stepper,
            count <= MIN_COUNT && styles.stepperDisabled,
            pressed && count > MIN_COUNT && styles.pressed,
          ]}>
          <Text style={styles.stepperLabel}>−</Text>
        </Pressable>

        <View style={styles.countBlock}>
          <Text style={styles.count}>{count}</Text>
          <Text style={styles.perDay}>per day</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Increase daily cigarettes"
          disabled={count >= MAX_COUNT}
          onPress={() => setCount((current) => Math.min(MAX_COUNT, current + 1))}
          style={({ pressed }) => [
            styles.stepper,
            count >= MAX_COUNT && styles.stepperDisabled,
            pressed && count < MAX_COUNT && styles.pressed,
          ]}>
          <Text style={styles.stepperLabel}>+</Text>
        </Pressable>
      </View>

      <View style={styles.pill}>
        <SproutIcon />
        <Text style={styles.pillText}>{packEstimateCopy(count)}</Text>
      </View>
    </OnboardingScreen>
  );
}

function packEstimateCopy(count: number): string {
  if (count === 1) {
    return 'About one cigarette daily';
  }

  const packs = count / CIGARETTES_PER_PACK;

  if (packs < 0.2) {
    return 'A few cigarettes daily';
  }

  if (packs < 0.4) {
    return 'About a quarter pack daily';
  }

  if (packs < 0.65) {
    return 'About half a pack daily';
  }

  if (packs < 0.9) {
    return 'About three-quarters of a pack daily';
  }

  if (packs < 1.25) {
    return 'About a pack daily';
  }

  if (packs < 1.75) {
    return 'About a pack and a half daily';
  }

  const rounded = Math.round(packs * 2) / 2;
  if (rounded % 1 === 0) {
    return `About ${rounded} packs daily`;
  }

  return `About ${rounded} packs daily`;
}

const styles = StyleSheet.create({
  title: {
    marginTop: Spacing.four,
    fontFamily: Fonts.serif,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 600,
    color: Brand.ink,
  },
  subtitle: {
    marginTop: Spacing.two,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 400,
    color: Brand.muted,
  },
  stepperCard: {
    marginTop: Spacing.five,
    minHeight: 168,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Brand.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperDisabled: {
    opacity: 0.4,
  },
  stepperLabel: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: 400,
    color: Brand.gold,
  },
  pressed: {
    opacity: 0.88,
  },
  countBlock: {
    alignItems: 'center',
    minWidth: 96,
  },
  count: {
    fontFamily: Fonts.serif,
    fontSize: 56,
    lineHeight: 64,
    fontWeight: 600,
    color: Brand.ink,
  },
  perDay: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 400,
    color: Brand.muted,
  },
  pill: {
    marginTop: Spacing.four,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: Brand.pill,
  },
  pillText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    color: Brand.leaf,
  },
  footer: {
    gap: Spacing.three,
  },
  fineTune: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 400,
    color: Brand.muted,
  },
});
