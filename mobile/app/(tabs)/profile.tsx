import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Avatar, EmptyState, Page, SectionTitle } from '@/components/Marketplace';
import { useDriveFlex } from '@/context/AppContext';
import { owners } from '@/data/catalog';
import { useColors } from '@/hooks/useColors';

export default function ProfileScreen() {
  const colors = useColors();
  const { session, setSession, bookings, ownerProfile, vehicles, favorites, theme, toggleTheme } = useDriveFlex();
  const displayOwner = ownerProfile ?? owners[1];
  const userBookings = session
    ? bookings.filter(
        (b) =>
          b.customer.toLowerCase().trim() === session.name.toLowerCase().trim() ||
          (session.email && b.customer.toLowerCase().trim() === session.email.toLowerCase().trim())
      )
    : bookings;
  const recentBookings = userBookings.slice(0, 5);

  return (
    <Page tabbed>
      {/* ─── HEADER & THEME TOGGLE ─── */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>YOUR ACCOUNT</Text>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle dark/light theme"
          onPress={toggleTheme}
          style={[styles.themeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather
            name={theme === 'dark' ? 'sun' : 'moon'}
            size={18}
            color={colors.accent}
          />
        </Pressable>
      </View>

      {/* ─── USER PROFILE CARD ─── */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Avatar size={60} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {session?.name ?? 'Guest Renter'}
          </Text>
          <Text style={[styles.email, { color: colors.mutedForeground }]}>
            {session?.email ?? 'Sign in to sync your bookings across devices'}
          </Text>
        </View>
        {session && <Feather name="check-circle" size={20} color={colors.accent} />}
      </View>

      {/* ─── QUICK METRICS PILL BAR ─── */}
      <View style={[styles.metricsBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricVal, { color: colors.foreground }]}>{userBookings.length}</Text>
          <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Bookings</Text>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricVal, { color: colors.foreground }]}>{favorites.length}</Text>
          <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Saved</Text>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricVal, { color: colors.foreground }]}>PK</Text>
          <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Pakistan</Text>
        </View>
      </View>

      {/* Sign in / Sign out action */}
      {!session ? (
        <View style={{ gap: 10, marginBottom: 20 }}>
          <ActionButton title="Sign In" onPress={() => router.push('/sign-in')} testID="sign-in-button" />
          <ActionButton title="Create Account" onPress={() => router.push('/register')} quiet />
        </View>
      ) : (
        <Pressable
          onPress={() => Alert.alert('Sign out?', 'Your saved cars and bookings will remain on this device.', [
            { text: 'Keep me signed in', style: 'cancel' },
            { text: 'Sign out', style: 'destructive', onPress: () => void setSession(null) },
          ])}
          style={[styles.signOutBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="log-out" size={16} color={colors.destructive} />
          <Text style={[styles.signOutText, { color: colors.destructive }]}>Sign Out</Text>
        </Pressable>
      )}

      {/* ─── RECENT BOOKINGS (Screen 3 style cards) ─── */}
      <View style={{ marginTop: 14 }}>
        <SectionTitle eyebrow="Your activity" title="Recent bookings" />
      </View>

      {recentBookings.length ? (
        <View style={{ gap: 10, marginBottom: 20 }}>
          {recentBookings.map((booking) => {
            const vehicle = vehicles.find((item) => item.id === booking.vehicleId);
            return (
              <View
                key={booking.id ?? `${booking.vehicleId}-${booking.pickup}`}
                style={[styles.bookingRow, { borderColor: colors.border, backgroundColor: colors.card }]}
              >
                <View style={[styles.bookingIcon, { backgroundColor: colors.secondary }]}>
                  <Feather name="calendar" size={17} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bookingName, { color: colors.foreground }]}>
                    {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'DriveFlex Reservation'}
                  </Text>
                  <Text style={[styles.bookingMeta, { color: colors.mutedForeground }]}>
                    {booking.pickup} → {booking.returnDate}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.statusText, { color: colors.accent }]}>
                    {booking.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <EmptyState
          icon="calendar"
          title="No trips booked yet"
          detail="Your upcoming car reservations will appear here."
          action="Find a car"
          onAction={() => router.push('/(tabs)/search')}
        />
      )}

      {/* ─── FOR HOSTS BANNER ─── */}
      <View style={{ marginTop: 16 }}>
        <SectionTitle eyebrow="For hosts" title="Manage your cars" />
      </View>

      <View style={[styles.hostCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Avatar uri={displayOwner.profileImage} size={46} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.bookingName, { color: colors.foreground }]}>Host dashboard</Text>
          <Text style={[styles.bookingMeta, { color: colors.mutedForeground }]}>Bookings, earnings and your host profile</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open host dashboard"
          onPress={() => router.push('/owner/dashboard')}
          style={[styles.hostArrowBtn, { backgroundColor: colors.secondary }]}
        >
          <Feather name="arrow-right" size={16} color={colors.foreground} />
        </Pressable>
      </View>

      {/* ─── MENU ITEMS ─── */}
      <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Pressable onPress={() => router.push('/owner/onboard')} style={[styles.linkRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.linkIconWrap, { backgroundColor: colors.secondary }]}>
            <Feather name="plus-circle" size={16} color={colors.accent} />
          </View>
          <Text style={[styles.linkText, { color: colors.foreground }]}>Become a DriveFlex host</Text>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </Pressable>

        <Pressable onPress={() => router.push('/about')} style={[styles.linkRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.linkIconWrap, { backgroundColor: colors.secondary }]}>
            <Feather name="info" size={16} color={colors.accent} />
          </View>
          <Text style={[styles.linkText, { color: colors.foreground }]}>About DriveFlex</Text>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </Pressable>

        <Pressable onPress={() => router.push('/contact')} style={[styles.linkRow, { borderBottomWidth: 0 }]}>
          <View style={[styles.linkIconWrap, { backgroundColor: colors.secondary }]}>
            <Feather name="message-circle" size={16} color={colors.accent} />
          </View>
          <Text style={[styles.linkText, { color: colors.foreground }]}>Contact support</Text>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  themeBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  email: {
    fontSize: 12,
    marginTop: 4,
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 14,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 17,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    marginBottom: 18,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bookingRow: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookingIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingName: {
    fontSize: 14,
    fontWeight: '700',
  },
  bookingMeta: {
    fontSize: 11,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  hostCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  hostArrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContainer: {
    borderWidth: 1,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 20,
  },
  linkRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  linkIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
});