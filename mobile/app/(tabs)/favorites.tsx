import { Feather } from '@expo/vector-icons';
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
import { ActionButton, EmptyState, Notice, Page } from '@/components/Marketplace';
import { useDriveFlex } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function FavoritesScreen() {
  const colors = useColors();
  const { favorites, vehicles, toggleFavorite, apiError, refresh, session, theme, toggleTheme } = useDriveFlex();
  const [search, setSearch] = useState('');

  // Top Right Filter & Theme State
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating' | 'brand'>('recommended');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedTransmission, setSelectedTransmission] = useState<string | null>(null);

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedTransmission !== null ||
    maxPrice !== null ||
    selectedSort !== 'recommended';

  const handleResetFavoritesFilters = () => {
    setSelectedCategory('All');
    setSelectedSort('recommended');
    setMaxPrice(null);
    setSelectedTransmission(null);
  };

  const savedVehicles = useMemo(() => {
    let list = vehicles.filter((v) => favorites.includes(v.id));

    // 1. Search text
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((v) =>
        `${v.brand} ${v.model} ${v.category} ${v.location} ${v.transmission}`.toLowerCase().includes(q)
      );
    }

    // 2. Category filter
    if (selectedCategory !== 'All') {
      list = list.filter((v) => v.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 3. Transmission filter
    if (selectedTransmission) {
      list = list.filter((v) => v.transmission.toLowerCase() === selectedTransmission.toLowerCase());
    }

    // 4. Max price filter
    if (maxPrice !== null) {
      list = list.filter((v) => v.pricePerDay <= maxPrice);
    }

    // 5. Sorting
    if (selectedSort === 'price-asc') {
      list.sort((a, b) => a.pricePerDay - b.pricePerDay);
    } else if (selectedSort === 'price-desc') {
      list.sort((a, b) => b.pricePerDay - a.pricePerDay);
    } else if (selectedSort === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (selectedSort === 'brand') {
      list.sort((a, b) => a.brand.localeCompare(b.brand));
    }

    return list;
  }, [vehicles, favorites, search, selectedCategory, selectedTransmission, maxPrice, selectedSort]);

  const totalEstimatedCost = useMemo(() => {
    return savedVehicles.reduce((acc, v) => acc + v.pricePerDay, 0);
  }, [savedVehicles]);

  const averageDaily = savedVehicles.length ? Math.round(totalEstimatedCost / savedVehicles.length) : 0;

  const handleClearAll = () => {
    Alert.alert('Clear shortlist?', 'Do you want to remove all saved cars from your shortlist?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear all',
        style: 'destructive',
        onPress: () => {
          favorites.forEach((id) => void toggleFavorite(id));
        },
      },
    ]);
  };

  const renderHeaderActions = () => (
    <View style={styles.headerActionsCluster}>
      {/* Switch Theme Button */}
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

      {/* Filters Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Filter favorites"
        onPress={() => setFilterModalOpen(true)}
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

      {/* Trash button if items exist */}
      {favorites.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remove all saved"
          onPress={handleClearAll}
          style={[
            styles.headerActionBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="trash-2" size={16} color={colors.destructive} />
        </Pressable>
      )}
    </View>
  );

  const renderActiveFilters = () => {
    if (!hasActiveFilters) return null;
    return (
      <View style={styles.activeFiltersRow}>
        {selectedCategory !== 'All' && (
          <View style={[styles.activeFilterChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Text style={[styles.activeFilterChipText, { color: colors.foreground }]}>
              {selectedCategory}
            </Text>
            <Pressable onPress={() => setSelectedCategory('All')} hitSlop={6}>
              <Feather name="x" size={12} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}
        {selectedTransmission && (
          <View style={[styles.activeFilterChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Text style={[styles.activeFilterChipText, { color: colors.foreground }]}>
              {selectedTransmission}
            </Text>
            <Pressable onPress={() => setSelectedTransmission(null)} hitSlop={6}>
              <Feather name="x" size={12} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}
        {maxPrice !== null && (
          <View style={[styles.activeFilterChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Text style={[styles.activeFilterChipText, { color: colors.foreground }]}>
              Under ${maxPrice}/d
            </Text>
            <Pressable onPress={() => setMaxPrice(null)} hitSlop={6}>
              <Feather name="x" size={12} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}
        {selectedSort !== 'recommended' && (
          <View style={[styles.activeFilterChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Text style={[styles.activeFilterChipText, { color: colors.foreground }]}>
              Sort: {selectedSort}
            </Text>
            <Pressable onPress={() => setSelectedSort('recommended')} hitSlop={6}>
              <Feather name="x" size={12} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}
        <Pressable onPress={handleResetFavoritesFilters} style={styles.resetFiltersBtn}>
          <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>Reset All</Text>
        </Pressable>
      </View>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={filterModalOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setFilterModalOpen(false)}
    >
      <Pressable
        style={styles.modalBackdrop}
        onPress={() => setFilterModalOpen(false)}
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
                Filter Saved Cars
              </Text>
            </View>
            <Pressable
              onPress={() => setFilterModalOpen(false)}
              hitSlop={8}
              style={[styles.closeModalBtn, { borderColor: colors.border }]}
            >
              <Feather name="x" size={16} color={colors.foreground} />
            </Pressable>
          </View>

          {/* Category Chips */}
          <View style={{ gap: 6, marginTop: 14 }}>
            <Text style={[styles.filterSectionLabel, { color: colors.foreground }]}>
              Vehicle Category
            </Text>
            <View style={styles.filterPillsRow}>
              {['All', 'Sedan', 'SUV', 'Luxury', 'Electric', 'Convertible', 'Sports'].map((cat) => {
                const isSel = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
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
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Sort By */}
          <View style={{ gap: 6, marginTop: 14 }}>
            <Text style={[styles.filterSectionLabel, { color: colors.foreground }]}>
              Sort By
            </Text>
            <View style={styles.filterPillsRow}>
              {[
                { key: 'recommended', label: 'Recommended' },
                { key: 'price-asc', label: 'Price: Low to High' },
                { key: 'price-desc', label: 'Price: High to Low' },
                { key: 'rating', label: 'Highest Rated' },
                { key: 'brand', label: 'Brand (A-Z)' },
              ].map((s) => {
                const isSel = selectedSort === s.key;
                return (
                  <Pressable
                    key={s.key}
                    onPress={() => setSelectedSort(s.key as any)}
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

          {/* Max Price */}
          <View style={{ gap: 6, marginTop: 14 }}>
            <Text style={[styles.filterSectionLabel, { color: colors.foreground }]}>
              Daily Budget
            </Text>
            <View style={styles.filterPillsRow}>
              {[
                { label: 'Any Price', val: null },
                { label: '< $150/d', val: 150 },
                { label: '< $250/d', val: 250 },
                { label: '< $400/d', val: 400 },
              ].map((p) => {
                const isSel = maxPrice === p.val;
                return (
                  <Pressable
                    key={p.label}
                    onPress={() => setMaxPrice(p.val)}
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
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Transmission */}
          <View style={{ gap: 6, marginTop: 14 }}>
            <Text style={[styles.filterSectionLabel, { color: colors.foreground }]}>
              Transmission
            </Text>
            <View style={styles.filterPillsRow}>
              {[
                { label: 'All', val: null },
                { label: 'Automatic', val: 'Automatic' },
                { label: 'Manual', val: 'Manual' },
              ].map((t) => {
                const isSel = selectedTransmission === t.val;
                return (
                  <Pressable
                    key={t.label}
                    onPress={() => setSelectedTransmission(t.val)}
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
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Modal Actions */}
          <View style={styles.filterModalActions}>
            <Pressable
              onPress={handleResetFavoritesFilters}
              style={[styles.filterResetBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.filterResetBtnText, { color: colors.foreground }]}>
                Reset
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFilterModalOpen(false)}
              style={[styles.filterApplyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.filterApplyBtnText}>Apply Filters</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  if (!session) {
    return (
      <Page tabbed>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eyebrow, { color: colors.accent }]}>YOUR SHORTLIST</Text>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Saved Rides</Text>
          </View>
          {renderHeaderActions()}
        </View>
        {renderActiveFilters()}

        {/* Account Locked Card */}
        <View
          style={[
            styles.authLockCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.authLockIconWrap, { backgroundColor: colors.secondary }]}>
            <Feather name="heart" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.authLockTitle, { color: colors.foreground }]}>
            Account Required
          </Text>
          <Text style={[styles.authLockSubtitle, { color: colors.mutedForeground }]}>
            Create an account or sign in to save luxury vehicles to your personal shortlist and track your favorites across all devices.
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create Account or Sign In"
            onPress={() => router.push('/register')}
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

  return (
    <Page tabbed>
      {/* ─── HEADER (Matching Screen 3 "My Chart") ─── */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>YOUR SHORTLIST</Text>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Saved Rides</Text>
        </View>
        {renderHeaderActions()}
      </View>
      {renderActiveFilters()}

      {/* ─── SEARCH IN SHORTLIST ─── */}
      {favorites.length > 1 && (
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search saved cars.."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Feather name="x-circle" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      )}

      {apiError && <Notice text={`Live catalog unavailable. ${apiError}`} retry={() => void refresh()} />}

      {/* ─── SHORTLIST CARDS (Matching Screen 3 item cards) ─── */}
      {savedVehicles.length === 0 ? (
        <EmptyState
          icon="heart"
          title={favorites.length === 0 ? 'Your shortlist is empty' : 'No matching saved cars'}
          detail={favorites.length === 0 ? 'Tap the heart icon on any car in the catalog to save it here for later.' : 'Try another search term.'}
          action="Browse cars"
          onAction={() => router.push('/(tabs)/search')}
        />
      ) : (
        <View style={{ gap: 12, marginBottom: 20 }}>
          {savedVehicles.map((vehicle) => (
            <Pressable
              key={vehicle.id}
              accessibilityLabel={`View ${vehicle.brand} ${vehicle.model}`}
              onPress={() => router.push({ pathname: '/cars/[slug]', params: { slug: vehicle.slug } })}
              style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {/* Left thumbnail */}
              <View style={[styles.thumbWrap, { backgroundColor: colors.secondary }]}>
                <Image
                  source={{ uri: vehicle.image }}
                  contentFit="cover"
                  style={styles.thumbImage}
                  transition={160}
                />
              </View>

              {/* Middle details */}
              <View style={styles.itemInfo}>
                <Text numberOfLines={1} style={[styles.itemTitle, { color: colors.foreground }]}>
                  {vehicle.brand} {vehicle.model}
                </Text>
                <Text numberOfLines={1} style={[styles.itemSubtitle, { color: colors.mutedForeground }]}>
                  {vehicle.category} · {vehicle.location.split(',')[0]}
                </Text>
                <View style={styles.itemPriceRow}>
                  <Text style={[styles.itemPrice, { color: colors.foreground }]}>${vehicle.pricePerDay}</Text>
                  <Text style={[styles.itemPerDay, { color: colors.mutedForeground }]}> / day</Text>
                </View>
              </View>

              {/* Right action column */}
              <View style={styles.actionCol}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remove from shortlist"
                  onPress={(e) => {
                    e.stopPropagation();
                    void toggleFavorite(vehicle.id);
                  }}
                  hitSlop={8}
                  style={[styles.removeBtn, { backgroundColor: colors.secondary }]}
                >
                  <Feather name="trash-2" size={15} color={colors.destructive} />
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Book car"
                  onPress={() => router.push({ pathname: '/cars/[slug]', params: { slug: vehicle.slug } })}
                  style={[styles.bookPillBtn, { backgroundColor: colors.accent }]}
                >
                  <Text style={styles.bookPillText}>Book</Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* ─── SUMMARY CARD (Matching Screen 3 "Amount" summary) ─── */}
      {savedVehicles.length > 0 && (
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Trip Estimate</Text>

          <View style={styles.summaryLine}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Saved cars</Text>
            <Text style={[styles.summaryVal, { color: colors.foreground }]}>{savedVehicles.length}</Text>
          </View>

          <View style={styles.summaryLine}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Average daily rate</Text>
            <Text style={[styles.summaryVal, { color: colors.foreground }]}>${averageDaily} / day</Text>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

          <View style={styles.summaryLine}>
            <Text style={[styles.summaryTotalLabel, { color: colors.foreground }]}>Total daily rates</Text>
            <Text style={[styles.summaryTotalVal, { color: colors.foreground }]}>${totalEstimatedCost}</Text>
          </View>

          <View style={{ marginTop: 14 }}>
            <ActionButton
              title="Explore More Cars"
              onPress={() => router.push('/(tabs)/search')}
              icon="arrow-right"
            />
          </View>
        </View>
      )}
      {renderFilterModal()}
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
  modalBackdrop: {
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
  clearBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  /* Screen 3 item card layout */
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 22,
    padding: 12,
    gap: 12,
  },
  thumbWrap: {
    width: 86,
    height: 86,
    borderRadius: 16,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemSubtitle: {
    fontSize: 12,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  itemPerDay: {
    fontSize: 11,
  },
  actionCol: {
    alignItems: 'flex-end',
    gap: 10,
  },
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookPillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bookPillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  /* Screen 3 Summary Box */
  summaryCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 10,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  summaryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 4,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  summaryTotalVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  /* Auth Locked State */
  authLockCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 24,
    padding: 32,
    marginTop: 30,
    gap: 12,
  },
  authLockIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  authLockTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  authLockSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 290,
    marginBottom: 10,
  },
  authPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
    maxWidth: 280,
  },
  authPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});