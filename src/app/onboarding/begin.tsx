import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { OnboardingCta } from '@/components/onboarding-cta';
import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { SproutIcon } from '@/components/sprout-icon';
import { Brand, Fonts, Spacing } from '@/constants/theme';
import {
  addDays,
  addMonths,
  daysBetween,
  formatMonthYear,
  formatScheduledDay,
  fromDateKey,
  isSameLocalDay,
  startOfLocalDay,
  startOfMonth,
  toDateKey,
} from '@/lib/date-key';
import {
  saveOnboardingStart,
  loadOnboardingSettings,
  type OnboardingStartMode,
} from '@/lib/onboarding';
import { useSettingsEditor } from '@/lib/settings-editor';

const DEFAULT_OFFSET_DAYS = 3;
const WEEKDAY_LABELS = Array.from({ length: 7 }, (_, index) =>
  new Date(2024, 0, 7 + index).toLocaleDateString(undefined, { weekday: 'narrow' }),
);

export default function BeginScreen() {
  const { isEditing, ctaLabel, finish } = useSettingsEditor();
  const today = useMemo(() => startOfLocalDay(new Date()), []);
  const firstSelectableDate = useMemo(() => addDays(today, 1), [today]);
  const earliestMonth = useMemo(() => startOfMonth(firstSelectableDate), [firstSelectableDate]);

  const [mode, setMode] = useState<OnboardingStartMode>('today');
  const [chosenDate, setChosenDate] = useState(() => addDays(today, DEFAULT_OFFSET_DAYS));
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(addDays(today, DEFAULT_OFFSET_DAYS)),
  );

  useEffect(() => {
    let cancelled = false;

    loadOnboardingSettings().then((saved) => {
      if (cancelled || !saved.start) {
        return;
      }

      const savedDate = fromDateKey(saved.start.dateKey);
      const nextDate =
        savedDate.getTime() > today.getTime() ? savedDate : addDays(today, DEFAULT_OFFSET_DAYS);
      setMode(saved.start.mode);
      setChosenDate(nextDate);
      setVisibleMonth(startOfMonth(nextDate));
    });

    return () => {
      cancelled = true;
    };
  }, [today]);

  const selectedDate = mode === 'today' ? today : chosenDate;
  const quietDays = daysBetween(today, selectedDate);
  const monthLabel = formatMonthYear(visibleMonth);
  const canGoPreviousMonth = visibleMonth.getTime() > earliestMonth.getTime();
  const canGoPreviousYear = addMonths(visibleMonth, -12).getTime() >= earliestMonth.getTime();
  const calendarDays = useMemo(() => daysInMonthGrid(visibleMonth), [visibleMonth]);

  function showMonth(month: Date) {
    const next = startOfMonth(month);
    if (next.getTime() < earliestMonth.getTime()) {
      return;
    }
    setVisibleMonth(next);
  }

  function selectFutureDate(date: Date) {
    if (date.getTime() < firstSelectableDate.getTime()) {
      return;
    }
    setChosenDate(date);
  }

  return (
    <OnboardingScreen
      footer={
        <OnboardingCta
          label={ctaLabel}
          onPress={() => {
            void saveOnboardingStart({
              mode,
              dateKey: toDateKey(selectedDate),
            });
            finish('/onboarding/pack');
          }}
        />
      }>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <OnboardingHeader step={2} editing={isEditing} />

        <Text style={styles.title}>When do you want to begin?</Text>
        <Text style={styles.subtitle}>
          Your journey unfolds at your own speed. There is no rush.
        </Text>

        <View style={styles.options}>
          <StartOption
            selected={mode === 'today'}
            title="Start today"
            description="Step gently into today’s reflection"
            icon="sun"
            onPress={() => setMode('today')}
          />
          <StartOption
            selected={mode === 'choose-date'}
            title="Choose a date"
            description="Prepare your environment first"
            icon="calendar"
            onPress={() => setMode('choose-date')}
          />
        </View>

        {mode === 'choose-date' ? (
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <View style={styles.calendarTitleRow}>
                <CalendarGlyph size={14} />
                <Text style={styles.calendarTitle}>Target date</Text>
              </View>
            </View>

            <View style={styles.monthNav}>
              <MonthNavButton
                label="Previous year"
                glyph="«"
                disabled={!canGoPreviousYear}
                onPress={() => showMonth(addMonths(visibleMonth, -12))}
              />
              <MonthNavButton
                label="Previous month"
                glyph="‹"
                disabled={!canGoPreviousMonth}
                onPress={() => showMonth(addMonths(visibleMonth, -1))}
              />
              <Text style={styles.monthLabel}>{monthLabel}</Text>
              <MonthNavButton
                label="Next month"
                glyph="›"
                onPress={() => showMonth(addMonths(visibleMonth, 1))}
              />
              <MonthNavButton
                label="Next year"
                glyph="»"
                onPress={() => showMonth(addMonths(visibleMonth, 12))}
              />
            </View>

            <View style={styles.weekdayRow}>
              {WEEKDAY_LABELS.map((label, index) => (
                <Text key={`${label}-${index}`} style={styles.weekdayLabel}>
                  {label}
                </Text>
              ))}
            </View>

            <View style={styles.dayGrid}>
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const selected = isSameLocalDay(date, chosenDate);
                const disabled = date.getTime() < firstSelectableDate.getTime();

                return (
                  <Pressable
                    key={toDateKey(date)}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled }}
                    accessibilityLabel={formatScheduledDay(date)}
                    disabled={disabled}
                    onPress={() => selectFutureDate(date)}
                    style={({ pressed }) => [
                      styles.dayCell,
                      selected && styles.dayCellSelected,
                      pressed && !disabled && styles.pressed,
                    ]}>
                    <Text
                      style={[
                        styles.dayNumber,
                        disabled && styles.dayNumberDisabled,
                        selected && styles.dayNumberSelected,
                      ]}>
                      {date.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.schedule}>
              <View style={styles.scheduleBar} />
              <View style={styles.scheduleCopy}>
                <Text style={styles.scheduleTitle}>Scheduled for {formatScheduledDay(chosenDate)}</Text>
                <Text style={styles.scheduleBody}>{quietDaysCopy(quietDays)}</Text>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.note}>
          <SproutIcon />
          <Text style={styles.noteBody}>
            Setting a specific day increases readiness by over 40% without added pressure.
          </Text>
        </View>
      </ScrollView>
    </OnboardingScreen>
  );
}

