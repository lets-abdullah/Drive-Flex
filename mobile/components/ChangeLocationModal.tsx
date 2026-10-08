import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle, Rect, Line, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';
import {
  CityLocation,
  PAKISTAN_CITIES,
  RADIUS_OPTIONS,
} from '@/lib/location-data';
import { useLocationFilter } from '@/context/LocationContext';
import { useColors } from '@/hooks/useColors';

export function ChangeLocationModal() {
  const colors = useColors();
  const {
    currentCity,
    radiusKm,
    isModalOpen,
    closeModal,
    applyLocation,
    clearFilter,
    detectUserLocation,
    isLocating,
  } = useLocationFilter();

  const [selectedCity, setSelectedCity] = useState<CityLocation>(currentCity);
  const [selectedRadius, setSelectedRadius] = useState<number>(radiusKm);
  const [searchQuery, setSearchQuery] = useState(currentCity.name);
  const [showCityPicker, setShowCityPicker] = useState(false);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isModalOpen) {
      setSelectedCity(currentCity);
      setSelectedRadius(radiusKm);
      setSearchQuery(currentCity.name);
      setShowCityPicker(false);
    }
  }, [isModalOpen, currentCity, radiusKm]);

  const filteredCities = PAKISTAN_CITIES.filter((city) =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleSelectCity = (city: CityLocation) => {
    setSelectedCity(city);
    setSearchQuery(city.name);
    setShowCityPicker(false);
  };

  const handleUseCurrentLocation = async () => {
    const detected = await detectUserLocation();
    if (detected) {
      setSelectedCity(detected);
      setSearchQuery(detected.name);
      setShowCityPicker(false);
    }
  };

  const handleApply = () => {
    applyLocation(selectedCity, selectedRadius);
  };

  const handleReset = () => {
    clearFilter();
    closeModal();
  };

  // Map circle radius calculations
  const mapWidth = Dimensions.get('window').width - 48;
  const mapHeight = 180;
  const centerX = mapWidth / 2;
  const centerY = mapHeight / 2;
  // Scale visual radius (10 km -> 22px, 500 km -> 78px)
  const visualRadius = Math.min(
    78,
    Math.max(22, Math.round(22 + (selectedRadius / 500) * 56))
  );

  return (
    <Modal
      visible={isModalOpen}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: '#1e1f21', borderColor: 'rgba(255,255,255,0.1)' }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Change location</Text>
            <Pressable
              onPress={closeModal}
              hitSlop={12}
              style={styles.closeBtn}
              accessibilityLabel="Close location modal"
            >
              <Feather name="x" size={20} color="#b0b3b8" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Location Input Section */}
            <View style={styles.section}>
              <Text style={styles.label}>Location</Text>
              <View style={styles.inputWrapper}>
                <Feather name="map-pin" size={16} color="#E5A93C" style={styles.inputPin} />
                <TextInput
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    setShowCityPicker(true);
                  }}
                  onFocus={() => setShowCityPicker(true)}
                  placeholder="Search city in Pakistan"
                  placeholderTextColor="#7a7f85"
                  style={styles.input}
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <Pressable
                    onPress={() => {
                      setSearchQuery('');
                      setShowCityPicker(true);
                    }}
                    hitSlop={8}
                    style={styles.clearInputBtn}
                  >
                    <Feather name="x-circle" size={16} color="#7a7f85" />
                  </Pressable>
                )}
              </View>

              {/* City Suggestions Dropdown */}
              {showCityPicker && (
                <View style={styles.dropdown}>
                  <ScrollView
                    nestedScrollEnabled
                    style={styles.dropdownScroll}
                    keyboardShouldPersistTaps="handled"
                  >
                    {filteredCities.map((city) => (
                      <Pressable
                        key={city.name}
                        onPress={() => handleSelectCity(city)}
                        style={[
                          styles.dropdownItem,
                          city.name === selectedCity.name && styles.dropdownItemActive,
                        ]}
                      >
                        <View style={styles.dropdownItemLeft}>
                          <Feather
                            name="map-pin"
                            size={14}
                            color={city.name === selectedCity.name ? '#E5A93C' : '#8a8d91'}
                          />
                          <Text
                            style={[
                              styles.dropdownCityName,
                              city.name === selectedCity.name && styles.dropdownCityNameActive,
                            ]}
                          >
                            {city.name}
                          </Text>
                        </View>
                        <Text style={styles.dropdownProvince}>{city.province}</Text>
                      </Pressable>
                    ))}
                    {filteredCities.length === 0 && (
                      <View style={styles.dropdownEmpty}>
                        <Text style={styles.dropdownEmptyText}>No matching Pakistani city found</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}

              {/* GPS Locate Me Button */}
              <Pressable
                onPress={handleUseCurrentLocation}
                disabled={isLocating}
                style={styles.gpsButton}
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color="#E5A93C" />
                ) : (
                  <Feather name="crosshair" size={15} color="#E5A93C" />
                )}
                <Text style={styles.gpsButtonText}>
                  {isLocating ? 'Detecting your GPS location...' : 'Use my current location'}
                </Text>
              </Pressable>
            </View>

            {/* Radius Selector */}
            <View style={styles.section}>
              <View style={styles.radiusHeader}>
                <Text style={styles.label}>Radius</Text>
                <Text style={styles.radiusValue}>{selectedRadius} km</Text>
              </View>
              <View style={styles.radiusPillsRow}>
                {RADIUS_OPTIONS.map((r) => {
                  const isSelected = selectedRadius === r;
                  return (
                    <Pressable
                      key={r}
                      onPress={() => setSelectedRadius(r)}
                      style={[
                        styles.radiusPill,
                        isSelected && styles.radiusPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.radiusPillText,
                          isSelected && styles.radiusPillTextActive,
                        ]}
                      >
                        {r} km
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Interactive Visual Map Canvas */}
            <View style={styles.mapContainer}>
              <Svg width={mapWidth} height={mapHeight} style={styles.mapSvg}>
                <Defs>
                  <RadialGradient id="circleGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#E5A93C" stopOpacity="0.35" />
                    <Stop offset="70%" stopColor="#E5A93C" stopOpacity="0.12" />
                    <Stop offset="100%" stopColor="#E5A93C" stopOpacity="0" />
                  </RadialGradient>
                </Defs>

                {/* Map Dark Background */}
                <Rect x="0" y="0" width={mapWidth} height={mapHeight} fill="#141517" rx="10" />

                {/* Subtle Grid Lines */}
                <Line x1="0" y1={centerY} x2={mapWidth} y2={centerY} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <Line x1={centerX} y1="0" x2={centerX} y2={mapHeight} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <Circle cx={centerX} cy={centerY} r="95" stroke="rgba(255,255,255,0.04)" fill="none" />
                <Circle cx={centerX} cy={centerY} r="130" stroke="rgba(255,255,255,0.03)" fill="none" />

                {/* Dynamic Scaling Radius Boundary Circle */}
                <Circle
                  cx={centerX}
                  cy={centerY}
                  r={visualRadius}
                  fill="url(#circleGlow)"
                  stroke="#E5A93C"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />

                {/* Center Pin Halo */}
                <Circle cx={centerX} cy={centerY} r="10" fill="rgba(229,169,60,0.25)" />
                <Circle cx={centerX} cy={centerY} r="5" fill="#E5A93C" />

                {/* Map Label (City & Radius) */}
                <SvgText
                  x={centerX}
                  y={centerY + visualRadius + 18}
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {selectedCity.name} · {selectedRadius} km
                </SvgText>
              </Svg>

              <View style={styles.mapBadge}>
                <Text style={styles.mapBadgeText}>
                  {selectedCity.name} ({selectedCity.lat.toFixed(2)}° N, {selectedCity.lng.toFixed(2)}° E)
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons Footer */}
          <View style={styles.footer}>
            <Pressable
              onPress={handleReset}
              style={styles.resetButton}
            >
              <Text style={styles.resetButtonText}>Reset Filter</Text>
            </Pressable>

            <Pressable
              onPress={handleApply}
              style={styles.applyButton}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e4e6eb',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#b0b3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2b2e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    height: 44,
  },
  inputPin: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    height: '100%',
  },
  clearInputBtn: {
    padding: 4,
  },
  dropdown: {
    backgroundColor: '#242528',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    maxHeight: 160,
    overflow: 'hidden',
    marginTop: 4,
  },
  dropdownScroll: {
    maxHeight: 160,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(229, 169, 60, 0.12)',
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownCityName: {
    fontSize: 14,
    color: '#e4e6eb',
    fontWeight: '500',
  },
  dropdownCityNameActive: {
    color: '#E5A93C',
    fontWeight: '700',
  },
  dropdownProvince: {
    fontSize: 12,
    color: '#8a8d91',
  },
  dropdownEmpty: {
    padding: 12,
    alignItems: 'center',
  },
  dropdownEmptyText: {
    fontSize: 12,
    color: '#8a8d91',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
  },
  gpsButtonText: {
    fontSize: 13,
    color: '#E5A93C',
    fontWeight: '600',
  },
  radiusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radiusValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E5A93C',
  },
  radiusPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radiusPill: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#2a2b2e',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  radiusPillActive: {
    backgroundColor: 'rgba(229, 169, 60, 0.18)',
    borderColor: '#E5A93C',
  },
  radiusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b0b3b8',
  },
  radiusPillTextActive: {
    color: '#E5A93C',
    fontWeight: '700',
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  mapSvg: {
    alignSelf: 'center',
  },
  mapBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  mapBadgeText: {
    fontSize: 10,
    color: '#9aa0a6',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#191a1c',
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b0b3b8',
  },
  applyButton: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    backgroundColor: '#E5A93C',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
});
