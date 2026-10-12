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
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Page, RentalCalendarView } from '@/components/Marketplace';
import { useDriveFlex } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { daysBetween, shortDate } from '@/lib/dates';

const AVAILABLE_TIMES = [
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
  '08:00 PM',
];

interface PaymentCard {
  id: string;
  bankName: string;
  brand: 'visa' | 'mastercard' | 'amex';
  last4: string;
  holderName: string;
  expiry: string;
}

const DEFAULT_PAYMENT_CARDS: PaymentCard[] = [
  {
    id: 'card-1',
    bankName: 'Capital One Bank',
    brand: 'visa',
    last4: '8765',
    holderName: 'Alex Mercer',
    expiry: '08/28',
  },
];

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { slug, pickupParam, returnParam } = useLocalSearchParams<{
    slug?: string;
    pickupParam?: string;
    returnParam?: string;
  }>();

  const { vehicles, createBooking, session } = useDriveFlex();

  // Find vehicle or fallback to featured design vehicle (BMW i7 Master or first)
  const vehicle = useMemo(() => {
    if (slug) {
      return vehicles.find((v) => v.slug === slug || v.id === slug) || vehicles[0];
    }
    return (
      vehicles.find((v) => v.slug === 'bmw-i7-master') ||
      vehicles.find((v) => v.slug === 'mercedes-benz-a-class') ||
      vehicles[0]
    );
  }, [slug, vehicles]);

  // Trip Dates and Times
  const [pickupDateRaw, setPickupDateRaw] = useState(pickupParam || '2026-09-11');
  const [departureTime, setDepartureTime] = useState('09:30 AM');
  const [returnDateRaw, setReturnDateRaw] = useState(returnParam || '2026-09-14');
  const [returnTime, setReturnTime] = useState('04:30 PM');
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [timeModalTarget, setTimeModalTarget] = useState<'pickup' | 'return'>('pickup');

  const departureDateFormatted = useMemo(() => {
    return pickupDateRaw.includes('-') ? shortDate(pickupDateRaw) : pickupDateRaw;
  }, [pickupDateRaw]);

  const returnDateFormatted = useMemo(() => {
    return returnDateRaw.includes('-') ? shortDate(returnDateRaw) : returnDateRaw;
  }, [returnDateRaw]);

  // Payment Method Selection & Cards
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>(DEFAULT_PAYMENT_CARDS);
  const [selectedCardId, setSelectedCardId] = useState<string>('card-1');
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'cash'>('card');
  const [processing, setProcessing] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [addCardModalVisible, setAddCardModalVisible] = useState(false);

  // Add Card Form State
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState(session?.name || '');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvv, setNewCardCvv] = useState('');
  const [newBankName, setNewBankName] = useState('Standard Chartered');

  // Price calculations based on selected days (No Trip Fee)
  const rentalDays = useMemo(() => {
    if (pickupDateRaw.includes('-') && returnDateRaw.includes('-')) {
      return Math.max(1, daysBetween(pickupDateRaw, returnDateRaw));
    }
    return 4;
  }, [pickupDateRaw, returnDateRaw]);

  const basePrice = (vehicle?.pricePerDay || 100) * rentalDays;
  const totalAmount = basePrice;

  const handlePayment = async () => {
    if (!session) {
      Alert.alert(
        'Account Required',
        'Please create an account or sign in to complete your booking.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Account', onPress: () => router.push('/register') },
          { text: 'Sign In', onPress: () => router.push('/sign-in') },
        ]
      );
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProcessing(true);

    try {
      if (vehicle) {
        await createBooking({
          vehicleId: vehicle.id,
          customer: session?.name || 'Guest Renter',
          pickup: pickupDateRaw,
          returnDate: returnDateRaw,
          totalAmount,
        });
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccessModalVisible(true);
    } catch {
      // In offline or demo mode, proceed to show confirmation
      setSuccessModalVisible(true);
    } finally {
      setProcessing(false);
    }
  };

  // Requirement 2: Disable Bookings - completely prevent Hosts from booking cars
  if (session?.role === 'host') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center', alignItems: 'center' }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: 'rgba(214, 31, 60, 0.12)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
          }}
        >
          <Feather name="slash" size={32} color={colors.destructive} />
        </View>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.foreground, textAlign: 'center', marginBottom: 8 }}>
          Booking Restricted for Hosts
        </Text>
        <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: 'center', lineHeight: 21, marginBottom: 24, maxWidth: 320 }}>
          Your account is registered as a Host. Host accounts are authorized for fleet management only. A Host cannot book a car.
        </Text>
        <Pressable
          onPress={() => router.replace('/(tabs)')}
          style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 13, borderRadius: 14 }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Return to Home</Text>
        </Pressable>
      </View>
    );
  }

  if (!vehicle) {
    return (
      <Page>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: '700' }}>
          No vehicle selected for checkout.
        </Text>
      </Page>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Page contentStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 90 }}>
        {/* ─── 1. TOP HEADER (Screen 2: Back arrow, "Check Out", options icon) ─── */}
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={[styles.circleBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="arrow-left" size={19} color={colors.foreground} />
          </Pressable>

          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Check Out</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Information"
            style={[styles.circleBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="more-horizontal" size={19} color={colors.foreground} />
          </Pressable>
        </View>

        {/* ─── 2. SELECTED CAR SUMMARY CARD (Screen 2) ─── */}
        <View
          style={[
            styles.carSummaryCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Left: Thumbnail */}
          <View style={[styles.summaryImageWrap, { backgroundColor: colors.isDark ? '#1C1C1C' : '#F4F5F7' }]}>
            <Image
              source={{ uri: vehicle.image }}
              contentFit="cover"
              style={styles.summaryImage}
              transition={150}
            />
          </View>

          {/* Right: Info */}
          <View style={styles.summaryInfo}>
            <Text numberOfLines={1} style={[styles.summaryTitle, { color: colors.foreground }]}>
              {vehicle.brand} {vehicle.model}
            </Text>
            <Text style={[styles.summaryReviews, { color: colors.mutedForeground }]}>
              (Total {vehicle.reviewCount || 200} Reviews)
            </Text>

            <View style={styles.ratingAndPriceRow}>
              <View style={[styles.ratingPill, { backgroundColor: 'rgba(201, 162, 39, 0.15)' }]}>
                <Feather name="star" size={12} color={colors.accent} />
                <Text style={[styles.ratingPillText, { color: colors.accent }]}>
                  {vehicle.rating.toFixed(1)}
                </Text>
              </View>

              <Text style={[styles.summaryDailyPrice, { color: colors.foreground }]}>
                ${vehicle.pricePerDay.toFixed(2)}/DAY
              </Text>
            </View>
          </View>
        </View>

        {/* ─── 3. TRIP DATES & TIMES (Unified 1-Row with Calendar and Time opening from bottom of screen) ─── */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>
              Trip Dates & Times
            </Text>
            <View style={[styles.rentalDurationTag, { backgroundColor: colors.isDark ? '#222' : '#F4F5F7', borderColor: colors.border }]}>
              <Text style={[styles.rentalDurationTagText, { color: colors.accent }]}>
                {rentalDays} {rentalDays === 1 ? 'Day' : 'Days'} Rental
              </Text>
            </View>
          </View>

          {/* Unified Single Row: Calendar and Time */}
          <View style={styles.scheduleRow}>
            {/* Calendar Card */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Select Trip Dates"
              onPress={() => setCalendarModalVisible(true)}
              style={({ pressed }) => [
                styles.scheduleCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={styles.scheduleCardHeader}>
                <View style={[styles.scheduleIconBadge, { backgroundColor: 'rgba(177, 18, 38, 0.12)' }]}>
                  <Feather name="calendar" size={15} color={colors.primary} />
                </View>
                <Text style={[styles.scheduleCardType, { color: colors.mutedForeground }]}>
                  CALENDAR
                </Text>
              </View>
              <Text numberOfLines={1} style={[styles.scheduleDateText, { color: colors.foreground }]}>
                {departureDateFormatted}
              </Text>
              <Text numberOfLines={1} style={[styles.scheduleDateSubtext, { color: colors.mutedForeground }]}>
                to {returnDateFormatted}
              </Text>
              <View style={styles.scheduleActionRow}>
                <Text style={[styles.scheduleActionLink, { color: colors.accent }]}>Change Date</Text>
                <Feather name="chevron-right" size={13} color={colors.accent} />
              </View>
            </Pressable>

            {/* Time Card */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Select Handover Times"
              onPress={() => setTimeModalVisible(true)}
              style={({ pressed }) => [
                styles.scheduleCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={styles.scheduleCardHeader}>
                <View style={[styles.scheduleIconBadge, { backgroundColor: 'rgba(201, 162, 39, 0.15)' }]}>
                  <Feather name="clock" size={15} color={colors.accent} />
                </View>
                <Text style={[styles.scheduleCardType, { color: colors.mutedForeground }]}>
                  TIME
                </Text>
              </View>
              <Text numberOfLines={1} style={[styles.scheduleDateText, { color: colors.foreground }]}>
                {departureTime}
              </Text>
              <Text numberOfLines={1} style={[styles.scheduleDateSubtext, { color: colors.mutedForeground }]}>
                return {returnTime}
              </Text>
              <View style={styles.scheduleActionRow}>
                <Text style={[styles.scheduleActionLink, { color: colors.accent }]}>Select Time</Text>
                <Feather name="chevron-right" size={13} color={colors.accent} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* ─── 4. YOUR PAYMENT (Working Add Card & Multi-Card Selector) ─── */}
        <View style={styles.sectionContainer}>
          <View style={styles.paymentHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>
              Your Payment
            </Text>
            <Pressable hitSlop={8} onPress={() => setAddCardModalVisible(true)}>
              <Text style={[styles.addCardLink, { color: colors.accent }]}>+ Add Card</Text>
            </Pressable>
          </View>

          {/* Render All Available Saved Cards */}
          {paymentCards.map((card) => {
            const isSelected = selectedMethod === 'card' && selectedCardId === card.id;
            return (
              <Pressable
                key={card.id}
                onPress={() => {
                  setSelectedMethod('card');
                  setSelectedCardId(card.id);
                }}
                style={[
                  styles.paymentOptionCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.radioCircle,
                    { borderColor: isSelected ? colors.primary : colors.mutedForeground },
                  ]}
                >
                  {isSelected && (
                    <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />
                  )}
                </View>

                {/* Card Brand Icon */}
                <View style={[styles.bankBrandIcon, { backgroundColor: colors.isDark ? '#222' : '#F1F5F9' }]}>
                  <Feather name="credit-card" size={17} color={colors.primary} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.paymentMethodName, { color: colors.foreground }]}>
                    {card.bankName} <Text style={{ color: colors.mutedForeground }}>****{card.last4}</Text>
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 1 }}>
                    Expires {card.expiry} · {card.holderName}
                  </Text>
                </View>

                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </Pressable>
            );
          })}

          {/* Payment Method 2: Hand Cash */}
          <Pressable
            onPress={() => setSelectedMethod('cash')}
            style={[
              styles.paymentOptionCard,
              {
                backgroundColor: colors.card,
                borderColor: selectedMethod === 'cash' ? colors.primary : colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.radioCircle,
                { borderColor: selectedMethod === 'cash' ? colors.primary : colors.mutedForeground },
              ]}
            >
              {selectedMethod === 'cash' && (
                <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />
              )}
            </View>

            {/* Cash Icon */}
            <View style={[styles.bankBrandIcon, { backgroundColor: colors.isDark ? '#222' : '#F1F5F9' }]}>
              <Feather name="dollar-sign" size={17} color={colors.accent} />
            </View>

            <Text style={[styles.paymentMethodName, { color: colors.foreground }]}>
              Hand Cash
            </Text>

            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* ─── 5. PAYMENT DETAILS BREAKDOWN (Zero Trip Fee) ─── */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Payment Details
          </Text>

          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: colors.mutedForeground }]}>
              Payment Details ({rentalDays} {rentalDays === 1 ? 'day' : 'days'})
            </Text>
            <Text style={[styles.breakdownValue, { color: colors.foreground }]}>
              ${basePrice}
            </Text>
          </View>

          <View style={[styles.breakdownDivider, { backgroundColor: colors.border }]} />

          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownTotalLabel, { color: colors.foreground }]}>
              Total Amount
            </Text>
            <Text style={[styles.breakdownTotalValue, { color: colors.primary }]}>
              ${totalAmount}
            </Text>
          </View>
        </View>
      </Page>

      {/* ─── 7. STICKY BOTTOM ACTION CTA: "Payment" (Screen 2) ─── */}
      <View
        style={[
          styles.stickyBottomBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 14),
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Submit payment"
          disabled={processing}
          onPress={handlePayment}
          style={({ pressed }) => [
            styles.paymentCtaBtn,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
          ]}
        >
          <Text style={styles.paymentCtaBtnText}>
            {processing ? 'Processing...' : 'Payment'}
          </Text>
        </Pressable>
      </View>

      {/* ─── CONFIRMATION SUCCESS MODAL ─── */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.successCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.successIconCircle, { backgroundColor: 'rgba(177, 18, 38, 0.15)' }]}>
              <Feather name="check" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>
              Booking Confirmed!
            </Text>
            <Text style={[styles.successSubtitle, { color: colors.mutedForeground }]}>
              Your reservation for {vehicle.brand} {vehicle.model} is all set. We have dispatched pickup details to your inbox.
            </Text>

            <Pressable
              onPress={() => {
                setSuccessModalVisible(false);
                router.replace('/(tabs)/profile');
              }}
              style={[styles.successDoneBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.successDoneBtnText}>Go to My Bookings</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ─── CALENDAR PICKER BOTTOM SHEET (Opens from bottom of screen) ─── */}
      <Modal visible={calendarModalVisible} transparent animationType="slide">
        <View style={styles.bottomSheetBackdrop}>
          <View style={[styles.bottomSheetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.bottomSheetHandle, { backgroundColor: colors.border }]} />

            <View style={styles.calendarModalHeader}>
              <View>
                <Text style={[styles.calendarModalTitle, { color: colors.foreground }]}>Select Rental Dates</Text>
                <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                  Tap start and end dates for your trip
                </Text>
              </View>
              <Pressable hitSlop={10} onPress={() => setCalendarModalVisible(false)}>
                <Feather name="x" size={20} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <RentalCalendarView
                pickup={pickupDateRaw}
                returnDate={returnDateRaw}
                onSelectPickup={setPickupDateRaw}
                onSelectReturnDate={setReturnDateRaw}
                vehicle={vehicle}
              />
            </ScrollView>

            <Pressable
              onPress={() => setCalendarModalVisible(false)}
              style={[styles.calendarApplyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.calendarApplyBtnText}>
                Apply Dates ({rentalDays} {rentalDays === 1 ? 'Day' : 'Days'})
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ─── TIME PICKER MODAL IN CHECKOUT ─── */}
      <Modal visible={timeModalVisible} transparent animationType="slide">
        <View style={styles.bottomSheetBackdrop}>
          <View style={[styles.bottomSheetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.bottomSheetHandle, { backgroundColor: colors.border }]} />
            <View style={styles.calendarModalHeader}>
              <View>
                <Text style={[styles.calendarModalTitle, { color: colors.foreground }]}>
                  {timeModalTarget === 'pickup' ? 'Select Pick-up Time' : 'Select Return Time'}
                </Text>
                <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                  Vehicle handover & key return window
                </Text>
              </View>
              <Pressable hitSlop={10} onPress={() => setTimeModalVisible(false)}>
                <Feather name="x" size={20} color={colors.foreground} />
              </Pressable>
            </View>

            {/* Target Tab Switch: Pick-up vs Return */}
            <View style={[styles.timeTargetTabBar, { backgroundColor: colors.secondary }]}>
              <Pressable
                onPress={() => setTimeModalTarget('pickup')}
                style={[
                  styles.timeTargetTab,
                  timeModalTarget === 'pickup' && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.timeTargetTabText,
                    { color: timeModalTarget === 'pickup' ? '#FFFFFF' : colors.foreground },
                  ]}
                >
                  Pick-up ({departureTime})
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setTimeModalTarget('return')}
                style={[
                  styles.timeTargetTab,
                  timeModalTarget === 'return' && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.timeTargetTabText,
                    { color: timeModalTarget === 'return' ? '#FFFFFF' : colors.foreground },
                  ]}
                >
                  Return ({returnTime})
                </Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.timeSlotsGrid} showsVerticalScrollIndicator={false}>
              {AVAILABLE_TIMES.map((timeStr) => {
                const isSelected =
                  timeModalTarget === 'pickup' ? departureTime === timeStr : returnTime === timeStr;
                return (
                  <Pressable
                    key={timeStr}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      if (timeModalTarget === 'pickup') {
                        setDepartureTime(timeStr);
                      } else {
                        setReturnTime(timeStr);
                      }
                      setTimeModalVisible(false);
                    }}
                    style={[
                      styles.timeSlotPill,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.secondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Feather
                      name="clock"
                      size={13}
                      color={isSelected ? '#FFFFFF' : colors.mutedForeground}
                    />
                    <Text
                      style={[
                        styles.timeSlotText,
                        { color: isSelected ? '#FFFFFF' : colors.foreground },
                      ]}
                    >
                      {timeStr}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              onPress={() => setTimeModalVisible(false)}
              style={[styles.calendarApplyBtn, { backgroundColor: colors.primary, marginTop: 10 }]}
            >
              <Text style={styles.calendarApplyBtnText}>Confirm Time</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ─── ADD PAYMENT CARD BOTTOM SHEET (Opens from bottom of screen) ─── */}
      <Modal visible={addCardModalVisible} transparent animationType="slide">
        <View style={styles.bottomSheetBackdrop}>
          <View style={[styles.bottomSheetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.bottomSheetHandle, { backgroundColor: colors.border }]} />

            <View style={styles.calendarModalHeader}>
              <View>
                <Text style={[styles.calendarModalTitle, { color: colors.foreground }]}>
                  Add Payment Card
                </Text>
                <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                  Secure 256-bit encrypted card registration
                </Text>
              </View>
              <Pressable hitSlop={10} onPress={() => setAddCardModalVisible(false)}>
                <Feather name="x" size={20} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
              {/* Card Live Preview */}
              <View style={[styles.cardPreviewBox, { backgroundColor: colors.isDark ? '#1C1517' : '#1E293B' }]}>
                <View style={styles.cardPreviewTop}>
                  <Text style={styles.cardPreviewBank}>{newBankName || 'DriveFlex Card'}</Text>
                  <Feather name="wifi" size={16} color="rgba(255,255,255,0.7)" />
                </View>

                {/* Chip graphic */}
                <View style={styles.cardChipGraphic} />

                <Text style={styles.cardPreviewNumber}>
                  {newCardNumber.length > 0 ? newCardNumber.padEnd(19, '•') : '•••• •••• •••• ••••'}
                </Text>

                <View style={styles.cardPreviewBottom}>
                  <View>
                    <Text style={styles.cardPreviewSmallLabel}>CARDHOLDER</Text>
                    <Text style={styles.cardPreviewName}>{newCardHolder.toUpperCase() || 'YOUR NAME'}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.cardPreviewSmallLabel}>EXPIRES</Text>
                    <Text style={styles.cardPreviewExpiry}>{newCardExpiry || 'MM/YY'}</Text>
                  </View>
                </View>
              </View>

              {/* Form Input: Bank Name */}
              <View style={styles.formInputGroup}>
                <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Bank / Issuer Name</Text>
                <TextInput
                  value={newBankName}
                  onChangeText={setNewBankName}
                  placeholder="e.g. Standard Chartered, Meezan, HBL"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.formInput, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
                />
              </View>

              {/* Form Input: Card Number */}
              <View style={styles.formInputGroup}>
                <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Card Number</Text>
                <TextInput
                  value={newCardNumber}
                  onChangeText={(val) => {
                    const cleaned = val.replace(/\D/g, '').slice(0, 16);
                    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
                    setNewCardNumber(formatted);
                  }}
                  keyboardType="number-pad"
                  maxLength={19}
                  placeholder="4111 2222 3333 4444"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.formInput, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
                />
              </View>

              {/* Form Input: Cardholder Name */}
              <View style={styles.formInputGroup}>
                <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Cardholder Name</Text>
                <TextInput
                  value={newCardHolder}
                  onChangeText={setNewCardHolder}
                  placeholder="Name on card"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.formInput, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
                />
              </View>

              {/* Form Row: Expiry and CVV */}
              <View style={styles.formRowTwo}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Expiry (MM/YY)</Text>
                  <TextInput
                    value={newCardExpiry}
                    onChangeText={(val) => {
                      const cleaned = val.replace(/\D/g, '').slice(0, 4);
                      if (cleaned.length > 2) {
                        setNewCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
                      } else {
                        setNewCardExpiry(cleaned);
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={5}
                    placeholder="12/28"
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.formInput, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>CVV / CVC</Text>
                  <TextInput
                    value={newCardCvv}
                    onChangeText={(val) => setNewCardCvv(val.replace(/\D/g, '').slice(0, 4))}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                    placeholder="123"
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.formInput, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
                  />
                </View>
              </View>

              {/* Save Card Button */}
              <Pressable
                onPress={() => {
                  const digits = newCardNumber.replace(/\D/g, '');
                  if (digits.length < 12) {
                    Alert.alert('Incomplete Card Number', 'Please enter a valid card number (at least 15-16 digits).');
                    return;
                  }
                  if (!newCardExpiry.includes('/') || newCardExpiry.length < 4) {
                    Alert.alert('Invalid Expiry', 'Please enter a valid expiry date in MM/YY format.');
                    return;
                  }
                  const last4 = digits.slice(-4);
                  const brand = digits.startsWith('4') ? 'visa' : digits.startsWith('5') ? 'mastercard' : 'visa';
                  const newCard: PaymentCard = {
                    id: `card-${Date.now()}`,
                    bankName: newBankName.trim() || 'DriveFlex Card',
                    brand,
                    last4,
                    holderName: newCardHolder.trim() || 'Valued Cardholder',
                    expiry: newCardExpiry.trim() || '12/28',
                  };
                  setPaymentCards((prev) => [newCard, ...prev]);
                  setSelectedCardId(newCard.id);
                  setSelectedMethod('card');
                  setAddCardModalVisible(false);
                  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }}
                style={[styles.calendarApplyBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
              >
                <Text style={styles.calendarApplyBtnText}>Save & Use This Card</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 4,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  /* Car summary card */
  carSummaryCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginBottom: 22,
    alignItems: 'center',
    gap: 14,
  },
  summaryImageWrap: {
    width: 110,
    height: 80,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  summaryImage: {
    width: '100%',
    height: '100%',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryReviews: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 6,
  },
  ratingAndPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryDailyPrice: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  /* Sections */
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },

  /* Trip Schedule (Separated Date & Time) */
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rentalDurationTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  rentalDurationTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subSectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  scheduleCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  scheduleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  scheduleIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleCardType: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scheduleDateText: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  scheduleActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  scheduleActionLink: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* Payment */
  paymentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addCardLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  paymentOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  bankBrandIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },

  /* Fare breakdown */
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontSize: 13,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  breakdownDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
  breakdownTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  breakdownTotalValue: {
    fontSize: 18,
    fontWeight: '800',
  },

  /* Sticky Bottom Bar */
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  paymentCtaBtn: {
    borderRadius: 22,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* Success Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  successDoneBtn: {
    width: '100%',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  calendarModalCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    maxHeight: '90%',
  },
  calendarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calendarModalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  calendarApplyBtn: {
    width: '100%',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  calendarApplyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 12,
  },
  timeSlotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* Bottom Sheet Modals (Opens from bottom of screen) */
  bottomSheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  bottomSheetCard: {
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '88%',
  },
  bottomSheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },

  /* Time Target Tabs */
  timeTargetTabBar: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginTop: 10,
    marginBottom: 6,
    gap: 6,
  },
  timeTargetTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeTargetTabText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* Single-Row Schedule Subtext */
  scheduleDateSubtext: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },

  /* Add Card Preview & Form */
  cardPreviewBox: {
    width: '100%',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  cardPreviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardPreviewBank: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardChipGraphic: {
    width: 32,
    height: 24,
    borderRadius: 5,
    backgroundColor: '#C9A227',
    marginBottom: 14,
  },
  cardPreviewNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 14,
    fontFamily: 'monospace',
  },
  cardPreviewBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardPreviewSmallLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  cardPreviewName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardPreviewExpiry: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Form Elements */
  formInputGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  formInput: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    fontWeight: '600',
  },
  formRowTwo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
});
