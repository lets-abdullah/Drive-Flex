import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { EmptyState, Notice, Page, Pill } from '@/components/Marketplace';
import { categories, type Vehicle } from '@/data/catalog';
import { useDriveFlex } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const cities = ['All cities', 'Lahore', 'Islamabad', 'Karachi'];

export default function SearchScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ category?: string }>();
  const { vehicles, favorites, toggleFavorite, apiError, refresh } = useDriveFlex();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(params.category ?? 'All');
  const [city, setCity] = useState('All cities');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (params.category && categories.includes(params.category)) {
      setCategory(params.category);
    }
  }, [params.category]);

  const filtered = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const searchText = `${vehicle.brand} ${vehicle.model} ${vehicle.category} ${vehicle.location}`.toLowerCase();
      const matchQuery = searchText.includes(query.trim().toLowerCase());
      const matchCategory = category === 'All' || vehicle.category === category;
      const matchCity = city === 'All cities' || vehicle.location.toLowerCase().startsWith(city.toLowerCase());
      const matchPrice = maxPrice === null || vehicle.pricePerDay <= maxPrice;
      return matchQuery && matchCategory && matchCity && matchPrice;
    });
  }, [vehicles, query, category, city, maxPrice]);

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = Math.max(150, (screenWidth - 52) / 2);

  const activeFilterCount = (category !== 'All' ? 1 : 0) + (city !== 'All cities' ? 1 : 0) + (maxPrice !== null ? 1 : 0);

  return (
    <Page tabbed>
      {/* ─── HEADER ─── */}
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>DISCOVER DRIVEFLEX</Text>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Find your{'\n'}next ride.</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Switch view"
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            style={[styles.viewToggleBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name={viewMode === 'grid' ? 'list' : 'grid'} size={18} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      {/* ─── SEARCH & FILTER ROW ─── */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search car, city, or category"
            placeholderTextColor={colors.mutedForeground}
            accessibilityLabel="Search cars"
            style={[styles.searchInput, { color: colors.foreground }]}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Feather name="x-circle" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open filters"
          onPress={() => setShowFilters(!showFilters)}
          style={[styles.filterButton, { backgroundColor: showFilters ? colors.foreground : colors.accent }]}
        >
          <Feather name="sliders" size={18} color={showFilters ? colors.background : '#ffffff'} />
          {activeFilterCount > 0 && !showFilters && (
            <View style={styles.filterDot} />
          )}
        </Pressable>
      </View>

      {/* ─── EXPANDABLE FILTER DRAWER ─── */}
      {showFilters && (
        <View style={[styles.filterDrawer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.drawerHeader}>
            <Text style={[styles.drawerTitle, { color: colors.foreground }]}>Filter Options</Text>
            {activeFilterCount > 0 && (
              <Pressable
                onPress={() => {
                  setCategory('All');
                  setCity('All cities');
                  setMaxPrice(null);
                }}
              >
                <Text style={[styles.resetText, { color: colors.accent }]}>Reset all</Text>
              </Pressable>
            )}
          </View>

          {/* City Chips */}
          <Text style={[styles.filterLabel, { color: colors.mutedForeground }]}>CITY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {cities.map((item) => (
              <Pill key={item} label={item} selected={city === item} onPress={() => setCity(item)} />
            ))}
          </ScrollView>

          {/* Budget */}
          <Text style={[styles.filterLabel, { color: colors.mutedForeground, marginTop: 14 }]}>DAILY BUDGET</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {[null, 75, 125, 200].map((price) => (
              <Pill
                key={price ?? 'any'}
                label={price ? `≤ $${price}` : 'Any budget'}
                selected={maxPrice === price}
                onPress={() => setMaxPrice(price)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* ─── CATEGORY HORIZONTAL PILLS ─── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((item) => {
          const isSelected = category === item;
          return (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected ? colors.accent : colors.card,
                  borderColor: isSelected ? colors.accent : colors.chipInactiveBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  {
                    color: isSelected ? '#ffffff' : colors.foreground,
                    fontWeight: isSelected ? '700' : '600',
                  },
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ─── STATUS & COUNT ─── */}
      <View style={styles.statusRow}>
        <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
          {filtered.length} {filtered.length === 1 ? 'ride available' : 'rides available'}
          {category !== 'All' ? ` in ${category}` : ''}
          {city !== 'All cities' ? ` (${city})` : ''}
        </Text>
      </View>

      {apiError && <Notice text={`Live catalog unavailable. ${apiError}`} retry={() => void refresh()} />}

      {/* ─── VEHICLE RESULTS (GRID OR LIST) ─── */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No cars match those filters"
          detail="Try another city, expand your budget, or choose a different category."
          action="Clear all filters"
          onAction={() => {
            setQuery('');
            setCategory('All');
            setCity('All cities');
            setMaxPrice(null);
          }}
        />
      ) : viewMode === 'grid' ? (
        /* 2-Column Grid (Screen 1 style) */
        <View style={styles.cardsGrid}>
          {filtered.map((vehicle) => {
            const isFav = favorites.includes(vehicle.id);
            return (
              <Pressable
                key={vehicle.id}
                onPress={() => router.push({ pathname: '/cars/[slug]', params: { slug: vehicle.slug } })}
                style={[
                  styles.gridCard,
                  {
                    width: cardWidth,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={[styles.gridImageWrap, { backgroundColor: colors.secondary }]}>
                  <Image source={{ uri: vehicle.image }} contentFit="cover" style={styles.gridImage} transition={150} />
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      void toggleFavorite(vehicle.id);
                    }}
                    hitSlop={6}
                    style={[styles.gridHeart, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <Feather name="heart" size={13} color={isFav ? colors.primary : colors.foreground} />
                  </Pressable>
                </View>
                <View style={[styles.gridTagBlock, { backgroundColor: colors.darkCard }]}>
                  <Text numberOfLines={1} style={styles.gridCategoryText}>{vehicle.category}</Text>
                  <Text numberOfLines={1} style={styles.gridTitleText}>{vehicle.brand} {vehicle.model}</Text>
                  <View style={styles.gridPriceRow}>
                    <Text style={styles.gridPriceText}>${vehicle.pricePerDay}</Text>
                    <Text style={styles.gridPerDayText}>/day</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        /* List Cards (Screen 3 style) */
        <View style={{ gap: 12, marginBottom: 24 }}>
          {filtered.map((vehicle) => {
            const isFav = favorites.includes(vehicle.id);
            return (
              <Pressable
                key={vehicle.id}
                onPress={() => router.push({ pathname: '/cars/[slug]', params: { slug: vehicle.slug } })}
                style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.listThumbWrap, { backgroundColor: colors.secondary }]}>
                  <Image source={{ uri: vehicle.image }} contentFit="cover" style={styles.listThumb} transition={150} />
                </View>
                <View style={styles.listInfo}>
                  <Text numberOfLines={1} style={[styles.listTitle, { color: colors.foreground }]}>
                    {vehicle.brand} {vehicle.model}
                  </Text>
                  <Text numberOfLines={1} style={[styles.listMeta, { color: colors.mutedForeground }]}>
                    {vehicle.category} · {vehicle.transmission} · {vehicle.location.split(',')[0]}
                  </Text>
                  <View style={styles.listPriceRow}>
                    <Text style={[styles.listPrice, { color: colors.foreground }]}>${vehicle.pricePerDay}</Text>
                    <Text style={[styles.listPerDay, { color: colors.mutedForeground }]}> / day</Text>
                  </View>
                </View>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    void toggleFavorite(vehicle.id);
                  }}
                  hitSlop={8}
                  style={[styles.listHeartBtn, { backgroundColor: colors.secondary }]}
                >
                  <Feather name="heart" size={16} color={isFav ? colors.primary : colors.foreground} />
                </Pressable>
              </Pressable>
            );
          })}
        </View>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -1,
    fontWeight: '800',
  },
  viewToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  searchBox: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ffffff',
  },
  filterDrawer: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  drawerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  resetText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 6,
    marginBottom: 14,
  },
  categoryChip: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  categoryChipText: {
    fontSize: 13,
  },
  statusRow: {
    marginBottom: 14,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  /* 2-Column Grid (Screen 1 style) */
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gridImageWrap: {
    height: 125,
    position: 'relative',
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridHeart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridTagBlock: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  gridCategoryText: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gridTitleText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '700',
  },
  gridPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  gridPriceText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '800',
  },
  gridPerDayText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.65)',
    marginLeft: 2,
  },
  /* List Cards (Screen 3 style) */
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 22,
    padding: 12,
    gap: 12,
  },
  listThumbWrap: {
    width: 86,
    height: 86,
    borderRadius: 16,
    overflow: 'hidden',
  },
  listThumb: {
    width: '100%',
    height: '100%',
  },
  listInfo: {
    flex: 1,
    gap: 4,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  listMeta: {
    fontSize: 11,
  },
  listPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  listPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  listPerDay: {
    fontSize: 11,
  },
  listHeartBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});