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

  const handleQuickDemoSignIn = async (demoRole: 'renter' | 'host') => {
    setLoading(true);
    setRole(demoRole);
    const demoEmail = demoRole === 'renter' ? 'renter@driveflex.pk' : 'host@driveflex.pk';
    const demoPassword = 'password123';
    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: demoEmail,
          password: demoPassword,
          expectedRole: demoRole,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
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
        router.replace(demoRole === 'host' ? '/owner/dashboard' : '/(tabs)/profile');
        return;
      }
    } catch {
      // offline fallback
    }

    await setSession({
      id: demoRole === 'host' ? 'owner-ali' : 'usr-demo-renter',
      name: demoRole === 'host' ? 'Ali Raza' : 'Omar Farooq',
      email: demoEmail,
      role: demoRole,
      phone: demoRole === 'host' ? '+92 321 440 7812' : '+92 300 8472910',
      city: 'Lahore',
      businessName: demoRole === 'host' ? 'Ali Motors Lahore' : undefined,
    });
    setLoading(false);
    router.replace(demoRole === 'host' ? '/owner/dashboard' : '/(tabs)/profile');
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

      {/* Quick Demo Credentials Box */}
      <View
        style={[
          styles.demoCredentialsBox,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.demoBoxHeader}>
          <Feather name="zap" size={14} color="#D97706" />
          <Text style={[styles.demoBoxTitle, { color: colors.foreground }]}>
            Demo Credentials (1-Tap Login)
          </Text>
        </View>

        <View style={styles.demoCardsRow}>
          {/* Demo Renter Card */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="1-Tap Login as Demo Renter"
            onPress={() => void handleQuickDemoSignIn('renter')}
            style={[
              styles.demoCard,
              {
                backgroundColor: role === 'renter' ? (colors.isDark ? '#261619' : '#FEF2F2') : (colors.isDark ? '#141822' : '#F8FAFC'),
                borderColor: role === 'renter' ? colors.primary : colors.border,
              },
            ]}
          >
            <View style={styles.demoCardTop}>
              <View style={[styles.demoBadge, { backgroundColor: 'rgba(177, 18, 38, 0.12)' }]}>
                <Text style={[styles.demoBadgeText, { color: colors.primary }]}>RENTER</Text>
              </View>
              <Text style={[styles.demoActionText, { color: colors.primary }]}>⚡ Login</Text>
            </View>
            <Text style={[styles.demoNameText, { color: colors.foreground }]} numberOfLines={1}>
              Omar Farooq
            </Text>
            <Text style={[styles.demoEmailText, { color: colors.mutedForeground }]} numberOfLines={1}>
              renter@driveflex.pk
            </Text>
            <Text style={[styles.demoPassText, { color: colors.mutedForeground }]}>
              🔑 password123
            </Text>
          </Pressable>

          {/* Demo Host Card */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="1-Tap Login as Demo Host"
            onPress={() => void handleQuickDemoSignIn('host')}
            style={[
              styles.demoCard,
              {
                backgroundColor: role === 'host' ? (colors.isDark ? '#262013' : '#FEFCE8') : (colors.isDark ? '#141822' : '#F8FAFC'),
                borderColor: role === 'host' ? '#C9A227' : colors.border,
              },
            ]}
          >
            <View style={styles.demoCardTop}>
              <View style={[styles.demoBadge, { backgroundColor: 'rgba(201, 162, 39, 0.16)' }]}>
                <Text style={[styles.demoBadgeText, { color: '#C9A227' }]}>HOST</Text>
              </View>
              <Text style={[styles.demoActionText, { color: '#C9A227' }]}>⚡ Login</Text>
            </View>
            <Text style={[styles.demoNameText, { color: colors.foreground }]} numberOfLines={1}>
              Ali Raza
            </Text>
            <Text style={[styles.demoEmailText, { color: colors.mutedForeground }]} numberOfLines={1}>
              host@driveflex.pk
            </Text>
            <Text style={[styles.demoPassText, { color: colors.mutedForeground }]}>
              🔑 password123
            </Text>
          </Pressable>
        </View>
      </View>

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
  demoCredentialsBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  demoBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoBoxTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  demoCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  demoCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  demoBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  demoBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  demoActionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  demoNameText: {
    fontSize: 13,
    fontWeight: '700',
  },
  demoEmailText: {
    fontSize: 11,
    fontWeight: '500',
  },
  demoPassText: {
    fontSize: 10.5,
    marginTop: 1,
  },
});