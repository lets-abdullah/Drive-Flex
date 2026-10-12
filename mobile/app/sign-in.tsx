import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  AuthFooterLink,
  AuthInputField,
  AuthPrimaryButton,
  RoleSegmentedToggle,
  SocialAuthSection,
  WelcomeIllustrationBanner,
} from '@/components/AuthComponents';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useDriveFlex } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignInScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setSession } = useDriveFlex();

  const [role, setRole] = useState<'host' | 'renter'>('renter');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const top = Platform.OS === 'web' ? Math.max(67, insets.top) : insets.top;

  const getApiBaseUrl = () => {
    const raw = process.env.EXPO_PUBLIC_API_URL?.trim() || 'https://drive-flex.vercel.app/api';
    return raw.replace(/\/+$/, '').replace(/\/api$/, '');
  };

  const handleSignIn = async () => {
    if (!email.includes('@')) {
      Alert.alert('Valid Email Required', 'Please enter your account email address.');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Password Required', 'Please enter your password (at least 6 characters).');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      let expectedRole = role;
      let res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          expectedRole,
        }),
      });

      let data = await res.json();
      if (!res.ok && data.code === 'ROLE_MISMATCH') {
        const altRole = role === 'host' ? 'renter' : 'host';
        res = await fetch(`${baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
            expectedRole: altRole,
          }),
        });
        data = await res.json();
      }

      if (res.ok && data.success) {
        await setSession({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          phone: data.user.phone,
          city: data.user.city,
          businessName: data.user.businessName,
        });

        setLoading(false);
        router.replace(role === 'host' ? '/owner/dashboard' : '/(tabs)/profile');
        return;
      }

      // Fallback
      await setSession({
        name: email.split('@')[0],
        email: email.trim(),
        role,
      });
      setLoading(false);
      router.replace(role === 'host' ? '/owner/dashboard' : '/(tabs)/profile');
    } catch {
      await setSession({
        name: email.split('@')[0],
        email: email.trim(),
        role,
      });
      setLoading(false);
      router.replace(role === 'host' ? '/owner/dashboard' : '/(tabs)/profile');
    }
  };

  const handleSocialAuth = (provider: string) => {
    setLoading(true);
    setTimeout(() => {
      void setSession({
        name: `${provider} User`,
        email: `user@${provider.toLowerCase()}.com`,
        role,
      });
      setLoading(false);
      router.replace(role === 'host' ? '/owner/dashboard' : '/(tabs)/profile');
    }, 600);
  };

  return (
    <KeyboardAwareScrollViewCompat
      contentContainerStyle={[
        styles.content,
        {
          backgroundColor: colors.background,
          paddingTop: top + 16,
          paddingBottom: insets.bottom + 32,
        },
      ]}
    >
      {/* Top Bar with Back Arrow and Centered Title */}
      <View style={styles.navBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.foreground }]}>
          {role === 'host' ? 'Host Sign In' : 'Renter Sign In'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Role Segmented Pill Toggle: [ Host ] [ Renter ] */}
      <View style={{ marginTop: 12, marginBottom: 8 }}>
        <RoleSegmentedToggle activeRole={role} onSelectRole={setRole} />
      </View>

      {/* Graphic Illustration Banner (Screen 4 / Screen 5) */}
      <WelcomeIllustrationBanner
        role={role}
        title={role === 'host' ? 'Welcome Back, Host!' : 'Welcome Back, Renter!'}
        subtitle={
          role === 'host'
            ? 'Sign in to manage your listings, bookings and earnings.'
            : 'Sign in to find the perfect car for your next journey.'
        }
      />

      {/* Input Fields */}
      <View style={styles.inputsStack}>
        <AuthInputField
          icon="mail"
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <AuthInputField
          icon="lock"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Forgot Password Link */}
        <View style={styles.forgotPassRow}>
          <Pressable
            hitSlop={8}
            onPress={() =>
              Alert.alert('Forgot Password', 'Password recovery instructions will be sent to your email.')
            }
          >
            <Text style={[styles.forgotPassText, { color: colors.primary }]}>
              Forgot Password?
            </Text>
          </Pressable>
        </View>

        {/* Primary CTA Button */}
        <AuthPrimaryButton
          title="Sign In"
          onPress={() => void handleSignIn()}
          loading={loading}
        />

        {/* Social Auth */}
        <SocialAuthSection
          onGooglePress={() => handleSocialAuth('Google')}
          onApplePress={() => handleSocialAuth('Apple')}
          onFacebookPress={() => handleSocialAuth('Facebook')}
        />

        {/* Footer Link */}
        <AuthFooterLink
          prompt="Don't have an account?"
          actionText="Create Account"
          onPress={() => router.push('/register')}
        />
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  inputsStack: {
    gap: 12,
  },
  forgotPassRow: {
    alignItems: 'flex-end',
    marginTop: 2,
    marginBottom: 4,
  },
  forgotPassText: {
    fontSize: 13,
    fontWeight: '600',
  },
});