function daysInMonthGrid(month: Date): (Date | null)[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  return Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - firstWeekday + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return null;
    }
    return new Date(year, monthIndex, dayNumber);
  });
}

function MonthNavButton({
  label,
  glyph,
  disabled = false,
  onPress,
}: {
  label: string;
  glyph: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.monthNavButton,
        disabled && styles.monthNavDisabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <Text style={[styles.monthNavGlyph, disabled && styles.dayNumberDisabled]}>{glyph}</Text>
    </Pressable>
  );
}

function quietDaysCopy(days: number): string {
  if (days <= 1) {
    return 'Gives you 1 quiet day to clear out triggers and settle your mind.';
  }

  return `Gives you ${days} quiet days to clear out triggers and settle your mind.`;
}

function StartOption({
  selected,
  title,
  description,
  icon,
  onPress,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: 'sun' | 'calendar';
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}. ${description}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        selected ? styles.optionSelected : styles.optionIdle,
        pressed && styles.pressed,
      ]}>
      <View style={[styles.iconWell, selected && styles.iconWellSelected]}>
        {icon === 'sun' ? <SunGlyph /> : <CalendarGlyph />}
      </View>
      <View style={styles.optionCopy}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <CheckGlyph /> : null}
      </View>
    </Pressable>
  );
}

function CheckGlyph() {
  return (
    <View
      style={[
        styles.check,
        {
          width: 10,
          height: 6.2,
          borderBottomColor: '#FFFFFF',
          borderLeftColor: '#FFFFFF',
        },
      ]}
    />
  );
}

function SunGlyph() {
  return (
    <View style={styles.sun}>
      <View style={styles.sunRayVertical} />
      <View style={styles.sunRayHorizontal} />
      <View style={styles.sunRayDiagA} />
      <View style={styles.sunRayDiagB} />
      <View style={styles.sunCore} />
    </View>
  );
}

function CalendarGlyph({ size = 16 }: { size?: number }) {
  const scale = size / 16;

  return (
    <View style={[styles.calendarIcon, { width: 16 * scale, height: 15 * scale }]}>
      <View style={[styles.calendarIconTop, { height: 4 * scale }]} />
      <View style={styles.calendarIconDots}>
        <View style={[styles.calendarIconDot, { width: 3 * scale, height: 3 * scale }]} />
        <View style={[styles.calendarIconDot, { width: 3 * scale, height: 3 * scale }]} />
      </View>
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
  calendarCard: {
    marginTop: Spacing.three,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 700,
    color: Brand.ink,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthNavButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavDisabled: {
    opacity: 0.35,
  },
  monthNavGlyph: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: 600,
    color: Brand.ink,
  },
  monthLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 700,
    color: Brand.ink,
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 600,
    color: Brand.muted,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    backgroundColor: Brand.goldSelected,
  },
  dayNumber: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: 600,
    color: Brand.ink,
  },
  dayNumberDisabled: {
    color: Brand.muted,
  },
  dayNumberSelected: {
    fontWeight: 700,
    color: Brand.ink,
  },
  schedule: {
    borderRadius: 16,
    backgroundColor: Brand.sageSoft,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    gap: 12,
  },
  scheduleBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: Brand.leaf,
    marginVertical: 2,
  },
  scheduleCopy: {
    flex: 1,
    gap: 4,
  },
  scheduleTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 700,
    color: Brand.ink,
  },
  scheduleBody: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
    color: Brand.muted,
  },
  note: {
    marginTop: Spacing.three,
    borderRadius: 22,
    backgroundColor: Brand.pill,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  noteBody: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
    color: Brand.muted,
  },
  sun: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Brand.gold,
  },
  sunRayVertical: {
    position: 'absolute',
    width: 2,
    height: 18,
    borderRadius: 1,
    backgroundColor: Brand.gold,
  },
  sunRayHorizontal: {
    position: 'absolute',
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: Brand.gold,
  },
  sunRayDiagA: {
    position: 'absolute',
    width: 2,
    height: 16,
    borderRadius: 1,
    backgroundColor: Brand.gold,
    transform: [{ rotate: '45deg' }],
  },
  sunRayDiagB: {
    position: 'absolute',
    width: 2,
    height: 16,
    borderRadius: 1,
    backgroundColor: Brand.gold,
    transform: [{ rotate: '-45deg' }],
  },
  calendarIcon: {
    width: 16,
    height: 15,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Brand.gold,
    overflow: 'hidden',
    justifyContent: 'space-between',
    paddingBottom: 3,
  },
  calendarIconTop: {
    height: 4,
    backgroundColor: Brand.gold,
  },
  calendarIconDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 3,
  },
  calendarIconDot: {
    width: 3,
    height: 3,
    borderRadius: 1,
    backgroundColor: Brand.gold,
  },
});
