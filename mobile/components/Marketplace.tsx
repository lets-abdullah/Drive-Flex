import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { type ReactNode } from 'react';
import {
  ActivityIndicator,
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
import type { Vehicle } from '@/data/catalog';
import { useDriveFlex } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

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
          borderColor: selected ? colors.accent : colors.chipInactiveBorder,
          backgroundColor: selected ? colors.accent : colors.chipInactiveBg,
        },
      ]}
    >
      <Text
        style={[
          styles.pillText,
          {
            color: selected ? colors.accentForeground : colors.chipInactiveText,
            fontWeight: selected ? '700' : '600',
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function VehicleCard({ vehicle, compact = false }: { vehicle: Vehicle; compact?: boolean }) {
  const colors = useColors();
  const { favorites, toggleFavorite } = useDriveFlex();
  const isFavorite = favorites.includes(vehicle.id);
  return (
    <View
      style={[
        styles.vehicleCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          width: compact ? 260 : '100%',
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
        <View style={[styles.cardBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardBadgeText, { color: colors.foreground }]}>{vehicle.category.toUpperCase()}</Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        testID={`favorite-${vehicle.id}`}
        onPress={() => void toggleFavorite(vehicle.id)}
        style={[styles.heartButton, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Feather name="heart" size={16} color={isFavorite ? colors.primary : colors.foreground} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${vehicle.brand} ${vehicle.model}`}
        onPress={() => router.push({ pathname: '/cars/[slug]', params: { slug: vehicle.slug } })}
        style={({ pressed }) => [styles.vehicleInfo, pressed && { opacity: 0.84 }]}
      >
        <View style={styles.vehicleTitleRow}>
          <Text numberOfLines={1} style={[styles.vehicleTitle, { color: colors.foreground }]}>
            {vehicle.brand} {vehicle.model}
          </Text>
          <View style={styles.ratingRow}>
            <Feather name="star" size={13} color={colors.star} />
            <Text style={[styles.ratingText, { color: colors.foreground }]}>{vehicle.rating.toFixed(1)}</Text>
          </View>
        </View>
        <Text numberOfLines={1} style={[styles.vehicleMeta, { color: colors.mutedForeground }]}>
          {vehicle.location.split(',')[0]} · {vehicle.seats} seats · {vehicle.transmission}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.foreground }]}>${vehicle.pricePerDay.toLocaleString()}</Text>
          <Text style={[styles.perDay, { color: colors.mutedForeground }]}> / day</Text>
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
});