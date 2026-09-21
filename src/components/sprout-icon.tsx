import { StyleSheet, View } from 'react-native';

import { Brand } from '@/constants/theme';

export function SproutIcon() {
  return (
    <View
      style={styles.wrap}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <View style={[styles.leaf, styles.leftLeaf]} />
      <View style={[styles.leaf, styles.rightLeaf]} />
      <View style={styles.stem} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  stem: {
    width: 2,
    height: 7,
    borderRadius: 1,
    backgroundColor: Brand.leaf,
    marginBottom: 1,
  },
  leaf: {
    position: 'absolute',
    width: 9,
    height: 6,
    borderRadius: 9,
    backgroundColor: Brand.leaf,
    bottom: 6,
  },
  leftLeaf: {
    left: 0,
    transform: [{ rotate: '-32deg' }],
  },
  rightLeaf: {
    right: 0,
    transform: [{ rotate: '32deg' }],
  },
});
