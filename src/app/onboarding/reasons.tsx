import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { OnboardingCta } from '@/components/onboarding-cta';
import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { SproutIcon } from '@/components/sprout-icon';
import { Brand, Fonts, Spacing } from '@/constants/theme';
import { loadOnboardingSettings, saveOnboardingReasons } from '@/lib/onboarding';
import { useSettingsEditor } from '@/lib/settings-editor';

const REASONS = [
  { id: 'health', label: 'Health', icon: 'health' },
  { id: 'family', label: 'Family', icon: 'family' },
  { id: 'freedom', label: 'Freedom', icon: 'freedom' },
  { id: 'money', label: 'Saving money', icon: 'money' },
  { id: 'fitness', label: 'Fitness', icon: 'fitness' },
  { id: 'peace', label: 'Mental peace', icon: 'peace' },
  { id: 'skin', label: 'Clear skin & breath', icon: 'skin' },
] as const;

type ReasonIcon = (typeof REASONS)[number]['icon'];

export default function ReasonsScreen() {
  const { isEditing, ctaLabel, finish } = useSettingsEditor();
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    let cancelled = false;

    loadOnboardingSettings().then((saved) => {
      if (cancelled || !saved.reasons) {
        return;
      }

      setSelected(saved.reasons.selected);
      setNote(saved.reasons.note);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  return (
    <OnboardingScreen
      footer={
        <OnboardingCta
          label={ctaLabel}
          onPress={() => {
            void saveOnboardingReasons({
              selected,
              note: note.trim(),
            });
            finish('/onboarding/attempt');
          }}
        />
      }>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <OnboardingHeader step={7} editing={isEditing} />

        <Text style={styles.title}>What are you quitting for?</Text>
        <Text style={styles.subtitle}>Choose what matters most to your journey.</Text>

        <View style={styles.chips}>
          {REASONS.map((reason) => {
            const isSelected = selected.includes(reason.id);

            return (
              <Pressable
                key={reason.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={reason.label}
                onPress={() => toggle(reason.id)}
                style={({ pressed }) => [
                  styles.chip,
                  isSelected ? styles.chipSelected : styles.chipIdle,
                  pressed && styles.pressed,
                ]}>
                <ReasonGlyph name={reason.icon} />
                <Text style={styles.chipLabel}>{reason.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.noteLabel}>Personal note (optional)</Text>
        <View style={styles.noteField}>
          <TextInput
            accessibilityLabel="Personal reason"
            value={note}
            onChangeText={setNote}
            placeholder="My reason..."
            placeholderTextColor={Brand.muted}
            maxLength={140}
            cursorColor={Brand.gold}
            selectionColor={Brand.gold}
            underlineColorAndroid="transparent"
            style={styles.noteInput}
          />
          <View style={styles.feather} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={styles.featherNib} />
            <View style={styles.featherShaft} />
          </View>
        </View>
        <Text style={styles.noteHint}>A private sentence kept safe in your daily journal companion.</Text>

        <View style={styles.insight}>
          <View style={styles.insightIcon}>
            <SproutIcon />
          </View>
          <Text style={styles.insightBody}>
            Holding clear reasons in mind reduces relapse risk by up to 64% during sudden triggers.
          </Text>
        </View>
      </ScrollView>
    </OnboardingScreen>
  );
}

function ReasonGlyph({ name }: { name: ReasonIcon }) {
  if (name === 'health') {
    return (
      <View style={styles.heart}>
        <View style={[styles.heartLobe, styles.heartLeft]} />
        <View style={[styles.heartLobe, styles.heartRight]} />
        <View style={styles.heartPoint} />
      </View>
    );
  }

  if (name === 'family') {
    return (
      <View style={styles.family}>
        <View style={styles.person}>
          <View style={styles.personHead} />
          <View style={styles.personBody} />
        </View>
        <View style={styles.person}>
          <View style={styles.personHead} />
          <View style={styles.personBody} />
        </View>
      </View>
    );
  }

  if (name === 'freedom') {
    return (
      <View style={styles.plane}>
        <View style={styles.planeWing} />
        <View style={styles.planeFuselage} />
      </View>
    );
  }

  if (name === 'money') {
    return (
      <View style={styles.coin}>
        <View style={styles.coinInner} />
      </View>
    );
  }

  if (name === 'fitness') {
    return (
      <View style={styles.runner}>
        <View style={styles.runnerHead} />
        <View style={styles.runnerTorso} />
        <View style={styles.runnerLeg} />
      </View>
    );
  }

  if (name === 'peace') {
    return (
      <View style={styles.sitter}>
        <View style={styles.sitterHead} />
        <View style={styles.sitterBody} />
      </View>
    );
  }

  return (
    <View style={styles.sun}>
      <View style={styles.sunRayVertical} />
      <View style={styles.sunRayHorizontal} />
      <View style={styles.sunCore} />
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
  pressed: {
    opacity: 0.88,
  },
  noteLabel: {
    marginTop: Spacing.four,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    color: Brand.muted,
  },
  noteField: {
    marginTop: Spacing.two,
    minHeight: 56,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noteInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: Brand.ink,
    outlineWidth: 0,
  },
  noteHint: {
    marginTop: Spacing.two,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 400,
    color: Brand.muted,
  },
  insight: {
    marginTop: Spacing.four,
    borderRadius: 22,
    backgroundColor: Brand.pill,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Brand.sageSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightBody: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
    color: Brand.muted,
  },
  heart: {
    width: 16,
    height: 14,
  },
  heartLobe: {
    position: 'absolute',
    top: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Brand.ink,
  },
  heartLeft: {
    left: 0,
  },
  heartRight: {
    right: 0,
  },
  heartPoint: {
    position: 'absolute',
    top: 3,
    left: 2,
    width: 12,
    height: 12,
    backgroundColor: Brand.ink,
    transform: [{ rotate: '45deg' }],
  },
  family: {
    width: 18,
    height: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  person: {
    alignItems: 'center',
    gap: 1,
  },
  personHead: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Brand.ink,
  },
  personBody: {
    width: 8,
    height: 7,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: Brand.ink,
  },
  plane: {
    width: 16,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planeWing: {
    width: 14,
    height: 8,
    borderLeftWidth: 14,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderLeftColor: Brand.ink,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  planeFuselage: {
    position: 'absolute',
    width: 10,
    height: 2,
    backgroundColor: Brand.ink,
    transform: [{ rotate: '-20deg' }],
  },
  coin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.6,
    borderColor: Brand.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinInner: {
    width: 4,
    height: 8,
    borderRadius: 1,
    borderWidth: 1.4,
    borderColor: Brand.ink,
  },
  runner: {
    width: 12,
    height: 16,
    alignItems: 'center',
  },
  runnerHead: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Brand.ink,
  },
  runnerTorso: {
    width: 2,
    height: 6,
    backgroundColor: Brand.ink,
  },
  runnerLeg: {
    width: 8,
    height: 2,
    backgroundColor: Brand.ink,
    transform: [{ rotate: '25deg' }],
  },
  sitter: {
    width: 14,
    height: 14,
    alignItems: 'center',
  },
  sitterHead: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Brand.ink,
  },
  sitterBody: {
    marginTop: 1,
    width: 12,
    height: 6,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: Brand.ink,
  },
  sun: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Brand.ink,
  },
  sunRayVertical: {
    position: 'absolute',
    width: 2,
    height: 14,
    borderRadius: 1,
    backgroundColor: Brand.ink,
  },
  sunRayHorizontal: {
    position: 'absolute',
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: Brand.ink,
  },
  feather: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featherNib: {
    width: 8,
    height: 8,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: Brand.muted,
    transform: [{ rotate: '-45deg' }],
  },
  featherShaft: {
    position: 'absolute',
    width: 1.5,
    height: 12,
    backgroundColor: Brand.muted,
    transform: [{ rotate: '35deg' }],
  },
});
