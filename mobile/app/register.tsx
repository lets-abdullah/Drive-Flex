import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text } from 'react-native';
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
  const top = Platform.OS === 'web' ? Math.max(67, insets.top) : insets.top;
  const createAccount = async () => {
    if (name.trim().length < 2 || !email.includes('@')) {
      Alert.alert('Add your details', 'Enter your name and a valid email address.');
      return;
    }
    await setSession({ name: name.trim(), email: email.trim() });
    router.replace('/(tabs)/profile');
  };
  return (
    <KeyboardAwareScrollViewCompat contentContainerStyle={[styles.content, { backgroundColor: colors.background, paddingTop: top + 28, paddingBottom: insets.bottom + 32 }]}>
      <Pressable onPress={() => router.back()} style={{ marginBottom: 28 }} accessibilityRole="button" accessibilityLabel="Go back">
        <Feather name="arrow-left" size={22} color={colors.foreground} />
      </Pressable>
      <BrandMark />
      <Text style={[styles.eyebrow, { color: colors.accent }]}>A BETTER WAY TO GET THERE</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Join the{'\n'}ride.</Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>Create a preview profile to save favorites and keep track of bookings.</Text>
      <Field label="Your name" value={name} onChangeText={setName} placeholder="Full name" />
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
      <ActionButton title="Create preview account" onPress={() => void createAccount()} icon="arrow-right" testID="register-submit" />
      <Text style={[styles.note, { color: colors.mutedForeground }]}>No password is requested. This preview profile stays on your device.</Text>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: 22, gap: 16 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.6, marginTop: 43 },
  title: { fontSize: 39, lineHeight: 43, fontWeight: '800', letterSpacing: -1 },
  body: { fontSize: 13, lineHeight: 20, marginTop: -7, marginBottom: 7 },
  note: { fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 2 },
});