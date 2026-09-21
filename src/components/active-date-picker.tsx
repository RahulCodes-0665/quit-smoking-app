import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  addMonths,
  clampToTodayOrEarlier,
  formatDisplayDate,
  isSameLocalDay,
  startOfLocalDay,
  startOfMonth,
} from '@/lib/date-key';

type ActiveDatePickerProps = {
  value: Date;
  onChange: (date: Date) => void;
};

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const CALENDAR_CELLS = 42;

export function ActiveDatePicker({ value, onChange }: ActiveDatePickerProps) {
  const theme = useTheme();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(value));

  const today = startOfLocalDay(new Date());
  const currentMonth = startOfMonth(today);
  const canGoNextMonth = visibleMonth.getTime() < currentMonth.getTime();

  const monthLabel = visibleMonth.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: CALENDAR_CELLS }, (_, index) => {
      const dayNumber = index - firstWeekday + 1;
      if (dayNumber < 1 || dayNumber > daysInMonth) {
        return null;
      }
      return new Date(year, month, dayNumber);
    });
  }, [visibleMonth]);

  function openCalendar() {
    setVisibleMonth(startOfMonth(value));
    setIsCalendarOpen((open) => !open);
  }

  function selectDate(date: Date) {
    onChange(clampToTodayOrEarlier(date));
    setIsCalendarOpen(false);
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Selected date ${formatDisplayDate(value)}. ${
          isCalendarOpen ? 'Hide' : 'Show'
        } calendar.`}
        onPress={openCalendar}
        style={({ pressed }) => [styles.dateButton, pressed && styles.pressed]}>
        <ThemedText type="default" themeColor="textSecondary">
          {formatDisplayDate(value)}
        </ThemedText>
      </Pressable>

      {isCalendarOpen ? (
        <ThemedView type="backgroundElement" style={styles.calendar}>
          <View style={styles.monthRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              onPress={() => setVisibleMonth((month) => addMonths(month, -1))}
              style={({ pressed }) => [styles.monthNav, pressed && styles.pressed]}>
              <ThemedText type="default">{'‹'}</ThemedText>
            </Pressable>
            <ThemedText type="smallBold" style={styles.monthLabel}>
              {monthLabel}
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next month"
              disabled={!canGoNextMonth}
              onPress={() => {
                if (!canGoNextMonth) {
                  return;
                }
                setVisibleMonth((month) => addMonths(month, 1));
              }}
              style={({ pressed }) => [
                styles.monthNav,
                pressed && canGoNextMonth && styles.pressed,
                !canGoNextMonth && styles.disabledNav,
              ]}>
              <ThemedText type="default" themeColor={canGoNextMonth ? 'text' : 'textSecondary'}>
                {'›'}
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAY_LABELS.map((label) => (
              <ThemedText key={label} type="small" themeColor="textSecondary" style={styles.weekDay}>
                {label}
              </ThemedText>
            ))}
          </View>

          <View style={styles.grid}>
            {calendarDays.map((date, index) => {
              if (!date) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const isFuture = date.getTime() > today.getTime();
              const isSelected = isSameLocalDay(date, value);
              const isToday = isSameLocalDay(date, today);

              return (
                <Pressable
                  key={date.toISOString()}
                  accessibilityRole="button"
                  accessibilityLabel={formatDisplayDate(date)}
                  accessibilityState={{ disabled: isFuture, selected: isSelected }}
                  disabled={isFuture}
                  onPress={() => selectDate(date)}
                  style={({ pressed }) => [
                    styles.dayCell,
                    isSelected && { backgroundColor: theme.backgroundSelected },
                    pressed && !isFuture && styles.pressed,
                  ]}>
                  <ThemedText
                    type="small"
                    themeColor={isFuture ? 'textSecondary' : 'text'}
                    style={[styles.dayLabel, isToday && !isSelected && styles.todayLabel]}>
                    {date.getDate()}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </ThemedView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    gap: Spacing.two,
  },
  dateButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  calendar: {
    width: '100%',
    maxWidth: 360,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthNav: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledNav: {
    opacity: 0.4,
  },
  monthLabel: {
    flex: 1,
    textAlign: 'center',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
  },
  dayLabel: {
    textAlign: 'center',
  },
  todayLabel: {
    fontWeight: 700,
    textDecorationLine: 'underline',
  },
});
