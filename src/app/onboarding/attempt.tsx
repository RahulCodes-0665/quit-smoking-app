import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { OnboardingCta } from '@/components/onboarding-cta';
import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { Brand, Fonts, Spacing } from '@/constants/theme';
import {
  saveOnboardingAttempt,
  type OnboardingAttempt,
} from '@/lib/onboarding';

const OPTIONS: {
  value: OnboardingAttempt;
  title: string;
  description: string;
  icon: 'first' | 'retry' | 'lock';
}[] = [
  {
    value: 'first',
    title: 'This is my first attempt',
    description: 'Stepping onto a new path with clear intent',
    icon: 'first',
  },
  {
    value: 'tried-before',
    title: 'I’ve tried before',
    description: 'Bringing prior learning into this journey',
    icon: 'retry',
  },
  {
    value: 'prefer-not',
    title: 'Prefer not to say',
    description: 'Focus purely on today and forward steps',
    icon: 'lock',
  },
];

export default function AttemptScreen() {
  const router = useRouter();
  const [attempt, setAttempt] = useState<OnboardingAttempt>('tried-before');

  return (
    <OnboardingScreen
      footer={
        <View style={styles.footer}>
          <OnboardingCta
            label="Continue"
            onPress={() => {
              void saveOnboardingAttempt(attempt);
              router.push('/onboarding/ready');
            }}
          />
          <Text style={styles.completeHint}>Onboarding complete • Ready for your plan</Text>
        </View>
      }>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <OnboardingHeader step={8} />

        <Text style={styles.title}>Have you tried quitting before?</Text>
        <Text style={styles.subtitle}>
          Past experience isn’t failure—it’s valuable insight that shapes how we move forward
          together.
        </Text>

        <View style={styles.options}>
          {OPTIONS.map((option) => {
            const selected = option.value === attempt;

            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${option.title}. ${option.description}`}
                onPress={() => setAttempt(option.value)}
                style={({ pressed }) => [
                  styles.option,
                  selected ? styles.optionSelected : styles.optionIdle,
                  pressed && styles.pressed,
                ]}>
                <View style={[styles.iconWell, selected && styles.iconWellSelected]}>
                  <AttemptGlyph name={option.icon} />
                </View>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? <CheckGlyph /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.privacy}>
          <View style={styles.privacyTitleRow}>
            <TreeGlyph />
            <Text style={styles.privacyTitle}>Safe & private space</Text>
          </View>
          <Text style={styles.privacyBody}>
            Most people make multiple attempts before it gently clicks. Everything you share is
            strictly on your device.
          </Text>
        </View>
      </ScrollView>
    </OnboardingScreen>
  );
}

function AttemptGlyph({ name }: { name: 'first' | 'retry' | 'lock' }) {
  if (name === 'retry') {
    return (
      <View style={styles.retry}>
        <View style={styles.retryArc} />
        <View style={styles.retryHead} />
      </View>
    );
  }

  if (name === 'lock') {
    return (
      <View style={styles.lock}>
        <View style={styles.lockShackle} />
        <View style={styles.lockBody} />
      </View>
    );
  }

  return (
    <View style={styles.path}>
      <View style={styles.pathRing} />
      <View style={styles.pathSlash} />
    </View>
  );
}

function CheckGlyph() {
  return <View style={styles.check} />;
}

function TreeGlyph() {
  return (
    <View style={styles.tree} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.treeCanopy} />
      <View style={styles.treeTrunk} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.four,
  },
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
    minHeight: 96,
    borderRadius: 24,
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
    backgroundColor: '#FFFFFF',
  },
  pressed: {
    opacity: 0.92,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Brand.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWellSelected: {
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  optionCopy: {
    flex: 1,
    gap: 4,
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
    width: 10,
    height: 6,
    marginTop: -1,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
  },
  privacy: {
    marginTop: Spacing.four,
    borderRadius: 22,
    backgroundColor: Brand.pill,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  privacyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  privacyTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 700,
    color: Brand.leaf,
  },
  privacyBody: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 400,
    color: Brand.muted,
  },
  footer: {
    gap: Spacing.three,
  },
  completeHint: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 400,
    color: Brand.muted,
  },
  path: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.6,
    borderColor: Brand.gold,
  },
  pathSlash: {
    position: 'absolute',
    width: 10,
    height: 1.6,
    backgroundColor: Brand.gold,
    transform: [{ rotate: '-45deg' }],
  },
  retry: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryArc: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.6,
    borderColor: Brand.gold,
    borderLeftColor: 'transparent',
  },
  retryHead: {
    position: 'absolute',
    top: 1,
    right: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Brand.gold,
    transform: [{ rotate: '55deg' }],
  },
  lock: {
    width: 14,
    height: 16,
    alignItems: 'center',
  },
  lockShackle: {
    width: 8,
    height: 6,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1.6,
    borderBottomWidth: 0,
    borderColor: Brand.gold,
  },
  lockBody: {
    width: 12,
    height: 8,
    borderRadius: 2,
    backgroundColor: Brand.gold,
  },
  tree: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  treeCanopy: {
    width: 12,
    height: 10,
    borderRadius: 6,
    backgroundColor: Brand.leaf,
  },
  treeTrunk: {
    width: 3,
    height: 5,
    backgroundColor: Brand.leaf,
  },
});
