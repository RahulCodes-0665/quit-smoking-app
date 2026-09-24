import { useLocalSearchParams, useRouter, type Href } from 'expo-router';

export function useSettingsEditor() {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string | string[] }>();
  const from = Array.isArray(params.from) ? params.from[0] : params.from;
  const isEditing = from === 'settings';

  return {
    isEditing,
    ctaLabel: isEditing ? 'Save' : 'Continue',
    finish(nextHref: Href) {
      if (isEditing) {
        router.back();
        return;
      }

      router.push(nextHref);
    },
  };
}
