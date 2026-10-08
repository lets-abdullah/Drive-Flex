import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ActionButton, BrandMark, Field } from '@/components/Marketplace';
import { useDriveFlex } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignInScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setSession } = useDriveFlex();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const top = Platform.OS === 'web' ? Math.max(67, insets.top) : insets.top;

  const getApiBaseUrl = () => {
    const raw = process.env.EXPO_PUBLIC_API_URL?.trim() || 'https://drive-flex.vercel.app/api';
    return raw.replace(/\/+$/, '').replace(/\/api$/, '');
  };

  const signIn = async () => {
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
      let expectedRole = 'renter';
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
        // Automatically authenticate with Host role if user registered as host on web
        expectedRole = 'host';
        res = await fetch(`${baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
            expectedRole,
          }),
        });
        data = await res.json();
      }

      if (!res.ok || !data.success) {
        Alert.alert(
          'Sign In Failed',
          data.message || 'Invalid email or password.'
        );
        setLoading(false);
        return;
      }

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
      router.replace('/(tabs)/profile');
    } catch (err: any) {
      // Offline fallback: sign in locally
      console.warn('Network auth failed, fallback to local session:', err);
      await setSession({
        name: email.split('@')[0],
        email: email.trim(),
        role: 'renter',
      });
      setLoading(false);
      router.replace('/(tabs)/profile');
    }
  };

  return (
    <KeyboardAwareScrollViewCompat contentContainerStyle={[styles.content, { backgroundColor: colors.background, paddingTop: top + 28, paddingBottom: insets.bottom + 32 }]}>
      <Pressable onPress={() => router.back()} style={{ marginBottom: 28 }} accessibilityRole="button" accessibilityLabel="Go back">
        <Feather name="arrow-left" size={22} color={colors.foreground} />
      </Pressable>
      <BrandMark />
      <View style={[styles.mark, { backgroundColor: colors.secondary }]}>
        <Feather name="user" size={22} color={colors.accent} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>Welcome{'\n'}back.</Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>Sign in with your DriveFlex account to sync bookings and favorites.</Text>

      <View style={{ gap: 16, marginTop: 24 }}>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        <ActionButton
          title={loading ? 'Signing in…' : 'Sign in'}
          onPress={() => void signIn()}
          icon="arrow-right"
          testID="sign-in-submit"
        />
      </View>

      <View style={styles.bottomLine}>
        <Text style={[styles.bottomText, { color: colors.mutedForeground }]}>New to DriveFlex?</Text>
        <Pressable onPress={() => router.push('/register')} accessibilityRole="button">
          <Text style={[styles.link, { color: colors.accent }]}>Create account</Text>
        </Pressable>
      </View>

      <Text style={[styles.previewNote, { color: colors.mutedForeground }]}>
        Connected to shared MongoDB database with DriveFlex Web.
      </Text>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: 22 },
  mark: { marginTop: 40, width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 38, lineHeight: 42, fontWeight: '800', letterSpacing: -1, marginTop: 17 },
  body: { fontSize: 13, lineHeight: 20, marginTop: 9, maxWidth: 280 },
  bottomLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 25 },
  bottomText: { fontSize: 12 },
  link: { fontSize: 12, fontWeight: '700' },
  previewNote: { fontSize: 10, textAlign: 'center', marginTop: 22 },
});