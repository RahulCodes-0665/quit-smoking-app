import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingCta } from '@/components/onboarding-cta';
import { QitMark } from '@/components/qit-mark';
import { SproutIcon } from '@/components/sprout-icon';
import { Brand, Fonts, Spacing } from '@/constants/theme';
import { useOnboardingSession } from '@/lib/onboarding-session';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isComplete } = useOnboardingSession();

  if (isComplete) {
    return <Redirect href="/onboarding/home" />;
  }

  return (
    <View style={styles.backdrop}>
      <View
        style={[
          styles.screen,
          {
            paddingTop: Math.max(insets.top, Spacing.four),
            paddingBottom: Math.max(insets.bottom, Spacing.three) + Spacing.three,
            paddingLeft: Spacing.four + insets.left,
            paddingRight: Spacing.four + insets.right,
          },
        ]}>
        <StatusBar style="dark" />

        <Text style={styles.wordmark}>Qit</Text>

        <View style={styles.hero}>
          <QitMark />
          <Text style={styles.headline}>A calmer way to quit{'\n'}smoking.</Text>
          <Text style={styles.subtitle}>Private. No account needed.</Text>
          <View style={styles.pill}>
            <SproutIcon />
            <Text style={styles.pillText}>A quiet companion for steady recovery</Text>
          </View>
        </View>

        <OnboardingCta label="Start my journey" onPress={() => router.push('/onboarding/goal')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
  },
  wordmark: {
    textAlign: 'center',
    fontFamily: Fonts.serif,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 600,
    color: Brand.ink,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  headline: {
    marginTop: Spacing.two,
    textAlign: 'center',
    fontFamily: Fonts.serif,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 600,
    color: Brand.ink,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 400,
    color: Brand.muted,
  },
  pill: {
    marginTop: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: Brand.pill,
  },
  pillText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    color: Brand.muted,
  },
});
