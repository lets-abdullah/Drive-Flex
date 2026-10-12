import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDriveFlex } from '@/context/AppContext';
import { type Vehicle } from '@/data/catalog';
import { useColors } from '@/hooks/useColors';
import { PAKISTAN_CITIES, calculateDistanceKm } from '@/lib/location-data';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CITY_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  Multan: { lat: 30.1900, lng: 71.4600, zoom: 13 },
  Lahore: { lat: 31.5280, lng: 74.3587, zoom: 13 },
  Islamabad: { lat: 33.7082, lng: 73.0505, zoom: 13 },
  Karachi: { lat: 24.8350, lng: 67.0390, zoom: 13 },
  Rawalpindi: { lat: 33.5651, lng: 73.0169, zoom: 13 },
};

export default function FullScreenMapScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { vehicles, theme } = useDriveFlex();

  // Search and Filter State
  const [searchCity, setSearchCity] = useState('');
  const [activeCity, setActiveCity] = useState<string>('Multan');
  const [selectedCar, setSelectedCar] = useState<Vehicle | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusFilter, setRadiusFilter] = useState<number | null>(null);

  // Animated card overlay
  const overlaySlideAnim = useRef(new Animated.Value(200)).current;

  // Iframe ref on Web
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Filter cars based on city, search query, radius
  const filteredCars = useMemo(() => {
    let result = vehicles.filter((v) => v.latitude && v.longitude);

    if (searchCity.trim().length > 0) {
      const q = searchCity.toLowerCase().trim();
      result = result.filter(
        (v) =>
          (v.city_name && v.city_name.toLowerCase().includes(q)) ||
          v.location.toLowerCase().includes(q) ||
          (v.address_text && v.address_text.toLowerCase().includes(q)) ||
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q)
      );
    } else if (activeCity) {
      result = result.filter(
        (v) =>
          (v.city_name && v.city_name.toLowerCase().includes(activeCity.toLowerCase())) ||
          v.location.toLowerCase().includes(activeCity.toLowerCase())
      );
    }

    // Distance calculation if user coordinates exist
    if (userCoords) {
      result = result.map((v) => {
        if (v.latitude && v.longitude) {
          const dist = calculateDistanceKm(userCoords.lat, userCoords.lng, v.latitude, v.longitude);
          return { ...v, calculatedDist: dist, distanceKm: `${dist} km` };
        }
        return v;
      });

      if (radiusFilter) {
        result = result.filter((v: any) => v.calculatedDist <= radiusFilter);
      }

      result.sort((a: any, b: any) => (a.calculatedDist || 9999) - (b.calculatedDist || 9999));
    }

    return result;
  }, [vehicles, searchCity, activeCity, userCoords, radiusFilter]);

  // Show / hide animated car overlay
  useEffect(() => {
    if (selectedCar) {
      Animated.spring(overlaySlideAnim, {
        toValue: 0,
        useNativeDriver: Platform.OS !== 'web',
        tension: 80,
        friction: 9,
      }).start();
    } else {
      Animated.timing(overlaySlideAnim, {
        toValue: 260,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [selectedCar, overlaySlideAnim]);

  // Handle messages from Web Leaflet iframe
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.type === 'SELECT_CAR') {
          const car = vehicles.find((v) => v.id === data.carId);
          if (car) {
            setSelectedCar(car);
          }
        }
      } catch {
        // Ignore unparseable messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [vehicles]);

  // Autonomous GPS "Near Me" Locator FAB
  const handleNearMeGPS = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      let coords = { lat: 30.1900, lng: 71.4600 }; // Default Multan fallback

      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      }

      setUserCoords(coords);
      setSearchCity('');

      // Find nearest Pakistani city
      let nearestCity = 'Multan';
      let shortestDist = 999999;
      for (const [cName, cCoord] of Object.entries(CITY_COORDINATES)) {
        const dist = calculateDistanceKm(coords.lat, coords.lng, cCoord.lat, cCoord.lng);
        if (dist < shortestDist) {
          shortestDist = dist;
          nearestCity = cName;
        }
      }
      setActiveCity(nearestCity);

      // Post update to Leaflet map if on web
      if (Platform.OS === 'web' && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            type: 'FLY_TO_GPS',
            lat: coords.lat,
            lng: coords.lng,
            zoom: 14,
          }),
          '*'
        );
      }
    } catch (err) {
      console.warn('GPS location error:', err);
    } finally {
      setIsLocating(false);
    }
  };

  // Change city lock
  const handleCitySelect = (cityName: string) => {
    setActiveCity(cityName);
    setSearchCity('');
    setSelectedCar(null);

    const coords = CITY_COORDINATES[cityName] || { lat: 30.1900, lng: 71.4600, zoom: 13 };
    if (Platform.OS === 'web' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          type: 'FLY_TO',
          lat: coords.lat,
          lng: coords.lng,
          zoom: coords.zoom,
        }),
        '*'
      );
    }
  };

  // Build Leaflet HTML Document for Web rendering
  const leafletHtml = useMemo(() => {
    const isDark = colors.isDark;
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const cityCoord = CITY_COORDINATES[activeCity] || { lat: 30.1900, lng: 71.4600, zoom: 13 };
    const initialLat = userCoords ? userCoords.lat : cityCoord.lat;
    const initialLng = userCoords ? userCoords.lng : cityCoord.lng;

    const markersData = filteredCars.map((v) => ({
      id: v.id,
      title: `${v.brand} ${v.model}`,
      price: v.price_per_day || v.pricePerDay || 75,
      lat: v.latitude,
      lng: v.longitude,
      address: v.address_text || v.location,
      image: v.image,
      category: v.category,
      rating: v.rating,
    }));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body, #map { width: 100%; height: 100%; background: ${isDark ? '#0F1318' : '#F8FAFC'}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .leaflet-control-attribution { display: none !important; }
          .leaflet-bar { border: none !important; box-shadow: 0 4px 14px rgba(0,0,0,0.2) !important; border-radius: 12px !important; overflow: hidden; }
          .leaflet-bar a { background-color: ${isDark ? '#1C232E' : '#FFFFFF'} !important; color: ${isDark ? '#FFFFFF' : '#111827'} !important; border-bottom: 1px solid ${isDark ? '#2D3748' : '#E2E8F0'} !important; }

          /* Custom Car Pin Marker */
          .car-pin-marker {
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${isDark ? '#0E141E' : '#FFFFFF'};
            border: 2px solid #B11226;
            border-radius: 20px;
            padding: 4px 9px;
            box-shadow: 0 6px 16px rgba(177, 18, 38, 0.35), 0 2px 6px rgba(0,0,0,0.2);
            cursor: pointer;
            transition: transform 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            white-space: nowrap;
          }
          .car-pin-marker:hover, .car-pin-marker.active {
            transform: scale(1.15) translateY(-4px);
            background: #B11226;
            border-color: #FFFFFF;
          }
          .car-pin-marker:hover .car-pin-price, .car-pin-marker.active .car-pin-price {
            color: #FFFFFF;
          }
          .car-pin-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #B11226;
            margin-right: 5px;
          }
          .car-pin-marker:hover .car-pin-dot, .car-pin-marker.active .car-pin-dot {
            background: #FFFFFF;
          }
          .car-pin-price {
            font-size: 12px;
            font-weight: 700;
            color: ${isDark ? '#F1F5F9' : '#0F172A'};
            letter-spacing: -0.2px;
          }

          /* GPS User Radar Beacon */
          .gps-beacon-wrap {
            position: relative;
            width: 24px;
            height: 24px;
          }
          .gps-beacon-center {
            position: absolute;
            top: 4px;
            left: 4px;
            width: 16px;
            height: 16px;
            background: #B11226;
            border: 3px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
          .gps-beacon-pulse {
            position: absolute;
            width: 24px;
            height: 24px;
            background: rgba(177, 18, 38, 0.4);
            border-radius: 50%;
            animation: pulse 1.8s infinite;
          }
          @keyframes pulse {
            0% { transform: scale(0.6); opacity: 0.9; }
            100% { transform: scale(2.2); opacity: 0; }
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', {
            center: [${initialLat}, ${initialLng}],
            zoom: ${cityCoord.zoom},
            zoomControl: false,
          });

          L.control.zoom({ position: 'bottomright' }).addTo(map);

          L.tileLayer('${tileUrl}', {
            maxZoom: 19,
            subdomains: 'abcd',
          }).addTo(map);

          let markers = [];
          const carsData = ${JSON.stringify(markersData)};

          function renderMarkers() {
            markers.forEach(m => map.removeLayer(m));
            markers = [];

            carsData.forEach(car => {
              if (!car.lat || !car.lng) return;

              const customIcon = L.divIcon({
                className: '',
                html: '<div class="car-pin-marker" id="pin-' + car.id + '"><span class="car-pin-dot"></span><span class="car-pin-price">$' + car.price + '/d</span></div>',
                iconSize: [70, 28],
                iconAnchor: [35, 14],
              });

              const marker = L.marker([car.lat, car.lng], { icon: customIcon }).addTo(map);
              marker.on('click', () => {
                document.querySelectorAll('.car-pin-marker').forEach(el => el.classList.remove('active'));
                const pinEl = document.getElementById('pin-' + car.id);
                if (pinEl) pinEl.classList.add('active');
                window.parent.postMessage({ type: 'SELECT_CAR', carId: car.id }, '*');
              });

              markers.push(marker);
            });
          }

          renderMarkers();

          // Listen for navigation messages from React Native
          window.addEventListener('message', (e) => {
            try {
              const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
              if (data.type === 'FLY_TO') {
                map.flyTo([data.lat, data.lng], data.zoom || 13, { duration: 1.2 });
              } else if (data.type === 'FLY_TO_GPS') {
                map.flyTo([data.lat, data.lng], 14, { duration: 1.2 });
                // Add GPS user beacon
                const beaconIcon = L.divIcon({
                  className: '',
                  html: '<div class="gps-beacon-wrap"><div class="gps-beacon-pulse"></div><div class="gps-beacon-center"></div></div>',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12],
                });
                L.marker([data.lat, data.lng], { icon: beaconIcon }).addTo(map);
              }
            } catch(err) {}
          });
        </script>
      </body>
      </html>
    `;
  }, [colors.isDark, activeCity, userCoords, filteredCars]);

  return (
    <View style={[styles.screenContainer, { backgroundColor: colors.background }]}>
      {/* ─── 1. FULL-SCREEN INTERACTIVE MAP VIEW ─── */}
      <View style={StyleSheet.absoluteFill}>
        {Platform.OS === 'web' ? (
          <iframe
            ref={iframeRef as any}
            srcDoc={leafletHtml}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
            }}
            title="DriveFlex Interactive Pakistani Vehicle Fleet Map"
          />
        ) : (
          /* Native Fallback Vector Canvas with Pin Markers */
          <View style={[styles.nativeMapCanvas, { backgroundColor: colors.isDark ? '#0F1318' : '#F1F5F9' }]}>
            <View style={styles.nativeGrid}>
              {filteredCars.map((car, idx) => (
                <Pressable
                  key={car.id}
                  onPress={() => setSelectedCar(car)}
                  style={[
                    styles.nativeCarMarker,
                    {
                      backgroundColor: colors.card,
                      borderColor: selectedCar?.id === car.id ? '#FFFFFF' : colors.primary,
                      top: 120 + ((idx * 65) % (SCREEN_HEIGHT - 350)),
                      left: 30 + ((idx * 95) % (SCREEN_WIDTH - 120)),
                    },
                  ]}
                >
                  <View style={[styles.markerDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.markerText, { color: colors.foreground }]}>
                    ${car.price_per_day || car.pricePerDay}/d
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* ─── 2. TOP FLOATING CONTROL BAR (Search + City Chips + Back) ─── */}
      <View style={[styles.topFloatingBar, { top: Math.max(insets.top, 16) }]}>
        {/* Header Search Row */}
        <View style={styles.searchRow}>
          {/* Back Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
            onPress={() => {
              if (Platform.OS === 'web' && typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
              if (router.canGoBack()) router.back();
              else router.push('/(tabs)');
            }}
            style={[
              styles.iconBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>

          {/* Dual-Stream City Search Box */}
          <View
            style={[
              styles.searchBoxWrap,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="search" size={17} color={colors.mutedForeground} style={{ marginLeft: 12 }} />
            <TextInput
              placeholder="Search by city or area (e.g. Multan, Lahore)..."
              placeholderTextColor={colors.mutedForeground}
              value={searchCity}
              onChangeText={(text) => {
                setSearchCity(text);
                if (text.length > 0) setActiveCity('');
              }}
              style={[styles.searchInput, { color: colors.foreground }]}
              autoCapitalize="words"
            />
            {searchCity.length > 0 && (
              <Pressable
                onPress={() => setSearchCity('')}
                hitSlop={8}
                style={{ paddingRight: 10 }}
              >
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>

          {/* Autonomous GPS "Near Me" FAB */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Find cars near my GPS location"
            onPress={handleNearMeGPS}
            style={[
              styles.gpsFabBtn,
              {
                backgroundColor: userCoords ? colors.primary : colors.card,
                borderColor: userCoords ? colors.primary : colors.border,
              },
            ]}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color={userCoords ? '#FFFFFF' : colors.primary} />
            ) : (
              <Feather
                name="crosshair"
                size={20}
                color={userCoords ? '#FFFFFF' : colors.primary}
              />
            )}
          </Pressable>
        </View>

        {/* City Filter Chips Horizontal Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cityChipsScroll}
        >
          {['Multan', 'Lahore', 'Islamabad', 'Karachi', 'Rawalpindi'].map((cityName) => {
            const isSelected = activeCity === cityName;
            return (
              <Pressable
                key={cityName}
                onPress={() => handleCitySelect(cityName)}
                style={[
                  styles.cityChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Feather
                  name="map-pin"
                  size={12}
                  color={isSelected ? '#FFFFFF' : colors.mutedForeground}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.cityChipText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.foreground,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {cityName}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ─── 3. BOTTOM FLOATING CAR CARD OVERLAY ─── */}
      {selectedCar && (
        <Animated.View
          style={[
            styles.carCardOverlayContainer,
            {
              bottom: Math.max(insets.bottom, 20) + 10,
              transform: [{ translateY: overlaySlideAnim }],
            },
          ]}
        >
          <View
            style={[
              styles.carCardOverlay,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Close Cross Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close Car Preview"
              onPress={() => setSelectedCar(null)}
              style={[styles.closeOverlayBtn, { backgroundColor: colors.isDark ? '#212A36' : '#E2E8F0' }]}
            >
              <Feather name="x" size={16} color={colors.foreground} />
            </Pressable>

            <View style={styles.overlayContentRow}>
              {/* High-Res Car Image Thumbnail */}
              <View style={[styles.overlayThumbWrap, { backgroundColor: colors.isDark ? '#1C232E' : '#F1F5F9' }]}>
                <Image
                  source={{ uri: selectedCar.image }}
                  contentFit="cover"
                  style={styles.overlayThumb}
                />
              </View>

              {/* Car Info Column */}
              <View style={styles.overlayInfoCol}>
                <View style={styles.overlayCategoryRow}>
                  <Text style={[styles.overlayCategoryBadge, { color: colors.primary }]}>
                    {selectedCar.category || 'Luxury'}
                  </Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={13} color="#EAB308" />
                    <Text style={[styles.ratingText, { color: colors.foreground }]}>
                      {selectedCar.rating} ({selectedCar.reviewCount})
                    </Text>
                  </View>
                </View>

                {/* Make & Model */}
                <Text numberOfLines={1} style={[styles.overlayCarTitle, { color: colors.foreground }]}>
                  {selectedCar.brand} {selectedCar.model}
                </Text>

                {/* Parked Coordinate Address */}
                <View style={styles.addressRow}>
                  <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                  <Text numberOfLines={1} style={[styles.addressText, { color: colors.mutedForeground }]}>
                    {selectedCar.address_text || selectedCar.location}
                  </Text>
                </View>

                {/* Price & Book Action */}
                <View style={styles.overlayFooterRow}>
                  <View>
                    <Text style={[styles.overlayPrice, { color: colors.foreground }]}>
                      ${selectedCar.price_per_day || selectedCar.pricePerDay}
                      <Text style={[styles.overlayPriceUnit, { color: colors.mutedForeground }]}>
                        /day
                      </Text>
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Book Now"
                    onPress={() => {
                      router.push({
                        pathname: '/cars/[slug]',
                        params: { slug: selectedCar.slug },
                      });
                    }}
                    style={[styles.bookNowBtn, { backgroundColor: colors.primary }]}
                  >
                    <Text style={styles.bookNowBtnText}>Book Now</Text>
                    <Feather name="arrow-right" size={14} color="#FFFFFF" style={{ marginLeft: 5 }} />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ─── 4. CAR COUNT CHIP (When no overlay is open) ─── */}
      {!selectedCar && (
        <View
          style={[
            styles.carCountBadge,
            {
              bottom: Math.max(insets.bottom, 20) + 16,
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Feather name="check-circle" size={14} color={colors.primary} />
          <Text style={[styles.carCountText, { color: colors.foreground }]}>
            {filteredCars.length} cars available in {activeCity || 'selected area'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  nativeMapCanvas: {
    flex: 1,
    position: 'relative',
  },
  nativeGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  nativeCarMarker: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  markerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  markerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  topFloatingBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100,
    gap: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  searchBoxWrap: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  searchInput: {
    flex: 1,
    height: 46,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  gpsFabBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  cityChipsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cityChipText: {
    fontSize: 13,
  },
  carCardOverlayContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 110,
  },
  carCardOverlay: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    position: 'relative',
  },
  closeOverlayBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  overlayContentRow: {
    flexDirection: 'row',
    gap: 14,
  },
  overlayThumbWrap: {
    width: 110,
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
  },
  overlayThumb: {
    width: '100%',
    height: '100%',
  },
  overlayInfoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  overlayCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 24,
  },
  overlayCategoryBadge: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  overlayCarTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  addressText: {
    fontSize: 12,
    flex: 1,
  },
  overlayFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  overlayPrice: {
    fontSize: 17,
    fontWeight: '800',
  },
  overlayPriceUnit: {
    fontSize: 12,
    fontWeight: '400',
  },
  bookNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bookNowBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  carCountBadge: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    zIndex: 90,
  },
  carCountText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
