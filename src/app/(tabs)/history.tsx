import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { loadCountsByDate } from '@/lib/cigarette-counts';
import { formatChartDayLabel, lastNLocalDays, toDateKey } from '@/lib/date-key';

const CHART_DAYS = 30;
const BAR_MAX_HEIGHT = 180;
const BAR_MIN_HEIGHT = 4;
const BAR_COLOR = '#3c87f7';

type DayUsage = {
  key: string;
  date: Date;
  count: number;
};

export default function HistoryScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const [countsByDate, setCountsByDate] = useState<Record<string, number>>({});

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      loadCountsByDate().then((savedCounts) => {
        if (!cancelled) {
          setCountsByDate(savedCounts);
        }
      });

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const days = useMemo<DayUsage[]>(() => {
    return lastNLocalDays(CHART_DAYS).map((date) => {
      const key = toDateKey(date);
      return {
        key,
        date,
        count: countsByDate[key] ?? 0,
      };
    });
  }, [countsByDate]);

  const totalCount = useMemo(() => days.reduce((sum, day) => sum + day.count, 0), [days]);
  const maxCount = useMemo(() => Math.max(0, ...days.map((day) => day.count)), [days]);

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    ios: {
      paddingTop: Spacing.four,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            Last 30 days
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            {totalCount} cigarettes
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.chartCard}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator
            contentContainerStyle={styles.chartScrollContent}>
            {days.map((day) => {
              const barHeight =
                day.count <= 0 || maxCount <= 0
                  ? 0
                  : Math.max(BAR_MIN_HEIGHT, (day.count / maxCount) * BAR_MAX_HEIGHT);

              return (
                <View key={day.key} style={styles.barColumn}>
                  <ThemedText type="smallBold" style={styles.countLabel}>
                    {day.count > 0 ? day.count : ' '}
                  </ThemedText>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: BAR_COLOR,
                        },
                      ]}
                    />
                  </View>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.dayLabel}>
                    {formatChartDayLabel(day.date)}
                  </ThemedText>
                </View>
              );
            })}
          </ScrollView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  title: {
    textAlign: 'center',
  },
  chartCard: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    minHeight: BAR_MAX_HEIGHT + 72,
  },
  chartScrollContent: {
    flexGrow: 1,
    minWidth: '100%',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 2,
  },
  barColumn: {
    flexGrow: 1,
    flexBasis: 18,
    minWidth: 18,
    alignItems: 'center',
    gap: Spacing.one,
  },
  countLabel: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
  barTrack: {
    height: BAR_MAX_HEIGHT,
    width: 14,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 14,
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
});
