import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
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
  const { favorites, vehicles, toggleFavorite, apiError, refresh } = useDriveFlex();
  const [search, setSearch] = useState('');

  const savedVehicles = useMemo(() => {
    return vehicles.filter((v) => favorites.includes(v.id) && (
      !search.trim() || `${v.brand} ${v.model} ${v.category} ${v.location}`.toLowerCase().includes(search.trim().toLowerCase())
    ));
  }, [vehicles, favorites, search]);

  const totalEstimatedCost = useMemo(() => {
    return savedVehicles.reduce((acc, v) => acc + v.pricePerDay, 0);
  }, [savedVehicles]);

  const averageDaily = savedVehicles.length ? Math.round(totalEstimatedCost / savedVehicles.length) : 0;

  return (
    <Page tabbed>
      {/* ─── HEADER (Matching Screen 3 "My Chart") ─── */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>YOUR SHORTLIST</Text>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Saved Rides</Text>
        </View>

        {favorites.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remove all saved"
            onPress={() => {
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
            }}
            style={[styles.clearBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="trash-2" size={17} color={colors.destructive} />
          </Pressable>
        )}
      </View>

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
});