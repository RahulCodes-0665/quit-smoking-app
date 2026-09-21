import { Redirect } from 'expo-router';

import { useOnboardingSession } from '@/lib/onboarding-session';

export default function RootIndex() {
  const { isComplete } = useOnboardingSession();

  return <Redirect href={isComplete ? '/onboarding/home' : '/onboarding'} />;
}
