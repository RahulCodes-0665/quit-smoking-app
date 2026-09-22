import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SproutIcon } from '@/components/sprout-icon';
import { CravingSosHeader } from '@/components/craving-sos-header';
import { Brand, Fonts, Spacing } from '@/constants/theme';

const CYCLES = 4;
const PHASES = [
  {
    name: 'Inhale',
    hint: 'Deep, slow breath through\nthe nose',
    seconds: 4,
    expand: 1,
  },
  {
    name: 'Hold',
    hint: 'Keep the air still for\na moment',
    seconds: 7,
    expand: 1,
  },
  {
    name: 'Exhale',
    hint: 'Slow breath out through\nthe mouth',
    seconds: 8,
    expand: 0,
  },
  {
    name: 'Rest',
    hint: 'Let the body settle\nbefore the next breath',
    seconds: 6,
    expand: 0,
  },
] as const;

const CYCLE_SECONDS = PHASES.reduce((sum, phase) => sum + phase.seconds, 0);
const TOTAL_SECONDS = CYCLE_SECONDS * CYCLES;

export default function BreatheScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [finishedEarly, setFinishedEarly] = useState(false);
  const expand = useSharedValue(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(timer);
  }, []);

  const session = useMemo(
    () => buildSession(startedAt, now, finishedEarly),
    [finishedEarly, now, startedAt],
  );

  useEffect(() => {
    expand.value = withTiming(session.complete ? 1 : session.phase.expand, {
      duration: session.complete ? 700 : session.phase.seconds * 1000,
      easing: Easing.inOut(Easing.sin),
    });
  }, [expand, session.complete, session.phase.expand, session.phase.seconds, session.phaseKey]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.86 + expand.value * 0.22 }],
    opacity: 0.22 + expand.value * 0.18,
  }));
  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.8 + expand.value * 0.2 }],
  }));
  const midStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.86 + expand.value * 0.14 }],
  }));
  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.94 + expand.value * 0.06 }],
  }));

  const goHome = () => {
    router.replace('/onboarding/home');
  };

  return (
    <View style={styles.backdrop}>
      <Stack.Screen options={{ contentStyle: { backgroundColor: Brand.cream } }} />
      <StatusBar style="dark" />
      <View
        style={[
          styles.screen,
          {
            paddingTop: Math.max(insets.top, Spacing.three),
            paddingBottom: Math.max(insets.bottom, Spacing.three),
            paddingLeft: Spacing.four + insets.left,
            paddingRight: Spacing.four + insets.right,
          },
        ]}>
        <CravingSosHeader />

        <View style={styles.topRow}>
          <View style={styles.chip}>
            <View style={styles.chipDot} />
            <Text style={styles.chipLabel}>Paced Calming</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Finish early"
            onPress={() => setFinishedEarly(true)}
            style={({ pressed }) => [styles.chip, styles.finishChip, pressed && styles.pressed]}>
            <Text style={styles.finishLabel}>Finish early ×</Text>
          </Pressable>
        </View>

        <View style={styles.stage}>
          <Animated.View style={[styles.glow, glowStyle]} />
          <Animated.View style={[styles.ring, styles.outerRing, outerStyle]} />
          <Animated.View style={[styles.ring, styles.midRing, midStyle]} />
          <Animated.View style={[styles.inner, innerStyle]}>
            <View style={styles.innerDot} />
            <Text style={styles.phaseName}>{session.complete ? 'Still' : session.phase.name}</Text>
            <Text style={styles.phaseHint}>
              {session.complete ? 'Let this calm stay with you' : session.phase.hint}
            </Text>
            <Text style={styles.phaseSeconds}>{session.complete ? '0s' : `${session.phaseLeft}s`}</Text>
          </Animated.View>
        </View>

        <View style={styles.cycleDots}>
          {Array.from({ length: CYCLES }, (_, index) => (
            <View
              key={index}
              style={[
                styles.cycleDot,
                index < session.cycle ? styles.cycleDotDone : null,
                index === session.cycle - 1 && !session.complete ? styles.cycleDotActive : null,
              ]}
            />
          ))}
        </View>
        <Text style={styles.cycleLabel}>
          Cycle {session.cycle} of {CYCLES} • {formatClock(session.remaining)} remaining
        </Text>

        <View style={styles.note}>
          <View style={styles.noteIcon}>
            <View style={styles.noteIconScale}>
              <SproutIcon />
            </View>
          </View>
          <View style={styles.noteCopy}>
            <Text style={styles.noteTitle}>You made space for the craving.</Text>
            <Text style={styles.noteBody}>
              The peak chemical surge only lasts 3 minutes. Your breath has already quieted the
              nervous system.
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Home"
          onPress={goHome}
          style={({ pressed }) => [styles.homeButton, pressed && styles.pressed]}>
          <Text style={styles.homeLabel}>Back to Home  →</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Try a gentle distraction"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.distract, pressed && styles.pressed]}>
          <Text style={styles.distractLabel}>Try a gentle distraction</Text>
        </Pressable>

        <Text style={styles.footer}>Unrushed recovery • No judgments, just stillness</Text>
      </View>
    </View>
  );
}

