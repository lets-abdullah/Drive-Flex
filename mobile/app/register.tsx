import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
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
  RoleChoiceCard,
  RoleSegmentedToggle,
  TermsCheckbox,
} from '@/components/AuthComponents';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useDriveFlex } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setSession } = useDriveFlex();
  const params = useLocalSearchParams<{ role?: string }>();

  // If role param was provided (e.g. /register?role=host), start directly on form step with that role
  const isTargetHost = params.role === 'host';
  const [step, setStep] = useState<'choose-role' | 'form'>(params.role ? 'form' : 'choose-role');
  const [role, setRole] = useState<'host' | 'renter'>(isTargetHost ? 'host' : 'renter');

  useEffect(() => {
    if (params.role === 'host') {
      setRole('host');
      setStep('form');
    }
  }, [params.role]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [loading, setLoading] = useState(false);

  const top = Platform.OS === 'web' ? Math.max(67, insets.top) : insets.top;

  const notifyUser = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const getApiBaseUrl = () => {
    const raw = process.env.EXPO_PUBLIC_API_URL?.trim() || 'https://drive-flex.vercel.app/api';
    return raw.replace(/\/+$/, '').replace(/\/api$/, '');
  };

  const createAccount = async () => {
    if (name.trim().length < 2) {
      notifyUser('Full Name Required', 'Please enter your full name.');
      return;
    }
    if (!email.includes('@')) {
      notifyUser('Valid Email Required', 'Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      notifyUser('Password Required', 'Password must be at least 6 characters.');
      return;
    }
    if (!termsAccepted) {
      notifyUser('Terms Required', 'Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          role,
          city: 'Lahore',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await setSession({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          phone: data.user.phone,
          city: data.user.city,
        });

        setLoading(false);
        router.replace('/(tabs)/profile');
        return;
      }

      // Offline fallback
      await setSession({
        name: name.trim(),
        email: email.trim(),
        role,
        phone: phone.trim(),
      });
      setLoading(false);
      router.replace('/(tabs)/profile');
    } catch {
      await setSession({
        name: name.trim(),
        email: email.trim(),
        role,
        phone: phone.trim(),
      });
      setLoading(false);
      router.replace('/(tabs)/profile');
    }
  };

  const handleQuickDemo = async (targetRole: 'renter' | 'host') => {
    setLoading(true);
    const demoUser =
      targetRole === 'host'
        ? {
            id: 'owner-ali',
            name: 'Ali Raza',
            email: 'host@driveflex.pk',
            role: 'host' as const,
            phone: '+92 321 440 7812',
            city: 'Lahore',
            businessName: 'Ali Motors Lahore',
            ownerId: 'owner-ali',
          }
        : {
            id: 'usr-demo-renter',
            name: 'Omar Farooq',
            email: 'renter@driveflex.pk',
            role: 'renter' as const,
            phone: '+92 300 8472910',
            city: 'Lahore',
          };
    await setSession(demoUser);
    setLoading(false);
    router.replace('/(tabs)/profile');
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
      {/* Top Bar with Back Arrow and Title */}
      <View style={styles.navBar}>
        <Pressable
          onPress={() => {
            if (step === 'form') {
              setStep('choose-role');
            } else {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)');
              }
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.foreground }]}>Create Account</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Demo Credentials Quick Access */}
      <View
        style={[
          styles.demoBox,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.demoBoxTitle, { color: colors.foreground }]}>
          ⚡ Instant Demo Credentials
        </Text>
        <Text style={[styles.demoBoxSub, { color: colors.mutedForeground }]}>
          Skip typing and login instantly with 1 tap:
        </Text>
        <View style={styles.demoBoxButtonsRow}>
          <Pressable
            onPress={() => void handleQuickDemo('renter')}
            style={[styles.demoBoxBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.demoBoxBtnText}>Demo Renter (renter@driveflex.pk)</Text>
          </Pressable>
          <Pressable
            onPress={() => void handleQuickDemo('host')}
            style={[styles.demoBoxBtn, { backgroundColor: '#C9A227' }]}
          >
            <Text style={styles.demoBoxBtnText}>Demo Host (host@driveflex.pk)</Text>
          </Pressable>
        </View>
      </View>

      {/* ──────────────────────────────────────────────────
          STEP 1: CHOOSE YOUR ROLE (Screen 1 from design)
          ────────────────────────────────────────────────── */}
      {step === 'choose-role' ? (
        <View style={{ marginTop: 12 }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={[styles.screenHeading, { color: colors.foreground }]}>
              Choose Your Role
            </Text>
            <Text style={[styles.screenSub, { color: colors.mutedForeground }]}>
              Select how you want to use our platform
            </Text>
          </View>

          {/* Role Choice Cards */}
          <View style={{ gap: 14 }}>
            <RoleChoiceCard
              role="host"
              title="Host"
              description="List your car, earn money and reach more renters."
              iconName="truck"
              isSelected={role === 'host'}
              onSelect={() => setRole('host')}
            />

            <RoleChoiceCard
              role="renter"
              title="Renter"
              description="Find the perfect car, book and hit the road."
              iconName="user"
              isSelected={role === 'renter'}
              onSelect={() => setRole('renter')}
            />
          </View>

          <View style={{ marginTop: 28 }}>
            <AuthPrimaryButton
              title="Continue"
              onPress={() => setStep('form')}
            />

            <AuthFooterLink
              prompt="Already have an account?"
              actionText="Sign In"
              onPress={() => router.push('/sign-in')}
            />
          </View>
        </View>
      ) : (
        /* ──────────────────────────────────────────────────
           STEP 2: CREATE ACCOUNT FORM (Screen 2 from design)
           ────────────────────────────────────────────────── */
        <View style={{ marginTop: 10 }}>
          {/* Segmented Pill Toggle: [ Host ] [ Renter ] */}
          <RoleSegmentedToggle activeRole={role} onSelectRole={setRole} />

          {/* Section: Personal Information */}
          <View style={styles.sectionHeaderWrap}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              Personal Information
            </Text>
          </View>

          <View style={styles.inputsStack}>
            <AuthInputField
              icon="user"
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />

            <AuthInputField
              icon="mail"
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <AuthInputField
              icon="phone"
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            {/* Section: Password */}
            <View style={[styles.sectionHeaderWrap, { marginTop: 6 }]}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                Password
              </Text>
            </View>

            <AuthInputField
              icon="lock"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Checkbox: Terms & Privacy */}
            <TermsCheckbox
              checked={termsAccepted}
              onToggle={() => setTermsAccepted((prev) => !prev)}
            />

            {/* Primary CTA */}
            <AuthPrimaryButton
              title="Create Account"
              onPress={() => void createAccount()}
              loading={loading}
            />

            <AuthFooterLink
              prompt="Already have an account?"
              actionText="Sign In"
              onPress={() => router.push('/sign-in')}
            />
          </View>
        </View>
      )}
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
  screenHeading: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  screenSub: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionHeaderWrap: {
    marginTop: 14,
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputsStack: {
    gap: 12,
  },
  demoBox: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    marginBottom: 16,
  },
  demoBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  demoBoxSub: {
    fontSize: 12,
  },
  demoBoxButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  demoBoxBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBoxBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
});