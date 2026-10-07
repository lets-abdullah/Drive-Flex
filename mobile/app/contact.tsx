import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Page, SectionTitle } from '@/components/Marketplace';
import { useColors } from '@/hooks/useColors';

export default function ContactScreen() {
  const colors = useColors();
  const openEmail = async () => {
    const url = 'mailto:hello@driveflex.demo?subject=DriveFlex%20support';
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else Alert.alert('Email support', 'Email hello@driveflex.demo for help with your trip.');
  };
  return (
    <Page>
      <Pressable onPress={() => router.back()} hitSlop={10} style={{ marginBottom: 18 }}>
        <Feather name="arrow-left" size={21} color={colors.foreground} />
      </Pressable>
      <Text style={[styles.eyebrow, { color: colors.accent }]}>WE’RE HERE TO HELP</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Let’s talk.</Text>
      <Text style={[styles.copy, { color: colors.mutedForeground }]}>Questions about a booking, a host listing, or a journey ahead? Reach the DriveFlex team.</Text>
      <SectionTitle eyebrow="Support" title="Choose what works for you" />
      <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.icon, { backgroundColor: colors.secondary }]}><Feather name="mail" size={18} color={colors.accent} /></View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.contactTitle, { color: colors.foreground }]}>Email support</Text>
          <Text style={[styles.contactDetail, { color: colors.mutedForeground }]}>hello@driveflex.demo</Text>
        </View>
        <Feather name="arrow-up-right" size={17} color={colors.mutedForeground} />
      </View>
      <ActionButton title="Write to DriveFlex" onPress={() => void openEmail()} icon="send" />
      <Text style={[styles.note, { color: colors.mutedForeground }]}>The sample contact address is for demonstration. Replace it with your live support contact before publishing.</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.7, marginTop: 28 },
  title: { fontSize: 39, fontWeight: '800', letterSpacing: -1, marginTop: 10 },
  copy: { fontSize: 13, lineHeight: 21, marginTop: 9, marginBottom: 28 },
  contactCard: { borderWidth: 1, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 13 },
  icon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  contactTitle: { fontSize: 13, fontWeight: '700' },
  contactDetail: { fontSize: 11, marginTop: 4 },
  note: { fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 15 },
});