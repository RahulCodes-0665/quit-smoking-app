import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { CravingSosHeader } from '@/components/craving-sos-header';
import { Brand, Fonts, Spacing } from '@/constants/theme';

const ACTIONS = [
  {
    id: 'breathe',
    title: 'Breathe with Qit',
    description: 'Follow a calming breathing rhythm.',
    icon: 'wind' as const,
  },
  {
    id: 'distract',
    title: 'Distract me for 3 minutes',
    description: 'Give the craving time to fade.',
    icon: 'hourglass' as const,
  },
];

export default function CravingHelpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
        <CravingSosHeader />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>This feeling will pass.</Text>
          <Text style={styles.subtitle}>A craving usually fades in a few minutes.</Text>

          <View style={styles.actions}>
            {ACTIONS.map((action) => (
              <Pressable
                key={action.id}
                accessibilityRole="button"
                accessibilityLabel={action.title}
                onPress={() => {
                  if (action.id === 'breathe') {
                    router.push('/onboarding/breathe');
                  } else {
                    router.push('/onboarding/distract');
                  }
                }}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
                <View style={styles.cardTop}>
                  <View style={styles.iconWell}>
                    {action.icon === 'wind' ? <WindGlyph /> : <HourglassGlyph />}
                  </View>
                  <View style={styles.forwardChevron} />
                </View>
                <Text style={styles.cardTitle}>{action.title}</Text>
                <Text style={styles.cardDescription}>{action.description}</Text>
                <View style={styles.cardAccent} />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function WindGlyph() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" accessibilityElementsHidden>
      <Path
        d="M3 8.2h10.4c1.7 0 2.8-1.1 2.8-2.5S15.1 3.4 13.5 3.4c-1.2 0-2.1.6-2.5 1.5"
        fill="none"
        stroke={Brand.gold}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Path
        d="M3 11.4h13.2c1.6 0 2.7 1 2.7 2.4s-1.2 2.5-2.8 2.5c-1.2 0-2.1-.6-2.5-1.5"
        fill="none"
        stroke={Brand.gold}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Path
        d="M3 14.6h6.8"
        fill="none"
        stroke={Brand.gold}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function HourglassGlyph() {
  return (
    <Svg width={20} height={22} viewBox="0 0 20 22" accessibilityElementsHidden>
      <Path
        d="M4.2 3.2h11.6M4.2 18.8h11.6M5.4 3.2v2.4c0 2.2 1.7 3.6 3.4 4.6-1.7 1-3.4 2.4-3.4 4.6v2M14.6 3.2v2.4c0 2.2-1.7 3.6-3.4 4.6 1.7 1 3.4 2.4 3.4 4.6v2"
        fill="none"
        stroke={Brand.gold}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.2 12.4h3.6"
        fill="none"
        stroke={Brand.gold}
        strokeWidth={1.7}
        strokeLinecap="round"
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.five,
    paddingBottom: Spacing.five,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: 600,
    color: Brand.ink,
  },
  subtitle: {
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 400,
    color: Brand.muted,
  },
  actions: {
    gap: Spacing.three,
  },
  card: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  iconWell: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Brand.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    marginTop: 16,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
    color: Brand.ink,
  },
  cardDescription: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
    color: Brand.muted,
  },
  forwardChevron: {
    width: 10,
    height: 10,
    marginTop: 6,
    borderRightWidth: 1.6,
    borderTopWidth: 1.6,
    borderColor: Brand.goldSoft,
    transform: [{ rotate: '45deg' }],
  },
  cardAccent: {
    marginTop: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: Brand.goldSoft,
  },
  pressed: {
    opacity: 0.6,
  },
});
