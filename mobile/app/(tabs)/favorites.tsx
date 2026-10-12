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
  const { favorites, vehicles, toggleFavorite, apiError, refresh, session, theme, toggleTheme } = useDriveFlex();
  const [search, setSearch] = useState('');

  const savedVehicles = useMemo(() => {
    let list = vehicles.filter((v) => favorites.includes(v.id));

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((v) =>
        `${v.brand} ${v.model} ${v.category} ${v.location} ${v.transmission}`.toLowerCase().includes(q)
      );
    }

    return list;
  }, [vehicles, favorites, search]);

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

  if (!session) {
    return (
      <Page tabbed>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            {/* <Text style={[styles.eyebrow, { color: colors.accent }]}>YOUR SHORTLIST</Text> */}
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Saved Rides</Text>
          </View>
        </View>

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