import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OnboardingCta } from '@/components/onboarding-cta';
import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { Brand, Fonts, Spacing } from '@/constants/theme';
import { saveOnboardingGoal, type OnboardingGoal } from '@/lib/onboarding';

const OPTIONS: {
  value: OnboardingGoal;
  title: string;
  description: string;
  icon: 'check' | 'reduce';
}[] = [
  {
    value: 'quit-completely',
    title: 'Quit completely',
    description: 'Stop smoking for good.',
    icon: 'check',
  },
  {
    value: 'reduce-smoking',
    title: 'Reduce smoking',
    description: 'Cut down at your own pace.',
    icon: 'reduce',
  },
];

export default function GoalScreen() {
  const router = useRouter();
  const [goal, setGoal] = useState<OnboardingGoal>('quit-completely');

  return (
    <OnboardingScreen
      footer={
        <OnboardingCta
          label="Continue"
          onPress={() => {
            void saveOnboardingGoal(goal);
            router.push('/onboarding/begin');
          }}
        />
      }>
      <OnboardingHeader step={1} />

      <Text style={styles.title}>What is your goal?</Text>
      <Text style={styles.subtitle}>
        Take a quiet breath. You are in complete control of your pace.
      </Text>

      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const selected = option.value === goal;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${option.title}. ${option.description}`}
              onPress={() => setGoal(option.value)}
              style={({ pressed }) => [
                styles.option,
                selected ? styles.optionSelected : styles.optionIdle,
                pressed && styles.optionPressed,
              ]}>
              <View style={[styles.iconWell, selected && styles.iconWellSelected]}>
                {option.icon === 'check' ? <CheckGlyph /> : <ReduceGlyph />}
              </View>
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <CheckGlyph color="#FFFFFF" size={10} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.note}>
        <View style={styles.noteBar} />
        <View style={styles.noteCopy}>
          <Text style={styles.noteTitle}>No wrong answers</Text>
          <Text style={styles.noteBody}>
            Your journey adapts as you evolve. You can re-align this goal anytime inside your
            settings.
          </Text>
        </View>
      </View>
    </OnboardingScreen>
  );
}

function CheckGlyph({ color = Brand.gold, size = 12 }: { color?: string; size?: number }) {
  return (
    <View
      style={[
        styles.check,
        {
          width: size,
          height: size * 0.62,
          borderBottomColor: color,
          borderLeftColor: color,
        },
      ]}
    />
  );
}

function ReduceGlyph() {
  return (
    <View style={styles.reduceIcon}>
      <View style={[styles.reduceBar, styles.reduceBarWide]} />
      <View style={[styles.reduceBar, styles.reduceBarNarrow]} />
    </View>
  );
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
  options: {
    marginTop: Spacing.four,
    gap: Spacing.three,
  },
  option: {
    minHeight: 88,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionSelected: {
    backgroundColor: Brand.goldSelected,
  },
  optionIdle: {
    backgroundColor: Brand.pill,
  },
  optionPressed: {
    opacity: 0.92,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWellSelected: {
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: 700,
    color: Brand.ink,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
    color: Brand.muted,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Brand.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: Brand.gold,
  },
  check: {
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    transform: [{ rotate: '-45deg' }, { translateY: -1 }],
  },
  reduceIcon: {
    width: 18,
    height: 12,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reduceBar: {
    height: 3,
    borderRadius: 2,
    backgroundColor: Brand.gold,
  },
  reduceBarWide: {
    width: 16,
  },
  reduceBarNarrow: {
    width: 10,
  },
  note: {
    marginTop: Spacing.four,
    borderRadius: 22,
    backgroundColor: Brand.pill,
    paddingVertical: 18,
    paddingRight: 18,
    paddingLeft: 18,
    flexDirection: 'row',
    gap: 12,
  },
  noteBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: Brand.leaf,
    marginVertical: 2,
  },
  noteCopy: {
    flex: 1,
    gap: 6,
  },
  noteTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 700,
    color: Brand.ink,
  },
  noteBody: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 400,
    color: Brand.muted,
  },
});
