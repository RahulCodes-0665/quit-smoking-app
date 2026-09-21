import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';

export type JourneyTab = 'home' | 'stats' | 'settings';

const TABS: {
  id: JourneyTab;
  label: string;
  href: Href;
}[] = [
  { id: 'home', label: 'Home', href: '/onboarding/home' },
  { id: 'stats', label: 'Stats', href: '/onboarding/stats' },
  { id: 'settings', label: 'Settings', href: '/onboarding/settings' },
];

export function JourneyTabBar({ active }: { active: JourneyTab }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((tab) => {
        const selected = tab.id === active;

        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={tab.label}
            onPress={() => {
              if (!selected) {
                router.replace(tab.href);
              }
            }}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
            <TabGlyph name={tab.id} color={selected ? Brand.gold : Brand.muted} />
            <Text style={[styles.label, selected && styles.labelSelected]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TabGlyph({ name, color }: { name: JourneyTab; color: string }) {
  if (name === 'stats') {
    return (
      <View style={styles.stats}>
        <View style={[styles.barShort, { backgroundColor: color }]} />
        <View style={[styles.barTall, { backgroundColor: color }]} />
        <View style={[styles.barMid, { backgroundColor: color }]} />
      </View>
    );
  }

  if (name === 'settings') {
    return (
      <View style={styles.gear}>
        <View style={[styles.gearRing, { borderColor: color }]} />
        <View style={[styles.gearHub, { backgroundColor: color }]} />
      </View>
    );
  }

  return (
    <View style={styles.leaf}>
      <View style={[styles.leafPad, { backgroundColor: color }]} />
      <View style={[styles.leafStem, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Brand.goldSoft,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  pressed: {
    opacity: 0.82,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 500,
    color: Brand.muted,
  },
  labelSelected: {
    color: Brand.gold,
    fontWeight: 600,
  },
  leaf: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  leafPad: {
    width: 12,
    height: 14,
    borderRadius: 12,
    transform: [{ rotate: '-18deg' }],
  },
  leafStem: {
    width: 2,
    height: 6,
    marginTop: -2,
    borderRadius: 1,
  },
  stats: {
    width: 22,
    height: 22,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 3,
    paddingBottom: 2,
  },
  barShort: {
    width: 4,
    height: 8,
    borderRadius: 1,
  },
  barTall: {
    width: 4,
    height: 16,
    borderRadius: 1,
  },
  barMid: {
    width: 4,
    height: 12,
    borderRadius: 1,
  },
  gear: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearRing: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  gearHub: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
