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
  ActionButton,
  Avatar,
  Field,
  Notice,
  Page,
  Pill,
} from '@/components/Marketplace';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDriveFlex } from '@/context/AppContext';
import { owners } from '@/data/catalog';
import { dateAfter, dateIsUnavailable, daysBetween, rangeIsUnavailable, shortDate } from '@/lib/dates';
import { useColors } from '@/hooks/useColors';

type DetailTab = 'overview' | 'specs' | 'policies';

export default function VehicleDetailsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { vehicles, session, apiError, createBooking, favorites, toggleFavorite, bookings } = useDriveFlex();

  const vehicle = vehicles.find((item) => item.slug === slug || item.id === slug);
  const host = vehicle ? owners.find((item) => item.id === vehicle.ownerId) : undefined;

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [pickup, setPickup] = useState(dateAfter(3));
  const [returnDate, setReturnDate] = useState(dateAfter(5));
  const [selecting, setSelecting] = useState<'pickup' | 'returnDate'>('pickup');
  const [reserveModalVisible, setReserveModalVisible] = useState(false);
  const [customer, setCustomer] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const isFavorite = vehicle ? favorites.includes(vehicle.id) : false;
  const days = daysBetween(pickup, returnDate);
  const total = vehicle ? days * vehicle.pricePerDay : 0;
  const calendar = useMemo(() => Array.from({ length: 35 }, (_, index) => dateAfter(index)), []);

  if (!vehicle) {
    return (
      <Page>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 24 }} accessibilityRole="button">
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

  const unavailable = rangeIsUnavailable(vehicle, pickup, returnDate)
    || bookings.some((booking) => {
      if (booking.vehicleId !== vehicle.id || booking.status.toLowerCase() === 'cancelled') return false;
      const start = new Date(`${pickup}T12:00:00`).getTime();
      const end = new Date(`${returnDate}T12:00:00`).getTime();
      const bookedStart = new Date(`${booking.pickup}T12:00:00`).getTime();
      const bookedEnd = new Date(`${booking.returnDate}T12:00:00`).getTime();
      return start < bookedEnd && end > bookedStart;
    });

  const cannotBook = vehicle.bookable === false
    && !vehicle.currentBooking
    && !vehicle.rentalPeriods?.length;

  const nextDay = (d: string) => {
    const dt = new Date(`${d}T12:00:00`);
    dt.setDate(dt.getDate() + 1);
    return `${dt.getFullYear()}-${`${dt.getMonth() + 1}`.padStart(2, '0')}-${`${dt.getDate()}`.padStart(2, '0')}`;
  };

  const setDate = (date: string) => {
    if (dateIsUnavailable(vehicle, date)) return;
    if (selecting === 'pickup') {
      setPickup(date);
      if (date >= returnDate) setReturnDate(nextDay(date));
    } else if (date > pickup) {
      setReturnDate(date);
    } else {
      Alert.alert('Choose a later return date', 'Your return date must be after pick-up.');
      return;
    }
  };

  const submitBooking = async () => {
    if (cannotBook) {
      Alert.alert('Already booked', 'This vehicle is currently marked as booked by its owner.');
      return;
    }
    if (!pickup || !returnDate || days < 1) {
      Alert.alert('Choose your dates', 'Select a pick-up and return date to continue.');
      return;
    }
    if (unavailable) {
      Alert.alert('Those dates are unavailable', 'Choose another date range for this car.');
      return;
    }
    const customerName = customer.trim() || session?.name || '';
    if (!customerName) {
      Alert.alert('Add your name', 'Enter the renter name for this reservation.');
      return;
    }
    setSaving(true);
    try {
      const booking = await createBooking({
        vehicleId: vehicle.id,
        customer: customerName,
        pickup,
        returnDate,
        totalAmount: total,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setReserveModalVisible(false);
      setCustomer('');
      Alert.alert(
        'Reservation Confirmed!',
        `Your reservation for ${vehicle.brand} ${vehicle.model} from ${shortDate(pickup)} to ${shortDate(returnDate)} is confirmed. Handover will be coordinated by the host.`,
        [
          { text: 'View in Profile', onPress: () => router.push('/(tabs)/profile') },
          { text: 'Done', style: 'cancel' },
        ]
      );
      void booking;
    } catch (error) {
      Alert.alert('Could not complete booking', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Page contentStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 90 }}>
        {/* ─── 1. TOP NAVIGATION BAR ─── */}
        <View style={styles.navBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={[styles.circleBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="arrow-left" size={19} color={colors.foreground} />
          </Pressable>

          <Text style={[styles.navTitle, { color: colors.foreground }]}>Vehicle Details</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Remove from shortlist' : 'Save to shortlist'}
            onPress={() => void toggleFavorite(vehicle.id)}
            style={[styles.circleBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="heart" size={19} color={isFavorite ? colors.primary : colors.foreground} />
          </Pressable>
        </View>

        {/* ─── 2. HERO IMAGE SHOWCASE (Clean rounded frame) ─── */}
        <View style={[styles.heroImageFrame, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Image source={{ uri: currentImage }} contentFit="cover" style={styles.heroImage} transition={200} />
          <View style={[styles.categoryBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.categoryBadgeText, { color: colors.foreground }]}>{vehicle.category.toUpperCase()}</Text>
          </View>
          <View style={[styles.verifiedTag, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="shield" size={12} color={colors.star} />
            <Text style={[styles.verifiedText, { color: colors.foreground }]}>VERIFIED HOST</Text>
          </View>
        </View>

        {/* Gallery angle thumbnails if multiple photos exist */}
        {gallery.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryStrip}>
            {gallery.map((img, idx) => (
              <Pressable
                key={idx}
                onPress={() => setSelectedImageIndex(idx)}
                style={[
                  styles.galleryThumb,
                  {
                    borderColor: selectedImageIndex === idx ? colors.accent : colors.border,
                    borderWidth: selectedImageIndex === idx ? 2 : 1,
                  },
                ]}
              >
                <Image source={{ uri: img }} contentFit="cover" style={styles.galleryThumbImg} />
              </Pressable>
            ))}
          </ScrollView>
        )}

        {apiError && <Notice text={`Live vehicle data unavailable. ${apiError}`} />}

        {/* ─── 3. CAR TITLE, RATING & PRICE ─── */}
        <View style={styles.titleSection}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.carName, { color: colors.foreground }]}>
              {vehicle.brand} {vehicle.model}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.ratingBadge}>
                <Feather name="star" size={13} color={colors.star} />
                <Text style={[styles.ratingVal, { color: colors.foreground }]}>{vehicle.rating.toFixed(1)}</Text>
                <Text style={[styles.reviewsCount, { color: colors.mutedForeground }]}>({vehicle.reviewCount} reviews)</Text>
              </View>
              <Text style={[styles.metaDot, { color: colors.mutedForeground }]}>·</Text>
              <Text style={[styles.metaLocation, { color: colors.mutedForeground }]}>
                {vehicle.location.split(',')[0]}
              </Text>
            </View>
          </View>

          <View style={styles.priceColumn}>
            <Text style={[styles.priceBig, { color: colors.foreground }]}>${vehicle.pricePerDay}</Text>
            <Text style={[styles.pricePerDay, { color: colors.mutedForeground }]}>per day</Text>
          </View>
        </View>

        {/* ─── 4. SEGMENTED TABS (Overview, Specs, Policies - From Screen 2) ─── */}
        <View style={[styles.tabSegmentBar, { backgroundColor: colors.secondary }]}>
          <Pressable
            accessibilityRole="tab"
            onPress={() => setActiveTab('overview')}
            style={[
              styles.segmentTab,
              activeTab === 'overview' && { backgroundColor: colors.darkCard },
            ]}
          >
            <Text
              style={[
                styles.segmentTabText,
                { color: activeTab === 'overview' ? '#ffffff' : colors.mutedForeground },
              ]}
            >
              Overview
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="tab"
            onPress={() => setActiveTab('specs')}
            style={[
              styles.segmentTab,
              activeTab === 'specs' && { backgroundColor: colors.darkCard },
            ]}
          >
            <Text
              style={[
                styles.segmentTabText,
                { color: activeTab === 'specs' ? '#ffffff' : colors.mutedForeground },
              ]}
            >
              Specifications
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="tab"
            onPress={() => setActiveTab('policies')}
            style={[
              styles.segmentTab,
              activeTab === 'policies' && { backgroundColor: colors.darkCard },
            ]}
          >
            <Text
              style={[
                styles.segmentTabText,
                { color: activeTab === 'policies' ? '#ffffff' : colors.mutedForeground },
              ]}
            >
              Host & Rules
            </Text>
          </Pressable>
        </View>

        {/* ─── TAB 1: OVERVIEW ─── */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            {/* Quick 3 Highlight Cards */}
            <View style={styles.highlightsRow}>
              <View style={[styles.highlightBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="settings" size={17} color={colors.accent} />
                <Text style={[styles.highlightValue, { color: colors.foreground }]}>{vehicle.transmission}</Text>
                <Text style={[styles.highlightLabel, { color: colors.mutedForeground }]}>Gearbox</Text>
              </View>

              <View style={[styles.highlightBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="users" size={17} color={colors.accent} />
                <Text style={[styles.highlightValue, { color: colors.foreground }]}>{vehicle.seats} Seats</Text>
                <Text style={[styles.highlightLabel, { color: colors.mutedForeground }]}>Capacity</Text>
              </View>

              <View style={[styles.highlightBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="zap" size={17} color={colors.accent} />
                <Text style={[styles.highlightValue, { color: colors.foreground }]}>{vehicle.fuelType}</Text>
                <Text style={[styles.highlightLabel, { color: colors.mutedForeground }]}>Fuel</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>ABOUT THIS VEHICLE</Text>
            <Text style={[styles.descriptionText, { color: colors.foreground }]}>
              {vehicle.description}
            </Text>

            {/* Key Features */}
            <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground, marginTop: 18 }]}>KEY FEATURES</Text>
            <View style={styles.featuresList}>
              {(vehicle.features ?? ['Free Handover', 'Sanitized & Cleaned', 'Bluetooth Audio', 'Air Conditioning', 'ABS Airbags']).map((feat) => (
                <View key={feat} style={[styles.featureChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Feather name="check" size={13} color={colors.accent} />
                  <Text style={[styles.featureText, { color: colors.foreground }]}>{feat}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ─── TAB 2: SPECIFICATIONS ─── */}
        {activeTab === 'specs' && (
          <View style={styles.tabContent}>
            <View style={[styles.specCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <SpecLine icon="sliders" label="Transmission" val={vehicle.transmission} colors={colors} />
              <SpecLine icon="users" label="Seating" val={`${vehicle.seats} Passengers`} colors={colors} />
              <SpecLine icon="droplet" label="Fuel Type" val={vehicle.fuelType} colors={colors} />
              <SpecLine icon="grid" label="Body Type" val={vehicle.category} colors={colors} />
              <SpecLine icon="map-pin" label="Registered City" val={vehicle.location} colors={colors} />
              <SpecLine icon="check-circle" label="Insurance" val="Standard Comprehensive" colors={colors} isLast />
            </View>
          </View>
        )}

        {/* ─── TAB 3: HOST & RULES ─── */}
        {activeTab === 'policies' && (
          <View style={styles.tabContent}>
            {host && (
              <Pressable
                onPress={() => router.push({ pathname: '/owners/[slug]', params: { slug: host.slug } })}
                style={[styles.hostBannerCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Avatar uri={host.profileImage} size={50} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.hostTitle, { color: colors.foreground }]}>{host.businessName}</Text>
                  <Text style={[styles.hostDetails, { color: colors.mutedForeground }]}>
                    {host.city} · {host.yearsExperience} years hosting on DriveFlex
                  </Text>
                </View>
                {host.verified && <Feather name="check-circle" size={19} color={colors.accent} />}
              </Pressable>
            )}

            <View style={[styles.rulesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.rulesHeading, { color: colors.foreground }]}>Rental Guidelines</Text>
              <RuleItem icon="award" title="Driver Age" desc="Minimum 21 years old with valid driving license." colors={colors} />
              <RuleItem icon="file-text" title="Documentation" desc="Original CNIC / Passport required at handover." colors={colors} />
              <RuleItem icon="repeat" title="Fuel Policy" desc="Same-to-same fuel level handover." colors={colors} />
              <RuleItem icon="clock" title="Free Cancellation" desc="Full refund up to 24 hours before pickup time." colors={colors} isLast />
            </View>
          </View>
        )}

      </Page>

      {/* ─── 4. BOTTOM ACTION DOCK (Price & Reserve Button ONLY) ─── */}
      <View
        style={[
          styles.bottomDock,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        <View style={styles.dockPriceCol}>
          <View style={styles.dockRateRow}>
            <Text style={[styles.dockPriceNum, { color: colors.foreground }]}>${vehicle.pricePerDay}</Text>
            <Text style={[styles.dockPriceUnit, { color: colors.mutedForeground }]}>/day</Text>
          </View>
          <Text style={[styles.dockInstantTag, { color: colors.accent }]}>⚡ Instant confirmation</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={cannotBook ? 'Vehicle unavailable' : `Reserve ${vehicle.brand} ${vehicle.model}`}
          onPress={() => {
            if (cannotBook) {
              Alert.alert('Unavailable', 'This vehicle is currently marked as unavailable for booking.');
              return;
            }
            setReserveModalVisible(true);
          }}
          disabled={cannotBook}
          style={[
            styles.dockReserveBtn,
            { backgroundColor: cannotBook ? colors.border : colors.accent },
          ]}
        >
          <Text style={[styles.dockReserveBtnText, { color: colors.accentForeground }]}>
            {cannotBook ? 'Unavailable' : 'Reserve'}
          </Text>
          {!cannotBook && <Feather name="arrow-right" size={17} color={colors.accentForeground} />}
        </Pressable>
      </View>

      {/* ─── 5. DEDICATED SEPARATE RESERVATION FORM MODAL ─── */}
      <Modal
        visible={reserveModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReserveModalVisible(false)}
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
            {/* Sheet Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalEyebrow, { color: colors.accent }]}>RESERVATION FORM</Text>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                  {vehicle.brand} {vehicle.model}
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.mutedForeground }]}>
                  ${vehicle.pricePerDay}/day · {vehicle.location.split(',')[0]}
                </Text>
              </View>
              <Pressable
                onPress={() => setReserveModalVisible(false)}
                hitSlop={12}
                style={[styles.closeCircleBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              >
                <Feather name="x" size={18} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
              {/* Step 1: Select Rental Dates */}
              <Text style={[styles.formSectionLabel, { color: colors.mutedForeground }]}>1. SELECT RENTAL DATES</Text>
              <View style={[styles.datesCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <View style={styles.datesChoiceRow}>
                  <Pressable
                    onPress={() => setSelecting('pickup')}
                    style={[
                      styles.dateChoiceBtn,
                      selecting === 'pickup' && { borderColor: colors.accent, backgroundColor: colors.card },
                    ]}
                  >
                    <Text style={[styles.dateMiniLabel, { color: colors.mutedForeground }]}>PICK-UP DATE</Text>
                    <View style={styles.dateValRow}>
                      <Feather name="calendar" size={14} color={colors.accent} />
                      <Text style={[styles.dateValText, { color: colors.foreground }]}>{shortDate(pickup)}</Text>
                    </View>
                  </Pressable>

                  <View style={styles.dateArrow}>
                    <Feather name="arrow-right" size={15} color={colors.mutedForeground} />
                  </View>

                  <Pressable
                    onPress={() => setSelecting('returnDate')}
                    style={[
                      styles.dateChoiceBtn,
                      selecting === 'returnDate' && { borderColor: colors.accent, backgroundColor: colors.card },
                    ]}
                  >
                    <Text style={[styles.dateMiniLabel, { color: colors.mutedForeground }]}>RETURN DATE</Text>
                    <View style={styles.dateValRow}>
                      <Feather name="calendar" size={14} color={colors.accent} />
                      <Text style={[styles.dateValText, { color: colors.foreground }]}>{shortDate(returnDate)}</Text>
                    </View>
                  </Pressable>
                </View>

                {/* Calendar date grid for active selection */}
                <Text style={[styles.calendarPrompt, { color: colors.mutedForeground }]}>
                  Choose {selecting === 'pickup' ? 'Pick-up Day' : 'Return Day'}:
                </Text>
                <View style={styles.calendarGrid}>
                  {calendar.slice(0, 14).map((date) => {
                    const isSelected = selecting === 'pickup' ? date === pickup : date === returnDate;
                    const isPastOrBlocked = dateIsUnavailable(vehicle, date);
                    return (
                      <Pressable
                        key={date}
                        disabled={isPastOrBlocked}
                        onPress={() => setDate(date)}
                        style={[
                          styles.calendarCell,
                          {
                            backgroundColor: isSelected ? colors.accent : colors.card,
                            borderColor: isSelected ? colors.accent : colors.border,
                            opacity: isPastOrBlocked ? 0.35 : 1,
                          },
                        ]}
                      >
                        <Text style={[styles.cellDate, { color: isSelected ? '#ffffff' : colors.foreground }]}>
                          {shortDate(date).split(' ')[0]}
                        </Text>
                        <Text style={[styles.cellDay, { color: isSelected ? 'rgba(255,255,255,0.85)' : colors.mutedForeground }]}>
                          {shortDate(date).split(' ')[1]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Step 2: Renter Details */}
              <Text style={[styles.formSectionLabel, { color: colors.mutedForeground, marginTop: 16 }]}>
                2. RENTER DETAILS
              </Text>
              <Field
                label="Full Name"
                value={customer || session?.name || ''}
                onChangeText={setCustomer}
                placeholder="Full name as per CNIC / Driving License"
              />

              <Field
                label="Contact / WhatsApp (Optional)"
                value={customerPhone}
                onChangeText={setCustomerPhone}
                placeholder="For handover coordination"
              />

              {/* Step 3: Transparent Cost Calculation */}
              <Text style={[styles.formSectionLabel, { color: colors.mutedForeground, marginTop: 16 }]}>
                3. COST ESTIMATION
              </Text>
              <View style={[styles.calcBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <View style={styles.calcLine}>
                  <Text style={[styles.calcLabel, { color: colors.mutedForeground }]}>
                    {days || 0} {days === 1 ? 'day' : 'days'} × ${vehicle.pricePerDay}
                  </Text>
                  <Text style={[styles.calcVal, { color: colors.foreground }]}>${total}</Text>
                </View>
                <View style={styles.calcLine}>
                  <Text style={[styles.calcLabel, { color: colors.mutedForeground }]}>Handover & Inspection Fee</Text>
                  <Text style={[styles.calcFree, { color: colors.accent }]}>FREE</Text>
                </View>
                <View style={[styles.calcDivider, { backgroundColor: colors.border }]} />
                <View style={styles.calcLine}>
                  <Text style={[styles.calcTotalLabel, { color: colors.foreground }]}>Estimated Total</Text>
                  <Text style={[styles.calcTotalVal, { color: colors.foreground }]}>${total}</Text>
                </View>
              </View>

              {unavailable && (
                <Text style={[styles.unavailAlert, { color: colors.destructive }]}>
                  ⚠️ Dates overlap an existing reservation. Please select different dates.
                </Text>
              )}

              <Text style={[styles.bookingNote, { color: colors.mutedForeground, marginVertical: 12 }]}>
                No immediate payment required today. Coordinate payment directly with host upon inspection.
              </Text>

              {/* Confirm Reservation Action */}
              <ActionButton
                title={saving ? 'Confirming reservation…' : `Confirm Reservation · $${total}`}
                onPress={() => void submitBooking()}
                disabled={saving || cannotBook || days < 1 || unavailable}
                icon="arrow-right"
              />
            </ScrollView>
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
});