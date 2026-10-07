import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ActionButton, Field } from '@/components/Marketplace';
import { useDriveFlex } from '@/context/AppContext';
import type { OwnerProfile } from '@/data/catalog';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OwnerOnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { ownerProfile, saveOwnerProfile } = useDriveFlex();
  const [name, setName] = useState(ownerProfile?.fullName ?? '');
  const [business, setBusiness] = useState(ownerProfile?.businessName ?? '');
  const [email, setEmail] = useState(ownerProfile?.email ?? '');
  const [phone, setPhone] = useState(ownerProfile?.phone ?? '');
  const [city, setCity] = useState(ownerProfile?.city ?? '');
  const [address, setAddress] = useState(ownerProfile?.businessLocation ?? '');
  const [description, setDescription] = useState(ownerProfile?.description ?? '');
  const [saving, setSaving] = useState(false);
  const top = Platform.OS === 'web' ? Math.max(67, insets.top) : insets.top;

  const submit = async () => {
    if (!name.trim() || !business.trim() || !email.includes('@') || !city.trim()) {
      Alert.alert('Complete the host profile', 'Add your name, business, a valid email, and city.');
      return;
    }
    setSaving(true);
    try {
      const profile: OwnerProfile = {
        id: ownerProfile?.id ?? `owner-local-${Date.now()}`,
        slug: ownerProfile?.slug ?? `driveflex-host-${Date.now()}`,
        fullName: name.trim(),
        businessName: business.trim(),
        ownerType: 'Car Rental Business',
        city: city.trim(),
        location: address.trim() || city.trim(),
        businessLocation: address.trim() || city.trim(),
        phone: phone.trim(),
        email: email.trim(),
        yearsExperience: ownerProfile?.yearsExperience ?? 0,
        description: description.trim() || 'A DriveFlex host, ready to welcome guests.',
        profileImage: ownerProfile?.profileImage ?? '',
        verified: false,
        vehicleIds: ownerProfile?.vehicleIds ?? [],
      };
      await saveOwnerProfile(profile);
      Alert.alert('Host profile saved', 'Your details are stored on this device for the preview.', [
        { text: 'Open dashboard', onPress: () => router.replace('/owner/dashboard') },
      ]);
    } catch {
      Alert.alert('Could not save profile', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      contentContainerStyle={[styles.content, { backgroundColor: colors.background, paddingTop: top + 14, paddingBottom: insets.bottom + 36 }]}
    >
      <Text
        accessibilityRole="button"
        onPress={() => router.back()}
        style={{ color: colors.mutedForeground, fontSize: 13, marginBottom: 21 }}
      >
        <Feather name="arrow-left" size={16} color={colors.mutedForeground} />  Back
      </Text>
      <Text style={[styles.eyebrow, { color: colors.accent }]}>BECOME A HOST</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Put your car{'\n'}on the map.</Text>
      <Text style={[styles.copy, { color: colors.mutedForeground }]}>Share a few details. You can refine your host profile later.</Text>
      <Field label="Your name" value={name} onChangeText={setName} placeholder="Full name" />
      <Field label="Business or fleet name" value={business} onChangeText={setBusiness} placeholder="Your rental business" />
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
      <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="+92 300 0000000" keyboardType="phone-pad" />
      <Field label="City" value={city} onChangeText={setCity} placeholder="Lahore, Islamabad, Karachi…" />
      <Field label="Business location" value={address} onChangeText={setAddress} placeholder="Area or neighborhood" />
      <Field label="About your service" value={description} onChangeText={setDescription} placeholder="What can guests expect from you?" multiline />
      <Text style={[styles.privacy, { color: colors.mutedForeground }]}>This preview saves the profile on this device. It does not submit identity documents or send your details to a server.</Text>
      <ActionButton title={saving ? 'Saving…' : 'Save host profile'} onPress={() => void submit()} disabled={saving} icon="arrow-right" />
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: 20, gap: 16 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.7 },
  title: { fontSize: 35, lineHeight: 39, fontWeight: '800', letterSpacing: -1 },
  copy: { fontSize: 13, lineHeight: 19, marginTop: -8, marginBottom: 4 },
  privacy: { fontSize: 10, lineHeight: 15 },
});