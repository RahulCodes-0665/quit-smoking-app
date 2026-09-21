import { StyleSheet, View } from 'react-native';

import { Brand } from '@/constants/theme';

export function QitMark() {
  return (
    <View style={styles.frame} accessibilityLabel="Qit mark">
      <View style={styles.ring} />
      <View style={styles.cigarette}>
        <View style={styles.tip} />
        <View style={styles.body} />
        <View style={styles.filter} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: Brand.gold,
  },
  cigarette: {
    position: 'absolute',
    width: 38,
    height: 11,
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: Brand.cigaretteBody,
    transform: [{ translateX: 18 }, { translateY: 16 }, { rotate: '-40deg' }],
  },
  tip: {
    width: 6,
    backgroundColor: Brand.cigaretteTip,
  },
  body: {
    flex: 1,
    backgroundColor: Brand.cigaretteBody,
  },
  filter: {
    width: 12,
    backgroundColor: Brand.gold,
  },
});
