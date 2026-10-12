import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { Vehicle } from '@/data/catalog';
import { useDriveFlex } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { dateIsUnavailable, daysBetween, isoDate, shortDate } from '@/lib/dates';
import { resolveLocationCoords } from '@/lib/location-data';

export function Page({
  children,
  tabbed = false,
  contentStyle,
  ...props
}: ScrollViewProps & { children: ReactNode; tabbed?: boolean; contentStyle?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  // Status bar clearance: on Android/iOS, this height is permanently reserved for time, battery, and signal
  const androidStatus = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 32) : 0;
  const statusBarHeight = Platform.OS === 'web' ? 0 : Math.max(insets.top, androidStatus, 32);

  // Robust bottom inset: ensures content scrolls comfortably above the floating dock and system navigation buttons
  const isAndroid = Platform.OS === 'android';
  const dockBottom = isAndroid
    ? Math.max(insets.bottom, 24) + 12
    : Math.max(insets.bottom, 16) + 10;
  const bottomPadding = tabbed ? dockBottom + 60 + 24 : Math.max(insets.bottom, 20) + 28;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ─── Permanent Reserved Status Bar Area (Time & battery stay clean, data never overlaps) ─── */}
      <View style={{ height: statusBarHeight, backgroundColor: colors.background, width: '100%' }} />

      <ScrollView
        {...props}
        style={[{ flex: 1, backgroundColor: colors.background }, props.style]}
        contentContainerStyle={[
          {
            paddingTop: 12,
            paddingBottom: bottomPadding,
            paddingHorizontal: 20,
          },
          contentStyle,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const colors = useColors();
  return (
    <View style={styles.brandRow}>
      <View style={[styles.brandIcon, { backgroundColor: colors.accent }]}>
        <Feather name="navigation" size={compact ? 15 : 17} color={colors.accentForeground} />
      </View>
      <View>
        <Text style={[styles.brandName, { color: colors.foreground, fontSize: compact ? 14 : 16 }]}>DRIVEFLEX</Text>
        {!compact && <Text style={[styles.brandSub, { color: colors.mutedForeground }]}>RENTALS, REIMAGINED</Text>}
      </View>
    </View>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.sectionRow}>
      <View style={{ flex: 1 }}>
        {eyebrow && <Text style={[styles.eyebrow, { color: colors.accent }]}>{eyebrow.toUpperCase()}</Text>}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      </View>
      {action && onAction && (
        <Pressable onPress={onAction} accessibilityRole="button" style={styles.actionBtn}>
          <Text style={[styles.actionText, { color: colors.foreground }]}>{action}</Text>
          <Feather name="chevron-right" size={14} color={colors.foreground} />
        </Pressable>
      )}
    </View>
  );
}

