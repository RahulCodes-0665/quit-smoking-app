import AsyncStorage from '@react-native-async-storage/async-storage';

const GOAL_KEY = 'onboarding-goal';
const START_KEY = 'onboarding-start';
const PACK_PRICE_KEY = 'onboarding-pack-price';
const DAILY_CIGARETTES_KEY = 'onboarding-daily-cigarettes';
const TRIGGERS_KEY = 'onboarding-triggers';
const PACK_SIZE_KEY = 'onboarding-pack-size';
const REASONS_KEY = 'onboarding-reasons';
const ATTEMPT_KEY = 'onboarding-attempt';
const COMPLETE_KEY = 'onboarding-complete';

export const ONBOARDING_STEPS = 8;

export type OnboardingGoal = 'quit-completely' | 'reduce-smoking';

export type OnboardingStartMode = 'today' | 'choose-date';

export type OnboardingStartPlan = {
  mode: OnboardingStartMode;
  dateKey: string;
};

export async function saveOnboardingGoal(goal: OnboardingGoal): Promise<void> {
  try {
    await AsyncStorage.setItem(GOAL_KEY, goal);
  } catch {
    // Keep the in-memory selection even if persistence fails.
  }
}

export async function saveOnboardingStart(plan: OnboardingStartPlan): Promise<void> {
  try {
    await AsyncStorage.setItem(START_KEY, JSON.stringify(plan));
  } catch {
    // Keep the in-memory selection even if persistence fails.
  }
}

export async function saveOnboardingPackPrice(price: number): Promise<void> {
  try {
    await AsyncStorage.setItem(PACK_PRICE_KEY, String(price));
  } catch {
    // Keep the in-memory selection even if persistence fails.
  }
}

export async function saveOnboardingDailyCigarettes(count: number): Promise<void> {
  try {
    await AsyncStorage.setItem(DAILY_CIGARETTES_KEY, String(count));
  } catch {
    // Keep the in-memory selection even if persistence fails.
  }
}

export type OnboardingTriggers = {
  selected: string[];
  unsure: boolean;
};

export async function saveOnboardingTriggers(plan: OnboardingTriggers): Promise<void> {
  try {
    await AsyncStorage.setItem(TRIGGERS_KEY, JSON.stringify(plan));
  } catch {
    // Keep the in-memory selection even if persistence fails.
  }
}

export async function saveOnboardingPackSize(count: number): Promise<void> {
  try {
    await AsyncStorage.setItem(PACK_SIZE_KEY, String(count));
  } catch {
    // Keep the in-memory selection even if persistence fails.
  }
}

export type OnboardingReasons = {
  selected: string[];
  note: string;
};

export async function saveOnboardingReasons(plan: OnboardingReasons): Promise<void> {
  try {
    await AsyncStorage.setItem(REASONS_KEY, JSON.stringify(plan));
  } catch {
    // Keep the in-memory selection even if persistence fails.
  }
}

export type OnboardingAttempt = 'first' | 'tried-before' | 'prefer-not';

export async function saveOnboardingAttempt(attempt: OnboardingAttempt): Promise<void> {
  try {
    await AsyncStorage.setItem(ATTEMPT_KEY, attempt);
  } catch {
    // Keep the in-memory selection even if persistence fails.
  }
}

export async function completeOnboarding(): Promise<void> {
  try {
    await AsyncStorage.setItem(COMPLETE_KEY, 'true');
  } catch {
    // Keep the in-memory completion even if persistence fails.
  }
}

export async function isOnboardingComplete(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(COMPLETE_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function resetOnboardingJourney(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      GOAL_KEY,
      START_KEY,
      PACK_PRICE_KEY,
      DAILY_CIGARETTES_KEY,
      TRIGGERS_KEY,
      PACK_SIZE_KEY,
      REASONS_KEY,
      ATTEMPT_KEY,
      COMPLETE_KEY,
    ]);
  } catch {
    // Continue the reset even if persistence fails.
  }
}

