import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Brand, Fonts } from '@/constants/theme';

export function CravingSosHeader() {
  const router = useRouter();

  return (
    <View style={styles.row}>
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

      <Text style={styles.title} numberOfLines={1}>
        Craving Emergency Sos
      </Text>

      <View style={styles.avatar} accessibilityElementsHidden>
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <Circle cx={9} cy={6.2} r={3.1} fill={Brand.cream} />
          <Path
            d="M3.4 15.2c.6-3.1 2.6-4.6 5.6-4.6s5 1.5 5.6 4.6"
            fill={Brand.cream}
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: Fonts.serif,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 600,
    color: Brand.ink,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
