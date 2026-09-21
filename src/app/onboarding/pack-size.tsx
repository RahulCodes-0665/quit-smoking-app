import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OnboardingCta } from '@/components/onboarding-cta';
import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { Brand, Fonts, Spacing } from '@/constants/theme';
import { saveOnboardingPackSize } from '@/lib/onboarding';

const DEFAULT_SIZE = 20;
const MIN_SIZE = 5;
const MAX_SIZE = 50;
const PRESETS = [
  { value: 10, label: '10s' },
  { value: 20, label: '20 (Standard)' },
  { value: 25, label: '25s' },
] as const;

export default function PackSizeScreen() {
  const router = useRouter();
  const [size, setSize] = useState(DEFAULT_SIZE);

  return (
    <OnboardingScreen
      footer={
        <OnboardingCta
          label="Continue"
          onPress={() => {
            void saveOnboardingPackSize(size);
            router.push('/onboarding/reasons');
          }}
        />
      }>
      <OnboardingHeader step={6} />

      <View style={styles.body}>
        <View style={styles.hero}>
          <Text style={styles.title}>How many cigarettes are in a pack?</Text>
          <Text style={styles.subtitle}>
            Standard packs usually contain 20, but this varies by region and brand.
          </Text>
        </View>

        <View style={styles.cardWrap}>
          <View style={styles.card}>
            <View style={styles.stepperRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decrease cigarettes per pack"
                disabled={size <= MIN_SIZE}
                onPress={() => setSize((current) => Math.max(MIN_SIZE, current - 1))}
                style={({ pressed }) => [
                  styles.stepper,
                  size <= MIN_SIZE && styles.stepperDisabled,
                  pressed && size > MIN_SIZE && styles.pressed,
                ]}>
                <Text style={styles.stepperLabel}>−</Text>
              </Pressable>

              <View style={styles.countBlock}>
                <Text style={styles.count}>{size}</Text>
                <Text style={styles.countHint}>cigarettes</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Increase cigarettes per pack"
                disabled={size >= MAX_SIZE}
                onPress={() => setSize((current) => Math.min(MAX_SIZE, current + 1))}
                style={({ pressed }) => [
                  styles.stepper,
                  size >= MAX_SIZE && styles.stepperDisabled,
                  pressed && size < MAX_SIZE && styles.pressed,
                ]}>
                <Text style={styles.stepperLabel}>+</Text>
              </Pressable>
            </View>

            <View style={styles.presets}>
              {PRESETS.map((preset) => {
                const selected = size === preset.value;

                return (
                  <Pressable
                    key={preset.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={preset.label}
                    onPress={() => setSize(preset.value)}
                    style={({ pressed }) => [
                      styles.preset,
                      selected ? styles.presetSelected : styles.presetIdle,
                      pressed && styles.pressed,
                    ]}>
                    <Text style={[styles.presetLabel, selected && styles.presetLabelSelected]}>
                      {preset.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <Text style={styles.footnote}>
          We use this to calculate your exact financial & health milestones accurately.
        </Text>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  hero: {
    marginTop: Spacing.five,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontFamily: Fonts.serif,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 600,
    color: Brand.ink,
  },
  subtitle: {
    marginTop: Spacing.two,
    maxWidth: 320,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 400,
    color: Brand.muted,
  },
  cardWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 18,
  },
  stepperRow: {
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
  countHint: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 400,
    color: Brand.muted,
  },
  presets: {
    marginTop: Spacing.four,
    borderRadius: 22,
    backgroundColor: Brand.pill,
    padding: 6,
    flexDirection: 'row',
    gap: 6,
  },
  preset: {
    flex: 1,
    minHeight: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  presetIdle: {
    backgroundColor: 'transparent',
  },
  presetSelected: {
    backgroundColor: Brand.gold,
  },
  presetLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 600,
    color: Brand.muted,
    textAlign: 'center',
  },
  presetLabelSelected: {
    color: '#FFFFFF',
  },
  footnote: {
    marginBottom: Spacing.four,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
    color: Brand.muted,
  },
});
