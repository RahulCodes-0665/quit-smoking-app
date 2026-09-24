import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { JourneyTabBar } from '@/components/journey-tab-bar';
import { Brand, Spacing } from '@/constants/theme';
import { fromDateKey } from '@/lib/date-key';
import { currencyLabel, formatMoney, loadOnboardingSettings, type OnboardingSettings } from '@/lib/onboarding';
import { useOnboardingSession } from '@/lib/onboarding-session';

const TRIGGER_LABELS: Record<string, string> = {
  stress: 'Stress',
  'after-meals': 'After meals',
  coffee: 'Coffee',
  social: 'Social situations',
  alcohol: 'Alcohol',
  driving: 'Driving',
  'work-breaks': 'Work breaks',
};

const REASON_LABELS: Record<string, string> = {
  health: 'Health',
  family: 'Family',
  freedom: 'Freedom',
  money: 'Saving money',
  fitness: 'Fitness',
  peace: 'Mental peace',
  skin: 'Clear skin & breath',
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { resetJourney } = useOnboardingSession();
  const [settings, setSettings] = useState<OnboardingSettings | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      loadOnboardingSettings().then((saved) => {
        if (!cancelled) {
          setSettings(saved);
        }
      });

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const triggerValue = triggerLabel(settings);
  const reasonValue = reasonLabel(settings);

  const rows = [
    {
      key: 'goal',
      label: 'Goal',
      value: goalLabel(settings?.goal),
      href: '/onboarding/goal',
      empty: false,
    },
    {
      key: 'start',
      label: 'Start or quit date',
      value: startLabel(settings?.start?.dateKey),
      href: '/onboarding/begin',
      empty: false,
    },
    {
      key: 'daily',
      label: 'Cigarettes per day',
      value: String(settings?.dailyCigarettes ?? 10),
      href: '/onboarding/daily',
      empty: false,
    },
    {
      key: 'price',
      label: 'Pack price',
      value: formatMoney(settings?.packPrice ?? 340, settings?.currency),
      href: '/onboarding/pack',
      empty: false,
    },
    {
      key: 'pack-size',
      label: 'Cigarettes per pack',
      value: String(settings?.packSize ?? 20),
      href: '/onboarding/pack-size',
      empty: false,
    },
    {
      key: 'currency',
      label: 'Currency',
      value: currencyLabel(settings?.currency),
      href: '/onboarding/currency',
      empty: false,
    },
    {
      key: 'triggers',
      label: 'Smoking triggers',
      value: triggerValue,
      href: '/onboarding/triggers',
      empty: triggerValue === 'Add triggers',
    },
    {
      key: 'reasons',
      label: 'Personal motivation',
      value: reasonValue,
      href: '/onboarding/reasons',
      empty: reasonValue === 'Add a reason',
    },
  ];

  return (
    <View style={styles.backdrop}>
      <Stack.Screen options={{ contentStyle: { backgroundColor: Brand.cream } }} />
      <StatusBar style="dark" />
      <View
        style={[
          styles.screen,
          {
            paddingTop: Math.max(insets.top, Spacing.four),
            paddingLeft: Spacing.four + insets.left,
            paddingRight: Spacing.four + insets.right,
          },
        ]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Your recovery parameters and daily baselines</Text>

          <View style={styles.card}>
            {rows.map((row, index) => (
              <View key={row.key}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${row.empty ? 'Add' : 'Edit'} ${row.label}`}
                  onPress={() => router.push(`${row.href}?from=settings`)}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <View style={styles.rowValueWrap}>
                    <Text
                      style={[styles.rowValue, row.empty && styles.rowValueEmpty]}
                      numberOfLines={1}>
                      {row.value}
                    </Text>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </Pressable>
              </View>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reset journey"
            onPress={() => confirmReset(router, resetJourney)}
            style={({ pressed }) => [styles.reset, pressed && styles.pressed]}>
            <Text style={styles.resetLabel}>Reset journey</Text>
          </Pressable>
          <Text style={styles.resetHint}>Clears milestones and baseline inputs with care</Text>
        </ScrollView>
      </View>
      <JourneyTabBar active="settings" />
    </View>
  );
}

function confirmReset(
  router: ReturnType<typeof useRouter>,
  resetJourney: () => Promise<void>,
) {
  Alert.alert(
    'Reset journey',
    'This clears your milestones and baseline inputs. You can begin again whenever you are ready.',
    [
      { text: 'Keep going', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await resetJourney();
            router.replace('/onboarding');
          })();
        },
      },
    ],
  );
}

function goalLabel(goal: OnboardingSettings['goal']): string {
  return goal === 'reduce-smoking' ? 'Reduce smoking' : 'Quit completely';
}

function startLabel(dateKey: string | undefined): string {
  if (!dateKey) {
    return 'Today';
  }

  return fromDateKey(dateKey).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function triggerLabel(settings: OnboardingSettings | null): string {
  if (settings?.triggers?.unsure) {
    return 'Not sure yet';
  }

  const labels = (settings?.triggers?.selected ?? [])
    .map((id) => TRIGGER_LABELS[id] ?? customTriggerLabel(id))
    .filter(Boolean);

  return joinLabels(labels, 'Add triggers');
}

function reasonLabel(settings: OnboardingSettings | null): string {
  const labels = (settings?.reasons?.selected ?? [])
    .map((id) => REASON_LABELS[id] ?? id)
    .filter(Boolean);

  if (labels.length === 0 && settings?.reasons?.note) {
    return settings.reasons.note;
  }

  return joinLabels(labels, 'Add a reason');
}

function customTriggerLabel(id: string): string {
  return id.startsWith('custom:') ? id.slice('custom:'.length) : id;
}

function joinLabels(labels: string[], empty: string): string {
  if (labels.length === 0) {
    return empty;
  }

  if (labels.length === 2) {
    return `${labels[0]} & ${labels[1]}`;
  }

  return labels.join(', ');
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Brand.cream,
  },
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.five,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: 700,
    color: Brand.ink,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: Spacing.four,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
    color: Brand.muted,
  },
  card: {
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  row: {
    minHeight: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLabel: {
    flexShrink: 0,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 700,
    color: Brand.ink,
  },
  rowValueWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  rowValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
    color: Brand.muted,
  },
  rowValueEmpty: {
    color: Brand.gold,
    fontWeight: 600,
  },
  chevron: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 400,
    color: Brand.muted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Brand.goldSoft,
    marginLeft: 20,
  },
  reset: {
    marginTop: Spacing.six,
    alignItems: 'center',
  },
  resetLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 500,
    color: Brand.muted,
  },
  resetHint: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
    color: '#C4B8AA',
  },
  pressed: {
    opacity: 0.82,
  },
});
