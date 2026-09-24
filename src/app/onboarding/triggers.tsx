import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { OnboardingCta } from '@/components/onboarding-cta';
import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { SproutIcon } from '@/components/sprout-icon';
import { Brand, Fonts, Spacing } from '@/constants/theme';
import { loadOnboardingSettings, saveOnboardingTriggers } from '@/lib/onboarding';
import { useSettingsEditor } from '@/lib/settings-editor';

const PRESETS = [
  { id: 'stress', label: 'Stress' },
  { id: 'after-meals', label: 'After meals' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'social', label: 'Social situations' },
  { id: 'alcohol', label: 'Alcohol' },
  { id: 'driving', label: 'Driving' },
  { id: 'work-breaks', label: 'Work breaks' },
] as const;

export default function TriggersScreen() {
  const { isEditing, ctaLabel, finish } = useSettingsEditor();
  const [selected, setSelected] = useState<string[]>([]);
  const [customLabels, setCustomLabels] = useState<string[]>([]);
  const [addingCustom, setAddingCustom] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    let cancelled = false;

    loadOnboardingSettings().then((saved) => {
      if (cancelled || !saved.triggers) {
        return;
      }

      const labels = saved.triggers.selected
        .filter((id) => id.startsWith('custom:'))
        .map((id) => id.slice('custom:'.length));

      setSelected(saved.triggers.unsure ? [] : saved.triggers.selected);
      setCustomLabels(labels);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const chips = useMemo(
    () => [
      ...PRESETS.map((preset) => ({ id: preset.id, label: preset.label })),
      ...customLabels.map((label) => ({ id: customId(label), label })),
    ],
    [customLabels],
  );

  function persist(unsure: boolean) {
    void saveOnboardingTriggers({
      selected: unsure ? [] : selected,
      unsure,
    });
    finish('/onboarding/pack-size');
  }

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  function addCustom() {
    const label = draft.trim();
    if (!label) {
      return;
    }

    const existing = chips.find((chip) => chip.label.toLowerCase() === label.toLowerCase());
    if (existing) {
      setSelected((current) => (current.includes(existing.id) ? current : [...current, existing.id]));
    } else {
      const id = customId(label);
      setCustomLabels((current) => [...current, label]);
      setSelected((current) => [...current, id]);
    }

    setDraft('');
    setAddingCustom(false);
  }

  return (
    <OnboardingScreen
      footer={
        <View style={styles.footer}>
          <OnboardingCta
            label={ctaLabel}
            onPress={() => {
              persist(false);
            }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="I am not sure yet"
            onPress={() => persist(true)}
            style={({ pressed }) => [styles.skip, pressed && styles.pressed]}>
            <Text style={styles.skipLabel}>I am not sure yet</Text>
          </Pressable>
        </View>
      }>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <OnboardingHeader step={5} editing={isEditing} />

        <View style={styles.observation}>
          <View style={styles.observationIcon}>
            <SproutIcon />
          </View>
          <View style={styles.observationCopy}>
            <Text style={styles.observationTitle}>Gentle observation</Text>
            <Text style={styles.observationBody}>
              Noticing your surroundings without judgment is the foundation of mindful rewiring.
            </Text>
          </View>
        </View>

        <Text style={styles.title}>When are you most likely to smoke?</Text>
        <Text style={styles.subtitle}>
          Choose all that apply. We will use these insights to tailor quiet rescue exercises.
        </Text>

        <View style={styles.chips}>
          {chips.map((chip) => {
            const isSelected = selected.includes(chip.id);

            return (
              <Pressable
                key={chip.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={chip.label}
                onPress={() => toggle(chip.id)}
                style={({ pressed }) => [
                  styles.chip,
                  isSelected ? styles.chipSelected : styles.chipIdle,
                  pressed && styles.pressed,
                ]}>
                {isSelected ? <CheckGlyph /> : <Text style={styles.plus}>+</Text>}
                <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>{chip.label}</Text>
              </Pressable>
            );
          })}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add another trigger"
            onPress={() => setAddingCustom(true)}
            style={({ pressed }) => [styles.chip, styles.chipIdle, pressed && styles.pressed]}>
            <Text style={styles.plus}>+</Text>
            <Text style={styles.chipLabel}>Other</Text>
          </Pressable>
        </View>

        {addingCustom ? (
          <View style={styles.customCard}>
            <TextInput
              accessibilityLabel="Your own trigger"
              autoFocus
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={addCustom}
              placeholder="Type your own trigger"
              placeholderTextColor={Brand.muted}
              returnKeyType="done"
              maxLength={32}
              cursorColor={Brand.gold}
              selectionColor={Brand.gold}
              underlineColorAndroid="transparent"
              style={styles.customInput}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add trigger"
              disabled={!draft.trim()}
              onPress={addCustom}
              style={({ pressed }) => [
                styles.addButton,
                !draft.trim() && styles.addButtonDisabled,
                pressed && draft.trim() && styles.pressed,
              ]}>
              <Text style={styles.addLabel}>Add</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.summary}>
          <View style={styles.summaryIcon}>
            <QuestionGlyph />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>{selectedCountLabel(selected.length)}</Text>
            <Text style={styles.summaryBody}>Patterns become clearer once named.</Text>
          </View>
          <SparkleGlyph />
        </View>
      </ScrollView>
    </OnboardingScreen>
  );
}

function customId(label: string): string {
  return `custom:${label.trim().toLowerCase()}`;
}

function selectedCountLabel(count: number): string {
  if (count === 1) {
    return '1 trigger selected';
  }

  return `${count} triggers selected`;
}

function CheckGlyph() {
  return (
    <View style={styles.checkWell}>
      <View style={styles.check} />
    </View>
  );
}

function QuestionGlyph() {
  return <Text style={styles.questionMark}>?</Text>;
}

function SparkleGlyph() {
  return (
    <View style={styles.sparkle} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.sparkleRayVertical} />
      <View style={styles.sparkleRayHorizontal} />
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
  observation: {
    marginTop: Spacing.four,
    borderRadius: 22,
    backgroundColor: Brand.pill,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 12,
  },
  observationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Brand.sageSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  observationCopy: {
    flex: 1,
    gap: 4,
  },
  observationTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 700,
    color: Brand.ink,
  },
  observationBody: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
    color: Brand.muted,
  },
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
  chips: {
    marginTop: Spacing.four,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    minHeight: 48,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipIdle: {
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    backgroundColor: Brand.goldSelected,
  },
  chipLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 600,
    color: Brand.ink,
  },
  chipLabelSelected: {
    color: Brand.ink,
  },
  plus: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: 500,
    color: Brand.muted,
  },
  checkWell: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.6,
    borderColor: Brand.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 8,
    height: 5,
    marginTop: -1,
    borderBottomWidth: 1.6,
    borderLeftWidth: 1.6,
    borderColor: Brand.ink,
    transform: [{ rotate: '-45deg' }],
  },
  customCard: {
    marginTop: Spacing.three,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customInput: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    fontSize: 16,
    color: Brand.ink,
    outlineWidth: 0,
  },
  addButton: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.45,
  },
  addLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 600,
    color: '#FFFFFF',
  },
  summary: {
    marginTop: Spacing.four,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.6,
    borderColor: Brand.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionMark: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: 600,
    color: Brand.gold,
  },
  summaryCopy: {
    flex: 1,
    gap: 2,
  },
  summaryTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 700,
    color: Brand.ink,
  },
  summaryBody: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
    color: Brand.muted,
  },
  sparkle: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleRayVertical: {
    position: 'absolute',
    width: 2,
    height: 14,
    borderRadius: 1,
    backgroundColor: Brand.goldSoft,
  },
  sparkleRayHorizontal: {
    position: 'absolute',
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: Brand.goldSoft,
  },
  footer: {
    gap: Spacing.three,
  },
  skip: {
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 400,
    color: Brand.muted,
  },
  pressed: {
    opacity: 0.88,
  },
});
