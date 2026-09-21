import { Stack } from 'expo-router';

import { Brand } from '@/constants/theme';
import { useOnboardingSession } from '@/lib/onboarding-session';

export default function OnboardingLayout() {
  const { isComplete } = useOnboardingSession();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Brand.cream },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!isComplete}>
        <Stack.Screen name="goal" />
        <Stack.Screen name="begin" />
        <Stack.Screen name="pack" />
        <Stack.Screen name="daily" />
        <Stack.Screen name="triggers" />
        <Stack.Screen name="pack-size" />
        <Stack.Screen name="reasons" />
        <Stack.Screen name="attempt" />
        <Stack.Screen name="ready" />
      </Stack.Protected>
      <Stack.Screen
        name="home"
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="settings" />
      <Stack.Screen name="stats" />
    </Stack>
  );
}
