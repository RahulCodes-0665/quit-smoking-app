import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { clearCountsByDate } from '@/lib/cigarette-counts';
import { completeOnboarding, isOnboardingComplete, resetOnboardingJourney } from '@/lib/onboarding';

type OnboardingSession = {
  isHydrated: boolean;
  isComplete: boolean;
  markComplete: () => Promise<void>;
  resetJourney: () => Promise<void>;
};

const OnboardingSessionContext = createContext<OnboardingSession | null>(null);

export function OnboardingSessionProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;

    isOnboardingComplete().then((complete) => {
      if (!cancelled) {
        setIsComplete(complete);
        setIsHydrated(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<OnboardingSession>(
    () => ({
      isHydrated,
      isComplete,
      markComplete: async () => {
        await completeOnboarding();
        setIsComplete(true);
      },
      resetJourney: async () => {
        await resetOnboardingJourney();
        await clearCountsByDate();
        setIsComplete(false);
      },
    }),
    [isComplete, isHydrated],
  );

  return <OnboardingSessionContext.Provider value={value}>{children}</OnboardingSessionContext.Provider>;
}

export function useOnboardingSession(): OnboardingSession {
  const session = useContext(OnboardingSessionContext);

  if (!session) {
    throw new Error('useOnboardingSession must be used within OnboardingSessionProvider');
  }

  return session;
}
