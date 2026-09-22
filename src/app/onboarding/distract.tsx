import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Brand, Fonts, Spacing } from '@/constants/theme';

const INITIAL_SECONDS = 3 * 60;
const RING_SIZE = 176;
const RING_STROKE = 8;

const IDEAS = [
  {
    title: 'Drink a glass of water slowly.',
    body: 'Feel the cool temperature and release shoulder tension.',
  },
  {
    title: 'Stretch your hands and neck.',
    body: 'Roll your shoulders back and let the restlessness leave your fingers.',
  },
  {
    title: 'Name five things you can see.',
    body: 'Stay with the room around you until the urge feels a little smaller.',
  },
  {
    title: 'Step to a window and breathe.',
    body: 'Notice the air on your face and give the craving a moment to pass.',
  },
] as const;

export default function DistractScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [remaining, setRemaining] = useState(INITIAL_SECONDS);
  const [total, setTotal] = useState(INITIAL_SECONDS);
  const [paused, setPaused] = useState(false);
  const [ideaIndex, setIdeaIndex] = useState(0);

  const idea = IDEAS[ideaIndex];
  const progress = total > 0 ? remaining / total : 0;
  const done = remaining <= 0;

  useEffect(() => {
    if (paused || done) {
      return;
    }

    const timer = setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [done, paused]);

  return (
    <View style={styles.backdrop}>
      <Stack.Screen options={{ contentStyle: { backgroundColor: Brand.cream } }} />
      <StatusBar style="dark" />
      <View
        style={[
          styles.screen,
          {
            paddingTop: Math.max(insets.top, Spacing.three),
            paddingLeft: Spacing.four + insets.left,
            paddingRight: Spacing.four + insets.right,
          },
        ]}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Svg width={22} height={22} viewBox="0 0 22 22">
              <Path
                d="M13.5 4.5 6.8 11l6.7 6.5"
                fill="none"
                stroke={Brand.ink}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
          <Text style={styles.headerTitle}>Distract me</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.timerWrap}>
            <TimerRing progress={progress} />
            <View style={styles.timerCopy} pointerEvents="none">
              <Text style={styles.timerValue}>{formatClock(remaining)}</Text>
              <Text style={styles.timerHint}>BREATHE SOFTLY</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paused ? 'Resume' : 'Pause'}
            onPress={() => setPaused((value) => !value)}
            style={({ pressed }) => [styles.pause, pressed && styles.pressed]}>
            {paused ? <PlayGlyph /> : <PauseGlyph />}
            <Text style={styles.pauseLabel}>{paused ? 'Resume' : 'Pause'}</Text>
          </Pressable>

          <View style={styles.ideaCard}>
            <DropGlyph />
            <Text style={styles.ideaTitle}>{idea.title}</Text>
            <Text style={styles.ideaBody}>{idea.body}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Show another idea"
              onPress={() => setIdeaIndex((index) => (index + 1) % IDEAS.length)}
              style={({ pressed }) => [styles.refresh, pressed && styles.pressed]}>
              <RefreshGlyph />
              <Text style={styles.refreshLabel}>Show another idea</Text>
            </Pressable>
          </View>

          <View style={styles.checkCard}>
            <View style={styles.checkHeading}>
              <HeartGlyph />
              <Text style={styles.checkTitle}>Has the craving eased?</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Yes, I'm okay"
              onPress={() => router.replace('/onboarding/home')}
              style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
              <CheckGlyph />
              <Text style={styles.primaryLabel}>Yes, I’m okay</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="I need another minute"
              onPress={() => {
                setPaused(false);
                setTotal((value) => value + 60);
                setRemaining((value) => value + 60);
              }}
              style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
              <ClockGlyph />
              <Text style={styles.secondaryLabel}>I need another minute</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function TimerRing({ progress }: { progress: number }) {
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = circumference * (1 - clamped);

  return (
    <Svg width={RING_SIZE} height={RING_SIZE}>
      <Circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={radius}
        stroke={Brand.goldSoft}
        strokeWidth={RING_STROKE}
        fill="#F8EEDD"
      />
      <Circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={radius}
        stroke={Brand.gold}
        strokeWidth={RING_STROKE}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
      />
    </Svg>
  );
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function PauseGlyph() {
  return (
    <View style={styles.pauseBars} accessibilityElementsHidden>
      <View style={styles.pauseBar} />
      <View style={styles.pauseBar} />
    </View>
  );
}

function PlayGlyph() {
  return (
    <View style={styles.play} accessibilityElementsHidden>
      <View style={styles.playTip} />
    </View>
  );
}

function DropGlyph() {
  return (
    <Svg width={22} height={26} viewBox="0 0 22 26" accessibilityElementsHidden>
      <Path
        d="M11 2.5C11 2.5 3.5 11.2 3.5 16.2a7.5 7.5 0 0 0 15 0C18.5 11.2 11 2.5 11 2.5Z"
        fill="none"
        stroke={Brand.gold}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function RefreshGlyph() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" accessibilityElementsHidden>
      <Path
        d="M12 7A5 5 0 1 1 9.2 2.4"
        fill="none"
        stroke={Brand.muted}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M8.1 2.1h2.6V4.7"
        fill="none"
        stroke={Brand.muted}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HeartGlyph() {
  return (
    <Svg width={16} height={15} viewBox="0 0 16 15" accessibilityElementsHidden>
      <Path
        d="M8 13.2S1.6 9.1 1.6 5.4A3.3 3.3 0 0 1 8 3.7a3.3 3.3 0 0 1 6.4 1.7c0 3.7-6.4 7.8-6.4 7.8Z"
        fill={Brand.gold}
      />
    </Svg>
  );
}

function CheckGlyph() {
  return (
    <View style={styles.checkWell} accessibilityElementsHidden>
      <View style={styles.check} />
    </View>
  );
}

function ClockGlyph() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" accessibilityElementsHidden>
      <Circle cx={8} cy={8} r={6} fill="none" stroke={Brand.ink} strokeWidth={1.5} />
      <Path
        d="M8 4.8V8l2.2 1.4"
        fill="none"
        stroke={Brand.ink}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
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
  header: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 600,
    color: Brand.ink,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    alignItems: 'center',
  },
  timerWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCopy: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerValue: {
    fontFamily: Fonts.serif,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: 600,
    color: Brand.ink,
    fontVariant: ['tabular-nums'],
  },
  timerHint: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.4,
    fontWeight: 600,
    color: Brand.muted,
  },
  pause: {
    marginTop: Spacing.four,
    minHeight: 34,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: Brand.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pauseBars: {
    width: 10,
    height: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pauseBar: {
    width: 3,
    height: 11,
    borderRadius: 1,
    backgroundColor: Brand.muted,
  },
  play: {
    width: 10,
    height: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTip: {
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: Brand.muted,
    marginLeft: 2,
  },
  pauseLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: 600,
    color: Brand.muted,
  },
  ideaCard: {
    marginTop: Spacing.four,
    width: '100%',
    borderRadius: 24,
    backgroundColor: Brand.pill,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
    alignItems: 'center',
  },
  ideaTitle: {
    marginTop: Spacing.three,
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
    color: Brand.ink,
  },
  ideaBody: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 400,
    color: Brand.muted,
  },
  refresh: {
    marginTop: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refreshLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: 500,
    color: Brand.muted,
  },
  checkCard: {
    marginTop: Spacing.three,
    width: '100%',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 10,
  },
  checkHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  checkTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 700,
    color: Brand.ink,
  },
  primary: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: Brand.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 600,
    color: '#FFFFFF',
  },
  checkWell: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.6,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 7,
    height: 4,
    marginTop: -1,
    borderBottomWidth: 1.6,
    borderLeftWidth: 1.6,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
  },
  secondary: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: Brand.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 600,
    color: Brand.ink,
  },
  pressed: {
    opacity: 0.82,
  },
});
