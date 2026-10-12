import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDriveFlex } from '@/context/AppContext';
import { useLocationFilter } from '@/context/LocationContext';
import { useColors } from '@/hooks/useColors';
import type { Vehicle } from '@/data/catalog';

/**
 * Screen 1 (Homepage) Featured Car Card (Vertical card for horizontal carousel)
 */
export function VehicleCardFeatured({
  vehicle,
  onPress,
}: {
  vehicle: Vehicle;
  onPress?: () => void;
}) {
  const colors = useColors();
  const { favorites, toggleFavorite } = useDriveFlex();
  const isFavorite = favorites.includes(vehicle.id);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({ pathname: '/cars/[slug]', params: { slug: vehicle.slug } });
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`View ${vehicle.brand} ${vehicle.model}`}
      style={({ pressed }) => [
        styles.featuredCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        pressed && { opacity: 0.93, transform: [{ scale: 0.98 }] },
      ]}
    >
      {/* Top row: Favorite Heart Icon */}
      <View style={styles.featuredHeartRow}>
        <Pressable
          hitSlop={8}
          onPress={(e) => {
            if (e && typeof e.stopPropagation === 'function') {
              e.stopPropagation();
            }
            void toggleFavorite(vehicle.id);
          }}
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Feather
            name="heart"
            size={18}
            color={isFavorite ? colors.primary : colors.mutedForeground}
          />
        </Pressable>
      </View>

      {/* Center: Car Cutout Image */}
      <View
        style={[
          styles.featuredImageWrap,
          { backgroundColor: colors.isDark ? '#111111' : '#F6F8FA' },
        ]}
      >
        <Image
          source={{ uri: vehicle.image }}
          contentFit="cover"
          style={styles.featuredImage}
          transition={200}
        />
      </View>

      {/* Bottom Information */}
      <View style={styles.featuredInfoWrap}>
        <Text numberOfLines={1} style={[styles.featuredTitle, { color: colors.foreground }]}>
          {vehicle.brand} {vehicle.model}
        </Text>

        {/* Price Row: $81/day */}
        <View style={styles.featuredPriceRow}>
          <Text style={[styles.featuredPriceBold, { color: colors.foreground }]}>
            ${vehicle.pricePerDay}
          </Text>
          <Text style={[styles.featuredPricePerDay, { color: colors.mutedForeground }]}>
            /day
          </Text>
        </View>

        {/* Specs row: Automatic | 5 Seats */}
        <View style={styles.featuredSpecsRow}>
          <View style={styles.featuredSpecItem}>
            <Feather name="settings" size={11} color={colors.mutedForeground} />
            <Text style={[styles.featuredSpecText, { color: colors.mutedForeground }]}>
              {vehicle.transmission === 'Automatic' ? 'Automatic' : 'Manual'}
            </Text>
          </View>
          <View style={styles.featuredSpecItem}>
            <Feather name="user" size={11} color={colors.mutedForeground} />
            <Text style={[styles.featuredSpecText, { color: colors.mutedForeground }]}>
              {vehicle.seats} Seats
            </Text>
          </View>
        </View>

        {/* Rating row: ★ 4.9 */}
        <View style={styles.featuredRatingRow}>
          <Feather name="star" size={12} color={colors.star} />
          <Text style={[styles.featuredRatingText, { color: colors.foreground }]}>
            {vehicle.rating ? vehicle.rating.toFixed(1) : '4.9'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Screen 2 (Searchpage) Car Result Card (Horizontal card with GPS distance and Featured tag)
 */
export function VehicleCardSearchResult({
  vehicle,
  isFeatured = true,
  onPress,
}: {
  vehicle: Vehicle;
  isFeatured?: boolean;
  onPress?: () => void;
}) {
  const colors = useColors();
  const { favorites, toggleFavorite } = useDriveFlex();
  const { getDistanceToVehicle } = useLocationFilter();
  const isFavorite = favorites.includes(vehicle.id);

  const distanceKm = getDistanceToVehicle(vehicle);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({ pathname: '/cars/[slug]', params: { slug: vehicle.slug } });
    }
  };

  // Clean location label
  const locationShort = vehicle.location
    ? vehicle.location.split(',')[0].trim()
    : 'Downtown';

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`View ${vehicle.brand} ${vehicle.model}`}
      style={({ pressed }) => [
        styles.searchCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
      ]}
    >
      {/* Left side: Clean vehicle cutout with Featured Badge */}
      <View
        style={[
          styles.searchImageContainer,
          { backgroundColor: colors.isDark ? '#121212' : '#F4F5F7' },
        ]}
      >
        {isFeatured && (
          <View style={[styles.featuredPillBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.featuredPillText}>Featured</Text>
          </View>
        )}
        <Image
          source={{ uri: vehicle.image }}
          contentFit="cover"
          style={styles.searchImage}
          transition={200}
        />
      </View>

      {/* Right side: Information */}
      <View style={styles.searchBody}>
        {/* Top: Title & Favorite Heart */}
        <View style={styles.searchTitleRow}>
          <Text numberOfLines={1} style={[styles.searchTitle, { color: colors.foreground }]}>
            {vehicle.brand} {vehicle.model}
          </Text>
          <Pressable
            hitSlop={8}
            onPress={(e) => {
              if (e && typeof e.stopPropagation === 'function') {
                e.stopPropagation();
              }
              void toggleFavorite(vehicle.id);
            }}
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Feather
              name="heart"
              size={17}
              color={isFavorite ? colors.primary : colors.mutedForeground}
            />
          </Pressable>
        </View>

        {/* Price: Bold $XX/day */}
        <View style={styles.searchPriceRow}>
          <Text style={[styles.searchPriceBold, { color: colors.foreground }]}>
            ${vehicle.pricePerDay}
          </Text>
          <Text style={[styles.searchPricePerDay, { color: colors.mutedForeground }]}>
            /day
          </Text>
        </View>

        {/* Specs: 3 micro-pills (transmission, seats, fuel) */}
        <View style={styles.searchSpecsRow}>
          <View style={styles.searchSpecItem}>
            <Feather name="settings" size={10} color={colors.mutedForeground} />
            <Text style={[styles.searchSpecText, { color: colors.mutedForeground }]}>
              {vehicle.transmission === 'Automatic' ? 'Auto' : 'Manual'}
            </Text>
          </View>
          <View style={styles.searchSpecItem}>
            <Feather name="user" size={10} color={colors.mutedForeground} />
            <Text style={[styles.searchSpecText, { color: colors.mutedForeground }]}>
              {vehicle.seats} Seats
            </Text>
          </View>
          <View style={styles.searchSpecItem}>
            <Feather name="zap" size={10} color={colors.mutedForeground} />
            <Text style={[styles.searchSpecText, { color: colors.mutedForeground }]}>
              {vehicle.fuelType || 'Petrol'}
            </Text>
          </View>
        </View>

        {/* Rating row: ★ 4.9 (124 reviews) */}
        <View style={styles.searchRatingRow}>
          <Feather name="star" size={11} color={colors.star} />
          <Text style={[styles.searchRatingText, { color: colors.foreground }]}>
            {vehicle.rating ? vehicle.rating.toFixed(1) : '4.9'}
          </Text>
          <Text style={[styles.searchReviewCount, { color: colors.mutedForeground }]}>
            ({vehicle.reviewCount || 98} reviews)
          </Text>
        </View>

        {/* Location & GPS Distance row: 📍 Dubai Marina • 3.2 km */}
        <View style={styles.searchDistanceRow}>
          <Feather name="map-pin" size={10} color={colors.primary} />
          <Text numberOfLines={1} style={[styles.searchDistanceText, { color: colors.mutedForeground }]}>
            {locationShort}
            {distanceKm !== null ? ` • ${distanceKm} km` : ' • 3.2 km'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  /* Featured Vertical Card */
  featuredCard: {
    width: 195,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  featuredHeartRow: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  featuredImageWrap: {
    width: '100%',
    height: 100,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredInfoWrap: {
    gap: 4,
  },
  featuredTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  featuredPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 2,
  },
  featuredPriceBold: {
    fontSize: 16,
    fontWeight: '800',
  },
  featuredPricePerDay: {
    fontSize: 12,
    marginLeft: 2,
  },
  featuredSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  featuredSpecItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  featuredSpecText: {
    fontSize: 11,
    fontWeight: '500',
  },
  featuredRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  featuredRatingText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* Search Horizontal Card */
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchImageContainer: {
    width: 122,
    height: 96,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  featuredPillBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 5,
  },
  featuredPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  searchImage: {
    width: '100%',
    height: '100%',
  },
  searchBody: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  searchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  searchTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  searchPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 1,
  },
  searchPriceBold: {
    fontSize: 16,
    fontWeight: '800',
  },
  searchPricePerDay: {
    fontSize: 11,
    marginLeft: 2,
  },
  searchSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  searchSpecItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  searchSpecText: {
    fontSize: 10,
    fontWeight: '500',
  },
  searchRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  searchRatingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchReviewCount: {
    fontSize: 10,
  },
  searchDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  searchDistanceText: {
    fontSize: 10,
    fontWeight: '500',
  },
});
