import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  LastActivityCard,
  LocationMiniCard,
  Page,
  SpecQuadrantGrid,
} from '@/components/Marketplace';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDriveFlex } from '@/context/AppContext';
import { owners } from '@/data/catalog';
import { dateAfter, daysBetween, shortDate } from '@/lib/dates';
import { useColors } from '@/hooks/useColors';

type DetailTab = 'overview' | 'specs' | 'policies';

export default function VehicleDetailsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { vehicles, favorites, toggleFavorite, session } = useDriveFlex();

  const vehicle = vehicles.find((item) => item.slug === slug || item.id === slug);
  const host = vehicle ? owners.find((item) => item.id === vehicle.ownerId) : undefined;

  const user = session;
  const isHost = user?.role === 'host';
  const isRenter = !user || user?.role === 'renter';

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const [pickup] = useState(dateAfter(3));
  const [returnDate] = useState(dateAfter(6));
  const [showFullSpecs, setShowFullSpecs] = useState(false);

  const handleProceedBooking = () => {
    if (user?.role === 'host') {
      Alert.alert('Booking Disabled', 'Host accounts cannot book vehicles. Switch to a renter profile to place reservations.');
      return;
    }
    if (cannotBook) {
      Alert.alert('Unavailable', 'This vehicle is currently marked as unavailable for booking.');
      return;
    }
    if (!session) {
      Alert.alert(
        'Account Required',
        'Please create an account or sign in to book this vehicle.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Account', onPress: () => router.push('/register') },
          { text: 'Sign In', onPress: () => router.push('/sign-in') },
        ]
      );
      return;
    }
    router.push({
      pathname: '/checkout' as any,
      params: {
        slug: vehicle?.slug || (slug as string),
        pickupParam: pickup,
        returnParam: returnDate,
      },
    });
  };

  const isFavorite = vehicle ? favorites.includes(vehicle.id) : false;

  const engineVal = vehicle?.engine || '2.0L Turbo Inline-4';
  const powerVal = vehicle?.horsepower || '255 hp / 295 lb-ft';
  const transmissionVal = vehicle?.transmission || 'Automatic';
  const fuelVal = vehicle?.fuelType || 'Gasoline';
  const mileageVal = vehicle?.mileage || vehicle?.fuelUsage || '10 l / 100 km';
  const wheelsVal = vehicle?.wheels || '19" Alloy Wheels';
  const seatsVal = `${vehicle?.seats || 5} Passengers`;

  if (!vehicle) {
    return (
      <Page>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))} style={{ marginBottom: 24 }} accessibilityRole="button">
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: '700' }}>This car isn’t available</Text>
        <Text style={{ color: colors.mutedForeground, marginTop: 8 }}>It may have been removed from the current listings.</Text>
      </Page>
    );
  }

  // Gallery array
  const gallery = [vehicle.image, ...(vehicle.gallery ?? [])].filter(Boolean);
  const currentImage = gallery[selectedImageIndex] || vehicle.image;

  const cannotBook = vehicle.bookable === false
    && !vehicle.currentBooking
    && !vehicle.rentalPeriods?.length;

  return (
    <>
      <Page contentStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 90 }}>
        {/* ─── 1. TOP NAVIGATION BAR ─── */}
        <View style={styles.navBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
            style={[styles.circleBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="arrow-left" size={19} color={colors.foreground} />
          </Pressable>

          <Text style={[styles.navTitle, { color: colors.foreground }]}>Car detail</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Remove from shortlist' : 'Save to shortlist'}
            onPress={() => void toggleFavorite(vehicle.id)}
            style={[styles.circleBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="heart" size={19} color={isFavorite ? colors.primary : colors.foreground} />
          </Pressable>
        </View>

        {/* ─── 2. HERO IMAGE SHOWCASE (Screen 4) ─── */}
        <View style={[styles.heroImageFrame, { backgroundColor: colors.isDark ? '#111111' : '#F6F7F9', borderColor: colors.border }]}>
          <Image
            source={{
              uri: imageError
                ? 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80'
                : (currentImage || 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80'),
            }}
            onError={() => setImageError(true)}
            contentFit="cover"
            style={styles.heroImage}
            transition={200}
          />

          <View style={[styles.verifiedTag, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="shield" size={12} color={colors.star} />
            <Text style={[styles.verifiedText, { color: colors.foreground }]}>VERIFIED HOST</Text>
          </View>
        </View>

        {/* ─── 3. CAR TITLE, YEAR & RATING (Screen 4 Layout) ─── */}
        <View style={styles.screen4HeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.screen4Year, { color: colors.mutedForeground }]}>
              {vehicle.year || 2021}
            </Text>
            <Text style={[styles.screen4Title, { color: colors.foreground }]}>
              {vehicle.brand} {vehicle.model}
            </Text>
          </View>
          <View style={[styles.screen4RatingBadge, { backgroundColor: 'rgba(201,162,39,0.14)' }]}>
            <Feather name="star" size={14} color={colors.star} />
            <Text style={[styles.screen4RatingText, { color: colors.foreground }]}>
              {vehicle.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        {/* ─── 4. 2x2 SPECIFICATION QUADRANT MATRIX (Screen 4) ─── */}
        <SpecQuadrantGrid vehicle={vehicle} />

        {/* ─── 5. DUAL CONTEXT CARDS: LAST ACTIVITY & LOCATION (Screen 4) ─── */}
        <View style={styles.dualCardsRow}>
          <LastActivityCard vehicle={vehicle} />
          <LocationMiniCard vehicle={vehicle} />
        </View>

        {/* ─── 6. FULL SPECIFICATIONS TRIGGER (Moved from 360 page to Car Details bottom) ─── */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View full specifications"
          onPress={() => setShowFullSpecs(true)}
          style={({ pressed }) => [
            styles.fullSpecsBar,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            pressed && { opacity: 0.9 },
          ]}
        >
          <View style={styles.fullSpecsBarLeft}>
            <View style={[styles.fullSpecsIconWrap, { backgroundColor: colors.isDark ? 'rgba(177, 18, 38, 0.15)' : '#FDE8EB' }]}>
              <Feather name="file-text" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fullSpecsBarTitle, { color: colors.foreground }]}>
                Full Specifications
              </Text>
              <Text style={[styles.fullSpecsBarSub, { color: colors.mutedForeground }]}>
                Engine, transmission, wheels, dimensions & safety
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={19} color={colors.mutedForeground} />
        </Pressable>

        {/* ─── 7. HOST PROFILE CARD (Cross-Profile Visibility & Privacy Guard) ─── */}
        {host && (
          <View
            style={[
              styles.hostProfileContainer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.hostCardHeader}>
              <Image
                source={{ uri: host.profileImage || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg' }}
                contentFit="cover"
                style={styles.hostAvatar}
              />
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text numberOfLines={1} style={[styles.hostBusinessName, { color: colors.foreground }]}>
                    {host.businessName || `${host.fullName}'s Fleet`}
                  </Text>
                  <View style={[styles.verifiedPill, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                    <Text style={styles.verifiedPillText}>VERIFIED HOST</Text>
                  </View>
                </View>

                <Text style={[styles.hostMeta, { color: colors.mutedForeground }]}>
                  {host.fullName} • {host.city}
                </Text>

                <View style={styles.hostTrustRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Feather name="star" size={12} color={colors.star} />
                    <Text style={[styles.hostRatingText, { color: colors.foreground }]}>4.95</Text>
                  </View>
                  <Text style={[styles.hostDot, { color: colors.mutedForeground }]}>•</Text>
                  <Text style={[styles.hostTripsText, { color: colors.mutedForeground }]}>
                    24 Trips Hosted
                  </Text>
                </View>
              </View>
            </View>


            {/* View Host Profile CTA */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View full public profile of ${host.fullName}`}
              onPress={() => router.push(`/owners/${host.slug}`)}
              style={[
                styles.viewHostBtn,
                { backgroundColor: colors.isDark ? '#1C232E' : '#F1F5F9', borderColor: colors.border },
              ]}
            >
              <Text style={[styles.viewHostBtnText, { color: colors.foreground }]}>
                View Host Profile & Fleet
              </Text>
              <Feather name="arrow-right" size={14} color={colors.foreground} />
            </Pressable>
          </View>
        )}
      </Page>

      {/* ─── 4. BOTTOM ACTION DOCK (Screen 4: Price pill left + Book now right) ─── */}
      <View
        style={[
          styles.bottomDock,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderTopWidth: 1,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        {/* Left: Price pill tag matching Screen 4 */}
        <View
          style={[
            styles.screen4PricePill,
            { backgroundColor: colors.isDark ? '#1C1C1C' : '#F4F5F7' },
          ]}
        >
          <Text style={[styles.screen4PriceNum, { color: colors.foreground }]}>
            {vehicle.pricePerDay}$
          </Text>
          <Text style={[styles.screen4PricePerDay, { color: colors.mutedForeground }]}>
            / a day
          </Text>
        </View>

        {/* Right: Book now button (Active for Renters, Disabled/Hidden for Hosts) */}
        {user?.role === 'host' ? (
          <View
            style={[
              styles.hostBrowsingBadge,
              {
                backgroundColor: colors.isDark ? '#1C232E' : '#F1F5F9',
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="shield" size={13} color={colors.mutedForeground} />
            <Text style={[styles.hostBrowsingBadgeText, { color: colors.mutedForeground }]}>
              Host View • Browsing Only
            </Text>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={cannotBook ? 'Vehicle unavailable' : `Book ${vehicle.brand} ${vehicle.model} now`}
            onPress={handleProceedBooking}
            disabled={cannotBook}
            style={({ pressed }) => [
              styles.screen4BookNowBtn,
              { backgroundColor: cannotBook ? colors.border : colors.primary },
              pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
            ]}
          >
            <Text style={styles.screen4BookNowText}>
              {cannotBook ? 'Unavailable' : 'Book now'}
            </Text>
          </Pressable>
        )}
      </View>



      {/* ─── FULL SPECIFICATIONS MODAL (Moved from 360 page) ─── */}
      <Modal
        visible={showFullSpecs}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFullSpecs(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.reserveModalSheet,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                paddingBottom: Math.max(insets.bottom, 20) + 12,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalEyebrow, { color: colors.primary }]}>TECHNICAL SPECIFICATIONS</Text>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                  {vehicle.brand} {vehicle.model}
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.mutedForeground }]}>
                  Verified Technical Data & Capabilities
                </Text>
              </View>
              <Pressable
                onPress={() => setShowFullSpecs(false)}
                hitSlop={12}
                style={[styles.closeCircleBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              >
                <Feather name="x" size={18} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420, marginTop: 10 }}>
              <ModalSpecRow label="Engine Type" value={engineVal} />
              <ModalSpecRow label="Max Power" value={powerVal} />
              <ModalSpecRow label="Transmission" value={transmissionVal} />
              <ModalSpecRow label="Fuel Type" value={fuelVal} />
              <ModalSpecRow label="Mileage / Usage" value={mileageVal} />
              <ModalSpecRow label="Wheels & Tires" value={wheelsVal} />
              <ModalSpecRow label="Seating Capacity" value={seatsVal} />
              <ModalSpecRow label="Body Category" value={vehicle.category} />
              <ModalSpecRow label="Location" value={vehicle.location} />
              <ModalSpecRow label="Verified Provider" value={vehicle.provider || 'DriveFlex Verified Host'} />
              {vehicle.features?.length ? (
                <ModalSpecRow label="Key Highlights" value={vehicle.features.join(', ')} />
              ) : null}
            </ScrollView>

            <Pressable
              accessibilityRole="button"
              onPress={() => setShowFullSpecs(false)}
              style={[styles.closeModalPrimaryBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.closeModalPrimaryBtnText}>Close Specifications</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

function SpecLine({
  icon,
  label,
  val,
  colors,
  isLast = false,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  val: string;
  colors: any;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.specLine, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <View style={styles.specLabelWrap}>
        <Feather name={icon} size={15} color={colors.accent} />
        <Text style={[styles.specLineLabel, { color: colors.mutedForeground }]}>{label}</Text>
      </View>
      <Text style={[styles.specLineVal, { color: colors.foreground }]}>{val}</Text>
    </View>
  );
}

function RuleItem({
  icon,
  title,
  desc,
  colors,
  isLast = false,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  desc: string;
  colors: any;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.ruleRow, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <View style={[styles.ruleIconWrap, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={15} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.ruleTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.ruleDesc, { color: colors.mutedForeground }]}>{desc}</Text>
      </View>
    </View>
  );
}

function ModalSpecRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.modalSpecRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.modalSpecRowLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.modalSpecRowVal, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

function dateAfterFrom(dateString: string, days: number) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  heroImageFrame: {
    height: 240,
    borderRadius: 26,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  verifiedTag: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  galleryStrip: {
    gap: 8,
    paddingBottom: 6,
    marginBottom: 14,
  },
  galleryThumb: {
    width: 60,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
  },
  galleryThumbImg: {
    width: '100%',
    height: '100%',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  carName: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  reviewsCount: {
    fontSize: 12,
  },
  metaDot: {
    fontSize: 12,
  },
  metaLocation: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  priceBig: {
    fontSize: 24,
    fontWeight: '800',
  },
  pricePerDay: {
    fontSize: 11,
  },

  /* Segmented Tabs (From Screen 2) */
  tabSegmentBar: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 4,
    marginBottom: 16,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabContent: {
    marginBottom: 16,
  },

  /* Highlights Box (Tab 1) */
  highlightsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  highlightBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  highlightValue: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  highlightLabel: {
    fontSize: 10,
  },
  sectionSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
  },

  /* Specs Table (Tab 2) */
  specCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  specLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  specLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specLineLabel: {
    fontSize: 13,
  },
  specLineVal: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* Host & Rules (Tab 3) */
  hostBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
  },
  hostTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  hostDetails: {
    fontSize: 11,
    marginTop: 2,
  },
  rulesCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
  },
  rulesHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
  },
  ruleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  ruleDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },

  /* Bottom Fixed Dock */
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingTop: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  dockPriceCol: {
    justifyContent: 'center',
  },
  dockRateRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  dockPriceNum: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  dockPriceUnit: {
    fontSize: 13,
    fontWeight: '600',
  },
  dockInstantTag: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  dockReserveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 26,
    height: 50,
    borderRadius: 16,
  },
  dockReserveBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },

  /* Dedicated Reservation Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  reserveModalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 20,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  closeCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 3,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  formSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  datesCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    marginBottom: 6,
  },
  datesChoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  dateChoiceBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateMiniLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  dateValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dateValText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dateArrow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarPrompt: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  calendarCell: {
    width: '22%',
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellDate: {
    fontSize: 12,
    fontWeight: '800',
  },
  cellDay: {
    fontSize: 10,
    marginTop: 2,
  },

  /* Cost Breakdown */
  calcBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  calcLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calcLabel: {
    fontSize: 12,
  },
  calcVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  calcFree: {
    fontSize: 12,
    fontWeight: '800',
  },
  calcDivider: {
    height: 1,
    marginVertical: 2,
  },
  calcTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  calcTotalVal: {
    fontSize: 17,
    fontWeight: '800',
  },
  unavailAlert: {
    fontSize: 12,
    fontWeight: '700',
    marginVertical: 4,
  },
  bookingNote: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },

  /* Full Specifications Trigger & Modal Styles */
  fullSpecsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
    marginBottom: 20,
  },
  fullSpecsBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fullSpecsIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullSpecsBarTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  fullSpecsBarSub: {
    fontSize: 12,
    marginTop: 2,
  },
  modalSpecRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalSpecRowLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalSpecRowVal: {
    fontSize: 13,
    fontWeight: '700',
    maxWidth: '55%',
    textAlign: 'right',
  },
  closeModalPrimaryBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeModalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  screen4HeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 4,
  },
  screen4Year: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  screen4Title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  screen4RatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  screen4RatingText: {
    fontSize: 14,
    fontWeight: '800',
  },
  dualCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 14,
  },
  screen4PricePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 4,
  },
  screen4PriceNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  screen4PricePerDay: {
    fontSize: 12,
  },
  screen4BookNowBtn: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screen4BookNowText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  hostInspectionDock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 4,
  },
  hostInspectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  hostInspectionNotice: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  hostCompareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  hostCompareBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  hostProfileContainer: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  hostCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hostAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  hostBusinessName: {
    fontSize: 15,
    fontWeight: '800',
    maxWidth: '65%',
  },
  verifiedPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedPillText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
  },
  hostMeta: {
    fontSize: 12,
  },
  hostTrustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  hostRatingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  hostDot: {
    fontSize: 12,
  },
  hostTripsText: {
    fontSize: 12,
  },
  privacyShieldNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  privacyNoticeText: {
    fontSize: 11,
    flex: 1,
  },
  viewHostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  viewHostBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* Renter Booking Workflow Card */
  renterBookingCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    gap: 14,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  bookingCardEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  bookingCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  bookingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  bookingPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  datesSelectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  dateBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateBoxLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  dateBoxValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  dateBoxTime: {
    fontSize: 11,
  },
  dateArrowWrap: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationPresetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationPresetsLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  durationChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  durationChipText: {
    fontSize: 11,
  },
  priceBreakdownBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  priceBreakdownTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  calcFreeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  calcTotalLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  renterCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 2,
  },
  renterCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  /* Host View Badge */
  hostBrowsingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
  },
  hostBrowsingBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
});