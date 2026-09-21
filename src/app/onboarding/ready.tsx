import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OnboardingCta } from '@/components/onboarding-cta';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { SproutIcon } from '@/components/sprout-icon';
import { Brand, Fonts, Spacing } from '@/constants/theme';
import { fromDateKey, isSameLocalDay, startOfLocalDay } from '@/lib/date-key';
import { loadOnboardingSummary, type OnboardingGoal, type OnboardingStartPlan } from '@/lib/onboarding';
import { useOnboardingSession } from '@/lib/onboarding-session';

export default function ReadyScreen() {
  const router = useRouter();
  const { markComplete } = useOnboardingSession();
  const [goal, setGoal] = useState<OnboardingGoal | null>(null);
  const [start, setStart] = useState<OnboardingStartPlan | null>(null);
  const [dailyCigarettes, setDailyCigarettes] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadOnboardingSummary().then((summary) => {
      if (cancelled) {
        return;
      }

      setGoal(summary.goal);
      setStart(summary.start);
      setDailyCigarettes(summary.dailyCigarettes);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <OnboardingScreen
      footer={
        <OnboardingCta
          label="Get started"
          onPress={() => {
            void (async () => {
              await markComplete();
              router.replace('/onboarding/home');
            })();
          }}
        />
      }>
      <View style={styles.body}>
        <View style={styles.hero}>
          <View style={styles.iconWell}>
            <View style={styles.iconScale}>
              <SproutIcon />
            </View>
          </View>
          <Text style={styles.title}>You’re ready.</Text>
          <Text style={styles.subtitle}>A small step today can change a lot.</Text>
        </View>

        <View style={styles.card}>
          <SummaryRow label="Goal" value={goalLabel(goal)} />
          <View style={styles.divider} />
          <SummaryRow label="Start" value={startLabel(start)} />
          <View style={styles.divider} />
          <SummaryRow label="Daily average" value={dailyLabel(dailyCigarettes)} />
        </View>
      </View>
    </OnboardingScreen>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function goalLabel(goal: OnboardingGoal | null): string {
  if (goal === 'reduce-smoking') {
    return 'Reduce smoking';
  }

  return 'Quit completely';
}

function startLabel(start: OnboardingStartPlan | null): string {
  if (!start || start.mode === 'today') {
    return 'Today';
  }

  const date = fromDateKey(start.dateKey);
  if (isSameLocalDay(date, startOfLocalDay(new Date()))) {
    return 'Today';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function dailyLabel(count: number | null): string {
  const daily = count ?? 10;
  return daily === 1 ? '1 cigarette' : `${daily} cigarettes`;
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    paddingBottom: Spacing.five,
  },
  iconWell: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Brand.sageSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconScale: {
    transform: [{ scale: 1.35 }],
  },
  title: {
    marginTop: Spacing.four,
    textAlign: 'center',
    fontFamily: Fonts.serif,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: 600,
    color: Brand.ink,
  },
  subtitle: {
    marginTop: Spacing.two,
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 400,
    color: Brand.muted,
  },
  card: {
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  rowLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: 400,
    color: Brand.muted,
  },
  rowValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 600,
    color: Brand.ink,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Brand.goldSoft,
  },
});
