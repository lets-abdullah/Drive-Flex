import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, EmptyState, Page, SectionTitle } from '@/components/Marketplace';
import { useDriveFlex } from '@/context/AppContext';
import { owners } from '@/data/catalog';
import { useColors } from '@/hooks/useColors';

export default function PublicHostProfileScreen() {
  const colors = useColors();
  const { slug, id } = useLocalSearchParams<{ slug?: string; id?: string }>();
  const hostParam = slug || id;
  const { vehicles, session, ownerProfile } = useDriveFlex();

  // Find host by slug, id, or match with session/ownerProfile
  const host = useMemo(() => {
    const match = owners.find((o) => o.slug === hostParam || o.id === hostParam);
    if (match) return match;
    if (ownerProfile && (ownerProfile.id === hostParam || ownerProfile.slug === hostParam)) {
      return ownerProfile;
    }
    if (session?.role === 'host' && (session.id === hostParam || hostParam === 'me')) {
      return {
        id: session.id || 'host-current',
        slug: 'my-fleet',
        fullName: session.name,
        businessName: session.businessName || `${session.name} Fleet`,
        ownerType: 'Verified Fleet Host',
        city: session.city || 'Lahore',
        location: session.city || 'Lahore',
        phone: session.phone || '',
        email: session.email,
        yearsExperience: 5,
        description: session.bio || 'Verified DriveFlex host with a maintained personal and commercial vehicle fleet.',
        profileImage: session.avatar || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400',
        verified: true,
        vehicleIds: [],
      };
    }
    // Fallback to first verified host if slug is generic
    return owners[0];
  }, [hostParam, ownerProfile, session]);

  if (!host) {
    return (
      <Page>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))} style={{ marginBottom: 20 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <EmptyState
          title="Host Profile Not Found"
          detail="This host profile is currently unavailable or has been de-listed."
          action="Back to Search"
          onAction={() => router.push('/(tabs)/search')}
        />
      </Page>
    );
  }

  // Active listings for this host
  const hostVehicles = vehicles.filter(
    (v) =>
      (v.ownerId === host.id || v.host_id === host.id || (host.id === 'owner-ali' && v.ownerId === 'owner-ali')) &&
      !v.isDelisted &&
      v.status !== 'maintenance'
  );

  return (
    <Page>
      {/* ─── BACK BUTTON ─── */}
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))} hitSlop={10} style={{ marginBottom: 14 }}>
        <Feather name="arrow-left" size={22} color={colors.foreground} />
      </Pressable>

      {/* ─── COVER BANNER ─── */}
      <View style={[styles.cover, { backgroundColor: colors.secondary }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80' }}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.coverGradientOverlay} />
      </View>

      {/* ─── HOST IDENTITY CARD ─── */}
      <View style={styles.identityRow}>
        <Avatar uri={host.profileImage} size={72} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.businessName, { color: colors.foreground }]}>
              {host.businessName}
            </Text>
            {host.verified && (
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            )}
          </View>
          <Text style={[styles.hostName, { color: colors.mutedForeground }]}>
            Hosted by {host.fullName} • {host.city}
          </Text>
        </View>
      </View>

      {/* ─── PUBLIC TRUST & PERFORMANCE STATS ─── */}
      <View style={[styles.trustMetricsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.metricCol}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Feather name="star" size={14} color={colors.star} />
            <Text style={[styles.metricNumber, { color: colors.foreground }]}>4.95</Text>
          </View>
          <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
            Rating (124 reviews)
          </Text>
        </View>

        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

        <View style={styles.metricCol}>
          <Text style={[styles.metricNumber, { color: colors.foreground }]}>
            {hostVehicles.length * 8 + 14}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
            Total Trips Hosted
          </Text>
        </View>

        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

        <View style={styles.metricCol}>
          <Text style={[styles.metricNumber, { color: '#10B981' }]}>
            100%
          </Text>
          <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
            Response Rate
          </Text>
        </View>
      </View>

      {/* ─── PRIVACY GUARD NOTICE (Cross-Profile Visibility Rule) ─── */}
      <View
        style={[
          styles.privacyGuardCard,
          {
            backgroundColor: colors.isDark ? '#141822' : '#F0FDF4',
            borderColor: colors.isDark ? '#1E293B' : '#BBF7D0',
          },
        ]}
      >
        <View style={styles.privacyIconWrap}>
          <Ionicons name="shield-checkmark" size={18} color="#10B981" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.privacyTitle, { color: colors.foreground }]}>
            DriveFlex Privacy Shield Active
          </Text>
          <Text style={[styles.privacyBody, { color: colors.mutedForeground }]}>
            To protect host safety, exact residential home addresses, direct telephone numbers, and email addresses are shielded until a booking is placed and approved.
          </Text>
        </View>
      </View>

      {/* ─── ABOUT THE HOST / BIO ─── */}
      <SectionTitle eyebrow="HOST BIO" title="About Your Host" />
      <Text style={[styles.bioText, { color: colors.mutedForeground }]}>
        {host.description}
      </Text>

      {/* ─── ACTIVE LISTINGS SLIDER (Horizontal Scroll of other cars) ─── */}
      <View style={{ marginTop: 22, marginBottom: 8 }}>
        <SectionTitle
          eyebrow="FLEET COLLECTION"
          title={`Active Listings by ${host.fullName} (${hostVehicles.length})`}
        />
      </View>

      {hostVehicles.length === 0 ? (
        <EmptyState
          title="No Active Vehicles"
          detail="This host currently has no other active vehicles in this hub."
        />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listingsSlider}
        >
          {hostVehicles.map((car) => (
            <Pressable
              key={car.id}
              accessibilityRole="button"
              accessibilityLabel={`View ${car.brand} ${car.model}`}
              onPress={() => router.push(`/cars/${car.slug}`)}
              style={[
                styles.sliderCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Image source={{ uri: car.image }} contentFit="cover" style={styles.sliderThumb} />
              <View style={styles.sliderContent}>
                <Text numberOfLines={1} style={[styles.sliderCarTitle, { color: colors.foreground }]}>
                  {car.brand} {car.model}
                </Text>
                <Text style={[styles.sliderCarSub, { color: colors.mutedForeground }]}>
                  {car.category} • {car.transmission}
                </Text>

                <View style={styles.sliderFooter}>
                  <Text style={[styles.sliderPrice, { color: colors.foreground }]}>
                    ${car.price_per_day || car.pricePerDay}
                    <Text style={{ fontSize: 11, fontWeight: '400', color: colors.mutedForeground }}> /day</Text>
                  </Text>
                  <View style={styles.ratingBadge}>
                    <Feather name="star" size={11} color={colors.star} />
                    <Text style={[styles.ratingText, { color: colors.foreground }]}>
                      {car.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  cover: {
    height: 140,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  coverGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: -30,
    marginLeft: 14,
    marginBottom: 16,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '800',
  },
  hostName: {
    fontSize: 12,
    marginTop: 2,
  },
  trustMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 18,
  },
  metricCol: {
    alignItems: 'center',
    gap: 4,
  },
  metricNumber: {
    fontSize: 17,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
  },
  metricDivider: {
    width: 1,
    height: 32,
  },
  privacyGuardCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  privacyIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  privacyBody: {
    fontSize: 11,
    lineHeight: 16,
  },
  bioText: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: -4,
  },
  listingsSlider: {
    gap: 14,
    paddingVertical: 8,
  },
  sliderCard: {
    width: 220,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sliderThumb: {
    width: '100%',
    height: 125,
  },
  sliderContent: {
    padding: 12,
  },
  sliderCarTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sliderCarSub: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 8,
  },
  sliderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderPrice: {
    fontSize: 14,
    fontWeight: '800',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});