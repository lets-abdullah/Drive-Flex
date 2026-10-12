import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';
import { useColors } from '@/hooks/useColors';

/**
 * Segmented Pill Toggle: [ Host ] [ Renter ]
 * Matches Screen 2 & 3 in the reference mockup
 */
export function RoleSegmentedToggle({
  activeRole,
  onSelectRole,
}: {
  activeRole: 'host' | 'renter';
  onSelectRole: (role: 'host' | 'renter') => void;
}) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.segmentedContainer,
        {
          backgroundColor: colors.isDark ? '#1C1C1C' : '#EEF1F5',
          borderColor: colors.border,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Select Host role"
        onPress={() => onSelectRole('host')}
        style={[
          styles.segmentedTab,
          activeRole === 'host' && {
            backgroundColor: colors.primary,
          },
        ]}
      >
        <Text
          style={[
            styles.segmentedTabText,
            {
              color: activeRole === 'host' ? '#FFFFFF' : colors.mutedForeground,
              fontWeight: activeRole === 'host' ? '700' : '500',
            },
          ]}
        >
          Host
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Select Renter role"
        onPress={() => onSelectRole('renter')}
        style={[
          styles.segmentedTab,
          activeRole === 'renter' && {
            backgroundColor: colors.primary,
          },
        ]}
      >
        <Text
          style={[
            styles.segmentedTabText,
            {
              color: activeRole === 'renter' ? '#FFFFFF' : colors.mutedForeground,
              fontWeight: activeRole === 'renter' ? '700' : '500',
            },
          ]}
        >
          Renter
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * Screen 1: Role Card Option (Host vs Renter) with Radio Button
 */
export function RoleChoiceCard({
  role,
  title,
  description,
  iconName,
  isSelected,
  onSelect,
}: {
  role: 'host' | 'renter';
  title: string;
  description: string;
  iconName: 'truck' | 'user' | 'key' | 'navigation';
  isSelected: boolean;
  onSelect: () => void;
}) {
  const colors = useColors();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`Select ${title} role`}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.roleCard,
        {
          backgroundColor: colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
          borderWidth: isSelected ? 2 : 1,
        },
        isSelected && {
          backgroundColor: colors.isDark ? '#1A1113' : '#FFF9FA',
        },
        pressed && { opacity: 0.95 },
      ]}
    >
      {/* Left Icon Pill */}
      <View
        style={[
          styles.roleIconWrap,
          {
            backgroundColor: isSelected
              ? 'rgba(177, 18, 38, 0.12)'
              : colors.isDark
              ? '#222222'
              : '#F1F4F8',
          },
        ]}
      >
        <Feather
          name={iconName}
          size={22}
          color={isSelected ? colors.primary : colors.mutedForeground}
        />
      </View>

      {/* Center Details */}
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={[styles.roleCardTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.roleCardDesc, { color: colors.mutedForeground }]}>
          {description}
        </Text>
      </View>

      {/* Right Radio Indicator */}
      <View
        style={[
          styles.radioCircle,
          {
            borderColor: isSelected ? colors.primary : colors.mutedForeground,
          },
        ]}
      >
        {isSelected && (
          <View
            style={[
              styles.radioDot,
              {
                backgroundColor: colors.primary,
              },
            ]}
          />
        )}
      </View>
    </Pressable>
  );
}

/**
 * Screen 4 & 5: Graphic Illustration Banner for Host/Renter Sign In
 */
export function WelcomeIllustrationBanner({
  role,
  title,
  subtitle,
}: {
  role: 'host' | 'renter';
  title: string;
  subtitle: string;
}) {
  const colors = useColors();

  return (
    <View style={styles.bannerContainer}>
      {/* Decorative Vehicle + Badge Art */}
      <View style={styles.artFrame}>
        <View
          style={[
            styles.artCircleBackdrop,
            {
              backgroundColor: colors.isDark ? '#1C1618' : '#FBF2F4',
              borderColor: 'rgba(177, 18, 38, 0.15)',
            },
          ]}
        >
          <Ionicons
            name="car-sport"
            size={48}
            color={colors.primary}
            style={{ marginRight: 6 }}
          />

          {/* Floating Badge (Host: Key/Shield, Renter: User/Badge) */}
          <View
            style={[
              styles.artBadge,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            {role === 'host' ? (
              <Feather name="shield" size={16} color={colors.star} />
            ) : (
              <Feather name="user-check" size={16} color={colors.primary} />
            )}
          </View>
        </View>
      </View>

      {/* Headings */}
      <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.welcomeSubtitle, { color: colors.mutedForeground }]}>
        {subtitle}
      </Text>
    </View>
  );
}

/**
 * Input field with left icon and optional password toggle
 * Matches mockup design in Light and Dark modes
 */
