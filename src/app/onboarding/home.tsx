import { BottomSheetModal } from '@expo/ui/community/bottom-sheet';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

import { JourneyTabBar } from '@/components/journey-tab-bar';
import { LogSlipSheet } from '@/components/log-slip-sheet';
import { Brand, Fonts, Spacing } from '@/constants/theme';
import { daysBetween, fromDateKey, startOfLocalDay } from '@/lib/date-key';
import { loadOnboardingJourney, type OnboardingJourney } from '@/lib/onboarding';

const RING_SIZE = 228;
const RING_STROKE = 8;
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_PACK_PRICE = 340;
const DEFAULT_DAILY = 10;
const DEFAULT_PACK_SIZE = 20;

export default function JourneyHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const slipSheetRef = useRef<BottomSheetModal>(null);
  const [now, setNow] = useState(() => new Date());
  const [journey, setJourney] = useState<OnboardingJourney | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadOnboardingJourney().then((saved) => {
      if (!cancelled) {
        setJourney(saved);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => buildJourneyStats(journey, now), [journey, now]);

  return (
    <View style={styles.backdrop}>
      <Stack.Screen
        options={{
          animation: 'fade',
          gestureEnabled: false,
          contentStyle: { backgroundColor: Brand.cream },
        }}
      />
      <StatusBar style="dark" />
      <View
        style={[
          styles.screen,
          {
            paddingTop: Math.max(insets.top, Spacing.four) + Spacing.two,
            paddingBottom: Spacing.two,
            paddingLeft: Spacing.four + insets.left,
            paddingRight: Spacing.four + insets.right,
          },
        ]}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{stats.greeting}</Text>
          <Text style={styles.title}>Your smoke-free journey</Text>
        </View>

        <View style={styles.hero}>
          <ProgressRing progress={stats.ringProgress} days={stats.days} hours={stats.hours} />

          <Text style={styles.quote}>
            One craving at a time. You’re building{'\n'}a new normal.
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.statsCard}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{formatRupees(stats.saved)}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{stats.cigarettes.toLocaleString('en-IN')}</Text>
              <Text style={styles.statLabel}>Cigarettes avoided</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Craving help"
            onPress={() => router.push('/onboarding/craving')}
            style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
            <Text style={styles.ctaLabel}>Craving help</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log a slip"
            onPress={() => slipSheetRef.current?.present()}
            style={({ pressed }) => [styles.slip, pressed && styles.pressed]}>
            <Text style={styles.slipLabel}>Log a slip</Text>
          </Pressable>
        </View>
      </View>
      <JourneyTabBar active="home" />
      <LogSlipSheet sheetRef={slipSheetRef} />
    </View>
  );
}

function ProgressRing({
  progress,
  days,
  hours,
}: {
  progress: number;
  days: number;
  hours: number;
}) {
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = circumference * (1 - clamped);
  const center = RING_SIZE / 2;
  const dayLabel = `${days} ${days === 1 ? 'day' : 'days'}`;
  const hourLabel = `${hours} ${hours === 1 ? 'hour' : 'hours'} smoke-free`;

  return (
    <Svg width={RING_SIZE} height={RING_SIZE}>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={Brand.goldSoft}
        strokeWidth={RING_STROKE}
        fill="none"
      />
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={Brand.gold}
        strokeWidth={RING_STROKE}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />
      <SvgText
        x={center}
        y={center - 2}
        textAnchor="middle"
        fontSize={34}
        fontWeight="700"
        fill={Brand.ink}>
        {dayLabel}
      </SvgText>
      <SvgText
        x={center}
        y={center + 22}
        textAnchor="middle"
        fontSize={14}
        fontWeight="400"
        fill={Brand.muted}>
        {hourLabel}
      </SvgText>
    </Svg>
  );
}

function buildJourneyStats(journey: OnboardingJourney | null, now: Date) {
  const start = journey?.start?.dateKey
    ? fromDateKey(journey.start.dateKey)
    : startOfLocalDay(now);
  const startDay = startOfLocalDay(start);
  const today = startOfLocalDay(now);
  const elapsedMs = Math.max(0, now.getTime() - startDay.getTime());
  const days = startDay.getTime() > today.getTime() ? 0 : daysBetween(startDay, today) + 1;
  const hours = Math.floor((elapsedMs % DAY_MS) / (60 * 60 * 1000));
  const daily = journey?.dailyCigarettes ?? DEFAULT_DAILY;
  const packSize = journey?.packSize ?? DEFAULT_PACK_SIZE;
  const packPrice = journey?.packPrice ?? DEFAULT_PACK_PRICE;
  const cigarettes = Math.floor((elapsedMs / DAY_MS) * daily);
  const saved = Math.round((cigarettes / packSize) * packPrice);

  return {
    greeting: greetingFor(now),
    days,
    hours,
    cigarettes,
    saved,
    ringProgress: (elapsedMs % DAY_MS) / DAY_MS,
  };
}

function greetingFor(date: Date): string {
  const hour = date.getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 17) {
    return 'Good afternoon';
  }

  return 'Good evening';
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
    backgroundColor: Brand.cream,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.two,
  },
  greeting: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
    color: Brand.muted,
  },
  title: {
    marginTop: 10,
    textAlign: 'center',
    fontFamily: Fonts.serif,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: 600,
    color: Brand.ink,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.five,
  },
  quote: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 400,
    color: Brand.muted,
  },
  footer: {
    gap: Spacing.three,
    paddingBottom: Spacing.one,
  },
  statsCard: {
    minHeight: 92,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 700,
    color: Brand.ink,
  },
  statLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: 400,
    color: Brand.muted,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 44,
    backgroundColor: Brand.goldSoft,
  },
  cta: {
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: 600,
    color: '#FFFFFF',
  },
  slip: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slipLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 400,
    color: Brand.muted,
  },
  pressed: {
    opacity: 0.88,
  },
});