export function Pill({ label, selected = false, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={[
        styles.pill,
        {
          borderColor: selected ? colors.primary : colors.chipInactiveBorder,
          backgroundColor: selected ? colors.primary : colors.chipInactiveBg,
        },
      ]}
    >
      <Text
        style={[
          styles.pillText,
          {
            color: selected ? '#FFFFFF' : colors.chipInactiveText,
            fontWeight: selected ? '700' : '600',
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function HorizontalRail({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.horizontalRailContent, style]}
      style={styles.horizontalRail}
    >
      {children}
    </ScrollView>
  );
}

export function VehicleCard({
  vehicle,
  compact = false,
  distanceText,
}: {
  vehicle: Vehicle;
  compact?: boolean;
  distanceText?: string | null;
}) {
  const colors = useColors();
  const { favorites, toggleFavorite } = useDriveFlex();
  const isFavorite = favorites.includes(vehicle.id);
  const locationLabel = distanceText || vehicle.location.split(',')[0];

  return (
    <View
      style={[
        styles.vehicleCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          width: compact ? 275 : '100%',
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${vehicle.brand} ${vehicle.model}`}
        testID={`vehicle-${vehicle.id}`}
        onPress={() => router.push({ pathname: '/cars/[slug]', params: { slug: vehicle.slug } })}
        style={({ pressed }) => [
          styles.vehicleImageWrap,
          { backgroundColor: colors.secondary },
          pressed && { opacity: 0.92 },
        ]}
      >
        <Image source={{ uri: vehicle.image }} contentFit="cover" style={styles.vehicleImage} transition={180} />
        
        {/* Category Pill Tag */}
        <View style={[styles.cardBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardBadgeText, { color: colors.foreground }]}>{vehicle.category.toUpperCase()}</Text>
        </View>

        {/* Verified Host Seal on Card */}
        <View style={styles.verifiedHostSeal}>
          <Feather name="shield" size={11} color="#10B981" />
          <Text style={styles.verifiedHostText}>Verified</Text>
        </View>
      </Pressable>

      {/* Heart Favorite Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        testID={`favorite-${vehicle.id}`}
        onPress={() => void toggleFavorite(vehicle.id)}
        style={[styles.heartButton, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Feather name="heart" size={16} color={isFavorite ? colors.primary : colors.mutedForeground} />
      </Pressable>

      {/* Card Content & Metrics */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${vehicle.brand} ${vehicle.model}`}
        onPress={() => router.push({ pathname: '/cars/[slug]', params: { slug: vehicle.slug } })}
        style={({ pressed }) => [styles.vehicleInfo, pressed && { opacity: 0.88 }]}
      >
        {/* Title & Rating */}
        <View style={styles.vehicleTitleRow}>
          <Text numberOfLines={1} style={[styles.vehicleTitle, { color: colors.foreground }]}>
            {vehicle.brand} {vehicle.model}
          </Text>
          <View style={styles.ratingRow}>
            <Feather name="star" size={13} color={colors.star} />
            <Text style={[styles.ratingText, { color: colors.star }]}>
              {vehicle.rating.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Concept 3 Inline 4-Metric Strip */}
        <View style={styles.metricStrip}>
          <View style={[styles.metricChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="user" size={10} color={colors.mutedForeground} />
            <Text style={[styles.metricChipText, { color: colors.foreground }]}>{vehicle.seats} Seats</Text>
          </View>
          <View style={[styles.metricChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="settings" size={10} color={colors.mutedForeground} />
            <Text style={[styles.metricChipText, { color: colors.foreground }]}>
              {vehicle.transmission === 'Automatic' ? 'Auto' : 'Manual'}
            </Text>
          </View>
          <View style={[styles.metricChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="zap" size={10} color={colors.mutedForeground} />
            <Text style={[styles.metricChipText, { color: colors.foreground }]}>{vehicle.fuelType || 'Gas'}</Text>
          </View>
          <View style={[styles.metricChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="map-pin" size={10} color={colors.accent} />
            <Text numberOfLines={1} style={[styles.metricChipText, { color: colors.foreground, maxWidth: 80 }]}>
              {locationLabel}
            </Text>
          </View>
        </View>

        {/* Pricing Anchor Stack & Quick Action */}
        <View style={styles.pricingAnchorRow}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={[styles.priceTabular, { color: colors.foreground }]}>
                ${vehicle.pricePerDay.toLocaleString()}
              </Text>
              <Text style={[styles.perDay, { color: colors.mutedForeground }]}> / day</Text>
            </View>
            {vehicle.reviewCount ? (
              <Text style={[styles.reviewCountText, { color: colors.mutedForeground }]}>
                ({vehicle.reviewCount} verified reviews)
              </Text>
            ) : null}
          </View>

          <View style={[styles.bookNowBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.bookNowBtnText}>Reserve</Text>
            <Feather name="arrow-right" size={13} color="#FFFFFF" />
          </View>
        </View>
      </Pressable>
    </View>
  );
}

export function ActionButton({
  title,
  onPress,
  disabled = false,
  quiet = false,
  icon,
  testID,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  quiet?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  testID?: string;
}) {
  const colors = useColors();
  const foreground = quiet ? colors.foreground : colors.primaryForeground;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.button, { backgroundColor: quiet ? colors.secondary : colors.primary, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 }]}
    >
      {icon && <Feather name={icon} size={17} color={foreground} />}
      <Text style={[styles.buttonText, { color: foreground }]}>{title}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline = false,
  autoCapitalize,
  secureTextEntry = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  secureTextEntry?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={{ gap: 8 }}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        accessibilityLabel={label}
        style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }, multiline && { minHeight: 104, textAlignVertical: 'top' }]}
      />
    </View>
  );
}

export function Notice({ text, retry }: { text: string; retry?: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.notice, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
      <Feather name="info" size={15} color={colors.accent} />
      <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>{text}</Text>
      {retry && <Pressable onPress={retry}><Text style={[styles.actionText, { color: colors.accent }]}>Retry</Text></Pressable>}
    </View>
  );
}

export function EmptyState({
  icon = 'search',
  title,
  detail,
  action,
  onAction,
}: {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  detail: string;
  action?: string;
  onAction?: () => void;
}) {
  const colors = useColors();
  return (
    <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}><Feather name={icon} size={22} color={colors.accent} /></View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.emptyDetail, { color: colors.mutedForeground }]}>{detail}</Text>
      {action && onAction && <ActionButton title={action} onPress={onAction} quiet />}
    </View>
  );
}

export function LoadingMark() {
  const colors = useColors();
  return <ActivityIndicator color={colors.accent} style={{ padding: 18 }} />;
}

export function Avatar({ uri, size = 44 }: { uri?: string; size?: number }) {
  const colors = useColors();
  return uri ? (
    <Image source={{ uri }} contentFit="cover" style={{ width: size, height: size, borderRadius: size / 2 }} />
  ) : (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }}>
      <Feather name="user" size={size * 0.44} color={colors.accent} />
    </View>
  );
}

/**
 * Screen 1: Available Cars horizontal card matching design reference
 */
export function VehicleCardHorizontal({
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
        styles.horizontalCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
      ]}
    >
      {/* Left side: Clean vehicle cutout */}
      <View style={[styles.horizontalCardImageWrap, { backgroundColor: colors.isDark ? '#111111' : '#F3F4F6' }]}>
        <Image
          source={{ uri: vehicle.image }}
          contentFit="cover"
          style={styles.horizontalCardImage}
          transition={200}
        />
      </View>

      {/* Right side: Information */}
      <View style={styles.horizontalCardBody}>
        {/* Top: Title & Favorite Heart */}
        <View style={styles.horizontalCardHeader}>
          <Text numberOfLines={1} style={[styles.horizontalCardTitle, { color: colors.foreground }]}>
            {vehicle.brand} {vehicle.model}
          </Text>
          <Pressable
            hitSlop={8}
            onPress={(e) => {
              e.stopPropagation();
              void toggleFavorite(vehicle.id);
            }}
            accessibilityRole="button"
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
        <View style={styles.horizontalPriceRow}>
          <Text style={[styles.horizontalPriceNumber, { color: colors.foreground }]}>
            ${vehicle.pricePerDay}
          </Text>
          <Text style={[styles.horizontalPricePerDay, { color: colors.mutedForeground }]}>
            /day
          </Text>
        </View>

        {/* Specs: 3 micro-pills (seats, transmission, fuel) */}
        <View style={styles.horizontalSpecsRow}>
          <View style={styles.horizontalSpecItem}>
            <Feather name="user" size={11} color={colors.mutedForeground} />
            <Text style={[styles.horizontalSpecText, { color: colors.mutedForeground }]}>
              {vehicle.seats} seats
            </Text>
          </View>
          <View style={styles.horizontalSpecItem}>
            <Feather name="settings" size={11} color={colors.mutedForeground} />
            <Text style={[styles.horizontalSpecText, { color: colors.mutedForeground }]}>
              {vehicle.transmission === 'Automatic' ? 'Automatic' : 'Manual'}
            </Text>
          </View>
          <View style={styles.horizontalSpecItem}>
            <Feather name="zap" size={11} color={colors.mutedForeground} />
            <Text style={[styles.horizontalSpecText, { color: colors.mutedForeground }]}>
              {vehicle.fuelType}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Screen 3: "Most popular car" card matching design reference
 */
export function VehicleCardPopular({
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
        styles.popularCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        pressed && { opacity: 0.94, transform: [{ scale: 0.99 }] },
      ]}
    >
      {/* Top row: Price and Heart icon */}
      <View style={styles.popularCardTopRow}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={[styles.popularPriceBold, { color: colors.foreground }]}>
            {vehicle.pricePerDay}$
          </Text>
          <Text style={[styles.popularPricePerDay, { color: colors.mutedForeground }]}>
            / day
          </Text>
        </View>

        <Pressable
          hitSlop={8}
          onPress={(e) => {
            e.stopPropagation();
            void toggleFavorite(vehicle.id);
          }}
          accessibilityRole="button"
        >
          <Feather
            name="heart"
            size={18}
            color={isFavorite ? colors.primary : colors.mutedForeground}
          />
        </Pressable>
      </View>

      {/* Center: Vehicle Studio Image */}
      <View style={styles.popularCardImageContainer}>
        <Image
          source={{ uri: vehicle.image }}
          contentFit="cover"
          style={styles.popularCardImage}
          transition={200}
        />
      </View>

      {/* Bottom row: Vehicle Name and Rating */}
      <View style={styles.popularCardBottomRow}>
        <Text numberOfLines={1} style={[styles.popularCardTitle, { color: colors.foreground }]}>
          {vehicle.brand} {vehicle.model}
        </Text>
        <View style={styles.popularRatingBadge}>
          <Feather name="star" size={13} color={colors.star} />
          <Text style={[styles.popularRatingText, { color: colors.foreground }]}>
            {vehicle.rating.toFixed(1)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Screen 4: 2x2 Specification Quadrant Grid matching design reference
 */
export function SpecQuadrantGrid({ vehicle }: { vehicle: Vehicle }) {
  const colors = useColors();

  const specs = [
    { label: 'Seats', value: `${vehicle.seats}` },
    { label: 'Fuel type', value: vehicle.fuelType || 'Petrol' },
    { label: 'Transmission', value: vehicle.transmission || 'Automatic' },
    { label: 'Fuel usage', value: vehicle.fuelUsage || '10 l / 100 km' },
  ];

  return (
    <View style={styles.specGridContainer}>
      {specs.map((item, index) => (
        <View
          key={index}
          style={[
            styles.specTile,
            {
              backgroundColor: colors.isDark ? '#141414' : '#F6F7F9',
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.specTileLabel, { color: colors.mutedForeground }]}>
            {item.label}
          </Text>
          <Text style={[styles.specTileValue, { color: colors.foreground }]}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Screen 4: "Last activity" card matching design reference
 */
export function LastActivityCard({ vehicle }: { vehicle: Vehicle }) {
  const colors = useColors();
  const activities = vehicle.lastActivity ?? [
    {
      renter: 'Andrew Dellington',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
      dateRange: '21 Sep, 22 - 9 Oct, 22',
      distance: '670 km',
    },
    {
      renter: 'Katy Jameson',
      avatar: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=200',
      dateRange: '12 Aug, 22 - 17 Aug, 22',
      distance: '276 km',
    },
  ];

  return (
    <View
      style={[
        styles.contextCard,
        {
          backgroundColor: colors.isDark ? '#141414' : '#FFFFFF',
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.contextCardHeader, { color: colors.foreground }]}>
        Last activity
      </Text>
      <View style={{ gap: 12, marginTop: 10 }}>
        {activities.map((act, i) => (
          <View key={i} style={styles.activityRow}>
            <Image
              source={{ uri: act.avatar }}
              style={styles.activityAvatar}
              contentFit="cover"
            />
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={[styles.activityRenterName, { color: colors.foreground }]}>
                {act.renter}
              </Text>
              <Text style={[styles.activityDateRange, { color: colors.mutedForeground }]}>
                {act.dateRange}
              </Text>
              <Text style={[styles.activityDistance, { color: colors.accent }]}>
                {act.distance}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Screen 4: "Location" proper interactive map card matching design reference
 * Displays real cartographic map preview of car's listed hub, with clickable deep link to Google/Apple Maps.
 */
export function LocationMiniCard({ vehicle }: { vehicle: Vehicle }) {
  const colors = useColors();
  const address = vehicle.pickupAddress || vehicle.location || 'Lahore, Pakistan';
  const dist = vehicle.distanceKm || '1.2 km';
  const duration = vehicle.durationEta || '14 min';

  const coords = resolveLocationCoords(address) || { lat: 31.5204, lng: 74.3587, name: 'Lahore' };

  const handleOpenMaps = () => {
    const query = encodeURIComponent(`${vehicle.brand} ${vehicle.model} - ${address}`);
    const lat = coords.lat;
    const lng = coords.lng;

    const url = Platform.select({
      ios: `maps:0,0?q=${query}@${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${query})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    });

    Linking.openURL(url!).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
    });
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open location for ${vehicle.brand} ${vehicle.model} in maps`}
      onPress={handleOpenMaps}
      style={({ pressed }) => [
        styles.contextCard,
        {
          backgroundColor: colors.isDark ? '#141414' : '#FFFFFF',
          borderColor: colors.border,
        },
        pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={styles.locationHeaderRow}>
        <Text style={[styles.contextCardHeader, { color: colors.foreground, marginBottom: 0 }]}>
          Location
        </Text>
        <View style={styles.openMapActionBadge}>
          <Text style={[styles.openMapActionText, { color: colors.accent }]}>Google Maps</Text>
          <Feather name="external-link" size={10} color={colors.accent} style={{ marginLeft: 3 }} />
        </View>
      </View>

      {/* Stylized Cartographic Map Thumbnail with Street Grids & Pin */}
      <View style={[styles.miniMapGraphic, { backgroundColor: colors.isDark ? '#0D1117' : '#E8EEF5' }]}>
        <Svg width="100%" height="100%" viewBox="0 0 160 70">
          {/* Water channel / River accent */}
          <Path
            d="M -10 50 Q 40 40 80 55 T 180 45"
            stroke={colors.isDark ? '#16283D' : '#BFDBFE'}
            strokeWidth="10"
            fill="none"
          />
          {/* Secondary road network */}
          <Path
            d="M 10 -5 L 45 75 M 120 -5 L 145 75 M -5 30 L 170 30 M -5 12 L 170 12 M 70 -5 L 65 75"
            stroke={colors.isDark ? '#21262D' : '#CBD5E1'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Main Expressway (e.g. Ring Road / GT Road) */}
          <Path
            d="M -10 65 Q 60 15 170 20"
            stroke={colors.isDark ? '#30363D' : '#94A3B8'}
            strokeWidth="4.5"
            fill="none"
          />
          {/* Road center highlight */}
          <Path
            d="M -10 65 Q 60 15 170 20"
            stroke={colors.isDark ? 'rgba(201, 162, 39, 0.4)' : '#F59E0B'}
            strokeWidth="1.2"
            strokeDasharray="4,3"
            fill="none"
          />
          {/* Radar ripple rings around car marker */}
          <Circle
            cx="80"
            cy="35"
            r="18"
            fill={colors.primary}
            fillOpacity={0.15}
          />
          <Circle
            cx="80"
            cy="35"
            r="11"
            fill={colors.primary}
            fillOpacity={0.25}
          />
          {/* Car Marker Pin */}
          <Circle
            cx="80"
            cy="35"
            r="7"
            fill={colors.primary}
          />
          <Circle
            cx="80"
            cy="35"
            r="2.5"
            fill="#FFFFFF"
          />
        </Svg>

        {/* Live GPS Tag */}
        <View style={styles.liveGpsBadge}>
          <View style={styles.liveGpsDot} />
          <Text style={styles.liveGpsText}>{coords.name || 'GPS Hub'}</Text>
        </View>
      </View>

      <Text numberOfLines={2} style={[styles.locationAddressText, { color: colors.foreground }]}>
        {address}
      </Text>

      <View style={styles.locationPillRow}>
        <Text style={[styles.locationPillText, { color: colors.mutedForeground }]}>
          {dist}
        </Text>
        <Text style={{ color: colors.mutedForeground }}>·</Text>
        <Text style={[styles.locationPillText, { color: colors.mutedForeground }]}>
          {duration}
        </Text>
        <Text style={{ color: colors.mutedForeground }}>·</Text>
        <Text style={[styles.locationPillText, { color: colors.accent, fontWeight: '700' }]}>
          Maps ↗
        </Text>
      </View>
    </Pressable>
  );
}

/**
 * Interactive Month-by-Month Calendar for selecting Pick-up and Return Dates
 */
export function RentalCalendarView({
  pickup,
  returnDate,
  onSelectPickup,
  onSelectReturnDate,
  vehicle,
  title = 'Select Rental Dates',
}: {
  pickup: string;
  returnDate: string;
  onSelectPickup: (date: string) => void;
  onSelectReturnDate: (date: string) => void;
  vehicle?: Vehicle;
  title?: string;
}) {
  const colors = useColors();
  const [selecting, setSelecting] = React.useState<'pickup' | 'returnDate'>('pickup');
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    const d = pickup ? new Date(`${pickup}T12:00:00`) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const nextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleDateString('en', { month: 'long', year: 'numeric' });

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = React.useMemo(() => {
    const arr: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      arr.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(d);
    }
    return arr;
  }, [firstDayOfWeek, daysInMonth]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysCount = daysBetween(pickup, returnDate);
  const dailyPrice = vehicle?.pricePerDay || 0;
  const totalPrice = daysCount * dailyPrice;

  const handleDayPress = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (vehicle && dateIsUnavailable(vehicle, dateStr)) return;

    if (selecting === 'pickup') {
      onSelectPickup(dateStr);
      if (dateStr >= returnDate) {
        const dt = new Date(`${dateStr}T12:00:00`);
        dt.setDate(dt.getDate() + 1);
        onSelectReturnDate(isoDate(dt));
      }
      setSelecting('returnDate');
    } else {
      if (dateStr > pickup) {
        onSelectReturnDate(dateStr);
        setSelecting('pickup');
      } else {
        onSelectPickup(dateStr);
        const dt = new Date(`${dateStr}T12:00:00`);
        dt.setDate(dt.getDate() + 1);
        onSelectReturnDate(isoDate(dt));
        setSelecting('returnDate');
      }
    }
  };

  const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <View
      style={[
        styles.calendarContainer,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {/* ─── Header: Title & Active Selection Tabs ─── */}
      <View style={styles.calendarHeaderRow}>
        <View style={styles.calendarTitleWrap}>
          <Feather name="calendar" size={17} color={colors.primary} />
          <Text style={[styles.calendarTitle, { color: colors.foreground }]}>{title}</Text>
        </View>
      </View>

      {/* ─── Departure vs Return Choice Chips ─── */}
      <View style={styles.calendarChoiceRow}>
        <Pressable
          onPress={() => setSelecting('pickup')}
          style={[
            styles.calendarChoiceChip,
            {
              backgroundColor: selecting === 'pickup' ? colors.secondary : 'transparent',
              borderColor: selecting === 'pickup' ? colors.primary : colors.border,
            },
          ]}
        >
          <Text style={[styles.calendarChoiceLabel, { color: colors.mutedForeground }]}>
            PICK-UP DATE
          </Text>
          <Text
            style={[
              styles.calendarChoiceVal,
              { color: selecting === 'pickup' ? colors.primary : colors.foreground },
            ]}
          >
            {shortDate(pickup)}
          </Text>
        </Pressable>

        <View style={styles.calendarChoiceArrow}>
          <Feather name="arrow-right" size={16} color={colors.mutedForeground} />
        </View>

        <Pressable
          onPress={() => setSelecting('returnDate')}
          style={[
            styles.calendarChoiceChip,
            {
              backgroundColor: selecting === 'returnDate' ? colors.secondary : 'transparent',
              borderColor: selecting === 'returnDate' ? colors.primary : colors.border,
            },
          ]}
        >
          <Text style={[styles.calendarChoiceLabel, { color: colors.mutedForeground }]}>
            RETURN DATE
          </Text>
          <Text
            style={[
              styles.calendarChoiceVal,
              { color: selecting === 'returnDate' ? colors.primary : colors.foreground },
            ]}
          >
            {shortDate(returnDate)}
          </Text>
        </Pressable>
      </View>

      {/* ─── Month Navigation ─── */}
      <View style={styles.calendarNavRow}>
        <Pressable
          hitSlop={10}
          onPress={prevMonth}
          style={[styles.calendarNavBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
        >
          <Feather name="chevron-left" size={18} color={colors.foreground} />
        </Pressable>

        <Text style={[styles.calendarMonthName, { color: colors.foreground }]}>
          {monthName}
        </Text>

        <Pressable
          hitSlop={10}
          onPress={nextMonth}
          style={[styles.calendarNavBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
        >
          <Feather name="chevron-right" size={18} color={colors.foreground} />
        </Pressable>
      </View>

      {/* ─── Weekday Headers (Su, Mo, Tu, We, Th, Fr, Sa) ─── */}
      <View style={styles.calendarWeekRow}>
        {dayHeaders.map((dh, i) => (
          <Text key={i} style={[styles.calendarWeekHeader, { color: colors.mutedForeground }]}>
            {dh}
          </Text>
        ))}
      </View>

      {/* ─── Day Grid Cells ─── */}
      <View style={styles.calendarDaysGrid}>
        {daysArray.map((day, idx) => {
          if (day === null) {
            return <View key={`blank-${idx}`} style={styles.calendarDayCell} />;
          }

          const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const cellDateTime = new Date(`${cellDateStr}T12:00:00`);
          const isPast = cellDateTime.getTime() < today.getTime();
          const isUnavailable = vehicle ? dateIsUnavailable(vehicle, cellDateStr) : false;
          const isPickup = cellDateStr === pickup;
          const isReturn = cellDateStr === returnDate;
          const isInRange = cellDateStr > pickup && cellDateStr < returnDate;

          return (
            <View
              key={`day-${day}`}
              style={[
                styles.calendarDayCell,
                isInRange && { backgroundColor: 'rgba(177, 18, 38, 0.12)' },
                isPickup && styles.calendarDayPickupWrap,
                isReturn && styles.calendarDayReturnWrap,
              ]}
            >
              <Pressable
                disabled={isPast || isUnavailable}
                onPress={() => handleDayPress(day)}
                style={[
                  styles.calendarDayBtn,
                  (isPickup || isReturn) && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    { color: colors.foreground },
                    (isPickup || isReturn) && { color: '#FFFFFF', fontWeight: '800' },
                    isInRange && { color: colors.primary, fontWeight: '700' },
                    (isPast || isUnavailable) && { color: colors.mutedForeground, opacity: 0.3 },
                  ]}
                >
                  {day}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* ─── Bottom Summary Row ─── */}
      <View style={[styles.calendarSummaryBar, { borderTopColor: colors.border }]}>
        <View style={styles.calendarDurationPill}>
          <Feather name="clock" size={13} color={colors.accent} />
          <Text style={[styles.calendarDurationText, { color: colors.foreground }]}>
            {daysCount} {daysCount === 1 ? 'Day' : 'Days'} Duration
          </Text>
        </View>

        {dailyPrice > 0 && (
          <View style={styles.calendarPriceSummary}>
            <Text style={[styles.calendarPriceEst, { color: colors.foreground }]}>
              Est. ${totalPrice}
            </Text>
            <Text style={[styles.calendarPricePerDay, { color: colors.mutedForeground }]}>
              (${dailyPrice}/day)
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontWeight: '800', letterSpacing: 1.5 },
  brandSub: { fontSize: 8, letterSpacing: 1.3, marginTop: 2 },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 15 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.8, marginBottom: 5 },
  sectionTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.45 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 13, fontWeight: '600' },
  pill: { borderWidth: 1, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 10, marginRight: 8 },
  pillText: { fontSize: 13, fontWeight: '600' },
  vehicleCard: { overflow: 'hidden', borderWidth: 1, borderRadius: 24, marginBottom: 16 },
  vehicleImageWrap: { height: 180, position: 'relative' },
  vehicleImage: { width: '100%', height: '100%' },
  cardBadge: { position: 'absolute', left: 14, top: 14, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  cardBadgeText: { fontSize: 10, letterSpacing: 0.8, fontWeight: '700' },
  heartButton: { position: 'absolute', right: 14, top: 14, width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  vehicleInfo: { padding: 16 },
  vehicleTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  vehicleTitle: { flex: 1, fontSize: 16, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '700' },
  vehicleMeta: { fontSize: 12, marginTop: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12 },
  price: { fontSize: 19, fontWeight: '800' },
  perDay: { fontSize: 12 },
  horizontalRail: { marginVertical: 6 },
  horizontalRailContent: { paddingHorizontal: 4, paddingRight: 24, alignItems: 'center' },
  verifiedHostSeal: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(10, 10, 10, 0.78)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  verifiedHostText: { fontSize: 10, fontWeight: '700', color: '#10B981', letterSpacing: 0.3 },
  metricStrip: { flexDirection: 'row', flexWrap: 'nowrap', gap: 6, marginTop: 10, marginBottom: 12 },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  metricChipText: { fontSize: 11, fontWeight: '600' },
  pricingAnchorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.15)',
  },
  priceTabular: { fontSize: 19, fontWeight: '800' },
  reviewCountText: { fontSize: 11, marginTop: 2 },
  bookNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
  },
  bookNowBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  button: { minHeight: 52, paddingHorizontal: 20, borderRadius: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  buttonText: { fontSize: 15, fontWeight: '700' },
  fieldLabel: { fontSize: 12, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 16, minHeight: 50, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15 },
  notice: { flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16 },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 17 },
  emptyCard: { borderWidth: 1, borderRadius: 24, padding: 26, alignItems: 'center', gap: 12 },
  emptyIcon: { width: 52, height: 52, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyDetail: { fontSize: 13, lineHeight: 19, textAlign: 'center', marginBottom: 4 },

  /* Screen 1: Horizontal Card Styles */
  horizontalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  horizontalCardImageWrap: {
    width: 110,
    height: 80,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  horizontalCardImage: {
    width: '100%',
    height: '100%',
  },
  horizontalCardBody: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  horizontalCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  horizontalPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
    marginBottom: 6,
  },
  horizontalPriceNumber: {
    fontSize: 16,
    fontWeight: '800',
  },
  horizontalPricePerDay: {
    fontSize: 12,
  },
  horizontalSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  horizontalSpecItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  horizontalSpecText: {
    fontSize: 11,
    fontWeight: '500',
  },

  /* Screen 3: Popular Car Card Styles */
  popularCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  popularCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularPriceBold: {
    fontSize: 18,
    fontWeight: '800',
  },
  popularPricePerDay: {
    fontSize: 13,
  },
  popularCardImageContainer: {
    width: '100%',
    height: 140,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
  popularCardImage: {
    width: '100%',
    height: '100%',
  },
  popularCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  popularCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  popularRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularRatingText: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* Screen 4: 2x2 Spec Quadrant Grid */
  specGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 18,
  },
  specTile: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  specTileLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  specTileValue: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },

  /* Screen 4: Context & Dual Cards (Activity & Location) */
  contextCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  contextCardHeader: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activityAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  activityRenterName: {
    fontSize: 12,
    fontWeight: '700',
  },
  activityDateRange: {
    fontSize: 10,
    marginTop: 1,
  },
  activityDistance: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  miniMapGraphic: {
    height: 68,
    borderRadius: 12,
    position: 'relative',
    marginVertical: 8,
    overflow: 'hidden',
  },
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  openMapActionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(201, 162, 39, 0.12)',
  },
  openMapActionText: {
    fontSize: 10,
    fontWeight: '700',
  },
  liveGpsBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  liveGpsDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  liveGpsText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  locationAddressText: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 6,
  },
  locationPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationPillText: {
    fontSize: 10.5,
    fontWeight: '600',
  },

  /* RentalCalendarView Styles */
  calendarContainer: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginVertical: 14,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  calendarChoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  calendarChoiceChip: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  calendarChoiceLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  calendarChoiceVal: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  calendarChoiceArrow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  calendarNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarMonthName: {
    fontSize: 15,
    fontWeight: '800',
  },
  calendarWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  calendarWeekHeader: {
    width: 38,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
  },
  calendarDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayCell: {
    width: `${100 / 7}%`,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 1,
  },
  calendarDayPickupWrap: {
    borderTopLeftRadius: 21,
    borderBottomLeftRadius: 21,
    backgroundColor: 'rgba(177, 18, 38, 0.2)',
  },
  calendarDayReturnWrap: {
    borderTopRightRadius: 21,
    borderBottomRightRadius: 21,
    backgroundColor: 'rgba(177, 18, 38, 0.2)',
  },
  calendarDayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  calendarSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  calendarDurationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calendarDurationText: {
    fontSize: 13,
    fontWeight: '700',
  },
  calendarPriceSummary: {
    alignItems: 'flex-end',
  },
  calendarPriceEst: {
    fontSize: 14,
    fontWeight: '800',
  },
  calendarPricePerDay: {
    fontSize: 11,
    marginTop: 1,
  },
});