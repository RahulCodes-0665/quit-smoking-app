import { BottomSheetModal, BottomSheetView } from '@expo/ui/community/bottom-sheet';
import { type RefObject } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { SproutIcon } from '@/components/sprout-icon';
import { Brand, Fonts, Spacing } from '@/constants/theme';

type LogSlipSheetProps = {
  sheetRef: RefObject<BottomSheetModal | null>;
};

export function LogSlipSheet({ sheetRef }: LogSlipSheetProps) {
  const insets = useSafeAreaInsets();

  const dismiss = () => {
    sheetRef.current?.dismiss();
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={['50%']}
      enableDynamicSizing={false}
      enablePanDownToClose
      handleComponent={null}
      backgroundStyle={styles.sheet}>
      <BottomSheetView style={[styles.content, { paddingBottom: Math.max(insets.bottom, Spacing.three) }]}>
        <View style={styles.handle} />

        <View style={styles.hero}>
          <View style={styles.iconWell}>
            <ClockGlyph />
          </View>
          <Text style={styles.title}>Did you smoke?</Text>
          <Text style={styles.subtitle}>
            Logging it honestly helps you understand your{'\n'}journey.
          </Text>
        </View>

        <View style={styles.note}>
          <View style={styles.noteIcon}>
            <SproutIcon />
          </View>
          <Text style={styles.noteBody}>
            A slip does not erase your progress. Your smoke-free timer will restart now, while your
            previous progress stays part of your journey.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Yes, I smoked"
          onPress={dismiss}
          style={({ pressed }) => [styles.confirm, pressed && styles.pressed]}>
          <Text style={styles.confirmLabel}>Yes, I smoked</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          onPress={dismiss}
          style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}>
          <Text style={styles.cancelLabel}>Cancel</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

function ClockGlyph() {
  return (
    <Svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Circle cx={14} cy={14} r={10} fill="none" stroke={Brand.gold} strokeWidth={1.8} />
      <Circle cx={14} cy={4.8} r={0.9} fill={Brand.gold} />
      <Circle cx={14} cy={23.2} r={0.9} fill={Brand.gold} />
      <Circle cx={4.8} cy={14} r={0.9} fill={Brand.gold} />
      <Circle cx={23.2} cy={14} r={0.9} fill={Brand.gold} />
      <Path
        d="M14 9.2v5.1l3.6 2.1"
        fill="none"
        stroke={Brand.gold}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: Brand.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: Brand.goldSoft,
    marginBottom: Spacing.three,
  },
  hero: {
    alignItems: 'center',
  },
  iconWell: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Brand.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: Spacing.three,
    textAlign: 'center',
    fontFamily: Fonts.serif,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 600,
    color: Brand.ink,
  },
  subtitle: {
    marginTop: Spacing.two,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 400,
    color: Brand.muted,
  },
  note: {
    marginTop: Spacing.four,
    borderRadius: 22,
    backgroundColor: Brand.pill,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  noteIcon: {
    marginTop: 2,
  },
  noteBody: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 400,
    color: Brand.ink,
  },
  confirm: {
    marginTop: Spacing.four,
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: 600,
    color: '#FFFFFF',
  },
  cancel: {
    marginTop: Spacing.two,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 500,
    color: Brand.muted,
  },
  pressed: {
    opacity: 0.88,
  },
});
