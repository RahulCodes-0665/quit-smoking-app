import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { OnboardingSessionProvider, useOnboardingSession } from '@/lib/onboarding-session';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'onboarding',
};

export default function RootLayout() {
  return (
    <OnboardingSessionProvider>
      <RootNavigator />
    </OnboardingSessionProvider>
  );
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { isHydrated } = useOnboardingSession();

  if (!isHydrated) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
