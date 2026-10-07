import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Avatar, EmptyState, Page, SectionTitle, VehicleCard } from '@/components/Marketplace';
import { useDriveFlex } from '@/context/AppContext';
import { owners } from '@/data/catalog';
import { useColors } from '@/hooks/useColors';

export default function OwnerProfileScreen() {
  const colors = useColors();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { vehicles } = useDriveFlex();
  const host = owners.find((owner) => owner.slug === slug);
  if (!host) {
    return (
      <Page>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 22 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <EmptyState title="Host profile not found" detail="This profile is not part of the current listings." action="Back to search" onAction={() => router.push('/(tabs)/search')} />
      </Page>
    );
  }
  const hostVehicles = vehicles.filter((vehicle) => vehicle.ownerId === host.id);
  return (
    <Page>
      <Pressable onPress={() => router.back()} hitSlop={10} style={{ marginBottom: 16 }}>
        <Feather name="arrow-left" size={21} color={colors.foreground} />
      </Pressable>
      <View style={[styles.cover, { backgroundColor: colors.secondary }]}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=1200' }}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={styles.identity}>
        <Avatar uri={host.profileImage} size={68} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.business, { color: colors.foreground }]}>{host.businessName}</Text>
          <Text style={[styles.ownerName, { color: colors.mutedForeground }]}>{host.fullName} · {host.city}</Text>
        </View>
        {host.verified && <Feather name="check-circle" size={20} color={colors.accent} />}
      </View>
      <View style={[styles.trustRow, { borderColor: colors.border }]}>
        <Trust icon="shield" value="Verified host" />
        <Trust icon="clock" value={`${host.yearsExperience} years`} />
        <Trust icon="truck" value={`${hostVehicles.length} cars`} />
      </View>
      <SectionTitle eyebrow="A note from your host" title="Local experience, personal handover" />
      <Text style={[styles.description, { color: colors.mutedForeground }]}>{host.description}</Text>
      <View style={{ marginTop: 8, marginBottom: 16 }}>
        <ActionButton title="Contact host" icon="message-circle" onPress={() => void Linking.openURL(`mailto:${host.email}`)} quiet />
      </View>
      <SectionTitle eyebrow="Their collection" title="Cars from this host" />
      {hostVehicles.length
        ? hostVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)
        : <EmptyState title="No cars listed yet" detail="Check back soon for this host’s next vehicle." />}
    </Page>
  );
}

function Trust({ icon, value }: { icon: keyof typeof Feather.glyphMap; value: string }) {
  const colors = useColors();
  return (
    <View style={styles.trust}>
      <Feather name={icon} size={15} color={colors.accent} />
      <Text style={[styles.trustText, { color: colors.mutedForeground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { height: 146, borderRadius: 20, overflow: 'hidden' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: -25, marginLeft: 14, marginBottom: 16 },
  business: { fontSize: 17, fontWeight: '800' },
  ownerName: { fontSize: 11, marginTop: 4 },
  trustRow: { borderTopWidth: 1, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 14, marginBottom: 25 },
  trust: { alignItems: 'center', gap: 6 },
  trustText: { fontSize: 10, fontWeight: '600' },
  description: { fontSize: 14, lineHeight: 22, marginTop: -5 },
});