export function AuthInputField({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'sentences',
}: {
  icon: keyof typeof Feather.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  const colors = useColors();
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  return (
    <View
      style={[
        styles.inputContainer,
        {
          backgroundColor: colors.isDark ? '#161616' : '#FFFFFF',
          borderColor: colors.border,
        },
      ]}
    >
      {/* Left Icon */}
      <View style={styles.inputLeftIcon}>
        <Feather name={icon} size={18} color={colors.mutedForeground} />
      </View>

      {/* Input */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry && !showPassword}
        style={[styles.inputField, { color: colors.foreground }]}
      />

      {/* Right Eye Toggle for password fields */}
      {secureTextEntry && (
        <Pressable
          hitSlop={12}
          onPress={() => setShowPassword((prev) => !prev)}
          style={styles.eyeToggle}
          accessibilityRole="button"
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
        >
          <Feather
            name={showPassword ? 'eye-off' : 'eye'}
            size={18}
            color={colors.mutedForeground}
          />
        </Pressable>
      )}
    </View>
  );
}

/**
 * Checkbox for Terms of Service and Privacy Policy
 */
export function TermsCheckbox({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  const colors = useColors();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel="Agree to terms of service and privacy policy"
      onPress={onToggle}
      style={styles.termsRow}
    >
      <View
        style={[
          styles.checkboxBox,
          {
            backgroundColor: checked ? colors.primary : colors.card,
            borderColor: checked ? colors.primary : colors.border,
          },
        ]}
      >
        {checked && <Feather name="check" size={13} color="#FFFFFF" />}
      </View>
      <Text style={[styles.termsText, { color: colors.mutedForeground }]}>
        I agree to the{' '}
        <Text style={{ color: colors.primary, fontWeight: '600' }}>Terms of Service</Text> and{' '}
        <Text style={{ color: colors.primary, fontWeight: '600' }}>Privacy Policy</Text>
      </Text>
    </Pressable>
  );
}

/**
 * Large Primary Action Button: "Continue", "Create Account", "Sign In"
 */
export function AuthPrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const colors = useColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        {
          backgroundColor: colors.primary,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.primaryButtonText}>{title}</Text>
      )}
    </Pressable>
  );
}

/**
 * Social Auth Section: "or" divider + Google, Apple, Facebook buttons
 */
export function SocialAuthSection({
  onGooglePress,
  onApplePress,
  onFacebookPress,
}: {
  onGooglePress?: () => void;
  onApplePress?: () => void;
  onFacebookPress?: () => void;
}) {
  const colors = useColors();

  return (
    <View style={styles.socialContainer}>
      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>or</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      {/* 3 Social Buttons */}
      <View style={styles.socialButtonsRow}>
        {/* Google */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign in with Google"
          onPress={onGooglePress}
          style={[
            styles.socialBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <FontAwesome name="google" size={19} color="#EA4335" />
        </Pressable>

        {/* Apple */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign in with Apple"
          onPress={onApplePress}
          style={[
            styles.socialBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <FontAwesome
            name="apple"
            size={20}
            color={colors.isDark ? '#FFFFFF' : '#000000'}
          />
        </Pressable>

        {/* Facebook */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign in with Facebook"
          onPress={onFacebookPress}
          style={[
            styles.socialBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <FontAwesome name="facebook-f" size={18} color="#1877F2" />
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Footer link at the bottom: e.g. "Already have an account? Sign In"
 */
export function AuthFooterLink({
  prompt,
  actionText,
  onPress,
}: {
  prompt: string;
  actionText: string;
  onPress: () => void;
}) {
  const colors = useColors();

  return (
    <View style={styles.footerLinkRow}>
      <Text style={[styles.footerPromptText, { color: colors.mutedForeground }]}>
        {prompt}{' '}
      </Text>
      <Pressable hitSlop={8} onPress={onPress}>
        <Text style={[styles.footerActionText, { color: colors.primary }]}>
          {actionText}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  /* Segmented Toggle */
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  segmentedTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedTabText: {
    fontSize: 14,
    letterSpacing: 0.2,
  },

  /* Role Choice Card */
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    gap: 14,
  },
  roleIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  roleCardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  /* Welcome Banner */
  bannerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  artFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  artCircleBackdrop: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  artBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
  },

  /* Input Field */
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  inputLeftIcon: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },
  eyeToggle: {
    padding: 4,
  },

  /* Checkbox */
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },

  /* Primary Button */
  primaryButton: {
    borderRadius: 22,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#B11226',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* Social Auth */
  socialContainer: {
    gap: 16,
    marginTop: 6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'lowercase',
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  /* Footer Link */
  footerLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  footerPromptText: {
    fontSize: 13,
    fontWeight: '500',
  },
  footerActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
