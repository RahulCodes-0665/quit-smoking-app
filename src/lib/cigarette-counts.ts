import AsyncStorage from '@react-native-async-storage/async-storage';

const COUNTS_STORAGE_KEY = 'cigarette-counts-by-date';

function isCountsByDate(value: unknown): value is Record<string, number> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  return Object.entries(value).every(
    ([key, count]) => /^\d{4}-\d{2}-\d{2}$/.test(key) && typeof count === 'number' && Number.isFinite(count),
  );
}

export async function loadCountsByDate(): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(COUNTS_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);
    return isCountsByDate(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export async function saveCountsByDate(countsByDate: Record<string, number>): Promise<void> {
  try {
    await AsyncStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(countsByDate));
  } catch {
    // Keep the in-memory count even if persistence fails.
  }
}

export async function clearCountsByDate(): Promise<void> {
  try {
    await AsyncStorage.removeItem(COUNTS_STORAGE_KEY);
  } catch {
    // Continue even if persistence fails.
  }
}
