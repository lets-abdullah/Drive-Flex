import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BrandLogo, POPULAR_BRANDS } from '@/components/BrandLogos';
import { VehicleCardSearchResult } from '@/components/CardDesigns';
import { InteractiveMap } from '@/components/InteractiveMap';
import { EmptyState, Page } from '@/components/Marketplace';
import { categories, type Vehicle } from '@/data/catalog';
import { PAKISTAN_CITIES } from '@/lib/location-data';
import { useDriveFlex } from '@/context/AppContext';
import { useLocationFilter } from '@/context/LocationContext';
import { useColors } from '@/hooks/useColors';

export default function SearchScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{
    category?: string;
    brand?: string;
  }>();

  const { vehicles } = useDriveFlex();
  const {
    currentCity,
    radiusKm,
    isFilterActive,
    applyLocation,
    clearFilter,
    detectUserLocation,
    isLocating,
    getDistanceToVehicle,
  } = useLocationFilter();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(
    isFilterActive ? currentCity.name : null
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    params.brand ?? null
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    params.category ?? 'All'
  );
  const [selectedTransmission, setSelectedTransmission] = useState<string | null>(
    null
  );
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>(
    'popular'
  );

  // Modals state
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Synchronize when route query params change (e.g. clicking brand from home screen)
  useEffect(() => {
    if (params.brand !== undefined) {
      setSelectedBrand(params.brand);
    }
    if (params.category !== undefined) {
      setSelectedCategory(params.category);
    }
  }, [params.brand, params.category]);

  // Synchronize with LocationContext city filter
  useEffect(() => {
    if (isFilterActive) {
      setSelectedCity(currentCity.name);
    }
  }, [isFilterActive, currentCity.name]);

  const handleSelectCity = (cityName: string | null) => {
    setSelectedCity(cityName);
    if (cityName) {
      const matched = PAKISTAN_CITIES.find(
        (c) => c.name.toLowerCase() === cityName.toLowerCase()
      );
      if (matched) {
        applyLocation(matched, radiusKm);
      }
    } else {
      clearFilter();
    }
  };

  // Handle GPS Auto-detect button
  const handleDetectGps = async () => {
    const detected = await detectUserLocation();
    if (detected) {
      applyLocation(detected, radiusKm);
      setSelectedCity(detected.name);
    }
  };

  // Filtered vehicles list (strictly 1 car per [City, Brand] pair)
  const filteredVehicles = useMemo(() => {
    const seenCityBrand = new Set<string>();

    const list = vehicles.filter((v) => {
      if (v.isDelisted || v.status === 'maintenance') return false;

      const vCity = (v.city_name || v.location.split(',')[0] || '').trim();

      // 1. Universal search text: matches brand, model, category, location, transmission, fuel
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q) ||
          vCity.toLowerCase().includes(q) ||
          v.transmission.toLowerCase().includes(q) ||
          (v.fuelType && v.fuelType.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // 2. City filter (exact city match so each city has 1 car per brand)
      if (selectedCity && vCity.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // 3. Brand filter
      if (
        selectedBrand &&
        !v.brand.toLowerCase().includes(selectedBrand.toLowerCase())
      ) {
        return false;
      }

      // 4. Category filter
      if (selectedCategory !== 'All' && v.category !== selectedCategory) {
        return false;
      }

      // 5. Transmission filter
      if (
        selectedTransmission &&
        v.transmission.toLowerCase() !== selectedTransmission.toLowerCase()
      ) {
        return false;
      }

      // 6. Price filter
      if (maxPrice !== null && v.pricePerDay > maxPrice) {
        return false;
      }

      // 7. Enforce strictly 1 car per (City, Brand) combination
      const pairKey = `${vCity.toLowerCase()}::${v.brand.trim().toLowerCase()}`;
      if (seenCityBrand.has(pairKey)) {
        return false;
      }
      seenCityBrand.add(pairKey);

      return true;
    });

    // 8. Sorting
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.pricePerDay - b.pricePerDay);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.pricePerDay - a.pricePerDay);
    } else {
      // Popular
      list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    return list;
  }, [
    vehicles,
    searchQuery,
    selectedCity,
    selectedBrand,
    selectedCategory,
    selectedTransmission,
    maxPrice,
    sortBy,
  ]);

  const activeFiltersCount =
    (selectedCity ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedTransmission ? 1 : 0) +
    (maxPrice !== null ? 1 : 0);

  const sortLabel =
    sortBy === 'price-asc'
      ? 'Price: Low'
      : sortBy === 'price-desc'
      ? 'Price: High'
      : 'Popular';

  const handleOpenFullMap = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    router.push('/map');
  };

  return (
    <Page tabbed>
      {/* ─── 1. TOP HEADER (Back Button + Search Cars + Map & Filter Sliders) ─── */}
      <View style={styles.topHeaderRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }}
          style={[
            styles.headerSquareBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="arrow-left" size={19} color={colors.foreground} />
        </Pressable>

        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Search Cars
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Interactive Map Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Interactive Fleet Map"
            onPress={handleOpenFullMap}
            style={[
              styles.headerSquareBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="map" size={17} color={colors.accent} />
          </Pressable>

          {/* Filter Sliders Button with Active Badge */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open all filters"
            onPress={() => setFilterModalVisible(true)}
            style={[
              styles.headerSquareBtn,
              {
                backgroundColor: activeFiltersCount > 0 ? colors.primary : colors.card,
                borderColor: activeFiltersCount > 0 ? colors.primary : colors.border,
              },
            ]}
          >
            <Feather
              name="sliders"
              size={18}
              color={activeFiltersCount > 0 ? '#FFFFFF' : colors.foreground}
            />
          </Pressable>
        </View>
      </View>

      {/* ─── 2. UNIVERSAL SEARCH BAR WITH GPS AUTO-DETECT BUTTON ─── */}
      <View
        style={[
          styles.locationBar,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Feather name="search" size={17} color={colors.primary} style={{ marginRight: 10 }} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by car, brand, city (e.g. Civic, Lahore)..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.locationInput, { color: colors.foreground }]}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8} style={{ marginRight: 8 }}>
            <Feather name="x-circle" size={16} color={colors.mutedForeground} />
          </Pressable>
        )}
        {/* GPS Target Crosshair Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Detect current GPS location"
          onPress={handleDetectGps}
          style={[
            styles.gpsDetectBtn,
            {
              backgroundColor: isLocating
                ? 'rgba(177, 18, 38, 0.15)'
                : colors.isDark
                ? '#1E1E1E'
                : '#F1F5F9',
            },
          ]}
        >
          {isLocating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Feather name="crosshair" size={17} color={colors.primary} />
          )}
        </Pressable>
      </View>

      {/* ─── 3A. CITY HORIZONTAL QUICK-SELECTOR ─── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.brandSelectorRow}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => handleSelectCity(null)}
          style={[
            styles.brandAllPill,
            {
              backgroundColor: selectedCity === null ? colors.primary : colors.card,
              borderColor: selectedCity === null ? colors.primary : colors.border,
              height: 36,
              paddingVertical: 6,
            },
          ]}
        >
          <Text
            style={[
              styles.brandAllText,
              { color: selectedCity === null ? '#FFFFFF' : colors.foreground, fontSize: 12 },
            ]}
          >
            All Cities
          </Text>
        </Pressable>

        {PAKISTAN_CITIES.map((city) => {
          const isSelected = selectedCity?.toLowerCase() === city.name.toLowerCase();
          return (
            <Pressable
              key={city.name}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${city.name}`}
              onPress={() => handleSelectCity(isSelected ? null : city.name)}
              style={[
                styles.brandAllPill,
                {
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                  height: 36,
                  paddingVertical: 6,
                  flexDirection: 'row',
                  gap: 5,
                },
              ]}
            >
              <Feather
                name="map-pin"
                size={11}
                color={isSelected ? '#FFFFFF' : colors.primary}
              />
              <Text
                style={[
                  styles.brandAllText,
                  { color: isSelected ? '#FFFFFF' : colors.foreground, fontSize: 12 },
                ]}
              >
                {city.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ─── 3B. BRAND HORIZONTAL QUICK-SELECTOR (Clean & Spacious) ─── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.brandSelectorRow}
      >
        {/* "All" Pill */}
        <Pressable
          accessibilityRole="button"
          onPress={() => setSelectedBrand(null)}
          style={[
            styles.brandAllPill,
            {
              backgroundColor: selectedBrand === null ? colors.primary : colors.card,
              borderColor: selectedBrand === null ? colors.primary : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.brandAllText,
              { color: selectedBrand === null ? '#FFFFFF' : colors.foreground },
            ]}
          >
            All Brands
          </Text>
        </Pressable>

        {/* Brand Circular Badges */}
        {POPULAR_BRANDS.map((item) => {
          const isSelected = selectedBrand === item.query;
          return (
            <Pressable
              key={item.name}
              accessibilityRole="button"
              accessibilityLabel={`Select ${item.name}`}
              onPress={() =>
                setSelectedBrand((prev) => (prev === item.query ? null : item.query))
              }
              style={[
                styles.brandSelectCircle,
                {
                  backgroundColor: colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                  transform: [{ scale: isSelected ? 1.05 : 1 }],
                },
              ]}
            >
              <BrandLogo
                brand={item.name}
                size={26}
                color={isSelected ? colors.primary : colors.foreground}
              />
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ─── 4. INTERACTIVE MAP COMPONENT (Prominent Maps, GPS, Radius) ─── */}
      <InteractiveMap
        vehicles={filteredVehicles}
        onSelectCluster={(cluster) => {
          const cleanCity = cluster.name.split('/')[0].replace('Cantt', '').trim();
          const matched = PAKISTAN_CITIES.find(
            (c) =>
              cleanCity.toLowerCase().includes(c.name.toLowerCase()) ||
              c.name.toLowerCase().includes(cleanCity.toLowerCase())
          );
          if (matched) {
            handleSelectCity(matched.name);
          }
        }}
        onOpenMap={handleOpenFullMap}
      />

      {/* ─── 5. RESULTS HEADER (Sort Dropdown & Count) ─── */}
      <View style={styles.resultsHeaderRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change sorting order"
          onPress={() => setSortModalVisible(true)}
          style={[
            styles.sortTriggerBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sortTriggerLabel, { color: colors.foreground }]}>
            Sort: <Text style={{ fontWeight: '700' }}>{sortLabel}</Text>
          </Text>
          <Feather name="chevron-down" size={13} color={colors.foreground} style={{ marginLeft: 4 }} />
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {selectedCity && (
            <Pressable
              onPress={() => handleSelectCity(null)}
              style={[styles.activeFilterChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            >
              <Feather name="map-pin" size={11} color={colors.primary} />
              <Text style={[styles.activeFilterChipText, { color: colors.foreground }]}>
                {selectedCity}
              </Text>
              <Feather name="x" size={11} color={colors.mutedForeground} />
            </Pressable>
          )}

          {selectedBrand && (
            <Pressable
              onPress={() => setSelectedBrand(null)}
              style={[styles.activeFilterChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            >
              <Text style={[styles.activeFilterChipText, { color: colors.foreground }]}>
                {selectedBrand}
              </Text>
              <Feather name="x" size={11} color={colors.mutedForeground} />
            </Pressable>
          )}

          <Text style={[styles.resultsCountText, { color: colors.mutedForeground }]}>
            {filteredVehicles.length} {filteredVehicles.length === 1 ? 'car' : 'cars'} found
          </Text>
        </View>
      </View>

      {/* ─── 6. VEHICLES LIST (Horizontal Cutout Cards with Distance) ─── */}
      {filteredVehicles.length === 0 ? (
        <View style={{ marginTop: 20 }}>
          <EmptyState
            title="No vehicles found"
            detail="Try clearing filters, switching brands, or adjusting search location."
            action="Reset Filters"
            onAction={() => {
              handleSelectCity(null);
              setSelectedBrand(null);
              setSelectedCategory('All');
              setSelectedTransmission(null);
              setMaxPrice(null);
              setSearchQuery('');
            }}
          />
        </View>
      ) : (
        <View style={styles.vehiclesListWrap}>
          {filteredVehicles.map((vehicle, index) => (
            <VehicleCardSearchResult
              key={vehicle.id}
              vehicle={vehicle}
              isFeatured={index < 3}
              onPress={() =>
                router.push({ pathname: '/cars/[slug]', params: { slug: vehicle.slug } })
              }
            />
          ))}
        </View>
      )}

      {/* ─── UNIFIED COMPREHENSIVE FILTER MODAL ─── */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.filterSheet,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="sliders" size={18} color={colors.primary} />
                <Text style={[styles.filterSheetTitle, { color: colors.foreground }]}>
                  Filter Vehicles
                </Text>
              </View>
              <Pressable
                onPress={() => setFilterModalVisible(false)}
                style={[styles.modalCloseBtn, { backgroundColor: colors.secondary }]}
              >
                <Feather name="x" size={17} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {/* City Filter */}
              <Text style={[styles.filterSectionLabel, { color: colors.mutedForeground }]}>
                CITY
              </Text>
              <View style={styles.filterOptionsWrap}>
                {[
                  { label: 'All Cities', val: null },
                  ...PAKISTAN_CITIES.map((c) => ({ label: c.name, val: c.name })),
                ].map((item) => {
                  const isSelected =
                    (item.val === null && selectedCity === null) ||
                    (item.val !== null && selectedCity?.toLowerCase() === item.val.toLowerCase());
                  return (
                    <Pressable
                      key={item.label}
                      onPress={() => handleSelectCity(item.val)}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.secondary,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.foreground,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Brand Filter */}
              <Text style={[styles.filterSectionLabel, { color: colors.mutedForeground, marginTop: 18 }]}>
                BRAND
              </Text>
              <View style={styles.filterOptionsWrap}>
                {[
                  { label: 'All Brands', val: null },
                  ...POPULAR_BRANDS.map((b) => ({ label: b.name, val: b.query })),
                ].map((item) => {
                  const isSelected = selectedBrand === item.val;
                  return (
                    <Pressable
                      key={item.label}
                      onPress={() => setSelectedBrand(item.val)}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.secondary,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.foreground,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Category / Body Type */}
              <Text style={[styles.filterSectionLabel, { color: colors.mutedForeground, marginTop: 18 }]}>
                BODY TYPE / CATEGORY
              </Text>
              <View style={styles.filterOptionsWrap}>
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.secondary,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.foreground,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Maximum Price / Day */}
              <Text style={[styles.filterSectionLabel, { color: colors.mutedForeground, marginTop: 18 }]}>
                MAXIMUM PRICE PER DAY
              </Text>
              <View style={styles.filterOptionsWrap}>
                {[
                  { label: 'Any Price', val: null },
                  { label: '< $80', val: 80 },
                  { label: '< $100', val: 100 },
                  { label: '< $150', val: 150 },
                  { label: '< $200', val: 200 },
                ].map((item) => {
                  const isSelected = maxPrice === item.val;
                  return (
                    <Pressable
                      key={item.label}
                      onPress={() => setMaxPrice(item.val)}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.secondary,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.foreground,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Transmission */}
              <Text style={[styles.filterSectionLabel, { color: colors.mutedForeground, marginTop: 18 }]}>
                TRANSMISSION
              </Text>
              <View style={styles.filterOptionsWrap}>
                {[
                  { label: 'Any', val: null },
                  { label: 'Automatic', val: 'Automatic' },
                  { label: 'Manual', val: 'Manual' },
                ].map((item) => {
                  const isSelected = selectedTransmission === item.val;
                  return (
                    <Pressable
                      key={item.label}
                      onPress={() => setSelectedTransmission(item.val)}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.secondary,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.foreground,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Bottom Actions: Reset and Apply */}
            <View style={styles.filterActionRow}>
              <Pressable
                onPress={() => {
                  handleSelectCity(null);
                  setSelectedBrand(null);
                  setSelectedCategory('All');
                  setMaxPrice(null);
                  setSelectedTransmission(null);
                  setFilterModalVisible(false);
                }}
                style={[styles.filterResetBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.filterResetBtnText, { color: colors.foreground }]}>
                  Reset
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setFilterModalVisible(false)}
                style={[styles.filterApplyBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.filterApplyBtnText}>Apply Filters</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── SORT MODAL ─── */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSortModalVisible(false)}>
          <View
            style={[
              styles.sortModalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sortModalTitle, { color: colors.foreground }]}>
              Sort Available Cars
            </Text>
            {[
              { id: 'popular', label: 'Most Popular' },
              { id: 'price-asc', label: 'Price: Low to High' },
              { id: 'price-desc', label: 'Price: High to Low' },
            ].map((opt) => {
              const isSelected = sortBy === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    setSortBy(opt.id as any);
                    setSortModalVisible(false);
                  }}
                  style={[
                    styles.sortChoiceRow,
                    isSelected && { backgroundColor: colors.secondary },
                  ]}
                >
                  <Text
                    style={[
                      styles.sortChoiceText,
                      {
                        color: isSelected ? colors.primary : colors.foreground,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {isSelected && <Feather name="check" size={16} color={colors.primary} />}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </Page>
  );
}

const styles = StyleSheet.create({
  /* Header */
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 4,
  },
  headerSquareBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  /* Location Input Bar */
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  locationInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 2,
  },
  gpsDetectBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Brand Selector Row */
  brandSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 4,
    marginBottom: 6,
  },
  brandAllPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  brandAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  brandSelectCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  /* Results Header */
  resultsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 6,
  },
  sortTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  sortTriggerLabel: {
    fontSize: 12,
  },
  resultsCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeFilterChipText: {
    fontSize: 11,
    fontWeight: '600',
  },

  /* Vehicles List */
  vehiclesListWrap: {
    marginTop: 4,
  },

  /* Modal Backdrop */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },

  /* Filter Sheet */
  filterSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 22,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterSheetTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  filterOptionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
  },
  filterActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 12,
  },
  filterResetBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterResetBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  filterApplyBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterApplyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Sort Modal Card */
  sortModalCard: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    marginBottom: 'auto',
    marginTop: 'auto',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  sortModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  sortChoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  sortChoiceText: {
    fontSize: 14,
  },
});