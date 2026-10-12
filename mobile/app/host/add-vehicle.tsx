import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FormDropdown, type DropdownOption } from '@/components/FormDropdown';
import { Page } from '@/components/Marketplace';
import { useDriveFlex } from '@/context/AppContext';
import type { Vehicle } from '@/data/catalog';
import { useColors } from '@/hooks/useColors';

const PRESET_RULES = [
  'No smoking inside car',
  'No pets allowed',
  'Valid driving license required at handover',
  'Return fuel level matching handover level',
  'Maximum 250 km/day allowance',
  'Highway speed limits strictly enforced',
];

const CATEGORY_OPTIONS: DropdownOption<string>[] = [
  { label: 'Sedan', value: 'Sedan', icon: 'shield', subtitle: '4-door executive & city sedans' },
  { label: 'SUV', value: 'SUV', icon: 'truck', subtitle: 'High-clearance & cross-country SUVs' },
  { label: 'Luxury', value: 'Luxury', icon: 'award', subtitle: 'Flagship executive & grand tourers' },
  { label: 'Hatchback', value: 'Hatchback', icon: 'box', subtitle: 'Compact & fuel-efficient hatchbacks' },
];

const TRANSMISSION_OPTIONS: DropdownOption<string>[] = [
  { label: 'Automatic', value: 'Automatic', icon: 'cpu', subtitle: 'Automatic / CVT transmission' },
  { label: 'Manual', value: 'Manual', icon: 'settings', subtitle: 'Manual stick-shift transmission' },
];

const FUEL_OPTIONS: DropdownOption<string>[] = [
  { label: 'Petrol', value: 'Petrol', icon: 'zap', subtitle: 'Gasoline / Unleaded petrol engine' },
  { label: 'Diesel', value: 'Diesel', icon: 'droplet', subtitle: 'Turbo-diesel high-torque engine' },
  { label: 'Hybrid', value: 'Hybrid', icon: 'battery-charging', subtitle: 'Self-charging or plug-in hybrid' },
  { label: 'Electric', value: 'Electric', icon: 'activity', subtitle: '100% battery electric powertrain' },
];

const SEATS_OPTIONS: DropdownOption<number>[] = [
  { label: '2 Seats', value: 2, icon: 'user', subtitle: 'Roadster & 2-passenger coupe' },
  { label: '4 Seats', value: 4, icon: 'users', subtitle: 'Compact 4-seater configuration' },
  { label: '5 Seats', value: 5, icon: 'users', subtitle: 'Standard 5-passenger family layout' },
  { label: '7 Seats', value: 7, icon: 'users', subtitle: '3-row midsize & full-size SUV' },
  { label: '8 Seats', value: 8, icon: 'users', subtitle: 'Passenger van & large MPV' },
];

const CITY_OPTIONS: DropdownOption<string>[] = [
  { label: 'Lahore', value: 'Lahore', icon: 'map-pin', subtitle: 'Punjab, Pakistan' },
  { label: 'Islamabad', value: 'Islamabad', icon: 'map-pin', subtitle: 'Federal Capital' },
  { label: 'Karachi', value: 'Karachi', icon: 'map-pin', subtitle: 'Sindh, Pakistan' },
  { label: 'Rawalpindi', value: 'Rawalpindi', icon: 'map-pin', subtitle: 'Punjab, Pakistan' },
  { label: 'Multan', value: 'Multan', icon: 'map-pin', subtitle: 'Punjab, Pakistan' },
];

const FALLBACK_DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80',
];

