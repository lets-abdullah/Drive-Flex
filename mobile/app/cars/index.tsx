import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
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

export default function ViewAllCarsScreen() {
  const colors = useColors();
  const { vehicles, favorites, toggleFavorite, apiError, refresh } = useDriveFlex();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All cities');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const matchSearch = `${v.brand} ${v.model} ${v.category} ${v.location}`.toLowerCase().includes(query.trim().toLowerCase());
      const matchCat = selectedCategory === 'All' || v.category === selectedCategory;
      const matchCity = selectedCity === 'All cities' || v.location.toLowerCase().includes(selectedCity.toLowerCase());
      const matchPrice = maxPrice === null || v.pricePerDay <= maxPrice;
      return matchSearch && matchCat && matchCity && matchPrice;
    });
  }, [vehicles, query, selectedCategory, selectedCity, maxPrice]);

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = Math.max(150, (screenWidth - 52) / 2);

  return (
    <Page>
      {/* ─── HEADER ─── */}
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={[styles.circleBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="arrow-left" size={19} color={colors.foreground} />
        </Pressable>

        <Text style={[styles.headerTitle, { color: colors.foreground }]}>All Vehicles</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle view mode"
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          style={[styles.circleBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name={viewMode === 'grid' ? 'list' : 'grid'} size={18} color={colors.foreground} />
        </Pressable>
      </View>

      {/* ─── SEARCH & FILTER ROW ─── */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search all cars, cities..."
            placeholderTextColor={colors.mutedForeground}
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
          accessibilityLabel="Toggle filters"
          onPress={() => setShowFilters(!showFilters)}
          style={[styles.filterBtn, { backgroundColor: showFilters ? colors.foreground : colors.accent }]}
        >
          <Feather name="sliders" size={18} color={showFilters ? colors.background : '#ffffff'} />
        </Pressable>
      </View>

      {/* ─── EXPANDABLE FILTER OPTIONS ─── */}
      {showFilters && (
        <View style={[styles.filterPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.filterPanelLabel, { color: colors.foreground }]}>Filter by City</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipRow}>
            {cities.map((c) => (
              <Pill key={c} label={c} selected={selectedCity === c} onPress={() => setSelectedCity(c)} />
            ))}
          </ScrollView>

          <Text style={[styles.filterPanelLabel, { color: colors.foreground, marginTop: 12 }]}>Daily Budget</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipRow}>
            {[null, 75, 125, 200].map((price) => (
              <Pill
                key={price ?? 'any'}
                label={price ? `≤ $${price}` : 'Any price'}
                selected={maxPrice === price}
                onPress={() => setMaxPrice(price)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* ─── CATEGORY PILLS ROW ─── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
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
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ─── RESULT COUNT ─── */}
      <View style={styles.countRow}>
        <Text style={[styles.countText, { color: colors.mutedForeground }]}>
          Showing {filtered.length} {filtered.length === 1 ? 'vehicle' : 'vehicles'} in Pakistan
        </Text>
      </View>

      {apiError && <Notice text={`Live catalog unavailable. ${apiError}`} retry={() => void refresh()} />}

      {/* ─── VEHICLE LISTING (GRID OR LIST) ─── */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No vehicles match your criteria"
          detail="Try adjusting your search terms or clearing the selected filters."
          action="Reset Filters"
          onAction={() => {
            setQuery('');
            setSelectedCategory('All');
            setSelectedCity('All cities');
            setMaxPrice(null);
          }}
        />
      ) : viewMode === 'grid' ? (
        /* ─── 2-Column Grid (Screen 1 style) ─── */
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
        /* ─── Horizontal List Cards (Screen 3 style) ─── */
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
  headerRow: {
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
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
  filterBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPanel: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  filterPanelLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  filterChipRow: {
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
  countRow: {
    marginBottom: 14,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  /* 2-Column Grid */
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
  /* List Card (Screen 3 style) */
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