export type OnboardingSummary = {
  goal: OnboardingGoal | null;
  start: OnboardingStartPlan | null;
  dailyCigarettes: number | null;
};

export type OnboardingJourney = {
  start: OnboardingStartPlan | null;
  packPrice: number | null;
  dailyCigarettes: number | null;
  packSize: number | null;
};

export type OnboardingSettings = {
  goal: OnboardingGoal | null;
  start: OnboardingStartPlan | null;
  dailyCigarettes: number | null;
  packPrice: number | null;
  packSize: number | null;
  triggers: OnboardingTriggers | null;
  reasons: OnboardingReasons | null;
};

export async function loadOnboardingJourney(): Promise<OnboardingJourney> {
  try {
    const [startRaw, packPriceRaw, dailyRaw, packSizeRaw] = await Promise.all([
      AsyncStorage.getItem(START_KEY),
      AsyncStorage.getItem(PACK_PRICE_KEY),
      AsyncStorage.getItem(DAILY_CIGARETTES_KEY),
      AsyncStorage.getItem(PACK_SIZE_KEY),
    ]);

    return {
      start: parseStart(startRaw),
      packPrice: parseCount(packPriceRaw),
      dailyCigarettes: parseCount(dailyRaw),
      packSize: parseCount(packSizeRaw),
    };
  } catch {
    return {
      start: null,
      packPrice: null,
      dailyCigarettes: null,
      packSize: null,
    };
  }
}

export async function loadOnboardingSettings(): Promise<OnboardingSettings> {
  try {
    const [goal, startRaw, dailyRaw, packPriceRaw, packSizeRaw, triggersRaw, reasonsRaw] =
      await Promise.all([
        AsyncStorage.getItem(GOAL_KEY),
        AsyncStorage.getItem(START_KEY),
        AsyncStorage.getItem(DAILY_CIGARETTES_KEY),
        AsyncStorage.getItem(PACK_PRICE_KEY),
        AsyncStorage.getItem(PACK_SIZE_KEY),
        AsyncStorage.getItem(TRIGGERS_KEY),
        AsyncStorage.getItem(REASONS_KEY),
      ]);

    return {
      goal: goal === 'quit-completely' || goal === 'reduce-smoking' ? goal : null,
      start: parseStart(startRaw),
      dailyCigarettes: parseCount(dailyRaw),
      packPrice: parseCount(packPriceRaw),
      packSize: parseCount(packSizeRaw),
      triggers: parseJson<OnboardingTriggers>(triggersRaw),
      reasons: parseJson<OnboardingReasons>(reasonsRaw),
    };
  } catch {
    return {
      goal: null,
      start: null,
      dailyCigarettes: null,
      packPrice: null,
      packSize: null,
      triggers: null,
      reasons: null,
    };
  }
}

function parseStart(raw: string | null): OnboardingStartPlan | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as OnboardingStartPlan;
  } catch {
    return null;
  }
}

function parseCount(raw: string | null): number | null {
  const value = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(value) ? value : null;
}

function parseJson<T>(raw: string | null): T | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function loadOnboardingSummary(): Promise<OnboardingSummary> {
  try {
    const [goal, startRaw, dailyRaw] = await Promise.all([
      AsyncStorage.getItem(GOAL_KEY),
      AsyncStorage.getItem(START_KEY),
      AsyncStorage.getItem(DAILY_CIGARETTES_KEY),
    ]);

    let start: OnboardingStartPlan | null = null;
    if (startRaw) {
      try {
        start = JSON.parse(startRaw) as OnboardingStartPlan;
      } catch {
        start = null;
      }
    }

    const daily = dailyRaw ? Number.parseInt(dailyRaw, 10) : Number.NaN;

    return {
      goal: goal === 'quit-completely' || goal === 'reduce-smoking' ? goal : null,
      start,
      dailyCigarettes: Number.isFinite(daily) ? daily : null,
    };
  } catch {
    return {
      goal: null,
      start: null,
      dailyCigarettes: null,
    };
  }
}
