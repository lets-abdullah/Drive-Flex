import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ActionButton, BrandMark, Field } from '@/components/Marketplace';
import { useDriveFlex } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setSession } = useDriveFlex();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'renter' | 'host'>('renter');
  const [loading, setLoading] = useState(false);

  const top = Platform.OS === 'web' ? Math.max(67, insets.top) : insets.top;

  const getApiBaseUrl = () => {
    const raw = process.env.EXPO_PUBLIC_API_URL?.trim() || 'https://drive-flex.vercel.app/api';
    return raw.replace(/\/+$/, '').replace(/\/api$/, '');
  };

  const createAccount = async () => {
    if (name.trim().length < 2) {
      Alert.alert('Full Name Required', 'Please enter your full name.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Valid Email Required', 'Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Password Required', 'Password must be at least 6 characters.');
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
      if (!res.ok || !data.success) {
        Alert.alert('Registration Notice', data.message || 'Registration could not be completed.');
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
      });

      setLoading(false);
      router.replace(role === 'host' ? '/owner/dashboard' : '/(tabs)/profile');
    } catch (err: any) {
      console.warn('Network registration fallback:', err);
      await setSession({
        name: name.trim(),
        email: email.trim(),
        role,
      });
      setLoading(false);
      router.replace(role === 'host' ? '/owner/dashboard' : '/(tabs)/profile');
    }
  };

  return (
    <KeyboardAwareScrollViewCompat contentContainerStyle={[styles.content, { backgroundColor: colors.background, paddingTop: top + 28, paddingBottom: insets.bottom + 32 }]}>
      <Pressable onPress={() => router.back()} style={{ marginBottom: 28 }} accessibilityRole="button" accessibilityLabel="Go back">
        <Feather name="arrow-left" size={22} color={colors.foreground} />
      </Pressable>
      <BrandMark />
      <Text style={[styles.eyebrow, { color: colors.accent }]}>A BETTER WAY TO GET THERE</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Join the{'\n'}ride.</Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>
        {role === 'host'
          ? 'Create your DriveFlex host account to list vehicles and manage bookings.'
          : 'Create your DriveFlex renter account to book vehicles and access member rates.'}
      </Text>

      {/* Role Selector Tabs */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        <Pressable
          onPress={() => setRole('renter')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor: role === 'renter' ? colors.primary : colors.card,
            borderWidth: 1,
            borderColor: role === 'renter' ? colors.accent : colors.border,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: role === 'renter' ? colors.primaryForeground : colors.mutedForeground }}>
            Renter
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setRole('host')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor: role === 'host' ? colors.primary : colors.card,
            borderWidth: 1,
            borderColor: role === 'host' ? colors.accent : colors.border,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: role === 'host' ? colors.primaryForeground : colors.mutedForeground }}>
            Car Host
          </Text>
        </Pressable>
      </View>

      <Field label="Your full name" value={name} onChangeText={setName} placeholder="Full legal name" />
      <Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
      <Field label="Mobile number (optional)" value={phone} onChangeText={setPhone} placeholder="+92 300 1234567" keyboardType="phone-pad" />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry />

      <ActionButton
        title={loading ? 'Creating account…' : role === 'host' ? 'Create Host Account' : 'Create Renter Account'}
        onPress={() => void createAccount()}
        icon="arrow-right"
        testID="register-submit"
      />

      <View style={styles.bottomLine}>
        <Text style={[styles.bottomText, { color: colors.mutedForeground }]}>Already have an account?</Text>
        <Pressable onPress={() => router.push('/sign-in')} accessibilityRole="button">
          <Text style={[styles.link, { color: colors.accent }]}>Sign in</Text>
        </Pressable>
      </View>

      <Text style={[styles.note, { color: colors.mutedForeground }]}>
        Synced with DriveFlex MongoDB Atlas cloud database.
      </Text>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: 22, gap: 14 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.6, marginTop: 25 },
  title: { fontSize: 39, lineHeight: 43, fontWeight: '800', letterSpacing: -1 },
  body: { fontSize: 13, lineHeight: 20, marginTop: -7, marginBottom: 7 },
  bottomLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 },
  bottomText: { fontSize: 12 },
  link: { fontSize: 12, fontWeight: '700' },
  note: { fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 10 },
});