export default function AddVehicleScreen() {
  const colors = useColors();
  const { session, addVehicleListing } = useDriveFlex();

  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2024');
  const [licensePlate, setLicensePlate] = useState('');

  // Dropdown selections
  const [category, setCategory] = useState<string>('Sedan');
  const [transmission, setTransmission] = useState<string>('Automatic');
  const [fuelType, setFuelType] = useState<string>('Petrol');
  const [seats, setSeats] = useState<number>(5);

  const [pricePerDay, setPricePerDay] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('100');
  const [selectedRules, setSelectedRules] = useState<string[]>([
    'No smoking inside car',
    'Return fuel level matching handover level',
  ]);
  const [customRule, setCustomRule] = useState('');

  const [city, setCity] = useState<string>(session?.city || 'Lahore');
  const [address, setAddress] = useState(session?.address || 'Main Commercial Boulevard');
  const [description, setDescription] = useState('');

  // Media
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Pick images
  const handlePickImages = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Photo Permission Needed',
          'DriveFlex needs access to your camera roll so you can upload real photos of your vehicle.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 6,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uris = result.assets.map((a) => a.uri);
        setUploadedImages((prev) => [...prev, ...uris]);
      }
    } catch {
      Alert.alert('Image Selection', 'Could not access the photo library. Please try again.');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleToggleRule = (rule: string) => {
    if (selectedRules.includes(rule)) {
      setSelectedRules((prev) => prev.filter((r) => r !== rule));
    } else {
      setSelectedRules((prev) => [...prev, rule]);
    }
  };

  const handleAddCustomRule = () => {
    if (!customRule.trim()) return;
    if (!selectedRules.includes(customRule.trim())) {
      setSelectedRules((prev) => [...prev, customRule.trim()]);
    }
    setCustomRule('');
  };

  const handlePublish = async () => {
    if (!brand.trim()) {
      Alert.alert('Required Field', 'Please specify the vehicle make or brand (e.g. Toyota, BMW).');
      return;
    }
    if (!model.trim()) {
      Alert.alert('Required Field', 'Please specify the vehicle model (e.g. Corolla, 3 Series).');
      return;
    }
    const priceNum = parseFloat(pricePerDay);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid daily rental rate.');
      return;
    }
    if (!licensePlate.trim()) {
      Alert.alert('Registration Plate Required', 'Please enter the vehicle registration plate number.');
      return;
    }

    setSubmitting(true);
    try {
      const gallery = uploadedImages.length > 0 ? uploadedImages : FALLBACK_DEFAULT_IMAGES;
      const primaryImage = gallery[0];
      const depositNum = parseFloat(securityDeposit) || 100;
      const parsedYear = parseInt(year, 10) || 2024;

      const slug = `${brand.trim().toLowerCase()}-${model.trim().toLowerCase()}-${Date.now().toString().slice(-4)}`;
      const newVehicle: Vehicle = {
        id: `veh-custom-${Date.now()}`,
        slug,
        brand: brand.trim(),
        make: brand.trim(),
        model: model.trim(),
        category,
        location: `${address.trim()}, ${city}`,
        city_name: city,
        address_text: address.trim(),
        license_plate: licensePlate.trim().toUpperCase(),
        pricePerDay: priceNum,
        price_per_day: priceNum,
        rating: 5.0,
        reviewCount: 0,
        seats,
        transmission,
        fuelType,
        description:
          description.trim() ||
          `Pristine ${parsedYear} ${brand.trim()} ${model.trim()} offered with complete handover checklist and verified maintenance.`,
        image: primaryImage,
        gallery,
        ownerId: session?.id || 'owner-ali',
        host_id: session?.id || 'owner-ali',
        features: [transmission, fuelType, `${seats} Seats`, category, 'Air Conditioning', 'Bluetooth'],
        year: parsedYear,
        status: 'available',
        bookable: true,
        securityDeposit: depositNum,
        customTripRules: selectedRules,
        isDelisted: false,
      };

      await addVehicleListing(newVehicle);

      Alert.alert(
        'Vehicle Published!',
        `${newVehicle.brand} ${newVehicle.model} is now active and live in your fleet.`,
        [
          {
            text: 'View Listings',
            onPress: () => router.replace('/host/listings'),
          },
        ]
      );
    } catch {
      Alert.alert('Error', 'Unable to save vehicle listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      {/* ─── HEADER ─── */}
      <View style={styles.navRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Listings"
          onPress={() => router.back()}
          style={[styles.backBtn, { borderColor: colors.border }]}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.eyebrow, { color: colors.star }]}>HOST FLEET PORTAL</Text>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Add New Vehicle</Text>
        </View>
      </View>

      <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
        List your vehicle on DriveFlex with clean specifications, daily rates, custom trip policies, and photos.
      </Text>

      {/* ─── SECTION 1: VEHICLE IDENTITY & SPECIFICATIONS ─── */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(201,162,39,0.15)' }]}>
            <Feather name="truck" size={16} color={colors.star} />
          </View>
          <Text style={[styles.sectionHeading, { color: colors.foreground }]}>
            1. Vehicle Identity & Specs
          </Text>
        </View>

        {/* Brand & Model Row */}
        <View style={styles.twoColRow}>
          <View style={styles.colHalf}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Brand / Make *</Text>
            <TextInput
              placeholder="e.g. Toyota, BMW"
              placeholderTextColor={colors.mutedForeground}
              value={brand}
              onChangeText={setBrand}
              style={[
                styles.textInput,
                { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
              ]}
            />
          </View>

          <View style={styles.colHalf}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Model Name *</Text>
            <TextInput
              placeholder="e.g. Fortuner, 3 Series"
              placeholderTextColor={colors.mutedForeground}
              value={model}
              onChangeText={setModel}
              style={[
                styles.textInput,
                { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
              ]}
            />
          </View>
        </View>

        {/* Model Year & License Plate Row */}
        <View style={styles.twoColRow}>
          <View style={styles.colHalf}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Model Year</Text>
            <TextInput
              placeholder="2024"
              placeholderTextColor={colors.mutedForeground}
              value={year}
              onChangeText={setYear}
              keyboardType="numeric"
              style={[
                styles.textInput,
                { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
              ]}
            />
          </View>

          <View style={styles.colHalf}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>License Plate *</Text>
            <TextInput
              placeholder="e.g. LEA-8990"
              placeholderTextColor={colors.mutedForeground}
              value={licensePlate}
              onChangeText={setLicensePlate}
              autoCapitalize="characters"
              style={[
                styles.textInput,
                { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
              ]}
            />
          </View>
        </View>

        {/* ─── DROPDOWNS: REPLACED SPRAWLING CHIPS WITH ELEGANT SELECT DROPDOWNS ─── */}
        {/* Row 1: Body Category & Seating Capacity */}
        <View style={styles.twoColRow}>
          <View style={styles.colHalf}>
            <FormDropdown
              label="Body Category *"
              icon="grid"
              value={category}
              options={CATEGORY_OPTIONS}
              onSelect={(val) => setCategory(val as string)}
            />
          </View>

          <View style={styles.colHalf}>
            <FormDropdown
              label="Seating Capacity *"
              icon="users"
              value={seats}
              options={SEATS_OPTIONS}
              onSelect={(val) => setSeats(val as number)}
            />
          </View>
        </View>

        {/* Row 2: Transmission & Fuel Type */}
        <View style={styles.twoColRow}>
          <View style={styles.colHalf}>
            <FormDropdown
              label="Transmission *"
              icon="cpu"
              value={transmission}
              options={TRANSMISSION_OPTIONS}
              onSelect={(val) => setTransmission(val as string)}
            />
          </View>

          <View style={styles.colHalf}>
            <FormDropdown
              label="Fuel Type *"
              icon="zap"
              value={fuelType}
              options={FUEL_OPTIONS}
              onSelect={(val) => setFuelType(val as string)}
            />
          </View>
        </View>
      </View>

      {/* ─── SECTION 2: PRICING & DEPOSIT ─── */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
            <Feather name="dollar-sign" size={16} color="#10B981" />
          </View>
          <Text style={[styles.sectionHeading, { color: colors.foreground }]}>
            2. Pricing & Security Deposit
          </Text>
        </View>

        <View style={styles.twoColRow}>
          <View style={styles.colHalf}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Price Per Day ($ USD) *</Text>
            <TextInput
              placeholder="e.g. 120"
              placeholderTextColor={colors.mutedForeground}
              value={pricePerDay}
              onChangeText={setPricePerDay}
              keyboardType="numeric"
              style={[
                styles.textInput,
                { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
              ]}
            />
          </View>

          <View style={styles.colHalf}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Security Deposit ($)</Text>
            <TextInput
              placeholder="e.g. 150"
              placeholderTextColor={colors.mutedForeground}
              value={securityDeposit}
              onChangeText={setSecurityDeposit}
              keyboardType="numeric"
              style={[
                styles.textInput,
                { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
              ]}
            />
          </View>
        </View>

        {/* Custom Trip Rules */}
        <Text style={[styles.fieldLabel, { color: colors.foreground, marginTop: 4 }]}>
          Custom Trip Rules (Select all that apply)
        </Text>
        <View style={{ gap: 8, marginTop: 4 }}>
          {PRESET_RULES.map((rule) => {
            const isChecked = selectedRules.includes(rule);
            return (
              <Pressable
                key={rule}
                onPress={() => handleToggleRule(rule)}
                style={[
                  styles.ruleRow,
                  {
                    backgroundColor: isChecked ? 'rgba(16,185,129,0.08)' : colors.background,
                    borderColor: isChecked ? '#10B981' : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={isChecked ? 'checkbox' : 'square-outline'}
                  size={18}
                  color={isChecked ? '#10B981' : colors.mutedForeground}
                />
                <Text style={[styles.ruleText, { color: colors.foreground }]}>{rule}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Add custom rule input */}
        <View style={[styles.customRuleInputRow, { marginTop: 10 }]}>
          <TextInput
            placeholder="Add custom policy (e.g. No track racing)..."
            placeholderTextColor={colors.mutedForeground}
            value={customRule}
            onChangeText={setCustomRule}
            style={[
              styles.textInput,
              { flex: 1, color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
            ]}
          />
          <Pressable
            onPress={handleAddCustomRule}
            style={[styles.addRuleBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="plus" size={16} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      {/* ─── SECTION 3: LOCATION & DESCRIPTION ─── */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(177,18,38,0.15)' }]}>
            <Feather name="map-pin" size={16} color={colors.primary} />
          </View>
          <Text style={[styles.sectionHeading, { color: colors.foreground }]}>
            3. City & Pickup Location
          </Text>
        </View>

        {/* Operating City Dropdown */}
        <FormDropdown
          label="Operating City *"
          icon="map-pin"
          value={city}
          options={CITY_OPTIONS}
          onSelect={(val) => setCity(val as string)}
        />

        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Exact Pickup Hub / Address</Text>
        <TextInput
          placeholder="e.g. Block H, Gulberg III / Allama Iqbal Airport"
          placeholderTextColor={colors.mutedForeground}
          value={address}
          onChangeText={setAddress}
          style={[
            styles.textInput,
            { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background, marginBottom: 14 },
          ]}
        />

        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Listing Description</Text>
        <TextInput
          placeholder="Highlight features, condition, airport delivery terms, and amenities..."
          placeholderTextColor={colors.mutedForeground}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={[
            styles.textInput,
            {
              color: colors.foreground,
              borderColor: colors.border,
              backgroundColor: colors.background,
              minHeight: 80,
              textAlignVertical: 'top',
            },
          ]}
        />
      </View>

      {/* ─── SECTION 4: REAL CAR PHOTOS ─── */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
            <Feather name="camera" size={16} color="#3B82F6" />
          </View>
          <Text style={[styles.sectionHeading, { color: colors.foreground }]}>
            4. Real Vehicle Photos (Multiple)
          </Text>
        </View>

        <Text style={[styles.fieldSub, { color: colors.mutedForeground }]}>
          High quality photos dramatically increase booking conversions. Upload exterior front, rear, sides, and clean interior shots.
        </Text>

        {/* Upload Button */}
        <Pressable
          onPress={() => void handlePickImages()}
          style={[
            styles.uploadZone,
            { backgroundColor: colors.isDark ? '#1C232E' : '#F8FAFC', borderColor: colors.border },
          ]}
        >
          <Feather name="upload-cloud" size={28} color={colors.primary} />
          <Text style={[styles.uploadZoneText, { color: colors.foreground }]}>
            Select Photos from Library
          </Text>
          <Text style={[styles.uploadZoneSub, { color: colors.mutedForeground }]}>
            Supports JPG, PNG (select multiple images)
          </Text>
        </Pressable>

        {/* Preview of Uploaded Images */}
        {uploadedImages.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.previewLabel, { color: colors.foreground }]}>
              Selected Photos ({uploadedImages.length}):
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 6 }}>
              {uploadedImages.map((uri, idx) => (
                <View key={idx} style={styles.previewThumbWrap}>
                  <Image source={{ uri }} contentFit="cover" style={styles.previewThumb} />
                  <Pressable
                    onPress={() => handleRemoveImage(idx)}
                    style={styles.removeImageBadge}
                  >
                    <Feather name="x" size={12} color="#FFFFFF" />
                  </Pressable>
                  {idx === 0 && (
                    <View style={styles.coverBadge}>
                      <Text style={styles.coverBadgeText}>COVER</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* ─── SUBMIT / PUBLISH BUTTON ─── */}
      <View style={{ marginTop: 8, marginBottom: 30 }}>
        <Pressable
          onPress={() => void handlePublish()}
          disabled={submitting}
          style={[
            styles.publishBtn,
            { backgroundColor: submitting ? colors.border : colors.primary },
          ]}
        >
          <Feather name="check-circle" size={18} color="#FFFFFF" />
          <Text style={styles.publishBtnText}>
            {submitting ? 'Publishing Fleet Car...' : 'Publish Vehicle Listing'}
          </Text>
        </Pressable>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  fieldSub: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  colHalf: {
    flex: 1,
  },
  textInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  ruleText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  customRuleInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addRuleBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadZone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadZoneText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  uploadZoneSub: {
    fontSize: 11,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  previewThumbWrap: {
    width: 84,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  previewThumb: {
    width: '100%',
    height: '100%',
  },
  removeImageBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#0F172A',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coverBadgeText: {
    color: '#38BDF8',
    fontSize: 8,
    fontWeight: '800',
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 16,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