function buildSession(startedAt: number, now: number, finishedEarly: boolean) {
  const elapsedSeconds = finishedEarly
    ? TOTAL_SECONDS
    : Math.min(TOTAL_SECONDS, Math.max(0, (now - startedAt) / 1000));
  const remaining = Math.max(0, Math.ceil(TOTAL_SECONDS - elapsedSeconds));
  const complete = remaining <= 0;
  const bounded = Math.min(TOTAL_SECONDS - 0.01, elapsedSeconds);
  const cycleIndex = Math.min(CYCLES - 1, Math.floor(bounded / CYCLE_SECONDS));
  let phaseOffset = bounded - cycleIndex * CYCLE_SECONDS;
  let phase = PHASES[0];
  let consumed = 0;

  for (const candidate of PHASES) {
    if (phaseOffset < consumed + candidate.seconds) {
      phase = candidate;
      break;
    }
    consumed += candidate.seconds;
    phase = candidate;
  }

  const phaseElapsed = phaseOffset - consumed;
  const phaseLeft = complete ? 0 : Math.max(1, Math.ceil(phase.seconds - phaseElapsed));

  return {
    cycle: complete ? CYCLES : cycleIndex + 1,
    phase,
    phaseKey: `${cycleIndex}-${phase.name}`,
    phaseLeft,
    remaining,
    complete,
  };
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const RING = 268;

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
  topRow: {
    marginTop: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Brand.pill,
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Brand.gold,
  },
  chipLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 600,
    color: Brand.muted,
  },
  finishChip: {
    backgroundColor: Brand.pill,
  },
  finishLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 600,
    color: Brand.muted,
  },
  stage: {
    flex: 1,
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: RING + 90,
    height: RING + 90,
    borderRadius: (RING + 90) / 2,
    backgroundColor: Brand.goldSelected,
  },
  ring: {
    position: 'absolute',
    borderRadius: RING / 2,
  },
  outerRing: {
    width: RING,
    height: RING,
    borderWidth: 18,
    borderColor: 'rgba(232, 215, 168, 0.55)',
  },
  midRing: {
    width: RING - 36,
    height: RING - 36,
    borderRadius: (RING - 36) / 2,
    borderWidth: 16,
    borderColor: 'rgba(241, 215, 138, 0.7)',
  },
  inner: {
    width: 188,
    height: 188,
    borderRadius: 94,
    backgroundColor: '#FBF4E7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  innerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Brand.gold,
    marginBottom: 10,
  },
  phaseName: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 600,
    color: Brand.ink,
  },
  phaseHint: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
    color: Brand.muted,
  },
  phaseSeconds: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 600,
    color: Brand.gold,
  },
  cycleDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cycleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Brand.goldSoft,
  },
  cycleDotDone: {
    backgroundColor: Brand.gold,
  },
  cycleDotActive: {
    backgroundColor: Brand.gold,
  },
  cycleLabel: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 500,
    color: Brand.muted,
    marginBottom: Spacing.four,
  },
  note: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  noteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Brand.sageSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteIconScale: {
    transform: [{ scale: 1.05 }],
  },
  noteCopy: {
    flex: 1,
    gap: 4,
  },
  noteTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 700,
    color: Brand.ink,
  },
  noteBody: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
    color: Brand.muted,
  },
  homeButton: {
    marginTop: Spacing.three,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 600,
    color: '#FFFFFF',
  },
  distract: {
    marginTop: Spacing.two,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distractLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
    color: Brand.ink,
  },
  footer: {
    marginTop: Spacing.two,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 400,
    color: '#C4B8AA',
  },
  pressed: {
    opacity: 0.82,
  },
});
