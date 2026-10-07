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
  View,
} from 'react-native';
import { Notice, Page } from '@/components/Marketplace';
import { categories, type Vehicle } from '@/data/catalog';
import { useDriveFlex } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const colors = useColors();
  const { vehicles, apiConfigured, apiError, refresh, theme, toggleTheme, favorites, toggleFavorite } = useDriveFlex();
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter vehicles by category on the home screen
  const displayedVehicles = useMemo(() => {
    if (selectedCategory === 'All') return vehicles;
    return vehicles.filter((v) => v.category === selectedCategory);
  }, [vehicles, selectedCategory]);

  // Featured car for the hero card
  const heroVehicle = vehicles[0] ?? {
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    brand: 'Toyota',
    model: 'Fortuner',
  };

  return (
    <Page tabbed>
      {/* ─── 1. TOP BAR (Grid icon on left, Theme Toggle & Profile on right) ─── */}
      <View style={styles.topBar}>
        <View style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="grid" size={20} color={colors.foreground} />
        </View>

        <View style={styles.topBarActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            testID="theme-toggle"
            onPress={toggleTheme}
            style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather
              name={theme === 'dark' ? 'sun' : 'moon'}
              size={18}
              color={colors.accent}
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            testID="open-profile"
            onPress={() => router.push('/(tabs)/profile')}
            style={[styles.avatarButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          >
            <Feather name="user" size={19} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      {/* ─── 2. MAIN HEADLINE ─── */}
      <View style={styles.headlineSection}>
        <Text style={[styles.headline, { color: colors.foreground }]}>
          Find unique cars{'\n'}for your journey
        </Text>
      </View>

      {/* ─── 3. SEARCH ROW WITH TERRACOTTA FILTER BUTTON ─── */}
      <View style={styles.searchRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search cars"
          testID="home-search-bar"
          onPress={() => router.push('/(tabs)/search')}
          style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <Text style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}>
            Search cars, cities, models..
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open search filters"
          testID="home-filter-btn"
          onPress={() => router.push('/(tabs)/search')}
          style={[styles.filterButton, { backgroundColor: colors.accent }]}
        >
          <Feather name="sliders" size={18} color="#ffffff" />
        </Pressable>
      </View>

      {/* ─── 4. HERO PROMO BANNER CARD (Compact horizontal card matching reference) ─── */}
      <View style={[styles.promoCard, { backgroundColor: colors.darkCard, borderColor: colors.border }]}>
        <View style={styles.promoContent}>
          <Text style={styles.promoEyebrow}>Up to</Text>
          <Text style={styles.promoTitle}>30% Discount!</Text>
          <Text style={styles.promoSubtitle}>Limited-time rental offers</Text>
          <Pressable
            accessibilityRole="button"
            testID="hero-cta"
            onPress={() => router.push('/(tabs)/search')}
            style={({ pressed }) => [
              styles.promoCta,
              { backgroundColor: '#ffffff', opacity: pressed ? 0.88 : 1 },
            ]}
          >
            <Text style={styles.promoCtaText}>Shop Now</Text>
          </Pressable>
        </View>

        <View style={styles.promoImageContainer}>
          <Image
            source={{ uri: heroVehicle.image }}
            contentFit="cover"
            style={styles.promoImage}
            transition={200}
          />
        </View>
      </View>

      {/* API Notices if needed */}
      {!apiConfigured && (
        <Notice text="Preview mode: sample cars and local bookings saved on device." />
      )}
      {apiError && (
        <Notice
          text={`Live catalog unavailable. ${apiError}`}
          retry={() => void refresh()}
        />
      )}

      {/* ─── 5. POPULAR ITEMS HEADER + CATEGORY PILLS ─── */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Popular Items</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/cars' as any)}
          style={styles.viewAllRow}
        >
          <Text style={[styles.viewAllText, { color: colors.mutedForeground }]}>View all</Text>
          <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {/* Category Pills Row */}
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

      {/* ─── 6. TWO-COLUMN PRODUCT CARDS GRID (Matching Screen 1 bottom cards) ─── */}
      <View style={styles.cardsGrid}>
        {displayedVehicles.slice(0, 6).map((vehicle) => (
          <GridCard
            key={vehicle.id}
            vehicle={vehicle}
            isFavorite={favorites.includes(vehicle.id)}
            onToggleFavorite={() => void toggleFavorite(vehicle.id)}
          />
        ))}
      </View>

      {/* ─── 7. QUICK STATS ROW ─── */}
      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.statCol}>
          <Text style={[styles.statNum, { color: colors.foreground }]}>{vehicles.length}+</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Curated cars</Text>
        </View>
        <View style={[styles.statSep, { backgroundColor: colors.border }]} />
        <View style={styles.statCol}>
          <Text style={[styles.statNum, { color: colors.foreground }]}>3</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Key cities</Text>
        </View>
        <View style={[styles.statSep, { backgroundColor: colors.border }]} />
        <View style={styles.statCol}>
          <Text style={[styles.statNum, { color: colors.foreground }]}>4.9</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Host rating</Text>
        </View>
      </View>

      {/* ─── 8. HOST CARD BANNER ─── */}
      <View style={[styles.hostBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.hostIconBox, { backgroundColor: colors.secondary }]}>
          <Feather name="key" size={18} color={colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.hostHeading, { color: colors.foreground }]}>Have a car to share?</Text>
          <Text style={[styles.hostSub, { color: colors.mutedForeground }]}>Earn by hosting on DriveFlex.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/owner/onboard')}
          style={[styles.hostArrow, { backgroundColor: colors.secondary }]}
        >
          <Feather name="arrow-right" size={16} color={colors.foreground} />
        </Pressable>
      </View>
    </Page>
  );
}

/**
 * 2-Column Product Card modeled after Screen 1 in the reference image
 */
function GridCard({
  vehicle,
  isFavorite,
  onToggleFavorite,
}: {
  vehicle: Vehicle;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const colors = useColors();
  const screenWidth = Dimensions.get('window').width;
  // Account for 20px padding on each side (40px) and 12px gap
  const cardWidth = Math.max(150, (screenWidth - 52) / 2);

  return (
    <Pressable
      accessibilityLabel={`View ${vehicle.brand} ${vehicle.model}`}
      onPress={() => router.push({ pathname: '/cars/[slug]', params: { slug: vehicle.slug } })}
      style={({ pressed }) => [
        styles.gridCard,
        {
          width: cardWidth,
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      {/* Image enclosure */}
      <View style={[styles.gridImageWrap, { backgroundColor: colors.secondary }]}>
        <Image
          source={{ uri: vehicle.image }}
          contentFit="cover"
          style={styles.gridImage}
          transition={160}
        />
        {/* Heart button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          onPress={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          hitSlop={6}
          style={[styles.gridHeart, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather
            name="heart"
            size={13}
            color={isFavorite ? colors.primary : colors.foreground}
          />
        </Pressable>
      </View>

      {/* Bottom tag block matching the dark pill in reference */}
      <View style={[styles.gridTagBlock, { backgroundColor: colors.darkCard }]}>
        <Text numberOfLines={1} style={styles.gridCategoryText}>
          {vehicle.category}
        </Text>
        <Text numberOfLines={1} style={styles.gridTitleText}>
          {vehicle.brand} {vehicle.model}
        </Text>
        <View style={styles.gridPriceRow}>
          <Text style={styles.gridPriceText}>${vehicle.pricePerDay}</Text>
          <Text style={styles.gridPerDayText}>/day</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 2. Headline */
  headlineSection: {
    marginBottom: 16,
  },
  headline: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
  },

  /* 3. Search Row */
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  searchBar: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchPlaceholder: {
    fontSize: 14,
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 4. Hero Promo Banner Card */
  promoCard: {
    minHeight: 155,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 22,
    position: 'relative',
  },
  promoContent: {
    flex: 1.15,
    paddingLeft: 20,
    paddingVertical: 18,
    justifyContent: 'center',
    zIndex: 2,
  },
  promoEyebrow: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.72)',
    fontWeight: '600',
    marginBottom: 2,
  },
  promoTitle: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  promoSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.72)',
    marginTop: 3,
    marginBottom: 14,
  },
  promoCta: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignSelf: 'flex-start',
  },
  promoCtaText: {
    color: '#18181a',
    fontSize: 12,
    fontWeight: '700',
  },
  promoImageContainer: {
    flex: 0.95,
    height: 155,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoImage: {
    width: '100%',
    height: '100%',
    opacity: 0.92,
  },

  /* 5. Popular Items & Categories */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 6,
    marginBottom: 16,
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

  /* 6. 2-Column Cards Grid */
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 22,
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

  /* 7. Stats Card */
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 17,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statSep: {
    width: 1,
    height: 26,
  },

  /* 8. Host Banner */
  hostBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 8,
  },
  hostIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostHeading: {
    fontSize: 14,
    fontWeight: '700',
  },
  hostSub: {
    fontSize: 12,
    marginTop: 2,
  },
  hostArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});