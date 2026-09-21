import { Stack, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { JourneyTabBar } from '@/components/journey-tab-bar';
import { SproutIcon } from '@/components/sprout-icon';
import { Brand, Spacing } from '@/constants/theme';
import { loadCountsByDate } from '@/lib/cigarette-counts';
import {
  addDays,
  daysBetween,
  fromDateKey,
  startOfLocalDay,
  startOfMonth,
  startOfWeekMonday,
  toDateKey,
} from '@/lib/date-key';
import { loadOnboardingJourney, type OnboardingJourney } from '@/lib/onboarding';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_PACK_PRICE = 340;
const DEFAULT_DAILY = 10;
const DEFAULT_PACK_SIZE = 20;
const BAR_TRACK_HEIGHT = 168;

type Range = 'week' | 'month' | 'all';

type ChartBar = {
  key: string;
  label: string;
  avoided: number;
};

const RANGES: { id: Range; label: string }[] = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'all', label: 'All time' },
];

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<Range>('week');
  const [now] = useState(() => new Date());
  const [journey, setJourney] = useState<OnboardingJourney | null>(null);
  const [countsByDate, setCountsByDate] = useState<Record<string, number>>({});

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      Promise.all([loadOnboardingJourney(), loadCountsByDate()]).then(([saved, counts]) => {
        if (cancelled) {
          return;
        }

        setJourney(saved);
        setCountsByDate(counts);
      });

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const model = useMemo(
    () => buildProgressModel(journey, countsByDate, now, range),
    [countsByDate, journey, now, range],
  );

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
          <Text style={styles.title}>Progress</Text>
          <Text style={styles.subtitle}>Quietly building steady, daily resilience.</Text>

          <View style={styles.segment}>
            {RANGES.map((option) => {
              const selected = option.id === range;

              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  accessibilityLabel={option.label}
                  onPress={() => setRange(option.id)}
                  style={({ pressed }) => [
                    styles.segmentItem,
                    selected && styles.segmentItemSelected,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.summary}>
            <SummaryCell value={`${model.streakDays}d`} label="Current streak" />
            <View style={styles.summaryDivider} />
            <SummaryCell value={formatRupees(model.saved)} label="Money saved" />
            <View style={styles.summaryDivider} />
            <SummaryCell value={model.avoidedAll.toLocaleString('en-IN')} label="Avoided" />
          </View>

          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Daily cadence</Text>
              <Text style={styles.chartLegend}>Cigarettes avoided</Text>
            </View>

            <View style={styles.chart}>
              {model.bars.map((bar, index) => {
                const fill = model.maxAvoided <= 0 ? 0 : bar.avoided / model.maxAvoided;
                const showLabel = model.bars.length <= 7 || shouldShowLabel(index, model.bars.length);

                return (
                  <View key={bar.key} style={styles.barColumn}>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { height: `${Math.max(fill, 0) * 100}%` }]} />
                    </View>
                    <Text style={[styles.barLabel, model.bars.length > 7 && styles.barLabelCompact]}>
                      {showLabel ? bar.label : ' '}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.banner}>
            <SproutIcon />
            <Text style={styles.bannerCopy}>
              You’ve avoided <Text style={styles.bannerEmphasis}>{model.rangeAvoided}</Text>{' '}
              {model.rangeAvoided === 1 ? 'cigarette' : 'cigarettes'} {model.rangePhrase}.
            </Text>
          </View>
        </ScrollView>
      </View>
      <JourneyTabBar active="stats" />
    </View>
  );
}

function SummaryCell({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.summaryCell}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function buildProgressModel(
  journey: OnboardingJourney | null,
  countsByDate: Record<string, number>,
  now: Date,
  range: Range,
) {
  const today = startOfLocalDay(now);
  const start = journey?.start?.dateKey ? fromDateKey(journey.start.dateKey) : today;
  const daily = journey?.dailyCigarettes ?? DEFAULT_DAILY;
  const packSize = journey?.packSize ?? DEFAULT_PACK_SIZE;
  const packPrice = journey?.packPrice ?? DEFAULT_PACK_PRICE;
  const elapsedMs = Math.max(0, now.getTime() - start.getTime());
  const avoidedAll = Math.floor((elapsedMs / DAY_MS) * daily);
  const saved = Math.round((avoidedAll / packSize) * packPrice);
  const dates = datesForRange(range, now, start);
  const bars = dates.map((date) => ({
    key: toDateKey(date),
    label: range === 'week' ? weekdayLetter(date) : String(date.getDate()),
    avoided: avoidedOn(date, start, now, daily, countsByDate[toDateKey(date)] ?? 0),
  }));
  const rangeAvoided = bars.reduce((sum, bar) => sum + bar.avoided, 0);
  const maxAvoided = Math.max(daily, ...bars.map((bar) => bar.avoided));

  return {
    streakDays: currentStreak(start, today, countsByDate),
    saved,
    avoidedAll,
    bars,
    maxAvoided,
    rangeAvoided,
    rangePhrase: range === 'week' ? 'this week' : range === 'month' ? 'this month' : 'since you began',
  };
}

function datesForRange(range: Range, now: Date, start: Date): Date[] {
  if (range === 'week') {
    const monday = startOfWeekMonday(now);
    return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
  }

  if (range === 'month') {
    const monthStart = startOfMonth(now);
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Array.from({ length: days }, (_, index) => addDays(monthStart, index));
  }

  const begin = start.getTime() > startOfLocalDay(now).getTime() ? startOfLocalDay(now) : start;
  const span = Math.max(1, daysBetween(begin, startOfLocalDay(now)) + 1);
  return Array.from({ length: span }, (_, index) => addDays(begin, index));
}

function avoidedOn(
  date: Date,
  start: Date,
  now: Date,
  daily: number,
  smoked: number,
): number {
  const day = startOfLocalDay(date);
  const today = startOfLocalDay(now);

  if (day.getTime() < startOfLocalDay(start).getTime() || day.getTime() > today.getTime()) {
    return 0;
  }

  if (day.getTime() === today.getTime()) {
    const fraction = Math.min(1, Math.max(0, (now.getTime() - today.getTime()) / DAY_MS));
    return Math.max(0, Math.round(daily * fraction) - smoked);
  }

  return Math.max(0, daily - smoked);
}

function currentStreak(
  start: Date,
  today: Date,
  countsByDate: Record<string, number>,
): number {
  if (today.getTime() < startOfLocalDay(start).getTime()) {
    return 0;
  }

  let streak = 0;
  for (let date = today; date.getTime() >= startOfLocalDay(start).getTime(); date = addDays(date, -1)) {
    if ((countsByDate[toDateKey(date)] ?? 0) > 0) {
      break;
    }
    streak += 1;
  }

  return streak;
}

function weekdayLetter(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1);
}

function shouldShowLabel(index: number, count: number): boolean {
  if (count <= 12) {
    return true;
  }

  return index === 0 || index % 7 === 0;
}

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
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
    paddingBottom: Spacing.four,
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
  segment: {
    flexDirection: 'row',
    backgroundColor: Brand.pill,
    borderRadius: 22,
    padding: 4,
    marginBottom: Spacing.three,
  },
  segmentItem: {
    flex: 1,
    minHeight: 40,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemSelected: {
    backgroundColor: '#FFFFFF',
  },
  segmentLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
    color: Brand.muted,
  },
  segmentLabelSelected: {
    fontWeight: 700,
    color: Brand.ink,
  },
  summary: {
    minHeight: 92,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  summaryCell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryValue: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 700,
    color: Brand.ink,
  },
  summaryLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 400,
    color: Brand.muted,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    height: 44,
    backgroundColor: Brand.goldSoft,
  },
  chartCard: {
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    marginBottom: Spacing.three,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  chartTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: 700,
    color: Brand.ink,
  },
  chartLegend: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: 400,
    color: Brand.muted,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: BAR_TRACK_HEIGHT + 28,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    height: '100%',
  },
  barTrack: {
    flex: 1,
    width: '100%',
    maxWidth: 28,
    borderRadius: 16,
    backgroundColor: Brand.pill,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: Brand.gold,
  },
  barLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 500,
    color: Brand.muted,
  },
  barLabelCompact: {
    fontSize: 9,
    lineHeight: 12,
  },
  barFill: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: Brand.gold,
  },
  barLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 500,
    color: Brand.muted,
  },
  banner: {
    minHeight: 64,
    borderRadius: 22,
    backgroundColor: Brand.pill,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerCopy: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
    color: Brand.ink,
  },
  bannerEmphasis: {
    fontWeight: 700,
    color: Brand.gold,
  },
  pressed: {
    opacity: 0.88,
  },
});
