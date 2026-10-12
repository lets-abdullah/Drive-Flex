import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { useLocationFilter } from '@/context/LocationContext';
import { PAKISTAN_CITIES } from '@/lib/location-data';
import { useColors } from '@/hooks/useColors';
import type { Vehicle } from '@/data/catalog';

interface ClusterLocation {
  id: string;
  name: string;
  x: number; // SVG coordinate
  y: number; // SVG coordinate
  count: number;
}

interface InteractiveMapProps {
  vehicles?: Vehicle[];
  onSelectCluster?: (cluster: ClusterLocation) => void;
  selectedClusterId?: string | null;
  onOpenMap?: () => void;
}

const RADIUS_OPTIONS = [10, 25, 50, 100, 250, 500];

export function InteractiveMap({
  vehicles = [],
  onSelectCluster,
  selectedClusterId,
  onOpenMap,
}: InteractiveMapProps) {
  const colors = useColors();
  const {
    currentCity,
    radiusKm,
    isFilterActive,
    isModalOpen,
    openModal,
    closeModal,
    applyLocation,
    clearFilter,
    detectUserLocation,
    isLocating,
  } = useLocationFilter();

  const [expanded, setExpanded] = useState(false);
  const [radiusPickerOpen, setRadiusPickerOpen] = useState(false);
  const [activeCluster, setActiveCluster] = useState<ClusterLocation | null>(null);

  // Center user GPS position
  const userGpsX = 180;
  const userGpsY = 100;

  // Dynamic fleet cluster distribution calculated from live catalog vehicles (5 cities x 6 brands = 6 per city)
  const lahoreCount = vehicles.filter((v) => v.location.toLowerCase().includes('lahore')).length || 6;
  const isbCount = vehicles.filter((v) => v.location.toLowerCase().includes('islamabad')).length || 6;
  const rwpCount = vehicles.filter((v) => v.location.toLowerCase().includes('rawalpindi')).length || 6;
  const karachiCount = vehicles.filter((v) => v.location.toLowerCase().includes('karachi')).length || 6;
  const multanCount = vehicles.filter((v) => v.location.toLowerCase().includes('multan')).length || 6;

  const clusters: ClusterLocation[] = [
    { id: 'c-isb', name: 'Islamabad / F-7', x: 135, y: 46, count: isbCount },
    { id: 'c-rwp', name: 'Rawalpindi / Cantt', x: 180, y: 92, count: rwpCount },
    { id: 'c-lahore', name: 'Lahore / Gulberg', x: 245, y: 72, count: lahoreCount },
    { id: 'c-multan', name: 'Multan / Bosan Rd', x: 295, y: 132, count: multanCount },
    { id: 'c-karachi', name: 'Karachi / DHA', x: 75, y: 138, count: karachiCount },
  ];

  // Visual Radius Circle in SVG based on selected radius
  const visualRadius = Math.min(Math.max((radiusKm / 100) * 45 + 30, 28), 115);

  const handleSelectRadius = (newRadius: number) => {
    applyLocation(currentCity, newRadius);
    setRadiusPickerOpen(false);
  };

  const handleGpsPress = async () => {
    const detected = await detectUserLocation();
    if (detected) {
      applyLocation(detected, radiusKm);
    }
  };

  const handleCitySelect = (cityName: string) => {
    const cleanCity = cityName.split('/')[0].replace('Cantt', '').trim();
    const matched = PAKISTAN_CITIES.find(
      (c) =>
        cleanCity.toLowerCase().includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(cleanCity.toLowerCase())
    );
    if (matched) {
      applyLocation(matched, radiusKm);
    }
  };

  const handleOpenMap = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (onOpenMap) {
      onOpenMap();
    } else {
      router.push('/map');
    }
  };

  const mapHeight = expanded ? 320 : 190;

  return (
    <View
      style={[
        styles.mapCard,
        {
          backgroundColor: colors.isDark ? '#0B0F17' : '#F1F5F9',
          borderColor: colors.border,
          height: mapHeight,
        },
      ]}
    >
      {/* ─── BASE CLICKABLE MAP SURFACE (Tapping opens Interactive Fleet Map) ─── */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Interactive fleet map for ${currentCity.name}. Tap to open full screen interactive map.`}
        onPress={handleOpenMap}
        style={StyleSheet.absoluteFill}
      >
        {/* ─── SVG High-End Cartographic Map Surface ─── */}
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 380 200"
          preserveAspectRatio="xMidYMid slice"
          style={StyleSheet.absoluteFill}
        >
          <Defs>
          {/* Radial glow for user GPS beacon */}
          <RadialGradient id="gpsGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#C9A227" stopOpacity="0.85" />
            <Stop offset="50%" stopColor="#B11226" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#B11226" stopOpacity="0" />
          </RadialGradient>
          {/* River / Indus Waters gradient */}
          <LinearGradient id="waterGrad" x1="0" y1="0" x2="0.4" y2="1">
            <Stop
              offset="0%"
              stopColor={colors.isDark ? '#061324' : '#BAE6FD'}
              stopOpacity="1"
            />
            <Stop
              offset="100%"
              stopColor={colors.isDark ? '#0B1E38' : '#E0F2FE'}
              stopOpacity="1"
            />
          </LinearGradient>
          {/* Golden Expressway glow gradient */}
          <LinearGradient id="goldHwy" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#C9A227" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#E5C158" stopOpacity="0.75" />
          </LinearGradient>
        </Defs>

        {/* Base Map Background / Terrain */}
        <Rect
          x="0"
          y="0"
          width="380"
          height="200"
          fill={colors.isDark ? '#090E17' : '#F8FAFC'}
        />

        {/* River Stream / Water body curves */}
        <Path
          d="M0 20 Q90 40 130 90 T210 160 T300 190 L380 200 L0 200 Z"
          fill="url(#waterGrad)"
          opacity={colors.isDark ? 0.45 : 0.65}
        />

        {/* Parks / Green Zones */}
        <Path
          d="M190 20 C220 18 240 32 230 52 C210 62 180 48 190 20 Z"
          fill={colors.isDark ? '#06281D' : '#DCFCE7'}
          opacity={0.7}
        />
        <Path
          d="M75 145 C105 145 120 170 95 188 C70 192 60 168 75 145 Z"
          fill={colors.isDark ? '#06281D' : '#DCFCE7'}
          opacity={0.7}
        />

        {/* Secondary Arterial Grid */}
        <Path
          d="
            M0 80 Q120 75 250 85 T380 80
            M0 135 Q180 125 380 140
            M50 0 L50 200
            M120 0 L120 200
            M220 0 L220 200
            M280 0 L280 200
            M340 0 L340 200
          "
          stroke={colors.isDark ? '#142132' : '#E2E8F0'}
          strokeWidth="1.2"
          strokeDasharray="3 3"
          fill="none"
        />

        {/* Major Freeways Base (Dark / Slate Underlay) */}
        <Path
          d="M0 45 C90 60 180 90 260 110 T380 125"
          stroke={colors.isDark ? '#16283D' : '#CBD5E1'}
          strokeWidth="6"
          fill="none"
        />
        <Path
          d="M80 0 C100 80 160 130 200 200"
          stroke={colors.isDark ? '#16283D' : '#CBD5E1'}
          strokeWidth="5"
          fill="none"
        />
        <Path
          d="M260 0 C240 70 290 140 350 200"
          stroke={colors.isDark ? '#16283D' : '#CBD5E1'}
          strokeWidth="5"
          fill="none"
        />

        {/* Highlighted M-2 Motorway Trunk (Gold & Crimson Executive Route) */}
        <Path
          d="M0 45 C90 60 180 90 260 110 T380 125"
          stroke="url(#goldHwy)"
          strokeWidth="2.5"
          fill="none"
        />
        <Path
          d="M80 0 C100 80 160 130 200 200"
          stroke={colors.isDark ? '#38BDF8' : '#0284C7'}
          strokeWidth="2"
          fill="none"
        />
        <Path
          d="M260 0 C240 70 290 140 350 200"
          stroke={colors.primary}
          strokeWidth="2"
          fill="none"
        />

        {/* Road Shields: Real Pakistan Arteries (M-2, GT Rd, Ring Rd) */}
        <G transform="translate(105, 75)">
          <Rect
            x="-14"
            y="-8"
            width="28"
            height="15"
            rx="4"
            fill={colors.isDark ? '#112233' : '#0284C7'}
          />
          <SvgText
            x="0"
            y="3"
            fontSize="8"
            fontWeight="bold"
            fill="#FFFFFF"
            textAnchor="middle"
          >
            M-2
          </SvgText>
        </G>
        <G transform="translate(295, 65)">
          <Rect
            x="-16"
            y="-8"
            width="32"
            height="15"
            rx="4"
            fill={colors.isDark ? '#2E2208' : '#C9A227'}
          />
          <SvgText
            x="0"
            y="3"
            fontSize="8"
            fontWeight="bold"
            fill="#FFFFFF"
            textAnchor="middle"
          >
            GT Rd
          </SvgText>
        </G>
        <G transform="translate(195, 175)">
          <Rect
            x="-18"
            y="-8"
            width="36"
            height="15"
            rx="4"
            fill={colors.isDark ? '#2B0E14' : colors.primary}
          />
          <SvgText
            x="0"
            y="3"
            fontSize="8"
            fontWeight="bold"
            fill="#FFFFFF"
            textAnchor="middle"
          >
            Ring Rd
          </SvgText>
        </G>

        {/* Location Region Labels */}
        <SvgText
          x="35"
          y="108"
          fontSize="9"
          fontWeight="700"
          fill={colors.isDark ? '#475569' : '#64748B'}
          letterSpacing="0.6"
        >
          KARACHI
        </SvgText>
        <SvgText
          x="125"
          y="28"
          fontSize="9"
          fontWeight="700"
          fill={colors.isDark ? '#475569' : '#64748B'}
          letterSpacing="0.6"
        >
          ISLAMABAD
        </SvgText>
        <SvgText
          x="245"
          y="58"
          fontSize="9"
          fontWeight="700"
          fill={colors.isDark ? '#475569' : '#64748B'}
          letterSpacing="0.6"
        >
          LAHORE
        </SvgText>
        <SvgText
          x="285"
          y="118"
          fontSize="9"
          fontWeight="700"
          fill={colors.isDark ? '#475569' : '#64748B'}
          letterSpacing="0.6"
        >
          MULTAN
        </SvgText>
        <SvgText
          x="180"
          y="130"
          fontSize="11"
          fontWeight="800"
          fill={colors.isDark ? '#94A3B8' : '#334155'}
          letterSpacing="1"
          textAnchor="middle"
        >
          {currentCity.name.toUpperCase()}
        </SvgText>

        {/* ─── DYNAMIC RADIUS RING ─── */}
        <Circle
          cx={userGpsX}
          cy={userGpsY}
          r={visualRadius}
          stroke={colors.primary}
          strokeWidth="1.8"
          strokeDasharray="4 3"
          fill={colors.primary}
          fillOpacity={colors.isDark ? 0.08 : 0.05}
        />

        {/* ─── USER GPS PIN (Pulsing Dot) ─── */}
        {/* Outer radial glow */}
        <Circle cx={userGpsX} cy={userGpsY} r="22" fill="url(#gpsGlow)" />
        {/* Radar wave 1 */}
        <Circle
          cx={userGpsX}
          cy={userGpsY}
          r="15"
          stroke="#0284C7"
          strokeWidth="1.5"
          fill="none"
          opacity={0.4}
        />
        {/* Core GPS dot */}
        <Circle
          cx={userGpsX}
          cy={userGpsY}
          r="7"
          fill="#0284C7"
          stroke="#FFFFFF"
          strokeWidth="2.5"
        />
      </Svg>
    </Pressable>

      {/* ─── TOP LEFT: IN-APP CITY SELECTOR BADGE & FULL MAP PILL ─── */}
      <View style={styles.cityBadgeContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Selected city: ${currentCity.name}. Tap to change city and filter listings.`}
          onPress={openModal}
          style={({ pressed }) => [
            styles.cityBadge,
            {
              backgroundColor: colors.isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)',
              borderColor: colors.border,
            },
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
          ]}
        >
          <Feather name="map-pin" size={12} color={colors.primary} />
          <Text style={[styles.cityBadgeText, { color: colors.foreground }]}>
            {currentCity.name}
          </Text>
          <Feather name="chevron-down" size={12} color={colors.primary} style={{ marginLeft: 3 }} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open Interactive Fleet Map"
          onPress={handleOpenMap}
          style={({ pressed }) => [
            styles.openFleetMapBtn,
            {
              backgroundColor: colors.isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)',
              borderColor: colors.border,
            },
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
          ]}
        >
          <View style={[styles.livePulseDot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.openFleetMapText, { color: colors.foreground }]}>
            Fleet Map
          </Text>
          <Feather name="arrow-up-right" size={12} color={colors.primary} />
        </Pressable>
      </View>

      {/* ─── INTERACTIVE CAR CLUSTERS (Crimson Badges) ─── */}
      {clusters.map((cluster) => {
        const isSelected = selectedClusterId === cluster.id;
        return (
          <Pressable
            key={cluster.id}
            accessibilityRole="button"
            accessibilityLabel={`${cluster.count} cars available at ${cluster.name}. Tap to filter.`}
            onPress={() => {
              setActiveCluster(cluster);
              handleCitySelect(cluster.name);
              if (onSelectCluster) onSelectCluster(cluster);
            }}
            style={[
              styles.clusterBadgeWrap,
              {
                left: `${(cluster.x / 380) * 100}%`,
                top: `${(cluster.y / 200) * 100}%`,
              },
            ]}
          >
            <View
              style={[
                styles.clusterBadge,
                {
                  backgroundColor: isSelected ? '#8F0D1E' : colors.primary,
                  borderColor: '#FFFFFF',
                  transform: [{ scale: isSelected ? 1.15 : 1 }],
                },
              ]}
            >
              <Text style={styles.clusterBadgeCount}>{cluster.count}</Text>
            </View>
          </Pressable>
        );
      })}

      {/* ─── TOP RIGHT: RADIUS SELECTOR PILL ─── */}
      <View style={styles.radiusPillContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Search radius ${radiusKm} kilometers. Tap to adjust.`}
          onPress={() => setRadiusPickerOpen(true)}
          style={[
            styles.radiusPill,
            {
              backgroundColor: colors.isDark ? 'rgba(21, 21, 21, 0.92)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.radiusPillText, { color: colors.foreground }]}>
            {radiusKm} km
          </Text>
          <Feather name="chevron-down" size={13} color={colors.primary} style={{ marginLeft: 3 }} />
        </Pressable>
      </View>

      {/* ─── RIGHT EDGE: FLOATING ACTION BUTTONS ─── */}
      <View style={styles.floatingControls}>
        {/* Select City within app button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open city selector to filter listings"
          onPress={openModal}
          style={[
            styles.floatingBtn,
            {
              backgroundColor: colors.isDark ? 'rgba(21, 21, 21, 0.92)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: colors.border,
            },
          ]}
        >
          <Feather
            name="map-pin"
            size={15}
            color={colors.primary}
          />
        </Pressable>

        {/* GPS Re-center button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Detect my GPS location and re-center map"
          onPress={handleGpsPress}
          style={[
            styles.floatingBtn,
            {
              backgroundColor: colors.isDark ? 'rgba(21, 21, 21, 0.92)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: colors.border,
            },
          ]}
        >
          <Feather
            name="crosshair"
            size={16}
            color={isLocating ? colors.primary : colors.foreground}
          />
        </Pressable>

        {/* Map Layers / Toggle Height */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle map expansion"
          onPress={() => setExpanded((prev) => !prev)}
          style={[
            styles.floatingBtn,
            {
              backgroundColor: colors.isDark ? 'rgba(21, 21, 21, 0.92)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: colors.border,
            },
          ]}
        >
          <Feather
            name={expanded ? 'minimize-2' : 'layers'}
            size={16}
            color={expanded ? colors.primary : colors.foreground}
          />
        </Pressable>

        {/* Fullscreen Interactive Fleet Map button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open interactive fleet map"
          onPress={handleOpenMap}
          style={[
            styles.floatingBtn,
            {
              backgroundColor: colors.isDark ? 'rgba(21, 21, 21, 0.92)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: colors.border,
            },
          ]}
        >
          <Feather
            name="maximize-2"
            size={15}
            color={colors.primary}
          />
        </Pressable>
      </View>

      {/* ─── ACTIVE CLUSTER TOOLTIP ─── */}
      {activeCluster && (
        <View
          style={[
            styles.clusterTooltip,
            {
              backgroundColor: colors.isDark ? '#1C1C1C' : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.clusterTooltipDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.clusterTooltipText, { color: colors.foreground }]}>
            <Text style={{ fontWeight: '700' }}>{activeCluster.count} cars</Text> in {activeCluster.name}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Filter listings in ${activeCluster.name}`}
            onPress={() => {
              handleCitySelect(activeCluster.name);
              setActiveCluster(null);
            }}
            style={[styles.tooltipMapsBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.tooltipMapsBtnText}>Select City</Text>
          </Pressable>
          <Pressable onPress={() => setActiveCluster(null)} hitSlop={8} style={{ marginLeft: 6 }}>
            <Feather name="x" size={13} color={colors.mutedForeground} />
          </Pressable>
        </View>
      )}

      {/* ─── RADIUS PICKER MODAL ─── */}
      <Modal
        visible={radiusPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRadiusPickerOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setRadiusPickerOpen(false)}>
          <View
            style={[
              styles.radiusModalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.radiusModalHeader}>
              <Feather name="compass" size={18} color={colors.primary} />
              <Text style={[styles.radiusModalTitle, { color: colors.foreground }]}>
                Search Radius
              </Text>
            </View>
            <Text style={[styles.radiusModalSub, { color: colors.mutedForeground }]}>
              Show cars located within this distance from your location
            </Text>

            <View style={styles.radiusOptionsGrid}>
              {RADIUS_OPTIONS.map((opt) => {
                const isSelected = radiusKm === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => handleSelectRadius(opt)}
                    style={[
                      styles.radiusOptionBtn,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.secondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.radiusOptionText,
                        {
                          color: isSelected ? '#FFFFFF' : colors.foreground,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {opt} km
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* ─── CITY PICKER MODAL ─── */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <View
            style={[
              styles.radiusModalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.radiusModalHeader}>
              <Feather name="map-pin" size={18} color={colors.primary} />
              <Text style={[styles.radiusModalTitle, { color: colors.foreground }]}>
                Select City
              </Text>
            </View>
            <Text style={[styles.radiusModalSub, { color: colors.mutedForeground }]}>
              Each city features 1 car of every brand (6 brands per city)
            </Text>

            <View style={styles.radiusOptionsGrid}>
              <Pressable
                onPress={() => {
                  clearFilter();
                  closeModal();
                }}
                style={[
                  styles.radiusOptionBtn,
                  {
                    backgroundColor: !isFilterActive ? colors.primary : colors.secondary,
                    borderColor: !isFilterActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.radiusOptionText,
                    {
                      color: !isFilterActive ? '#FFFFFF' : colors.foreground,
                      fontWeight: !isFilterActive ? '700' : '500',
                    },
                  ]}
                >
                  All Cities
                </Text>
              </Pressable>
              {PAKISTAN_CITIES.map((city) => {
                const isSelected = isFilterActive && currentCity.name === city.name;
                return (
                  <Pressable
                    key={city.name}
                    onPress={() => applyLocation(city, radiusKm)}
                    style={[
                      styles.radiusOptionBtn,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.secondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.radiusOptionText,
                        {
                          color: isSelected ? '#FFFFFF' : colors.foreground,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {city.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  clusterBadgeWrap: {
    position: 'absolute',
    marginLeft: -15,
    marginTop: -15,
  },
  clusterBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B11226',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  clusterBadgeCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  cityBadgeContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  cityBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    marginLeft: 4,
  },
  openFleetMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  openFleetMapText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  radiusPillContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  radiusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  radiusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  floatingControls: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    gap: 8,
    zIndex: 10,
  },
  floatingBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clusterTooltip: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  clusterTooltipDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  clusterTooltipText: {
    fontSize: 11,
  },
  tooltipMapsBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  tooltipMapsBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  radiusModalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  radiusModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  radiusModalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  radiusModalSub: {
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 17,
  },
  radiusOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radiusOptionBtn: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusOptionText: {
    fontSize: 14,
  },
});
