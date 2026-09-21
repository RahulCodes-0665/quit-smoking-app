import type { ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, Spacing } from '@/constants/theme';

type OnboardingScreenProps = {
  children: ReactNode;
  footer: ReactNode;
};

export function OnboardingScreen({ children, footer }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.backdrop}>
      <StatusBar style="dark" />
      <View
        style={[
          styles.screen,
          {
            paddingTop: Math.max(insets.top, Spacing.three),
            paddingBottom: Math.max(insets.bottom, Spacing.three) + Spacing.three,
            paddingLeft: Spacing.four + insets.left,
            paddingRight: Spacing.four + insets.right,
          },
        ]}>
        <View style={styles.body}>{children}</View>
        {footer}
      </View>
    </View>
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
    backgroundColor: Brand.cream,
  },
  body: {
    flex: 1,
  },
});
