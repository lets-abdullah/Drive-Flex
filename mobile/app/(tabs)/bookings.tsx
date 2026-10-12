import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
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
import { EmptyState, Page } from '@/components/Marketplace';
import { useDriveFlex } from '@/context/AppContext';
import { type Booking, type Vehicle } from '@/data/catalog';
import { useColors } from '@/hooks/useColors';
import { shortDate } from '@/lib/dates';

type HostTabFilter = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
type RenterTabFilter = 'upcoming' | 'pending' | 'completed' | 'cancelled';

export default function BookingsScreen() {
  const colors = useColors();
  const { bookings, vehicles, session, cancelBooking, approveBooking, declineBooking, theme, toggleTheme } = useDriveFlex();

  // Local state for dynamic bookings updates (e.g. approve/decline/review)
  const [localBookingsList, setLocalBookingsList] = useState<Booking[]>(bookings);

  // Tab filters
  const [hostTab, setHostTab] = useState<HostTabFilter>('pending');
  const [renterTab, setRenterTab] = useState<RenterTabFilter>('upcoming');
  const [selectedListingFilter, setSelectedListingFilter] = useState<string>('all');
  const [auditedBooking, setAuditedBooking] = useState<Booking | null>(null);

  // Top-Right Corner Filters & Theme Controls
  const [customFilterModalVisible, setCustomFilterModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSort, setFilterSort] = useState<'newest' | 'oldest' | 'price-desc' | 'price-asc'>('newest');
  const [filterQuery, setFilterQuery] = useState('');

  const hasActiveFilters = filterStatus !== 'all' || filterSort !== 'newest' || filterQuery.trim().length > 0;

  const handleResetFilters = () => {
    setFilterStatus('all');
    setFilterSort('newest');
    setFilterQuery('');
  };

  // Review Modal State
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Keep localBookings in sync with context
  React.useEffect(() => {
    setLocalBookingsList(bookings);
  }, [bookings]);

  // Host Actions: Approve and Decline
  const handleApproveBooking = (bookingId?: string) => {
    if (!bookingId) return;
    setLocalBookingsList((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'confirmed', refund_status: 'Guaranteed Reservation (Approved by Host)' }
          : b
      )
    );
    void approveBooking(bookingId);
    Alert.alert(
      'Booking Approved!',
      'You have accepted this rental request. Renter contact details are now unlocked for handover coordination.'
    );
  };

  const handleDeclineBooking = (bookingId?: string) => {
    if (!bookingId) return;
    Alert.alert(
      'Decline Booking',
      'Are you sure you want to decline this request? The renter will be notified and escrow refunded.',
      [
        { text: 'Keep Request', style: 'cancel' },
        {
          text: 'Decline & Refund',
          style: 'destructive',
          onPress: () => {
            setLocalBookingsList((prev) =>
              prev.map((b) =>
                b.id === bookingId
                  ? {
                    ...b,
                    status: 'cancelled',
                    refund_status: 'Refund Processed to Renter',
                    cancellation_reason: 'Declined by host',
                  }
                  : b
              )
            );
            void declineBooking(bookingId, 'Declined by host');
          },
        },
      ]
    );
  };

  // Renter Action: Cancel Reservation
  const handleRenterCancel = (bookingId?: string) => {
    if (!bookingId) return;
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel your upcoming drive? A 100% refund will be processed to your payment method.',
      [
        { text: 'Keep Reservation', style: 'cancel' },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: () => {
            setLocalBookingsList((prev) =>
              prev.map((b) =>
                b.id === bookingId
                  ? {
                    ...b,
                    status: 'cancelled',
                    refund_status: 'Refund Processed to Card (100% Refund)',
                    cancellation_reason: 'Cancelled by renter',
                  }
                  : b
              )
            );
            void cancelBooking(bookingId);
          },
        },
      ]
    );
  };

  // Submit Review Modal
  const handleSubmitReview = () => {
    if (!reviewBookingId) return;
    setLocalBookingsList((prev) =>
      prev.map((b) =>
        b.id === reviewBookingId
          ? {
            ...b,
            review_rating: reviewRating,
            review_comment: reviewComment || 'Great rental experience!',
          }
          : b
      )
    );
    setReviewModalVisible(false);
    setReviewComment('');
    Alert.alert('Review Submitted', 'Thank you for rating your trip!');
  };

  // Filtered lists
  const isHost = session?.role === 'host';

  const hostListings = useMemo(() => {
    return vehicles.filter(
      (v) =>
        v.host_id === session?.id ||
        v.ownerId === session?.id ||
        (session?.role === 'host' && (v.ownerId === 'owner-ali' || v.ownerId === 'owner-sana' || !v.ownerId))
    );
  }, [vehicles, session]);

  const hostFilteredBookings = useMemo(() => {
    let list = localBookingsList.filter((b) => {
      const s = b.status.toLowerCase();

      // Per-listing filter
      if (selectedListingFilter !== 'all') {
        if (b.vehicleId !== selectedListingFilter && b.car_id !== selectedListingFilter) {
          return false;
        }
      }

      if (filterStatus !== 'all') {
        if (s !== filterStatus.toLowerCase()) return false;
      } else {
        if (hostTab === 'pending' && s !== 'pending') return false;
        if (hostTab === 'confirmed' && s !== 'confirmed') return false;
        if (hostTab === 'active' && s !== 'active') return false;
        if (hostTab === 'completed' && s !== 'completed') return false;
        if (hostTab === 'cancelled' && s !== 'cancelled') return false;
      }

      if (filterQuery.trim()) {
        const q = filterQuery.toLowerCase().trim();
        const vehicle = vehicles.find((v) => v.id === (b as any).vehicle_id || v.id === b.vehicleId);
        const carStr = `${vehicle?.brand || ''} ${vehicle?.model || ''} ${b.customer || ''} ${b.renter_name || ''} ${b.pickup_address || ''}`.toLowerCase();
        if (!carStr.includes(q)) return false;
      }

      return true;
    });

    if (filterSort === 'price-asc') {
      list.sort((a, b) => (a.total_price || a.totalAmount || 0) - (b.total_price || b.totalAmount || 0));
    } else if (filterSort === 'price-desc') {
      list.sort((a, b) => (b.total_price || b.totalAmount || 0) - (a.total_price || a.totalAmount || 0));
    } else if (filterSort === 'oldest') {
      list.sort((a, b) => new Date((a as any).startDate || a.start_date || 0).getTime() - new Date((b as any).startDate || b.start_date || 0).getTime());
    } else {
      list.sort((a, b) => new Date((b as any).startDate || b.start_date || 0).getTime() - new Date((a as any).startDate || a.start_date || 0).getTime());
    }

    return list;
  }, [localBookingsList, selectedListingFilter, hostTab, filterStatus, filterQuery, filterSort, vehicles]);

  const renterFilteredBookings = useMemo(() => {
    let list = localBookingsList.filter((b) => {
      const s = b.status.toLowerCase();
      if (filterStatus !== 'all') {
        if (s !== filterStatus.toLowerCase()) return false;
      } else {
        if (renterTab === 'upcoming' && s !== 'confirmed') return false;
        if (renterTab === 'pending' && s !== 'pending') return false;
        if (renterTab === 'completed' && s !== 'completed') return false;
        if (renterTab === 'cancelled' && s !== 'cancelled') return false;
      }

      if (filterQuery.trim()) {
        const q = filterQuery.toLowerCase().trim();
        const vehicle = vehicles.find((v) => v.id === (b as any).vehicle_id || v.id === b.vehicleId);
        const carStr = `${vehicle?.brand || ''} ${vehicle?.model || ''} ${b.host_name || ''} ${b.pickup_address || ''}`.toLowerCase();
        if (!carStr.includes(q)) return false;
      }

      return true;
    });

    if (filterSort === 'price-asc') {
      list.sort((a, b) => (a.total_price || a.totalAmount || 0) - (b.total_price || b.totalAmount || 0));
    } else if (filterSort === 'price-desc') {
      list.sort((a, b) => (b.total_price || b.totalAmount || 0) - (a.total_price || a.totalAmount || 0));
    } else if (filterSort === 'oldest') {
      list.sort((a, b) => new Date((a as any).startDate || a.start_date || 0).getTime() - new Date((b as any).startDate || b.start_date || 0).getTime());
    } else {
      list.sort((a, b) => new Date((b as any).startDate || b.start_date || 0).getTime() - new Date((a as any).startDate || a.start_date || 0).getTime());
    }

    return list;
  }, [localBookingsList, renterTab, filterStatus, filterQuery, filterSort, vehicles]);

  // Counts for Badges
  const hostPendingCount = localBookingsList.filter((b) => b.status.toLowerCase() === 'pending').length;
  const renterPendingCount = localBookingsList.filter((b) => b.status.toLowerCase() === 'pending').length;

  const renderHeaderActions = () => (
    <View style={styles.headerActionsCluster}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        onPress={toggleTheme}
        style={[
          styles.headerActionBtn,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Feather
          name={theme === 'dark' ? 'sun' : 'moon'}
          size={16}
          color={colors.accent}
        />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open Bookings Filters"
        onPress={() => setCustomFilterModalVisible(true)}
        style={[
          styles.headerActionBtn,
          {
            backgroundColor: hasActiveFilters ? colors.primary : colors.card,
            borderColor: hasActiveFilters ? colors.primary : colors.border,
          },
        ]}
      >
        <Feather
          name="sliders"
          size={16}
          color={hasActiveFilters ? '#FFFFFF' : colors.foreground}
        />
        {hasActiveFilters && <View style={styles.filterActiveDot} />}
      </Pressable>
    </View>
  );

  const renderActiveFilterBadges = () => {
    if (!hasActiveFilters) return null;
    return (
      <View style={styles.activeFiltersRow}>
        {filterStatus !== 'all' && (
          <View style={[styles.activeFilterChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Text style={[styles.activeFilterChipText, { color: colors.foreground }]}>
              Status: {filterStatus}
            </Text>
            <Pressable onPress={() => setFilterStatus('all')} hitSlop={6}>
              <Feather name="x" size={12} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}
        {filterQuery.trim().length > 0 && (
          <View style={[styles.activeFilterChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Text style={[styles.activeFilterChipText, { color: colors.foreground }]}>
              "{filterQuery}"
            </Text>
            <Pressable onPress={() => setFilterQuery('')} hitSlop={6}>
              <Feather name="x" size={12} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}
        {filterSort !== 'newest' && (
          <View style={[styles.activeFilterChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Text style={[styles.activeFilterChipText, { color: colors.foreground }]}>
              {filterSort === 'price-desc' ? 'Price: High' : filterSort === 'price-asc' ? 'Price: Low' : 'Oldest'}
            </Text>
            <Pressable onPress={() => setFilterSort('newest')} hitSlop={6}>
              <Feather name="x" size={12} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}
        <Pressable onPress={handleResetFilters} style={styles.resetFiltersBtn}>
          <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>Reset All</Text>
        </Pressable>
      </View>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={customFilterModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setCustomFilterModalVisible(false)}
    >
      <Pressable
        style={styles.filterModalBackdrop}
        onPress={() => setCustomFilterModalVisible(false)}
      >
        <Pressable
          style={[
            styles.filterModalCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.filterModalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Feather name="sliders" size={18} color={colors.primary} />
              <Text style={[styles.filterModalTitle, { color: colors.foreground }]}>
                Filter Bookings
              </Text>
            </View>
            <Pressable
              onPress={() => setCustomFilterModalVisible(false)}
              hitSlop={8}
              style={[styles.closeModalBtn, { borderColor: colors.border }]}
            >
              <Feather name="x" size={16} color={colors.foreground} />
            </Pressable>
          </View>

          {/* Keyword Search */}
          <View style={{ gap: 6, marginTop: 14 }}>
            <Text style={[styles.filterSectionLabel, { color: colors.foreground }]}>
              Search by Vehicle / Name
            </Text>
            <View
              style={[
                styles.filterSearchInputWrap,
                { backgroundColor: colors.secondary, borderColor: colors.border },
              ]}
            >
              <Feather name="search" size={14} color={colors.mutedForeground} />
              <TextInput
                placeholder="e.g. Civic, Land Cruiser, Omar..."
                placeholderTextColor={colors.mutedForeground}
                value={filterQuery}
                onChangeText={setFilterQuery}
                style={[styles.filterSearchInput, { color: colors.foreground }]}
              />
              {filterQuery.length > 0 && (
                <Pressable onPress={() => setFilterQuery('')} hitSlop={6}>
                  <Feather name="x" size={14} color={colors.mutedForeground} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Status Selector */}
          <View style={{ gap: 6, marginTop: 14 }}>
            <Text style={[styles.filterSectionLabel, { color: colors.foreground }]}>
              Booking Status
            </Text>
            <View style={styles.filterPillsRow}>
              {[
                { key: 'all', label: 'All Statuses' },
                { key: 'pending', label: 'Pending' },
                { key: 'confirmed', label: 'Confirmed' },
                { key: 'active', label: 'Active Drives' },
                { key: 'completed', label: 'Completed' },
                { key: 'cancelled', label: 'Cancelled' },
              ].map((st) => {
                const isSel = filterStatus === st.key;
                return (
                  <Pressable
                    key={st.key}
                    onPress={() => setFilterStatus(st.key)}
                    style={[
                      styles.filterOptionPill,
                      {
                        backgroundColor: isSel ? colors.primary : colors.secondary,
                        borderColor: isSel ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterOptionPillText,
                        {
                          color: isSel ? '#FFFFFF' : colors.foreground,
                          fontWeight: isSel ? '700' : '500',
                        },
                      ]}
                    >
                      {st.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Sort Order */}
          <View style={{ gap: 6, marginTop: 14 }}>
            <Text style={[styles.filterSectionLabel, { color: colors.foreground }]}>
              Sort By
            </Text>
            <View style={styles.filterPillsRow}>
              {[
                { key: 'newest', label: 'Newest Dates' },
                { key: 'oldest', label: 'Oldest Dates' },
                { key: 'price-desc', label: 'Price: High to Low' },
                { key: 'price-asc', label: 'Price: Low to High' },
              ].map((s) => {
                const isSel = filterSort === s.key;
                return (
                  <Pressable
                    key={s.key}
                    onPress={() => setFilterSort(s.key as any)}
                    style={[
                      styles.filterOptionPill,
                      {
                        backgroundColor: isSel ? colors.primary : colors.secondary,
                        borderColor: isSel ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterOptionPillText,
                        {
                          color: isSel ? '#FFFFFF' : colors.foreground,
                          fontWeight: isSel ? '700' : '500',
                        },
                      ]}
                    >
                      {s.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Modal Actions */}
          <View style={styles.filterModalActions}>
            <Pressable
              onPress={handleResetFilters}
              style={[styles.filterResetBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.filterResetBtnText, { color: colors.foreground }]}>
                Reset All
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setCustomFilterModalVisible(false)}
              style={[styles.filterApplyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.filterApplyBtnText}>Apply Filters</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  /* ─────────────────────────────────────────────────────────────
     RENTER AUDIT MODAL (FOR HOST REVIEW WITH PRIVACY GUARD)
     ───────────────────────────────────────────────────────────── */
  const renderRenterAuditModal = () => {
    if (!auditedBooking) return null;
    const b = auditedBooking;
    const vehicle = vehicles.find((v) => v.id === b.vehicleId || v.id === b.car_id);
    const isApproved = b.status === 'confirmed' || b.status === 'active' || b.status === 'completed';
    const renterName = b.renter_name || b.customer || 'Verified Guest';
    const renterRating = b.renter_rating || 4.9;

    return (
      <Modal visible={!!auditedBooking} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.auditModalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.auditModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.auditShieldIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                  <Feather name="shield" size={18} color="#10B981" />
                </View>
                <View>
                  <Text style={[styles.auditModalTitle, { color: colors.foreground }]}>
                    Renter Trust & Identity
                  </Text>
                  <Text style={[styles.auditModalSub, { color: colors.mutedForeground }]}>
                    Public profile & verification check
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setAuditedBooking(null)}
                hitSlop={8}
                style={[styles.closeModalBtn, { borderColor: colors.border }]}
              >
                <Feather name="x" size={16} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
              {/* Profile Card */}
              <View
                style={[
                  styles.auditProfileBox,
                  { backgroundColor: colors.isDark ? '#141822' : '#F8FAFC', borderColor: colors.border },
                ]}
              >
                <View style={styles.auditAvatarWrap}>
                  {b.renter_avatar ? (
                    <Image source={{ uri: b.renter_avatar }} contentFit="cover" style={styles.auditAvatarImg} />
                  ) : (
                    <View style={[styles.auditAvatarFallback, { backgroundColor: colors.primary }]}>
                      <Text style={styles.auditAvatarFallbackText}>{renterName.charAt(0)}</Text>
                    </View>
                  )}
                  <View style={styles.auditVerifiedBadge}>
                    <Feather name="check" size={10} color="#FFFFFF" />
                  </View>
                </View>

                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.auditRenterName, { color: colors.foreground }]}>{renterName}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="star" size={14} color="#EAB308" />
                    <Text style={[styles.auditRatingText, { color: colors.foreground }]}>
                      {renterRating} Stars <Text style={{ color: colors.mutedForeground }}>(14 trips hosted)</Text>
                    </Text>
                  </View>
                  <Text style={[styles.auditBadgePill, { color: '#10B981' }]}>
                    ✓ Verified Driver's License & Identity
                  </Text>
                </View>
              </View>

              {/* Privacy Guard Callout */}
              <View
                style={[
                  styles.auditPrivacyCard,
                  {
                    backgroundColor: isApproved ? 'rgba(16, 185, 129, 0.08)' : 'rgba(234, 179, 8, 0.08)',
                    borderColor: isApproved ? 'rgba(16, 185, 129, 0.25)' : 'rgba(234, 179, 8, 0.25)',
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Feather name={isApproved ? 'unlock' : 'lock'} size={14} color={isApproved ? '#10B981' : '#EAB308'} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isApproved ? '#10B981' : '#EAB308' }}>
                    {isApproved ? 'Privacy Unlocked (Booking Approved)' : 'DriveFlex Privacy Guard Active'}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, lineHeight: 18, color: colors.mutedForeground, marginTop: 4 }}>
                  {isApproved
                    ? 'Reservation approved. Direct renter mobile phone number and delivery handover coordinates are now unlocked.'
                    : 'Personal telephone number and exact home address remain strictly concealed until you officially approve this booking.'}
                </Text>
              </View>

              {/* Verified Details Sheet */}
              <View
                style={[
                  styles.auditDetailsCard,
                  { backgroundColor: colors.isDark ? '#141822' : '#F8FAFC', borderColor: colors.border },
                ]}
              >
                <View style={styles.auditDetailRow}>
                  <Text style={[styles.auditDetailLabel, { color: colors.mutedForeground }]}>Direct Mobile Phone</Text>
                  <Text style={[styles.auditDetailVal, { color: isApproved ? colors.foreground : colors.mutedForeground }]}>
                    {isApproved ? (b.renter_phone || '+92 300 1234567') : '+92 ••• ••••••• (Locked until approval)'}
                  </Text>
                </View>

                <View style={styles.auditDetailRow}>
                  <Text style={[styles.auditDetailLabel, { color: colors.mutedForeground }]}>Email Address</Text>
                  <Text style={[styles.auditDetailVal, { color: isApproved ? colors.foreground : colors.mutedForeground }]}>
                    {isApproved ? (b.renter_email || 'renter@driveflex.com') : '•••••••••@gmail.com (Locked)'}
                  </Text>
                </View>

                <View style={styles.auditDetailRow}>
                  <Text style={[styles.auditDetailLabel, { color: colors.mutedForeground }]}>Requested Vehicle</Text>
                  <Text style={[styles.auditDetailVal, { color: colors.foreground, fontWeight: '700' }]}>
                    {b.car_title || (vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Fleet Car')}
                  </Text>
                </View>

                <View style={styles.auditDetailRow}>
                  <Text style={[styles.auditDetailLabel, { color: colors.mutedForeground }]}>Schedule</Text>
                  <Text style={[styles.auditDetailVal, { color: colors.foreground }]}>
                    {shortDate(b.pickup)} ({b.pickup_time || '10:00 AM'}) → {shortDate(b.returnDate)} ({b.return_time || '06:00 PM'})
                  </Text>
                </View>

                <View style={styles.auditDetailRow}>
                  <Text style={[styles.auditDetailLabel, { color: colors.mutedForeground }]}>Delivery Option</Text>
                  <Text style={[styles.auditDetailVal, { color: colors.foreground }]}>
                    {b.delivery_option || 'Central Hub Pick-up'}
                  </Text>
                </View>

                <View style={styles.auditDetailRow}>
                  <Text style={[styles.auditDetailLabel, { color: colors.mutedForeground }]}>Handover Location</Text>
                  <Text style={[styles.auditDetailVal, { color: colors.foreground }]}>
                    {b.pickup_address || 'DriveFlex Central Fleet Hub'}
                  </Text>
                </View>

                <View style={[styles.auditDetailRow, { borderBottomWidth: 0 }]}>
                  <Text style={[styles.auditDetailLabel, { color: colors.mutedForeground }]}>Your Net Payout</Text>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#10B981' }}>
                    ${b.host_payout || Math.round((b.total_price || b.totalAmount || 180) * 0.9)}
                  </Text>
                </View>
              </View>

              {/* Action buttons inside modal */}
              {b.status === 'pending' && (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                  <Pressable
                    onPress={() => {
                      const id = b.id;
                      setAuditedBooking(null);
                      handleDeclineBooking(id);
                    }}
                    style={[styles.auditDeclineBtn, { borderColor: colors.border }]}
                  >
                    <Text style={{ color: colors.destructive, fontWeight: '700', fontSize: 13 }}>Decline</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      const id = b.id;
                      setAuditedBooking(null);
                      handleApproveBooking(id);
                    }}
                    style={[styles.auditApproveBtn, { backgroundColor: '#10B981' }]}
                  >
                    <Feather name="check" size={16} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>Approve Booking</Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     SCENARIO 1: GUEST / NOT LOGGED IN
     ───────────────────────────────────────────────────────────── */
  if (!session) {
    return (
      <Page tabbed>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Your Bookings</Text>
            <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
              Sign in to manage confirmed reservations, track releases, and view receipts.
            </Text>
          </View>
          {renderHeaderActions()}
        </View>
        {renderActiveFilterBadges()}

        <View
          style={[
            styles.authLockCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.authLockIconWrap, { backgroundColor: 'rgba(177,18,38,0.12)' }]}>
            <Feather name="calendar" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.authLockTitle, { color: colors.foreground }]}>
            Account Required
          </Text>
          <Text style={[styles.authLockSubtitle, { color: colors.mutedForeground }]}>
            Sign in or create a DriveFlex account to inspect live reservations, pending approvals, and scheduled vehicle release countdowns.
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create Account or Sign In"
            onPress={() => router.push('/(tabs)/profile')}
            style={[styles.authPrimaryBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.authPrimaryBtnText}>Create Account / Sign In</Text>
            <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </Pressable>
        </View>
        {renderFilterModal()}
      </Page>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     SCENARIO 2: HOST CAR BOOKINGS & APPROVALS DASHBOARD
     ───────────────────────────────────────────────────────────── */
  if (isHost) {
    return (
      <Page tabbed>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eyebrow, { color: colors.star }]}>HOST FLEET MANAGEMENT</Text>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              Fleet Bookings & Approvals
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
              Review booking requests per listing, verify financial breakdowns, and audit renters
            </Text>
          </View>
          {renderHeaderActions()}
        </View>
        {renderActiveFilterBadges()}

        {/* 1. Host Status Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {[
            { key: 'pending', label: 'Pending Approvals', count: hostPendingCount },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'active', label: 'Active Trips' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map((tab) => {
            const isSelected = hostTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setHostTab(tab.key as HostTabFilter)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.foreground,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
                {tab.count !== undefined && tab.count > 0 && (
                  <View
                    style={[
                      styles.counterBadge,
                      {
                        backgroundColor: isSelected ? '#FFFFFF' : colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.counterBadgeText,
                        { color: isSelected ? colors.primary : '#FFFFFF' },
                      ]}
                    >
                      {tab.count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* 3. Host Bookings List with Detailed Breakdown Cards */}
        {hostFilteredBookings.length === 0 ? (
          <EmptyState
            title={`No ${hostTab} bookings`}
            detail={`No reservations currently match "${hostTab}" for the selected listing.`}
            action={selectedListingFilter !== 'all' ? 'Show All Cars' : undefined}
            onAction={() => setSelectedListingFilter('all')}
          />
        ) : (
          <View style={styles.bookingsList}>
            {hostFilteredBookings.map((b) => {
              const vehicle = vehicles.find((v) => v.id === b.vehicleId || v.id === b.car_id);
              const carTitle = b.car_title || (vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Fleet Car');
              const carImg = b.car_image || vehicle?.image;
              const days = b.total_days || 3;
              const gross = b.total_price || b.totalAmount || 180;
              const dailyRate = b.daily_rate || Math.round(gross / days);
              const platformFee = b.platform_fee || Math.round(gross * 0.1);
              const hostPayout = b.host_payout || (gross - platformFee);
              const pickupTime = b.pickup_time || '10:00 AM';
              const returnTime = b.return_time || '06:00 PM';
              const deliveryOption = b.delivery_option || 'DriveFlex Station Pick-up';
              const pickupLocation = b.pickup_address || 'Central Fleet Terminal';
              const renterName = b.renter_name || b.customer || 'Verified Guest';
              const renterRating = b.renter_rating || 4.9;
              const isApproved = b.status === 'confirmed' || b.status === 'active' || b.status === 'completed';

              return (
                <View
                  key={b.id}
                  style={[
                    styles.bookingCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  {/* Top Status & Booking Ref Header */}
                  <View style={styles.cardHeaderRow}>
                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor:
                            b.status === 'pending'
                              ? 'rgba(234, 179, 8, 0.15)'
                              : b.status === 'confirmed'
                                ? 'rgba(16, 185, 129, 0.12)'
                                : b.status === 'active'
                                  ? 'rgba(59, 130, 246, 0.15)'
                                  : b.status === 'completed'
                                    ? 'rgba(16, 185, 129, 0.15)'
                                    : 'rgba(214, 31, 60, 0.12)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          {
                            color:
                              b.status === 'pending'
                                ? '#EAB308'
                                : b.status === 'confirmed'
                                  ? '#10B981'
                                  : b.status === 'active'
                                    ? '#3B82F6'
                                    : b.status === 'completed'
                                      ? '#10B981'
                                      : colors.destructive,
                          },
                        ]}
                      >
                        {b.status === 'pending' ? 'ACTION NEEDED: APPROVAL' : b.status.toUpperCase()}
                      </Text>
                    </View>

                    <Text style={[styles.bookingRefText, { color: colors.mutedForeground }]}>
                      #DF-{(b.id || '000000').slice(-6).toUpperCase()}
                    </Text>
                  </View>

                  {/* Vehicle Identity Banner */}
                  <View style={styles.cardBody}>
                    {carImg && (
                      <View style={[styles.carThumbWrap, { backgroundColor: colors.isDark ? '#1C232E' : '#F1F5F9' }]}>
                        <Image source={{ uri: carImg }} contentFit="cover" style={styles.carThumb} />
                      </View>
                    )}

                    <View style={{ flex: 1, justifyContent: 'center', gap: 3 }}>
                      <Text numberOfLines={1} style={[styles.carTitle, { color: colors.foreground }]}>
                        {carTitle}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.carSubTag, { color: colors.mutedForeground }]}>
                          {vehicle?.category || 'Luxury'} • {vehicle?.transmission || 'Automatic'}
                        </Text>
                        {(vehicle?.license_plate || (vehicle as any)?.licensePlate) && (
                          <View style={[styles.licensePlateTag, { borderColor: colors.border }]}>
                            <Text style={[styles.licensePlateText, { color: colors.foreground }]}>
                              {vehicle?.license_plate || (vehicle as any)?.licensePlate}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* 1. Selected Booking Dates & Exact Times */}
                  <View
                    style={[
                      styles.breakdownBox,
                      { backgroundColor: colors.isDark ? '#141822' : '#F8FAFC', borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.breakdownHeaderRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Feather name="calendar" size={13} color={colors.primary} />
                        <Text style={[styles.breakdownSectionTitle, { color: colors.foreground }]}>
                          Booking Dates & Exact Times
                        </Text>
                      </View>
                      <View style={[styles.durationBadge, { backgroundColor: colors.secondary }]}>
                        <Text style={[styles.durationBadgeText, { color: colors.foreground }]}>
                          {days} Days Total
                        </Text>
                      </View>
                    </View>

                    <View style={styles.scheduleRow}>
                      <View style={styles.scheduleColumn}>
                        <Text style={[styles.scheduleMiniLabel, { color: colors.mutedForeground }]}>PICK-UP</Text>
                        <Text style={[styles.scheduleDateVal, { color: colors.foreground }]}>{shortDate(b.pickup)}</Text>
                        <Text style={[styles.scheduleTimeVal, { color: colors.accent }]}>⏰ {pickupTime}</Text>
                      </View>
                      <View style={styles.scheduleArrowWrap}>
                        <Feather name="arrow-right" size={14} color={colors.mutedForeground} />
                      </View>
                      <View style={styles.scheduleColumn}>
                        <Text style={[styles.scheduleMiniLabel, { color: colors.mutedForeground }]}>DROP-OFF</Text>
                        <Text style={[styles.scheduleDateVal, { color: colors.foreground }]}>{shortDate(b.returnDate)}</Text>
                        <Text style={[styles.scheduleTimeVal, { color: colors.accent }]}>⏰ {returnTime}</Text>
                      </View>
                    </View>
                  </View>

                  {/* 2. Delivery Option & Handover Location */}
                  <View
                    style={[
                      styles.breakdownBox,
                      { backgroundColor: colors.isDark ? '#141822' : '#F8FAFC', borderColor: colors.border },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Feather name="map-pin" size={13} color={colors.accent} />
                      <Text style={[styles.breakdownSectionTitle, { color: colors.foreground }]}>
                        Delivery & Handover Location
                      </Text>
                    </View>
                    <Text style={[styles.deliveryOptionName, { color: colors.foreground }]}>
                      {deliveryOption}
                    </Text>
                    <Text style={[styles.deliveryAddressText, { color: colors.mutedForeground }]}>
                      {pickupLocation}
                    </Text>
                  </View>

                  {/* 3. Detailed Financial Breakdown Card */}
                  <View
                    style={[
                      styles.breakdownBox,
                      { backgroundColor: colors.isDark ? '#141822' : '#F8FAFC', borderColor: colors.border },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Feather name="dollar-sign" size={13} color="#10B981" />
                      <Text style={[styles.breakdownSectionTitle, { color: colors.foreground }]}>
                        Financial Breakdown & Host Payout
                      </Text>
                    </View>

                    <View style={styles.financeLineRow}>
                      <Text style={[styles.financeLineLabel, { color: colors.mutedForeground }]}>
                        Rental Duration & Daily Rate
                      </Text>
                      <Text style={[styles.financeLineValue, { color: colors.foreground }]}>
                        {days} Days × ${dailyRate}/day
                      </Text>
                    </View>

                    <View style={styles.financeLineRow}>
                      <Text style={[styles.financeLineLabel, { color: colors.mutedForeground }]}>
                        Gross Trip Total
                      </Text>
                      <Text style={[styles.financeLineValue, { color: colors.foreground, fontWeight: '700' }]}>
                        ${gross}
                      </Text>
                    </View>

                    <View style={styles.financeLineRow}>
                      <Text style={[styles.financeLineLabel, { color: colors.mutedForeground }]}>
                        Platform & Escrow Service Fee (10%)
                      </Text>
                      <Text style={[styles.financeLineValue, { color: colors.destructive }]}>
                        -${platformFee}
                      </Text>
                    </View>

                    <View style={[styles.payoutHighlightRow, { borderTopColor: colors.border }]}>
                      <View>
                        <Text style={[styles.payoutTitle, { color: colors.foreground }]}>
                          Net Host Payout
                        </Text>
                        <Text style={[styles.payoutSub, { color: colors.mutedForeground }]}>
                          Guaranteed by DriveFlex Escrow
                        </Text>
                      </View>
                      <Text style={styles.payoutAmount}>${hostPayout}</Text>
                    </View>
                  </View>

                  {/* 4. Cross-Profile Renter Audit & Privacy Guard */}
                  <View
                    style={[
                      styles.renterAuditCard,
                      { backgroundColor: colors.isDark ? '#141822' : '#F8FAFC', borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.renterAuditHeader}>
                      <View style={styles.renterAuditAvatarWrap}>
                        {b.renter_avatar ? (
                          <Image source={{ uri: b.renter_avatar }} contentFit="cover" style={styles.renterAuditAvatar} />
                        ) : (
                          <View style={[styles.renterAuditAvatarFallback, { backgroundColor: colors.primary }]}>
                            <Text style={styles.renterAuditAvatarFallbackText}>{renterName.charAt(0)}</Text>
                          </View>
                        )}
                        <View style={styles.auditMiniBadge}>
                          <Feather name="check" size={8} color="#FFFFFF" />
                        </View>
                      </View>

                      <View style={{ flex: 1, gap: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.renterAuditName, { color: colors.foreground }]}>
                            {renterName}
                          </Text>
                          <Text style={{ fontSize: 11, color: '#10B981', fontWeight: '700' }}>✓ Verified</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="star" size={12} color="#EAB308" />
                          <Text style={[styles.renterAuditRating, { color: colors.foreground }]}>
                            {renterRating} Stars • 14 drives
                          </Text>
                        </View>
                      </View>

                      <Pressable
                        onPress={() => setAuditedBooking(b)}
                        style={[styles.auditRenterBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
                      >
                        <Feather name="user-check" size={13} color={colors.foreground} />
                        <Text style={[styles.auditRenterBtnText, { color: colors.foreground }]}>Audit</Text>
                      </Pressable>
                    </View>

                    {/* Privacy Guard Notice */}
                    <View
                      style={[
                        styles.privacyGuardNotice,
                        {
                          backgroundColor: isApproved ? 'rgba(16, 185, 129, 0.08)' : 'rgba(234, 179, 8, 0.08)',
                          borderColor: isApproved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                        },
                      ]}
                    >
                      <Feather
                        name={isApproved ? 'unlock' : 'lock'}
                        size={12}
                        color={isApproved ? '#10B981' : '#EAB308'}
                      />
                      <Text
                        style={[
                          styles.privacyGuardText,
                          { color: isApproved ? '#10B981' : '#EAB308' },
                        ]}
                        numberOfLines={1}
                      >
                        {isApproved
                          ? `Contact Unlocked: ${b.renter_phone || '+92 300 1234567'}`
                          : 'Privacy Guard: Contact phone & address shielded until approved'}
                      </Text>
                    </View>
                  </View>

                  {/* 5. Action Buttons & Live Status Updates */}
                  <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                    {b.status === 'pending' ? (
                      <View style={styles.actionButtonsRowFull}>
                        <Pressable
                          onPress={() => handleDeclineBooking(b.id)}
                          style={[styles.declineBtnFull, { borderColor: colors.border }]}
                        >
                          <Feather name="x" size={15} color={colors.destructive} />
                          <Text style={[styles.declineBtnText, { color: colors.destructive }]}>
                            Decline Booking
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() => handleApproveBooking(b.id)}
                          style={[styles.approveBtnFull, { backgroundColor: '#10B981' }]}
                        >
                          <Feather name="check" size={15} color="#FFFFFF" />
                          <Text style={styles.approveBtnText}>Approve Booking</Text>
                        </Pressable>
                      </View>
                    ) : b.status === 'confirmed' ? (
                      <View style={styles.actionButtonsRowFull}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: '#10B981' }}>
                            ✓ Reservation Confirmed
                          </Text>
                          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                            Vehicle reserved for handover
                          </Text>
                        </View>
                        <Pressable
                          onPress={() =>
                            Alert.alert(
                              'Renter Contact',
                              `Name: ${renterName}\nPhone: ${b.renter_phone || '+92 300 1234567'}\nPickup: ${pickupLocation}`,
                              [{ text: 'OK' }]
                            )
                          }
                          style={[styles.approveBtn, { backgroundColor: colors.primary }]}
                        >
                          <Feather name="phone-call" size={13} color="#FFFFFF" />
                          <Text style={styles.approveBtnText}>Call Renter</Text>
                        </Pressable>
                      </View>
                    ) : b.status === 'completed' ? (
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#10B981' }}>
                          💰 Paid Out: ${hostPayout}
                        </Text>
                        {b.review_rating && (
                          <Text style={{ fontSize: 12, color: colors.foreground }}>
                            ⭐ {b.review_rating} Stars ({b.review_comment})
                          </Text>
                        )}
                      </View>
                    ) : (
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.destructive }}>
                          Cancelled ({b.cancellation_reason || 'Declined'})
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
        {renderRenterAuditModal()}
        {renderFilterModal()}
      </Page>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     SCENARIO 3: RENTER TRIPS DASHBOARD
     ───────────────────────────────────────────────────────────── */
  return (
    <Page tabbed>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>RENTER PROFILE</Text>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Trips & Drives</Text>
          <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
            Upcoming reservations, waiting approvals, and past trip reviews
          </Text>
        </View>
        {renderHeaderActions()}
      </View>
      {renderActiveFilterBadges()}

      {/* Renter Filter Tabs Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {[
          { key: 'upcoming', label: 'My Trips' },
          { key: 'pending', label: 'Pending Approval', count: renterPendingCount },
          { key: 'completed', label: 'Past Trips & Reviews' },
          { key: 'cancelled', label: 'Cancelled' },
        ].map((tab) => {
          const isSelected = renterTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setRenterTab(tab.key as RenterTabFilter)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  {
                    color: isSelected ? '#FFFFFF' : colors.foreground,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
              {tab.count !== undefined && tab.count > 0 && (
                <View
                  style={[
                    styles.counterBadge,
                    {
                      backgroundColor: isSelected ? '#FFFFFF' : colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.counterBadgeText,
                      { color: isSelected ? colors.primary : '#FFFFFF' },
                    ]}
                  >
                    {tab.count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Renter Bookings List */}
      {renterFilteredBookings.length === 0 ? (
        <EmptyState
          title={`No ${renterTab} trips`}
          detail={`You don't have any reservations under "${renterTab}".`}
          action="Find a Car"
          onAction={() => router.push('/(tabs)/search')}
        />
      ) : (
        <View style={styles.bookingsList}>
          {renterFilteredBookings.map((b) => {
            const vehicle = vehicles.find((v) => v.id === b.vehicleId || v.id === b.car_id);
            const carTitle = b.car_title || (vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Reserved Vehicle');
            const carImg = b.car_image || vehicle?.image;

            return (
              <View
                key={b.id}
                style={[
                  styles.bookingCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                {/* Header Row: Status badge & Dates */}
                <View style={styles.cardHeaderRow}>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor:
                          b.status === 'pending'
                            ? 'rgba(234, 179, 8, 0.15)'
                            : b.status === 'confirmed'
                              ? 'rgba(16, 185, 129, 0.12)'
                              : b.status === 'completed'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(214, 31, 60, 0.12)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color:
                            b.status === 'pending'
                              ? '#EAB308'
                              : b.status === 'confirmed'
                                ? '#10B981'
                                : b.status === 'completed'
                                  ? '#10B981'
                                  : colors.destructive,
                        },
                      ]}
                    >
                      {b.status === 'pending'
                        ? 'WAITING FOR HOST APPROVAL'
                        : b.status === 'confirmed'
                          ? 'CONFIRMED TRIP'
                          : b.status.toUpperCase()}
                    </Text>
                  </View>

                  <Text style={[styles.bookingDateSummary, { color: colors.mutedForeground }]}>
                    {shortDate(b.pickup)} → {shortDate(b.returnDate)}
                  </Text>
                </View>

                {/* Body: Vehicle Info & Host Contact */}
                <View style={styles.cardBody}>
                  {carImg && (
                    <View style={[styles.carThumbWrap, { backgroundColor: colors.isDark ? '#1C232E' : '#F1F5F9' }]}>
                      <Image source={{ uri: carImg }} contentFit="cover" style={styles.carThumb} />
                    </View>
                  )}

                  <View style={{ flex: 1, gap: 2 }}>
                    <Text numberOfLines={1} style={[styles.carTitle, { color: colors.foreground }]}>
                      {carTitle}
                    </Text>
                    <Text style={[styles.renterText, { color: colors.foreground }]}>
                      🏢 Host: <Text style={{ fontWeight: '700' }}>{b.host_name || 'Ali Motors'}</Text>
                    </Text>
                    <Text style={[styles.phoneText, { color: colors.mutedForeground }]}>
                      📞 Contact: {b.host_phone || '+92 321 440 7812'}
                    </Text>
                    <Text style={[styles.addressText, { color: colors.mutedForeground }]} numberOfLines={1}>
                      📍 Pick-up: {b.pickup_address || 'Agreed Terminal'}
                    </Text>
                  </View>
                </View>

                {/* Callout Info for Pending / Cancelled */}
                {b.status === 'pending' && (
                  <View style={[styles.calloutBox, { backgroundColor: 'rgba(234, 179, 8, 0.08)' }]}>
                    <Text style={{ color: '#EAB308', fontWeight: '700', fontSize: 13 }}>
                      ⏳ Request Submitted to Host
                    </Text>
                    <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 2 }}>
                      Your dates are reserved. The vehicle owner is reviewing your booking request.
                    </Text>
                  </View>
                )}

                {b.status === 'cancelled' && (
                  <View style={[styles.calloutBox, { backgroundColor: 'rgba(214, 31, 60, 0.08)' }]}>
                    <Text style={{ color: colors.destructive, fontWeight: '700', fontSize: 13 }}>
                      {b.refund_status || '100% Refund Processed'}
                    </Text>
                    <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 2 }}>
                      {b.cancellation_reason || 'Reservation was cancelled.'}
                    </Text>
                  </View>
                )}

                {/* Footer: Price & Renter Actions */}
                <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                  <View>
                    <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>
                      Total Paid
                    </Text>
                    <Text style={[styles.totalAmount, { color: colors.foreground }]}>
                      ${b.total_price || b.totalAmount || 170}
                    </Text>
                  </View>

                  <View style={styles.actionButtonsRow}>
                    {/* Cancellation Trigger for Confirmed Trips */}
                    {b.status === 'confirmed' && (
                      <Pressable
                        onPress={() => handleRenterCancel(b.id)}
                        style={[styles.declineBtn, { borderColor: colors.border }]}
                      >
                        <Text style={[styles.declineBtnText, { color: colors.destructive }]}>
                          Cancel Trip
                        </Text>
                      </Pressable>
                    )}

                    {/* Review Trigger for Completed Trips */}
                    {b.status === 'completed' && (
                      <Pressable
                        onPress={() => {
                          setReviewBookingId(b.id || null);
                          setReviewRating(b.review_rating || 5);
                          setReviewComment(b.review_comment || '');
                          setReviewModalVisible(true);
                        }}
                        style={[styles.approveBtn, { backgroundColor: colors.primary }]}
                      >
                        <Ionicons name="star" size={14} color="#FFFFFF" />
                        <Text style={styles.approveBtnText}>
                          {b.review_rating ? 'Edit Review' : 'Leave a Review'}
                        </Text>
                      </Pressable>
                    )}

                    {/* View Car Details Button */}
                    {vehicle && (
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: '/cars/[slug]',
                            params: { slug: vehicle.slug },
                          })
                        }
                        style={[styles.viewCarBtn, { borderColor: colors.border }]}
                      >
                        <Text style={[styles.viewCarBtnText, { color: colors.foreground }]}>
                          View Car
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* ─── REVIEW MODAL ─── */}
      <Modal visible={reviewModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.reviewModalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.reviewModalHeader}>
              <Text style={[styles.reviewModalTitle, { color: colors.foreground }]}>
                Rate Your Rental Experience
              </Text>
              <Pressable onPress={() => setReviewModalVisible(false)} hitSlop={8}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <Text style={[styles.reviewModalSub, { color: colors.mutedForeground }]}>
              How was your drive? Your feedback helps the host and other DriveFlex renters.
            </Text>

            {/* Star Rating Selectors */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setReviewRating(star)} style={{ padding: 6 }}>
                  <Ionicons
                    name="star"
                    size={32}
                    color={star <= reviewRating ? '#EAB308' : colors.border}
                  />
                </Pressable>
              ))}
            </View>

            {/* Comment Field */}
            <TextInput
              placeholder="Write a comment about car condition, pickup, host communication..."
              placeholderTextColor={colors.mutedForeground}
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              style={[
                styles.reviewInput,
                {
                  backgroundColor: colors.isDark ? '#141822' : '#F8FAFC',
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
            />

            <Pressable
              onPress={handleSubmitReview}
              style={[styles.submitReviewBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.submitReviewBtnText}>Submit Review</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {renderFilterModal()}
    </Page>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 4,
    gap: 12,
  },
  headerActionsCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterActiveDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  activeFilterChipText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  resetFiltersBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  filterModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  filterModalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterSearchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  filterSearchInput: {
    flex: 1,
    fontSize: 13,
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterOptionPill: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterOptionPillText: {
    fontSize: 12,
  },
  filterModalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  filterResetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterResetBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterApplyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  filterApplyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterPillText: {
    fontSize: 13,
  },
  counterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  counterBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  bookingsList: {
    gap: 14,
    paddingBottom: 40,
  },
  bookingCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bookingDateSummary: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    flexDirection: 'row',
    gap: 14,
  },
  carThumbWrap: {
    width: 86,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
  },
  carThumb: {
    width: '100%',
    height: '100%',
  },
  carTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  renterText: {
    fontSize: 13,
  },
  phoneText: {
    fontSize: 12,
  },
  addressText: {
    fontSize: 12,
  },
  calloutBox: {
    padding: 10,
    borderRadius: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  declineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  declineBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  viewCarBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  viewCarBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  authLockCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    textAlign: 'center',
    gap: 12,
    marginTop: 10,
  },
  authLockIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authLockTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  authLockSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  authPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  authPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  reviewModalCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  reviewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewModalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  reviewModalSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 4,
  },
  reviewInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    height: 90,
    textAlignVertical: 'top',
    fontSize: 13,
  },
  submitReviewBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  bookingRefText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  carSubTag: {
    fontSize: 12,
    fontWeight: '500',
  },
  licensePlateTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
  },
  licensePlateText: {
    fontSize: 10,
    fontWeight: '700',
  },
  listingFilterContainer: {
    marginTop: 10,
    marginBottom: 12,
    gap: 6,
  },
  listingFilterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listingFilterHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  listingFilterScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  listingFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  listingFilterChipText: {
    fontSize: 12,
  },
  breakdownBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  breakdownHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownSectionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  durationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  durationBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  scheduleColumn: {
    flex: 1,
    gap: 2,
  },
  scheduleMiniLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scheduleDateVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  scheduleTimeVal: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  scheduleArrowWrap: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryOptionName: {
    fontSize: 13,
    fontWeight: '700',
  },
  deliveryAddressText: {
    fontSize: 12,
    lineHeight: 16,
  },
  financeLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  financeLineLabel: {
    fontSize: 12,
  },
  financeLineValue: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  payoutHighlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
  },
  payoutTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  payoutSub: {
    fontSize: 10.5,
  },
  payoutAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
  },
  renterAuditCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  renterAuditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  renterAuditAvatarWrap: {
    position: 'relative',
  },
  renterAuditAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  renterAuditAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  renterAuditAvatarFallbackText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  auditMiniBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: '#10B981',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  renterAuditName: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  renterAuditRating: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  auditRenterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  auditRenterBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  privacyGuardNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  privacyGuardText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  actionButtonsRowFull: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  declineBtnFull: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  approveBtnFull: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  auditModalCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    gap: 14,
    maxHeight: '85%',
  },
  auditModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  auditShieldIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auditModalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  auditModalSub: {
    fontSize: 11.5,
  },
  auditProfileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  auditAvatarWrap: {
    position: 'relative',
  },
  auditAvatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  auditAvatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auditAvatarFallbackText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
  },
  auditVerifiedBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: '#10B981',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  auditRenterName: {
    fontSize: 16,
    fontWeight: '800',
  },
  auditRatingText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  auditBadgePill: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  auditPrivacyCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  auditDetailsCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  auditDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150,150,150,0.15)',
  },
  auditDetailLabel: {
    fontSize: 12,
  },
  auditDetailVal: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  auditDeclineBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  auditApproveBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
});
