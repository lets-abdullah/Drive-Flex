import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BrandMark, Page, SectionTitle } from '@/components/Marketplace';
import { useColors } from '@/hooks/useColors';

export default function AboutScreen() {
  const colors = useColors();
  return (
    <Page>
      <Pressable onPress={() => router.back()} hitSlop={10} style={{ marginBottom: 18 }}>
        <Feather name="arrow-left" size={21} color={colors.foreground} />
      </Pressable>
      <BrandMark />
      <Text style={[styles.kicker, { color: colors.accent }]}>ABOUT DRIVEFLEX</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>The right car{'\n'}changes the trip.</Text>
      <Text style={[styles.copy, { color: colors.mutedForeground }]}>
        DriveFlex brings thoughtful local hosts and well-kept cars together, so getting around Pakistan feels personal, flexible, and clear.
      </Text>
      <SectionTitle eyebrow="Our promise" title="A smoother start to every journey" />
      {[
        ['Verified hosts', 'Meet local rental teams with a real profile and clear handover details.'],
        ['Cars for your plans', 'From quick city errands to long weekends, choose a vehicle that fits.'],
        ['Straightforward booking', 'See the rate, choose your dates, and keep trip details close.'],
      ].map(([title, detail], index) => (
        <View key={title} style={[styles.promise, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.number, { backgroundColor: colors.secondary }]}>
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '800' }}>0{index + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.promiseTitle, { color: colors.foreground }]}>{title}</Text>
            <Text style={[styles.promiseCopy, { color: colors.mutedForeground }]}>{detail}</Text>
          </View>
        </View>
      ))}
      <Text style={[styles.preview, { color: colors.mutedForeground }]}>This mobile preview uses the sample DriveFlex catalog. Connect a deployed API to work with live vehicles and bookings.</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  kicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1.7, marginTop: 39 },
  title: { fontSize: 38, lineHeight: 42, fontWeight: '800', letterSpacing: -1, marginTop: 12 },
  copy: { fontSize: 14, lineHeight: 23, marginTop: 13, marginBottom: 28 },
  promise: { flexDirection: 'row', alignItems: 'flex-start', gap: 13, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10 },
  number: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  promiseTitle: { fontSize: 13, fontWeight: '700' },
  promiseCopy: { fontSize: 11, lineHeight: 17, marginTop: 5 },
  preview: { fontSize: 10, lineHeight: 15, marginTop: 14 },
});