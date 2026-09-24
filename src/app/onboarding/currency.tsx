import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OnboardingCta } from '@/components/onboarding-cta';
import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { Brand, Fonts, Spacing } from '@/constants/theme';
import {
  CURRENCY_OPTIONS,
  loadOnboardingSettings,
  saveOnboardingCurrency,
  type OnboardingCurrency,
} from '@/lib/onboarding';
import { useSettingsEditor } from '@/lib/settings-editor';

export default function CurrencyScreen() {
  const { isEditing, ctaLabel, finish } = useSettingsEditor();
  const [currency, setCurrency] = useState<OnboardingCurrency>('INR');

  useEffect(() => {
    let cancelled = false;

    loadOnboardingSettings().then((saved) => {
      if (!cancelled) {
        setCurrency(saved.currency);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <OnboardingScreen
      footer={
        <OnboardingCta
          label={ctaLabel}
          onPress={() => {
            void saveOnboardingCurrency(currency);
            finish('/onboarding/settings');
          }}
        />
      }>
      <OnboardingHeader step={3} editing={isEditing} />

      <Text style={styles.title}>Which currency should we use?</Text>
      <Text style={styles.subtitle}>
        This is only for how pack price and savings appear in your journal.
      </Text>

      <View style={styles.options}>
        {CURRENCY_OPTIONS.map((option) => {
          const selected = option.code === currency;

          return (
            <Pressable
              key={option.code}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              onPress={() => setCurrency(option.code)}
              style={({ pressed }) => [
                styles.option,
                selected ? styles.optionSelected : styles.optionIdle,
                pressed && styles.pressed,
              ]}>
              <View style={[styles.symbolWell, selected && styles.symbolWellSelected]}>
                <Text style={styles.symbol}>{option.symbol}</Text>
              </View>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <View style={styles.check} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: Spacing.four,
    fontFamily: Fonts.serif,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 600,
    color: Brand.ink,
  },
  subtitle: {
    marginTop: Spacing.two,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 400,
    color: Brand.muted,
  },
  options: {
    marginTop: Spacing.four,
    gap: Spacing.three,
  },
  option: {
    minHeight: 72,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionSelected: {
    backgroundColor: Brand.goldSelected,
  },
  optionIdle: {
    backgroundColor: Brand.pill,
  },
  pressed: {
    opacity: 0.92,
  },
  symbolWell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolWellSelected: {
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  symbol: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: 700,
    color: Brand.gold,
  },
  optionLabel: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: 700,
    color: Brand.ink,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Brand.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: Brand.gold,
  },
  check: {
    width: 10,
    height: 6,
    marginTop: -1,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
  },
});
