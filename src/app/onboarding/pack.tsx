import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { OnboardingCta } from '@/components/onboarding-cta';
import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { Brand, Fonts, Spacing } from '@/constants/theme';
import { loadOnboardingSettings, saveOnboardingPackPrice } from '@/lib/onboarding';
import { useSettingsEditor } from '@/lib/settings-editor';

const PRESETS = [280, 340, 420] as const;
const PRICE_STEP = 10;
const MIN_PRICE = 10;
const MAX_PRICE = 9999;
const DEFAULT_PRICE = 340;
const SAVINGS_DAYS = 30;

export default function PackScreen() {
  const { isEditing, ctaLabel, finish } = useSettingsEditor();
  const [draft, setDraft] = useState(String(DEFAULT_PRICE));
  const price = parsePrice(draft);
  const savings = price * SAVINGS_DAYS;
  const formattedPrice = formatRupees(price);
  const formattedSavings = formatRupees(savings);

  useEffect(() => {
    let cancelled = false;

    loadOnboardingSettings().then((saved) => {
      if (!cancelled && saved.packPrice) {
        setDraft(String(saved.packPrice));
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const reminder = useMemo(
    () =>
      `At ${formattedPrice} per pack, resting for just ${SAVINGS_DAYS} days keeps roughly ${formattedSavings} preserved for what truly matters to you.`,
    [formattedPrice, formattedSavings],
  );

  return (
    <OnboardingScreen
      footer={
        <OnboardingCta
          label={ctaLabel}
          disabled={price < MIN_PRICE}
          onPress={() => {
            void saveOnboardingPackPrice(price);
            finish('/onboarding/daily');
          }}
        />
      }>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <OnboardingHeader step={3} editing={isEditing} />

        <View style={styles.hero}>
          <View style={styles.iconWell}>
            <WalletGlyph />
          </View>
          <Text style={styles.title}>What does a pack cost?</Text>
          <Text style={styles.subtitle}>
            An honest baseline to quietly track the wealth returning to your pocket each week.
          </Text>
        </View>

        <View style={styles.priceCard}>
          <View style={styles.priceAccent} />
          <Text style={styles.priceEyebrow}>AVERAGE PACK PRICE</Text>
          <View style={styles.priceRow}>
            <Text style={styles.currency}>₹</Text>
            <TextInput
              accessibilityLabel="Average pack price"
              value={draft}
              onChangeText={(value) => setDraft(sanitizePriceInput(value))}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={4}
              caretHidden={false}
              cursorColor={Brand.gold}
              selectionColor={Brand.gold}
              underlineColorAndroid="transparent"
              style={[
                styles.priceInput,
                { width: Math.max(1, draft.length) * 34 },
              ]}
            />
          </View>

          <View style={styles.controls}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Decrease pack price"
              onPress={() => setDraft(String(stepPrice(price, -PRICE_STEP)))}
              style={({ pressed }) => [styles.stepper, pressed && styles.pressed]}>
              <Text style={styles.stepperLabel}>−</Text>
            </Pressable>

            {PRESETS.map((preset) => {
              const selected = price === preset;

              return (
                <Pressable
                  key={preset}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${formatRupees(preset)} pack`}
                  onPress={() => setDraft(String(preset))}
                  style={({ pressed }) => [
                    styles.preset,
                    selected ? styles.presetSelected : styles.presetIdle,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.presetLabel, selected && styles.presetLabelSelected]}>
                    {formatRupees(preset)}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Increase pack price"
              onPress={() => setDraft(String(stepPrice(price, PRICE_STEP)))}
              style={({ pressed }) => [styles.stepper, pressed && styles.pressed]}>
              <Text style={styles.stepperLabel}>+</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.currencyHint}>You can change currency later.</Text>

        <View style={styles.note}>
          <View style={styles.noteBar} />
          <View style={styles.noteCopy}>
            <Text style={styles.noteTitle}>A gentle reminder</Text>
            <Text style={styles.noteBody}>{reminder}</Text>
          </View>
        </View>
      </ScrollView>
    </OnboardingScreen>
  );
}

function parsePrice(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sanitizePriceInput(value: string): string {
  return value.replace(/[^\d]/g, '').slice(0, 4);
}

function stepPrice(current: number, delta: number): number {
  const next = Math.max(MIN_PRICE, current + delta);
  return Math.min(MAX_PRICE, next);
}

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function WalletGlyph() {
  return (
    <View style={styles.wallet} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.walletBody}>
        <View style={styles.walletSlot} />
        <View style={styles.walletBill} />
      </View>
      <View style={styles.walletFlap} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.four,
  },
  hero: {
    marginTop: Spacing.five,
    alignItems: 'center',
  },
  iconWell: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Brand.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: Spacing.four,
    textAlign: 'center',
    fontFamily: Fonts.serif,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 600,
    color: Brand.ink,
  },
  subtitle: {
    marginTop: Spacing.two,
    maxWidth: 320,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 400,
    color: Brand.muted,
  },
  priceCard: {
    marginTop: Spacing.four,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingTop: 22,
    paddingBottom: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  priceAccent: {
    width: 42,
    height: 3,
    borderRadius: 2,
    backgroundColor: Brand.goldSoft,
    marginBottom: 16,
  },
  priceEyebrow: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
    fontWeight: 600,
    color: Brand.muted,
  },
  priceRow: {
    marginTop: 8,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  currency: {
    fontFamily: Fonts.serif,
    fontSize: 44,
    lineHeight: 52,
    fontWeight: 600,
    color: Brand.ink,
  },
  priceInput: {
    padding: 0,
    margin: 0,
    height: 60,
    fontFamily: Fonts.serif,
    fontSize: 52,
    lineHeight: 60,
    fontWeight: 600,
    color: Brand.ink,
    textAlign: 'left',
    outlineWidth: 0,
  },
  controls: {
    marginTop: Spacing.three,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  stepper: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: Brand.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperLabel: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: 500,
    color: Brand.muted,
  },
  preset: {
    minWidth: 64,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetIdle: {
    backgroundColor: Brand.pill,
  },
  presetSelected: {
    backgroundColor: Brand.gold,
  },
  presetLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 600,
    color: Brand.muted,
  },
  presetLabelSelected: {
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.88,
  },
  currencyHint: {
    marginTop: Spacing.three,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 400,
    color: Brand.muted,
  },
  note: {
    marginTop: Spacing.three,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingRight: 18,
    paddingLeft: 18,
    flexDirection: 'row',
    gap: 12,
  },
  noteBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: Brand.leaf,
    marginVertical: 2,
  },
  noteCopy: {
    flex: 1,
    gap: 6,
  },
  noteTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 700,
    color: Brand.ink,
  },
  noteBody: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 400,
    color: Brand.muted,
  },
  wallet: {
    width: 22,
    height: 16,
  },
  walletBody: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 13,
    borderRadius: 4,
    borderWidth: 1.6,
    borderColor: Brand.gold,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingLeft: 5,
  },
  walletSlot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.4,
    borderColor: Brand.gold,
  },
  walletBill: {
    position: 'absolute',
    right: 3,
    top: 3,
    width: 8,
    height: 6,
    borderRadius: 1,
    backgroundColor: Brand.goldSoft,
  },
  walletFlap: {
    position: 'absolute',
    top: 0,
    left: 3,
    right: 3,
    height: 4,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderWidth: 1.6,
    borderBottomWidth: 0,
    borderColor: Brand.gold,
  },
});
