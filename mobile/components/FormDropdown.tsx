import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

export interface DropdownOption<T = string | number> {
  label: string;
  value: T;
  icon?: keyof typeof Feather.glyphMap;
  subtitle?: string;
}

interface FormDropdownProps<T = string | number> {
  label: string;
  value: T;
  options: DropdownOption<T>[];
  onSelect: (value: T) => void;
  placeholder?: string;
  icon?: keyof typeof Feather.glyphMap;
  disabled?: boolean;
}

export function FormDropdown<T = string | number>({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select an option',
  icon,
  disabled = false,
}: FormDropdownProps<T>) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleOpen = () => {
    if (disabled) return;
    void Haptics.selectionAsync();
    setModalVisible(true);
  };

  const handleSelect = (optValue: T) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(optValue);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}</Text>
      ) : null}

      {/* Dropdown Trigger Box */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Select ${label}`}
        onPress={handleOpen}
        disabled={disabled}
        style={({ pressed }) => [
          styles.triggerBox,
          {
            backgroundColor: colors.background,
            borderColor: modalVisible ? colors.primary : colors.border,
          },
          pressed && { opacity: 0.88 },
          disabled && { opacity: 0.5 },
        ]}
      >
        <View style={styles.triggerLeftContent}>
          {icon ? (
            <Feather
              name={icon}
              size={16}
              color={selectedOption ? colors.primary : colors.mutedForeground}
              style={{ marginRight: 8 }}
            />
          ) : null}
          <Text
            numberOfLines={1}
            style={[
              styles.triggerText,
              {
                color: selectedOption ? colors.foreground : colors.mutedForeground,
                fontWeight: selectedOption ? '600' : '400',
              },
            ]}
          >
            {displayText}
          </Text>
        </View>

        <Feather
          name={modalVisible ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={modalVisible ? colors.primary : colors.mutedForeground}
        />
      </Pressable>

      {/* Elegant Picker Modal Sheet */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />

          <View
            style={[
              styles.sheetContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                paddingBottom: Math.max(insets.bottom, 16) + 12,
              },
            ]}
          >
            {/* Sheet Handle */}
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sheetEyebrow, { color: colors.primary }]}>
                  SELECT OPTION
                </Text>
                <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                  {label}
                </Text>
              </View>

              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={12}
                style={[
                  styles.closeCircleBtn,
                  { backgroundColor: colors.secondary, borderColor: colors.border },
                ]}
              >
                <Feather name="x" size={17} color={colors.foreground} />
              </Pressable>
            </View>

            {/* Options List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 360, marginTop: 4 }}
            >
              {options.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isLast = idx === options.length - 1;

                return (
                  <Pressable
                    key={String(opt.value)}
                    accessibilityRole="button"
                    accessibilityLabel={opt.label}
                    onPress={() => handleSelect(opt.value)}
                    style={({ pressed }) => [
                      styles.optionRow,
                      !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                      isSelected && {
                        backgroundColor: colors.isDark ? 'rgba(177, 18, 38, 0.12)' : '#FDF0F2',
                      },
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <View style={styles.optionLeft}>
                      {opt.icon ? (
                        <View
                          style={[
                            styles.optionIconCircle,
                            {
                              backgroundColor: isSelected
                                ? colors.primary
                                : colors.secondary,
                            },
                          ]}
                        >
                          <Feather
                            name={opt.icon}
                            size={14}
                            color={isSelected ? '#FFFFFF' : colors.foreground}
                          />
                        </View>
                      ) : null}

                      <View>
                        <Text
                          style={[
                            styles.optionLabel,
                            {
                              color: isSelected ? colors.primary : colors.foreground,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                        >
                          {opt.label}
                        </Text>
                        {opt.subtitle ? (
                          <Text
                            style={[
                              styles.optionSub,
                              { color: colors.mutedForeground },
                            ]}
                          >
                            {opt.subtitle}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    {isSelected ? (
                      <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                        <Feather name="check" size={13} color="#FFFFFF" />
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.emptyRadioCircle,
                          { borderColor: colors.border },
                        ]}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 7,
  },
  triggerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  triggerLeftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerText: {
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  sheetEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  optionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 14,
  },
  optionSub: {
    fontSize: 11,
    marginTop: 1,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRadioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
  },
});
