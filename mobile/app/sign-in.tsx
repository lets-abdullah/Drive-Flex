import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ActionButton, BrandMark, Field } from '@/components/Marketplace';
import { useDriveFlex } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignInScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setSession } = useDriveFlex();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const top = Platform.OS === 'web' ? Math.max(67, insets.top) : insets.top;
  const signIn = async () => {
    if (!name.trim() || !email.includes('@')) {
      Alert.alert('Check your details', 'Enter your name and a valid email address to continue.');
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
      <View style={[styles.mark, { backgroundColor: colors.secondary }]}>
        <Feather name="user" size={22} color={colors.accent} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>Welcome{'\n'}back.</Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>Sign in to keep your saved cars and trips together.</Text>
      <View style={{ gap: 16, marginTop: 24 }}>
        <Field label="Your name" value={name} onChangeText={setName} placeholder="Full name" />
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
        <ActionButton title="Continue" onPress={() => void signIn()} icon="arrow-right" testID="sign-in-submit" />
      </View>
      <View style={styles.bottomLine}>
        <Text style={[styles.bottomText, { color: colors.mutedForeground }]}>New to DriveFlex?</Text>
        <Pressable onPress={() => router.push('/register')} accessibilityRole="button">
          <Text style={[styles.link, { color: colors.accent }]}>Create account</Text>
        </Pressable>
      </View>
      <Text style={[styles.previewNote, { color: colors.mutedForeground }]}>Preview account only — no password is collected or sent.</Text>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: 22 },
  mark: { marginTop: 54, width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 38, lineHeight: 42, fontWeight: '800', letterSpacing: -1, marginTop: 17 },
  body: { fontSize: 13, lineHeight: 20, marginTop: 9, maxWidth: 270 },
  bottomLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 25 },
  bottomText: { fontSize: 12 },
  link: { fontSize: 12, fontWeight: '700' },
  previewNote: { fontSize: 10, textAlign: 'center', marginTop: 22 },
});