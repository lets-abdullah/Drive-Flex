import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { EmptyState, Page } from '@/components/Marketplace';
import { useDriveFlex } from '@/context/AppContext';
import type { Vehicle } from '@/data/catalog';
import { useColors } from '@/hooks/useColors';

type FilterTab = 'all' | 'active' | 'delisted';

export default function HostListingsScreen() {
  const colors = useColors();
  const { session, vehicles, toggleVehicleListingStatus, updateVehicleListing, deleteVehicleListing } = useDriveFlex();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Car Modal State
  const [editingCar, setEditingCar] = useState<Vehicle | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editRules, setEditRules] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Confirmation Modal State (for De-list / Re-list & Delete across Web + Native)
  const [confirmModal, setConfirmModal] = useState<{
    type: 'toggle' | 'delete';
    car: Vehicle;
  } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Host's vehicles filter
  const hostCars = useMemo(() => {
    return vehicles.filter(
      (v) =>
        v.host_id === session?.id ||
        v.ownerId === session?.id ||
        (session?.role === 'host' && (v.ownerId === 'owner-ali' || v.ownerId === 'owner-sana' || !v.ownerId))
    );
  }, [vehicles, session]);

  // Tab & query filtered
  const filteredCars = useMemo(() => {
    return hostCars.filter((car) => {
      const isDelisted = Boolean(car.isDelisted || car.status === 'maintenance');
      if (activeTab === 'active' && isDelisted) return false;
      if (activeTab === 'delisted' && !isDelisted) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = `${car.brand} ${car.model}`.toLowerCase().includes(q);
        const matchesPlate = (car.license_plate || '').toLowerCase().includes(q);
        const matchesLoc = (car.address_text || car.location || '').toLowerCase().includes(q);
        return matchesTitle || matchesPlate || matchesLoc;
      }
      return true;
    });
  }, [hostCars, activeTab, searchQuery]);

  const activeCount = hostCars.filter((c) => !c.isDelisted && c.status !== 'maintenance').length;
  const delistedCount = hostCars.filter((c) => c.isDelisted || c.status === 'maintenance').length;

  const handleOpenEdit = (car: Vehicle) => {
    setEditingCar(car);
    setEditPrice(String(car.price_per_day || car.pricePerDay || ''));
    setEditLocation(car.address_text || car.location || '');
    setEditDescription(car.description || '');
    setEditRules((car.customTripRules || ['No smoking inside car', 'Return fuel at same level']).join(', '));
  };

  const handleSaveCarDetails = async () => {
    if (!editingCar) return;
    const priceNum = parseFloat(editPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid positive daily rental price.');
      return;
    }

    setIsSaving(true);
    try {
      const parsedRules = editRules
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      await updateVehicleListing(editingCar.id, {
        pricePerDay: priceNum,
        price_per_day: priceNum,
        address_text: editLocation.trim() || editingCar.address_text,
        location: editLocation.trim() || editingCar.location,
        description: editDescription.trim() || editingCar.description,
        customTripRules: parsedRules.length ? parsedRules : editingCar.customTripRules,
      });

      setEditingCar(null);
    } catch {
      Alert.alert('Error', 'Unable to update vehicle details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = (car: Vehicle) => {
    setConfirmModal({ type: 'toggle', car });
  };

  const handleDeleteListing = (car: Vehicle) => {
    setConfirmModal({ type: 'delete', car });
  };

  const handleExecuteConfirmAction = async () => {
    if (!confirmModal) return;
    const { type, car } = confirmModal;
    setIsProcessingAction(true);
    try {
      if (type === 'toggle') {
        await toggleVehicleListingStatus(car.id);
      } else {
        await deleteVehicleListing(car.id);
      }
      setConfirmModal(null);
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <Page>
      {/* ─── HEADER WITH BACK AND ADD NEW CAR BUTTON ─── */}
      <View style={styles.navRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Profile"
          onPress={() => router.back()}
          style={[styles.backBtn, { borderColor: colors.border }]}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.eyebrow, { color: colors.star }]}>HOST FLEET MANAGEMENT</Text>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Manage Listings</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add New Car"
          onPress={() => router.push('/host/add-vehicle')}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Car</Text>
        </Pressable>
      </View>

      <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
        Manage all active and de-listed vehicles in your fleet. You can modify prices, rules, or toggle visibility anytime.
      </Text>

      {/* ─── METRIC PILLS & SEARCH ─── */}
      <View style={styles.tabsRow}>
        <Pressable
          onPress={() => setActiveTab('all')}
          style={[
            styles.tabPill,
            activeTab === 'all' && { backgroundColor: colors.foreground },
            { borderColor: colors.border },
          ]}
        >
          <Text
            style={[
              styles.tabPillText,
              { color: activeTab === 'all' ? colors.background : colors.mutedForeground },
            ]}
          >
            All ({hostCars.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('active')}
          style={[
            styles.tabPill,
            activeTab === 'active' && { backgroundColor: '#10B981' },
            { borderColor: colors.border },
          ]}
        >
          <Text
            style={[
              styles.tabPillText,
              { color: activeTab === 'active' ? '#FFFFFF' : colors.mutedForeground },
            ]}
          >
            Active ({activeCount})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('delisted')}
          style={[
            styles.tabPill,
            activeTab === 'delisted' && { backgroundColor: '#EAB308' },
            { borderColor: colors.border },
          ]}
        >
          <Text
            style={[
              styles.tabPillText,
              { color: activeTab === 'delisted' ? '#000000' : colors.mutedForeground },
            ]}
          >
            De-listed ({delistedCount})
          </Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          placeholder="Filter by brand, model, license plate..."
          placeholderTextColor={colors.mutedForeground}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { color: colors.foreground }]}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <Feather name="x-circle" size={16} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      {/* ─── VEHICLE LIST ─── */}
      {filteredCars.length === 0 ? (
        <EmptyState
          title={activeTab === 'delisted' ? 'No De-listed Vehicles' : 'No Listings Found'}
          detail={
            searchQuery
              ? 'No vehicles match your search query.'
              : 'Add your first car to start receiving rental requests.'
          }
          action="Add New Car"
          onAction={() => router.push('/host/add-vehicle')}
        />
      ) : (
        <View style={styles.carsList}>
          {filteredCars.map((car) => {
            const isDelisted = Boolean(car.isDelisted || car.status === 'maintenance');

            return (
              <View
                key={car.id}
                style={[
                  styles.listingCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                {/* Top Image + Badges */}
                <View style={styles.imageContainer}>
                  <Image source={{ uri: car.image }} contentFit="cover" style={styles.carCover} />

                  <View style={styles.badgeOverImageRow}>
                    <View
                      style={[
                        styles.statusTag,
                        {
                          backgroundColor: isDelisted
                            ? 'rgba(234, 179, 8, 0.92)'
                            : 'rgba(16, 185, 129, 0.92)',
                        },
                      ]}
                    >
                      <Ionicons
                        name={isDelisted ? 'eye-off-outline' : 'checkmark-circle-outline'}
                        size={13}
                        color={isDelisted ? '#000000' : '#FFFFFF'}
                      />
                      <Text
                        style={[
                          styles.statusTagText,
                          { color: isDelisted ? '#000000' : '#FFFFFF' },
                        ]}
                      >
                        {isDelisted ? 'DE-LISTED (HIDDEN)' : 'ACTIVE & SEARCHABLE'}
                      </Text>
                    </View>

                    <View style={[styles.plateTag, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                      <Text style={styles.plateTagText}>
                        {car.license_plate || 'REG-2023'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Card Content */}
                <View style={styles.cardContent}>
                  <View style={styles.titleRow}>
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={[styles.carName, { color: colors.foreground }]}>
                        {car.brand} {car.model}
                      </Text>
                      <Text style={[styles.carSub, { color: colors.mutedForeground }]}>
                        {car.year || 2023} • {car.category} • {car.transmission} • {car.seats} seats
                      </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.priceNum, { color: colors.foreground }]}>
                        ${car.price_per_day || car.pricePerDay}
                      </Text>
                      <Text style={[styles.pricePerDay, { color: colors.mutedForeground }]}>
                        / per day
                      </Text>
                    </View>
                  </View>

                  <View style={styles.locationRow}>
                    <Feather name="map-pin" size={13} color={colors.primary} />
                    <Text numberOfLines={1} style={[styles.locationText, { color: colors.mutedForeground }]}>
                      {car.address_text || car.location}
                    </Text>
                  </View>

                  {/* Quick Specs Chips */}
                  <View style={styles.specsRow}>
                    <View style={[styles.miniChip, { backgroundColor: colors.isDark ? '#222834' : '#F1F5F9' }]}>
                      <Feather name="droplet" size={11} color={colors.mutedForeground} />
                      <Text style={[styles.miniChipText, { color: colors.foreground }]}>
                        {car.fuelType}
                      </Text>
                    </View>
                    <View style={[styles.miniChip, { backgroundColor: colors.isDark ? '#222834' : '#F1F5F9' }]}>
                      <Feather name="star" size={11} color={colors.star} />
                      <Text style={[styles.miniChipText, { color: colors.foreground }]}>
                        {car.rating.toFixed(1)} ({car.reviewCount} reviews)
                      </Text>
                    </View>
                  </View>

                  {/* Actions Divider */}
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  {/* Action Buttons Row */}
                  <View style={styles.actionsRow}>
                    {/* Modify Details */}
                    <Pressable
                      onPress={() => handleOpenEdit(car)}
                      style={[
                        styles.actionBtn,
                        { backgroundColor: colors.isDark ? '#1C232E' : '#F1F5F9', borderColor: colors.border },
                      ]}
                    >
                      <Feather name="edit-3" size={13} color={colors.foreground} />
                      <Text style={[styles.actionBtnText, { color: colors.foreground }]}>
                        Edit
                      </Text>
                    </Pressable>

                    {/* De-list / Re-list Button */}
                    <Pressable
                      onPress={() => handleToggleStatus(car)}
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor: isDelisted ? 'rgba(16, 185, 129, 0.12)' : 'rgba(234, 179, 8, 0.12)',
                          borderColor: isDelisted ? '#10B981' : '#EAB308',
                        },
                      ]}
                    >
                      <Feather
                        name={isDelisted ? 'eye' : 'eye-off'}
                        size={13}
                        color={isDelisted ? '#10B981' : '#EAB308'}
                      />
                      <Text
                        style={[
                          styles.actionBtnText,
                          { color: isDelisted ? '#10B981' : '#D97706', fontWeight: '700' },
                        ]}
                      >
                        {isDelisted ? 'Re-list' : 'De-list'}
                      </Text>
                    </Pressable>

                    {/* Delete Button */}
                    <Pressable
                      onPress={() => handleDeleteListing(car)}
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          borderColor: '#EF4444',
                        },
                      ]}
                    >
                      <Feather name="trash-2" size={13} color="#EF4444" />
                      <Text style={[styles.actionBtnText, { color: '#EF4444', fontWeight: '700' }]}>
                        Delete
                      </Text>
                    </Pressable>

                    {/* Preview Live */}
                    <Pressable
                      onPress={() => router.push(`/cars/${car.slug}`)}
                      style={[
                        styles.iconOnlyBtn,
                        { backgroundColor: colors.isDark ? '#1C232E' : '#F1F5F9', borderColor: colors.border },
                      ]}
                    >
                      <Feather name="external-link" size={14} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* ─── 4. EDIT VEHICLE DETAILS MODAL ─── */}
      <Modal
        visible={Boolean(editingCar)}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingCar(null)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.editModalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                  Modify Vehicle Details
                </Text>
                <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
                  {editingCar ? `${editingCar.brand} ${editingCar.model}` : ''}
                </Text>
              </View>
              <Pressable
                onPress={() => setEditingCar(null)}
                style={[styles.closeModalBtn, { borderColor: colors.border }]}
              >
                <Feather name="x" size={18} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <View style={{ gap: 14, paddingVertical: 10 }}>
                {/* Price */}
                <View>
                  <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                    Daily Rental Rate ($ USD)
                  </Text>
                  <TextInput
                    value={editPrice}
                    onChangeText={setEditPrice}
                    keyboardType="numeric"
                    placeholder="e.g. 150"
                    placeholderTextColor={colors.mutedForeground}
                    style={[
                      styles.modalInput,
                      { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
                    ]}
                  />
                </View>

                {/* Location */}
                <View>
                  <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                    Pickup Address / Hub Location
                  </Text>
                  <TextInput
                    value={editLocation}
                    onChangeText={setEditLocation}
                    placeholder="e.g. F-7 Markaz, Islamabad"
                    placeholderTextColor={colors.mutedForeground}
                    style={[
                      styles.modalInput,
                      { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
                    ]}
                  />
                </View>

                {/* Description */}
                <View>
                  <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                    Host Note & Description
                  </Text>
                  <TextInput
                    value={editDescription}
                    onChangeText={setEditDescription}
                    multiline
                    numberOfLines={3}
                    placeholder="Share vehicle features and handover notes for renters..."
                    placeholderTextColor={colors.mutedForeground}
                    style={[
                      styles.modalInput,
                      {
                        color: colors.foreground,
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        minHeight: 80,
                        textAlignVertical: 'top',
                      },
                    ]}
                  />
                </View>

                {/* Custom Trip Rules */}
                <View>
                  <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                    Custom Trip Rules (Comma separated)
                  </Text>
                  <TextInput
                    value={editRules}
                    onChangeText={setEditRules}
                    placeholder="e.g. No smoking, Valid license required, Return fuel matched"
                    placeholderTextColor={colors.mutedForeground}
                    style={[
                      styles.modalInput,
                      { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
                    ]}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                onPress={() => setEditingCar(null)}
                style={[styles.cancelModalBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.cancelModalText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={() => void handleSaveCarDetails()}
                disabled={isSaving}
                style={[styles.saveModalBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.saveModalText}>
                  {isSaving ? 'Saving...' : 'Save Modifications'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── 5. DE-LIST / RE-LIST & DELETE CONFIRMATION MODAL ─── */}
      <Modal
        visible={Boolean(confirmModal)}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModal(null)}
      >
        <View style={styles.confirmBackdrop}>
          <View
            style={[
              styles.confirmCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {confirmModal && (() => {
              const { type, car } = confirmModal;
              const isCurrentlyDelisted = Boolean(car.isDelisted || car.status === 'maintenance');
              const isDelete = type === 'delete';
              const accentColor = isDelete
                ? '#EF4444'
                : isCurrentlyDelisted
                  ? '#10B981'
                  : '#EAB308';
              const iconName = isDelete
                ? 'trash-2'
                : isCurrentlyDelisted
                  ? 'eye'
                  : 'eye-off';
              const title = isDelete
                ? 'Delete Listing?'
                : isCurrentlyDelisted
                  ? 'Re-list Vehicle?'
                  : 'De-list Vehicle?';
              const message = isDelete
                ? `Are you sure you want to permanently delete ${car.brand} ${car.model}? This action cannot be undone.`
                : isCurrentlyDelisted
                  ? `This will make ${car.brand} ${car.model} active and visible to all renters in search and map results.`
                  : `This will hide ${car.brand} ${car.model} from public search results. Existing confirmed bookings will remain active.`;
              const confirmBtnLabel = isProcessingAction
                ? 'Processing...'
                : isDelete
                  ? 'Delete Car'
                  : isCurrentlyDelisted
                    ? 'Re-list Car'
                    : 'De-list Car';

              return (
                <>
                  <View
                    style={[
                      styles.confirmIconCircle,
                      { backgroundColor: `${accentColor}1F` },
                    ]}
                  >
                    <Feather name={iconName as any} size={22} color={accentColor} />
                  </View>

                  <Text style={[styles.confirmTitle, { color: colors.foreground }]}>
                    {title}
                  </Text>
                  <Text style={[styles.confirmMessage, { color: colors.mutedForeground }]}>
                    {message}
                  </Text>

                  <View style={styles.confirmActionsRow}>
                    <Pressable
                      onPress={() => setConfirmModal(null)}
                      disabled={isProcessingAction}
                      style={[styles.confirmCancelBtn, { borderColor: colors.border }]}
                    >
                      <Text style={[styles.confirmCancelText, { color: colors.foreground }]}>
                        Cancel
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => void handleExecuteConfirmAction()}
                      disabled={isProcessingAction}
                      style={[
                        styles.confirmPrimaryBtn,
                        { backgroundColor: accentColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.confirmPrimaryText,
                          { color: !isDelete && !isCurrentlyDelisted ? '#000000' : '#FFFFFF' },
                        ]}
                      >
                        {confirmBtnLabel}
                      </Text>
                    </Pressable>
                  </View>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>
    </Page>
  );
}

const styles = StyleSheet.create({
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  carsList: {
    gap: 16,
  },
  listingCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  carCover: {
    width: '100%',
    height: '100%',
  },
  badgeOverImageRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  plateTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  plateTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  cardContent: {
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 6,
  },
  carName: {
    fontSize: 17,
    fontWeight: '800',
  },
  carSub: {
    fontSize: 12,
    marginTop: 2,
  },
  priceNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  pricePerDay: {
    fontSize: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 12,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  miniChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  miniChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconOnlyBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  editModalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelModalText: {
    fontWeight: '700',
    fontSize: 14,
  },
  saveModalBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveModalText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
  },
  confirmIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelText: {
    fontWeight: '700',
    fontSize: 14,
  },
  confirmPrimaryBtn: {
    flex: 1.2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmPrimaryText: {
    fontWeight: '800',
    fontSize: 14,
  },
});
