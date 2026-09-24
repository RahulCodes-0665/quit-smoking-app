import { Image, StyleSheet, View } from 'react-native';

export function QitMark() {
  return (
    <View style={styles.frame} accessibilityLabel="Qit logo">
      <Image
        source={require('@/assets/images/qit-logo.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const LOGO_SIZE = 200;

const styles = StyleSheet.create({
  frame: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});
