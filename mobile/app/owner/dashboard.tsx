import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Avatar, EmptyState, Notice, Page, SectionTitle } from '@/components/Marketplace';
import { useDriveFlex } from '@/context/AppContext';
import { owners } from '@/data/catalog';
import { shortDate } from '@/lib/dates';
import { useColors } from '@/hooks/useColors';

export default function OwnerDashboardScreen() {
  const colors = useColors();
  const { ownerProfile, bookings, vehicles, cancelBooking, apiConfigured, apiError } = useDriveFlex();
  const host = ownerProfile ?? owners[1];
  const ownerVehicleIds = vehicles.filter((vehicle) => vehicle.ownerId === host.id).map((vehicle) => vehicle.id);
  const hostBookings = bookings.filter((booking) => ownerVehicleIds.includes(booking.vehicleId) && booking.status !== 'Cancelled');
  const earnings = hostBookings.reduce((sum, booking) => sum + (booking.totalAmount ?? 0), 0);
  return (
    <Page>
      <Pressable onPress={() => router.back()} hitSlop={10} style={{ marginBottom: 18 }}>
        <Feather name="arrow-left" size={21} color={colors.foreground} />
      </Pressable>
      <View style={styles.heading}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>HOST TOOLS</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Your dashboard</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{host.businessName}</Text>
        </View>
        <Avatar uri={host.profileImage} size={48} />
      </View>
      {apiError && <Notice text={`Live booking data is unavailable. ${apiError}`} />}
      {!apiConfigured && <Notice text="Demo dashboard: bookings and host activity are stored on this device." />}

      <View style={styles.metrics}>
        <Metric label="Bookings" value={`${hostBookings.length}`} icon="calendar" />
        <Metric label="Listed cars" value={`${ownerVehicleIds.length}`} icon="truck" />
        <Metric label="Demo earnings" value={`$${earnings.toLocaleString()}`} icon="trending-up" />
      </View>

      <SectionTitle eyebrow="The next handover" title="Bookings" />
      {hostBookings.length ? hostBookings.map((booking) => {
        const vehicle = vehicles.find((item) => item.id === booking.vehicleId);
        return (
          <View key={booking.id ?? `${booking.vehicleId}-${booking.pickup}`} style={[styles.bookingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.bookingTop}>
              <View style={[styles.bookingIcon, { backgroundColor: colors.secondary }]}>
                <Feather name="key" size={17} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bookingTitle, { color: colors.foreground }]}>{vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehicle booking'}</Text>
                <Text style={[styles.bookingMeta, { color: colors.mutedForeground }]}>{booking.customer} · {booking.status}</Text>
              </View>
              <Text style={[styles.bookingTotal, { color: colors.accent }]}>${booking.totalAmount ?? 0}</Text>
            </View>
            <View style={[styles.bookingFooter, { borderTopColor: colors.border }]}>
              <Text style={[styles.bookingMeta, { color: colors.mutedForeground }]}>{shortDate(booking.pickup)} — {shortDate(booking.returnDate)}</Text>
              {booking.id && (
                <Pressable
                  onPress={() => Alert.alert('Cancel this booking?', 'The reservation will be removed and the vehicle made available.', [
                    { text: 'Keep booking', style: 'cancel' },
                    { text: 'Cancel booking', style: 'destructive', onPress: () => void cancelBooking(booking.id!) },
                  ])}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel booking"
                >
                  <Text style={{ color: colors.destructive, fontSize: 11, fontWeight: '700' }}>Cancel</Text>
                </Pressable>
              )}
            </View>
          </View>
        );
      }) : (
        <EmptyState icon="calendar" title="No upcoming bookings" detail="New reservations will appear here once a guest books one of your cars." />
      )}
      <View style={{ marginTop: 16 }}>
        <ActionButton title="Update host profile" icon="edit-3" quiet onPress={() => router.push('/owner/onboard')} />
      </View>
      <Text style={[styles.footnote, { color: colors.mutedForeground }]}>Earnings are estimates only. Payment handling is not enabled in this preview.</Text>
    </Page>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: keyof typeof Feather.glyphMap }) {
  const colors = useColors();
  return (
    <View style={[styles.metric, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name={icon} size={17} color={colors.accent} />
      <Text style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.7, marginBottom: 7 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 12, marginTop: 5 },
  metrics: { flexDirection: 'row', gap: 8, marginTop: 17, marginBottom: 26 },
  metric: { flex: 1, minHeight: 104, borderWidth: 1, borderRadius: 15, padding: 11, justifyContent: 'space-between' },
  metricValue: { fontSize: 18, fontWeight: '800' },
  metricLabel: { fontSize: 9 },
  bookingCard: { borderWidth: 1, borderRadius: 17, padding: 13, marginBottom: 10 },
  bookingTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bookingIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bookingTitle: { fontSize: 13, fontWeight: '700' },
  bookingMeta: { fontSize: 10, marginTop: 5 },
  bookingTotal: { fontSize: 13, fontWeight: '800' },
  bookingFooter: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 11, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footnote: { fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 16 },
});