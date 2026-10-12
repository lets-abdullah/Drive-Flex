import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  AuthFooterLink,
  AuthInputField,
  AuthPrimaryButton,
  RoleChoiceCard,
  RoleSegmentedToggle,
  SocialAuthSection,
  TermsCheckbox,
  WelcomeIllustrationBanner,
} from '@/components/AuthComponents';
import { Avatar, Page, SectionTitle } from '@/components/Marketplace';
import { useDriveFlex } from '@/context/AppContext';
import { owners } from '@/data/catalog';
import { useColors } from '@/hooks/useColors';

type AuthViewMode = 'sign-in' | 'choose-role' | 'create-account';

export default function ProfileScreen() {
  const colors = useColors();
  const {
    session,
    setSession,
    updateUserProfile,
    bookings,
    ownerProfile,
    vehicles,
    favorites,
    theme,
    toggleTheme,
  } = useDriveFlex();

  // Auth UI state when not logged in
  const [authMode, setAuthMode] = useState<AuthViewMode>('choose-role');
  const [selectedRole, setSelectedRole] = useState<'host' | 'renter'>('renter');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('renter@driveflex.pk');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('password123');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole: 'host' | 'renter') => {
    setSelectedRole(newRole);
    if (newRole === 'host') {
      setEmail('host@driveflex.pk');
      setPassword('password123');
    } else {
      setEmail('renter@driveflex.pk');
      setPassword('password123');
    }
  };

  // Edit Profile Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBusinessName, setEditBusinessName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const handleOpenEditProfile = () => {
    setEditName(session?.name || '');
    setEditEmail(session?.email || '');
    setEditPhone(session?.phone || '+92 300 1234567');
    setEditAddress(session?.address || session?.city || 'Lahore, Pakistan');
    setEditAvatar(
      session?.avatar ||
      (session?.role === 'host'
        ? 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'
        : 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg')
    );
    setEditBusinessName(session?.businessName || (session?.name ? `${session.name} Fleet Management` : ''));
    setEditModalVisible(true);
  };

  const handlePickEditAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Access to photos is required to update your profile photo.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setEditAvatar(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Could not open photo library.');
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }
    if (!editEmail.includes('@')) {
      Alert.alert('Valid Email Required', 'Please enter a valid email address.');
      return;
    }
    setSavingProfile(true);
    try {
      await updateUserProfile({
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
        city: editAddress.split(',')[0].trim() || 'Lahore',
        avatar: editAvatar,
        businessName: session?.role === 'host' ? editBusinessName.trim() : undefined,
      });
      setEditModalVisible(false);
      Alert.alert('Profile Updated', 'Your profile details and profile picture have been updated.');
    } catch {
      Alert.alert('Error', 'Unable to save profile changes.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Host's specific fleet cars
  const hostCars = vehicles.filter(
    (v) =>
      v.host_id === session?.id ||
      v.ownerId === session?.id ||
      (session?.role === 'host' && (v.ownerId === 'owner-ali' || v.ownerId === 'owner-sana' || !v.ownerId))
  );

  // Host's bookings & earnings
  const hostBookings = bookings.filter(
    (b) =>
      b.host_id === session?.id ||
      b.host_name?.includes(session?.name || '') ||
      (session?.role === 'host' && (b.host_id === 'owner-ali' || b.host_id === 'owner-sana' || !b.host_id))
  );
  const hostTotalEarnings =
    hostBookings.reduce(
      (sum, b) =>
        b.status === 'completed' || b.status === 'confirmed' || b.status === 'active'
          ? sum + (b.host_payout || b.total_price || b.totalAmount || 0)
          : sum,
      0
    ) || 14250;

  // Renter's personal bookings
  const renterBookings = bookings.filter(
    (b) =>
      b.renter_id === session?.id ||
      b.customer?.toLowerCase().trim() === session?.name?.toLowerCase().trim() ||
      (session?.email && b.renter_email?.toLowerCase().trim() === session?.email?.toLowerCase().trim())
  );

  const getApiBaseUrl = () => {
    const raw = process.env.EXPO_PUBLIC_API_URL?.trim() || 'https://drive-flex.vercel.app/api';
    return raw.replace(/\/+$/, '').replace(/\/api$/, '');
  };

  // Sign In Handler
  const handleSignIn = async () => {
    if (!email.includes('@')) {
      Alert.alert('Valid Email Required', 'Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Password Required', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      let res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          expectedRole: selectedRole,
        }),
      });

      let data = await res.json();
      if (!res.ok && data.code === 'ROLE_MISMATCH') {
        const altRole = selectedRole === 'host' ? 'renter' : 'host';
        res = await fetch(`${baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
            expectedRole: altRole,
          }),
        });
        data = await res.json();
      }

      if (res.ok && data.success) {
        await setSession({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          phone: data.user.phone,
          city: data.user.city,
          businessName: data.user.businessName,
        });
        setLoading(false);
        return;
      }

      // Offline / Demo fallback
      const isDemoHost = email.trim() === 'host@driveflex.pk';
      const isDemoRenter = email.trim() === 'renter@driveflex.pk';
      await setSession({
        id: isDemoHost ? 'owner-ali' : isDemoRenter ? 'usr-demo-renter' : `usr-${selectedRole}-${Date.now()}`,
        name: isDemoHost ? 'Ali Raza' : isDemoRenter ? 'Omar Farooq' : email.split('@')[0],
        email: email.trim(),
        role: selectedRole,
        phone: isDemoHost ? '+92 321 440 7812' : isDemoRenter ? '+92 300 8472910' : (phone || '+92 300 1234567'),
        city: 'Lahore',
        businessName: selectedRole === 'host' ? 'Ali Motors Lahore' : undefined,
      });
      setLoading(false);
    } catch {
      // Offline fallback
      const isDemoHost = email.trim() === 'host@driveflex.pk';
      const isDemoRenter = email.trim() === 'renter@driveflex.pk';
      await setSession({
        id: isDemoHost ? 'owner-ali' : isDemoRenter ? 'usr-demo-renter' : `usr-${selectedRole}-${Date.now()}`,
        name: isDemoHost ? 'Ali Raza' : isDemoRenter ? 'Omar Farooq' : email.split('@')[0],
        email: email.trim(),
        role: selectedRole,
        phone: isDemoHost ? '+92 321 440 7812' : isDemoRenter ? '+92 300 8472910' : (phone || '+92 300 1234567'),
        city: 'Lahore',
        businessName: selectedRole === 'host' ? 'Ali Motors Lahore' : undefined,
      });
      setLoading(false);
    }
  };


  // Create Account Handler
  const handleCreateAccount = async () => {
    if (fullName.trim().length < 2) {
      Alert.alert('Full Name Required', 'Please enter your full name.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Valid Email Required', 'Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Password Required', 'Password must be at least 6 characters.');
      return;
    }
    if (!termsAccepted) {
      Alert.alert('Terms Required', 'Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          role: selectedRole,
          city: 'Lahore',
          businessName: selectedRole === 'host' ? `${fullName.trim()} Motors` : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await setSession({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          phone: data.user.phone,
          city: data.user.city,
          businessName: data.user.businessName,
        });
        setLoading(false);
        return;
      }

      // Offline fallback
      await setSession({
        id: `usr-${selectedRole}-${Date.now()}`,
        name: fullName.trim(),
        email: email.trim(),
        role: selectedRole,
        phone: phone.trim(),
        businessName: selectedRole === 'host' ? `${fullName.trim()} Motors` : undefined,
      });
      setLoading(false);
    } catch {
      await setSession({
        id: `usr-${selectedRole}-${Date.now()}`,
        name: fullName.trim(),
        email: email.trim(),
        role: selectedRole,
        phone: phone.trim(),
        businessName: selectedRole === 'host' ? `${fullName.trim()} Motors` : undefined,
      });
      setLoading(false);
    }
  };

  // Robust Sign Out: Flushes AsyncStorage and clears session
  const performSignOut = async () => {
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      await AsyncStorage.removeItem('driveflex-demo-session');
      await AsyncStorage.removeItem('driveflex-auth-token');
      await AsyncStorage.removeItem('driveflex-user-role');
      await AsyncStorage.removeItem('driveflex-demo-owner');
      await setSession(null);
      setAuthMode('choose-role');
    } catch (err) {
      console.warn('Error flushing storage on sign out:', err);
      await setSession(null);
    }
  };

  const handleSignOut = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to sign out? Your credentials and session tokens will be cleared.');
      if (confirmed) {
        await performSignOut();
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out? Your credentials and session tokens will be cleared.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: () => void performSignOut(),
          },
        ]
      );
    }
  };

  // Renter conversion to Host: explicit sign out and redirect to Host registration
  const handleBecomeHost = async () => {
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      await AsyncStorage.removeItem('driveflex-demo-session');
      await AsyncStorage.removeItem('driveflex-auth-token');
      await AsyncStorage.removeItem('driveflex-user-role');
      await setSession(null);
      router.push({ pathname: '/register', params: { role: 'host' } });
    } catch (err) {
      console.warn('Error during host registration switch:', err);
      router.push({ pathname: '/register', params: { role: 'host' } });
    }
  };

  return (
    <Page tabbed>
      {/* ─── 1. TOP HEADER & THEME TOGGLE ─── */}
      <View style={styles.topHeader}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>
            {session ? (session.role === 'host' ? 'HOST FLEET PORTAL' : 'RENTER ACCOUNT') : 'DRIVEFLEX'}
          </Text>
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>
            {session ? (session.role === 'host' ? 'Host Dashboard' : 'My Profile') : 'Authentication'}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          onPress={toggleTheme}
          style={[
            styles.themePillBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather
            name={theme === 'dark' ? 'sun' : 'moon'}
            size={14}
            color={colors.accent}
          />
          <Text style={[styles.themePillText, { color: colors.foreground }]}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Text>
        </Pressable>
      </View>

      {/* ══════════════════════════════════════════════════════════════
          SCENARIO A: USER IS NOT LOGGED IN
          ══════════════════════════════════════════════════════════════ */}
      {!session ? (
        <View style={styles.authWrapper}>

          {/* VIEW 1: SIGN IN */}
          {authMode === 'sign-in' && (
            <View style={styles.formCard}>
              <RoleSegmentedToggle
                activeRole={selectedRole}
                onSelectRole={handleRoleChange}
              />

              <WelcomeIllustrationBanner
                role={selectedRole}
                title={selectedRole === 'host' ? 'Welcome Back, Host!' : 'Welcome Back, Renter!'}
                subtitle={
                  selectedRole === 'host'
                    ? 'Sign in to manage your vehicle fleet, bookings and earnings.'
                    : 'Sign in to find and book the perfect car for your next trip.'
                }
              />

              <View style={styles.inputsStack}>
                <AuthInputField
                  icon="mail"
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <AuthInputField
                  icon="lock"
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <AuthPrimaryButton
                  title="Sign In"
                  onPress={() => void handleSignIn()}
                  loading={loading}
                />

                <AuthFooterLink
                  prompt="Don't have an account?"
                  actionText="Create Account"
                  onPress={() => setAuthMode('choose-role')}
                />
              </View>
            </View>
          )}

          {/* VIEW 2: CHOOSE YOUR ROLE */}
          {authMode === 'choose-role' && (
            <View style={styles.formCard}>
              {/* <View style={{ marginBottom: 18 }}>
                <Text style={[styles.chooseRoleHeading, { color: colors.foreground }]}>
                  Choose Your Account Type
                </Text>
                <Text style={[styles.chooseRoleSub, { color: colors.mutedForeground }]}>
                  DriveFlex strictly separates Host fleet owners from Renters for privacy and security.
                </Text>
              </View> */}

              <View style={{ marginTop: 20, marginBottom: 15, width: '100%' }}>
                <Text style={[styles.chooseRoleHeading, { color: colors.foreground, textAlign: 'center' }]}>
                  Choose Your Account Type
                </Text>
              </View>

              <View style={{ gap: 14 }}>
                <RoleChoiceCard
                  role="host"
                  title="Host Partner"
                  description="List your vehicles, accept bookings, track earnings, and manage your fleet."
                  iconName="truck"
                  isSelected={selectedRole === 'host'}
                  onSelect={() => setSelectedRole('host')}
                />

                <RoleChoiceCard
                  role="renter"
                  title="Renter"
                  description="Browse verified cars, request rentals, view itineraries, and rate your trips."
                  iconName="user"
                  isSelected={selectedRole === 'renter'}
                  onSelect={() => setSelectedRole('renter')}
                />
              </View>

              <View style={{ marginTop: 24 }}>
                <AuthPrimaryButton
                  title="Continue to Registration"
                  onPress={() => setAuthMode('create-account')}
                />
                <View style={{ marginTop: 14 }}>
                  <AuthFooterLink
                    prompt="Already registered?"
                    actionText="Sign In Here"
                    onPress={() => setAuthMode('sign-in')}
                  />
                </View>
              </View>
            </View>
          )}

          {/* VIEW 3: CREATE ACCOUNT */}
          {authMode === 'create-account' && (
            <View style={styles.formCard}>
              <View style={styles.navBarWithBack}>
                <Pressable
                  onPress={() => setAuthMode('choose-role')}
                  style={[styles.backNavBtn, { borderColor: colors.border }]}
                >
                  <Feather name="chevron-left" size={20} color={colors.foreground} />
                </Pressable>
                <Text style={[styles.navBackTitle, { color: colors.foreground }]}>
                  Create {selectedRole === 'host' ? 'Host' : 'Renter'} Account
                </Text>
              </View>

              <View style={styles.inputsStack}>
                <AuthInputField
                  icon="user"
                  placeholder="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                />

                <AuthInputField
                  icon="mail"
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <AuthInputField
                  icon="phone"
                  placeholder="Phone (+92 300 1234567)"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />

                <AuthInputField
                  icon="lock"
                  placeholder="Create Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <TermsCheckbox
                  checked={termsAccepted}
                  onToggle={() => setTermsAccepted((prev) => !prev)}
                />

                <AuthPrimaryButton
                  title="Register Account"
                  onPress={() => void handleCreateAccount()}
                  loading={loading}
                />

                <AuthFooterLink
                  prompt="Already registered?"
                  actionText="Sign In Here"
                  onPress={() => setAuthMode('sign-in')}
                />
              </View>
            </View>
          )}
        </View>
      ) : session.role === 'host' ? (
        /* ══════════════════════════════════════════════════════════════
           SCENARIO B: HOST VIEW (Strictly Fleet, Listings, Earnings)
           ══════════════════════════════════════════════════════════════ */
        <View style={{ gap: 18 }}>
          {/* Host Profile Hero Card */}
          <View
            style={[
              styles.userProfileHero,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={{ position: 'relative' }}>
              <Avatar
                uri={session.avatar || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400'}
                size={68}
              />
              <Pressable
                onPress={handleOpenEditProfile}
                style={[styles.avatarCameraBadge, { backgroundColor: colors.primary, borderColor: colors.card }]}
              >
                <Feather name="camera" size={11} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={{ flex: 1, gap: 3 }}>
              <View style={styles.nameRow}>
                <Text style={[styles.userNameText, { color: colors.foreground }]}>
                  {session.name}
                </Text>
                <View style={[styles.roleBadgePill, { backgroundColor: 'rgba(201,162,39,0.18)' }]}>
                  <Text style={[styles.roleBadgeText, { color: colors.star }]}>
                    VERIFIED HOST
                  </Text>
                </View>
              </View>

              <Text style={[styles.userEmailText, { color: colors.mutedForeground }]}>
                {session.businessName || `${session.name} Fleet Management`}
              </Text>
              <Text style={[styles.userPhoneText, { color: colors.mutedForeground }]}>
                {session.email} • {session.phone || '+92 321 440 7812'}
              </Text>
              <Text style={[styles.userAddressText, { color: colors.mutedForeground }]} numberOfLines={1}>
                📍 {session.address || session.city || 'Lahore, Pakistan'}
              </Text>
            </View>
          </View>

          {/* Edit Profile Action Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit Host Profile"
            onPress={handleOpenEditProfile}
            style={[
              styles.editProfilePillBtn,
              { backgroundColor: colors.isDark ? '#1C232E' : '#F1F5F9', borderColor: colors.border },
            ]}
          >
            <Feather name="edit-2" size={14} color={colors.foreground} />
            <Text style={[styles.editProfilePillText, { color: colors.foreground }]}>
              Edit Host Profile Details
            </Text>
          </Pressable>

          {/* Host Financial & Fleet Performance Metrics (Specification 1) */}
          <View
            style={[
              styles.metricsBar,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >


            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

            <Pressable
              onPress={() => router.push('/host/listings')}
              style={styles.metricItem}
            >
              <Text style={[styles.metricVal, { color: colors.foreground }]}>
                {hostCars.length}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                Total Listed
              </Text>
            </Pressable>

            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

            <Pressable
              onPress={() => router.push('/(tabs)/bookings')}
              style={styles.metricItem}
            >
              <Text style={[styles.metricVal, { color: colors.foreground }]}>
                {hostBookings.length || 4}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                Bookings
              </Text>
            </Pressable>

            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: colors.star }]}>4.95 ★</Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                Host Rating
              </Text>
            </View>
          </View>

          {/* Specification 1 & 2: Quick Link to "Manage Listings" (Dedicated Separate Page) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Manage Fleet Listings"
            onPress={() => router.push('/host/listings')}
            style={[
              styles.hostActionCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderLeftWidth: 4,
                borderLeftColor: colors.star,
              },
            ]}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(201,162,39,0.18)' }]}>
              <Feather name="layers" size={20} color={colors.star} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.actionTitle, { color: colors.foreground }]}>
                  Manage Listings ({hostCars.length} Cars)
                </Text>
                <View style={[styles.roleBadgePill, { backgroundColor: 'rgba(201,162,39,0.18)', paddingHorizontal: 6, paddingVertical: 2 }]}>
                  <Text style={[styles.roleBadgeText, { color: colors.star, fontSize: 10 }]}>
                    FLEET
                  </Text>
                </View>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>

          {/* Quick Host Navigation: Bookings & Approvals */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fleet Bookings and Approvals"
            onPress={() => router.push('/(tabs)/bookings')}
            style={[
              styles.hostActionCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(177,18,38,0.12)' }]}>
              <Feather name="calendar" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionTitle, { color: colors.foreground }]}>
                Booking Approvals & Schedule
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>

          {/* Host Interactive Fleet Map Action Card */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Interactive Fleet Map"
            onPress={() => {
              if (Platform.OS === 'web' && typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
              router.push('/map');
            }}
            style={[
              styles.hostActionCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(201,162,39,0.15)' }]}>
              <Feather name="map" size={20} color={colors.star} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.actionTitle, { color: colors.foreground }]}>
                  Interactive Fleet Map
                </Text>
                <View style={[styles.roleBadgePill, { backgroundColor: 'rgba(201,162,39,0.18)', paddingHorizontal: 6, paddingVertical: 2 }]}>
                  <Text style={[styles.roleBadgeText, { color: colors.star, fontSize: 10 }]}>
                    LIVE GPS
                  </Text>
                </View>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>

          {/* Action: Update Password / Security */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Update Password"
            onPress={() => router.push('/update-password')}
            style={[
              styles.hostActionCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(201,162,39,0.18)' }]}>
              <Feather name="lock" size={20} color={colors.star} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionTitle, { color: colors.foreground }]}>
                Security & Update Password
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>

          {/* Action: Add New Vehicle (Specification 2) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add New Vehicle"
            onPress={() => router.push('/host/add-vehicle')}
            style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="plus-circle" size={18} color="#FFFFFF" />
            <Text style={styles.primaryActionBtnText}>Add New Vehicle</Text>
          </Pressable>

          {/* Sign Out CTA */}
          <Pressable
            onPress={handleSignOut}
            style={[
              styles.signOutBtn,
              { backgroundColor: colors.card, borderColor: colors.border, marginTop: 4 },
            ]}
          >
            <Feather name="log-out" size={17} color={colors.destructive} />
            <Text style={[styles.signOutText, { color: colors.destructive }]}>
              Sign Out of Host Account
            </Text>
          </Pressable>
        </View>
      ) : (
        /* ══════════════════════════════════════════════════════════════
           SCENARIO C: RENTER VIEW (Strictly Trips, Bookings, Favorites)
           ══════════════════════════════════════════════════════════════ */
        <View style={{ gap: 18 }}>
          {/* Renter Profile Hero Card */}
          <View
            style={[
              styles.userProfileHero,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={{ position: 'relative' }}>
              <Avatar
                uri={session.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400'}
                size={68}
              />
              <Pressable
                onPress={handleOpenEditProfile}
                style={[styles.avatarCameraBadge, { backgroundColor: colors.primary, borderColor: colors.card }]}
              >
                <Feather name="camera" size={11} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={{ flex: 1, gap: 3 }}>
              <View style={styles.nameRow}>
                <Text style={[styles.userNameText, { color: colors.foreground }]}>
                  {session.name}
                </Text>
                <View style={[styles.roleBadgePill, { backgroundColor: 'rgba(177,18,38,0.12)' }]}>
                  <Text style={[styles.roleBadgeText, { color: colors.primary }]}>
                    VERIFIED RENTER
                  </Text>
                </View>
              </View>

              <Text style={[styles.userEmailText, { color: colors.mutedForeground }]}>
                {session.email}
              </Text>
              <Text style={[styles.userPhoneText, { color: colors.mutedForeground }]}>
                {session.phone || '+92 300 1234567'}
              </Text>
              <Text style={[styles.userAddressText, { color: colors.mutedForeground }]} numberOfLines={1}>
                📍 {session.address || session.city || 'Islamabad, Pakistan'}
              </Text>
            </View>
          </View>

          {/* Edit Profile Action Button (Specification 1) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit Renter Profile"
            onPress={handleOpenEditProfile}
            style={[
              styles.editProfilePillBtn,
              { backgroundColor: colors.isDark ? '#1C232E' : '#F1F5F9', borderColor: colors.border },
            ]}
          >
            <Feather name="edit-2" size={14} color={colors.foreground} />
            <Text style={[styles.editProfilePillText, { color: colors.foreground }]}>
              Edit Profile Details
            </Text>
          </Pressable>

          {/* Renter Metric Stats: Total Booking Count & Favorites Count (Specification 1) */}
          <View
            style={[
              styles.metricsBar,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View All Trips"
              onPress={() => router.push('/(tabs)/bookings')}
              style={styles.metricItem}
            >
              <Text style={[styles.metricVal, { color: colors.foreground }]}>
                {renterBookings.length}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                Total Bookings
              </Text>
            </Pressable>

            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View Saved Wishlist"
              onPress={() => router.push('/(tabs)/favorites')}
              style={styles.metricItem}
            >
              <Text style={[styles.metricVal, { color: colors.foreground }]}>
                {favorites.length}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                Favorites / Wishlist
              </Text>
            </Pressable>

            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

            {/* <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: colors.foreground }]}>
                2024
              </Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                Member Since
              </Text>
            </View> */}
          </View>

          {/* ─── INFORMATIVE "BECOME A HOST" PARTNER BANNER ─── */}
          <View
            style={[
              styles.becomeHostBanner,
              {
                backgroundColor: colors.isDark ? '#141822' : '#FFF8EB',
                borderColor: colors.isDark ? '#2E3547' : '#FDE68A',
              },
            ]}
          >
            <View style={styles.becomeHostHeader}>
              <View style={[styles.goldBadge, { backgroundColor: 'rgba(201,162,39,0.18)' }]}>
                <Ionicons name="key" size={16} color={colors.star} />
              </View>
              <Text style={[styles.becomeHostTitle, { color: colors.foreground }]}>
                Become a Host Partner
              </Text>
            </View>

            <Text style={[styles.becomeHostBody, { color: colors.mutedForeground }]}>
              Want to earn money by listing your cars? Create a dedicated Host account with verified vehicle details.
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign Out and Register as Host"
              onPress={handleBecomeHost}
              style={[styles.becomeHostBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.becomeHostBtnText}>Register as Host</Text>
              <Feather name="arrow-right" size={15} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </Pressable>
          </View>

          {/* Renter Interactive Fleet Map Action Card */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Interactive Fleet Map"
            onPress={() => {
              if (Platform.OS === 'web' && typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
              router.push('/map');
            }}
            style={[
              styles.hostActionCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(177,18,38,0.12)' }]}>
              <Feather name="map-pin" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.actionTitle, { color: colors.foreground }]}>
                  Interactive Fleet Map
                </Text>
                <View style={[styles.roleBadgePill, { backgroundColor: 'rgba(177,18,38,0.12)', paddingHorizontal: 6, paddingVertical: 2 }]}>
                  <Text style={[styles.roleBadgeText, { color: colors.primary, fontSize: 10 }]}>
                    EXPLORE
                  </Text>
                </View>
              </View>
              <Text style={[styles.actionSub, { color: colors.mutedForeground }]}>
                Locate verified cars near you across Islamabad, Lahore, Multan, and Karachi
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>

          {/* Quick Renter Navigation Links */}
          <View
            style={[
              styles.menuContainer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Pressable
              onPress={() => router.push('/(tabs)/bookings')}
              style={[styles.linkRow, { borderBottomColor: colors.border }]}
            >
              <View style={[styles.linkIconWrap, { backgroundColor: 'rgba(177,18,38,0.12)' }]}>
                <Feather name="calendar" size={16} color={colors.primary} />
              </View>
              <Text style={[styles.linkText, { color: colors.foreground }]}>
                My Trips & Booking Itinerary
              </Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Pressable>

            <Pressable
              onPress={() => router.push('/(tabs)/favorites')}
              style={[styles.linkRow, { borderBottomColor: colors.border }]}
            >
              <View style={[styles.linkIconWrap, { backgroundColor: 'rgba(177,18,38,0.12)' }]}>
                <Feather name="heart" size={16} color={colors.primary} />
              </View>
              <Text style={[styles.linkText, { color: colors.foreground }]}>
                Saved Cars / Wishlist ({favorites.length})
              </Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Pressable>

            <Pressable
              onPress={() => router.push('/update-password')}
              style={[styles.linkRow, { borderBottomWidth: 0 }]}
            >
              <View style={[styles.linkIconWrap, { backgroundColor: 'rgba(177,18,38,0.12)' }]}>
                <Feather name="lock" size={16} color={colors.primary} />
              </View>
              <Text style={[styles.linkText, { color: colors.foreground }]}>
                Security & Update Password
              </Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {/* Sign Out CTA */}
          <Pressable
            onPress={handleSignOut}
            style={[
              styles.signOutBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="log-out" size={17} color={colors.destructive} />
            <Text style={[styles.signOutText, { color: colors.destructive }]}>
              Sign Out
            </Text>
          </Pressable>
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════
          EDIT PROFILE MODAL (SPECIFICATION 1: PROFILE PICTURE, NAME,
          PHONE, EMAIL, AND LOCATION/ADDRESS MODIFICATION)
          ══════════════════════════════════════════════════════════════ */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.editModalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                  Edit Profile Information
                </Text>
                <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
                  Update your contact details, profile picture, and location
                </Text>
              </View>
              <Pressable
                onPress={() => setEditModalVisible(false)}
                style={[styles.closeModalBtn, { borderColor: colors.border }]}
              >
                <Feather name="x" size={18} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
              <View style={{ gap: 14, paddingVertical: 10 }}>
                {/* Profile Picture Upload Section */}
                <View style={{ alignItems: 'center', marginBottom: 6 }}>
                  <View style={{ position: 'relative' }}>
                    <Avatar uri={editAvatar} size={84} />
                    <Pressable
                      onPress={() => void handlePickEditAvatar()}
                      style={[styles.editAvatarOverlayBadge, { backgroundColor: colors.primary }]}
                    >
                      <Feather name="camera" size={14} color="#FFFFFF" />
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={() => void handlePickEditAvatar()}
                    style={{ marginTop: 8 }}
                  >
                    <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>
                      Change Profile Picture
                    </Text>
                  </Pressable>
                </View>

                {/* Full Name */}
                <View>
                  <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                    Full Name *
                  </Text>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Your legal full name"
                    placeholderTextColor={colors.mutedForeground}
                    style={[
                      styles.modalInput,
                      { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
                    ]}
                  />
                </View>

                {/* Host Business Name (if host) */}
                {session?.role === 'host' && (
                  <View>
                    <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                      Fleet / Business Name
                    </Text>
                    <TextInput
                      value={editBusinessName}
                      onChangeText={setEditBusinessName}
                      placeholder="e.g. Royal Motors Lahore"
                      placeholderTextColor={colors.mutedForeground}
                      style={[
                        styles.modalInput,
                        { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
                      ]}
                    />
                  </View>
                )}

                {/* Email Address */}
                <View>
                  <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                    Email Address *
                  </Text>
                  <TextInput
                    value={editEmail}
                    onChangeText={setEditEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="email@example.com"
                    placeholderTextColor={colors.mutedForeground}
                    style={[
                      styles.modalInput,
                      { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
                    ]}
                  />
                </View>

                {/* Phone Number */}
                <View>
                  <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                    Phone Number
                  </Text>
                  <TextInput
                    value={editPhone}
                    onChangeText={setEditPhone}
                    keyboardType="phone-pad"
                    placeholder="+92 300 1234567"
                    placeholderTextColor={colors.mutedForeground}
                    style={[
                      styles.modalInput,
                      { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
                    ]}
                  />
                </View>

                {/* Location / Address */}
                <View>
                  <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                    Location / City Address
                  </Text>
                  <TextInput
                    value={editAddress}
                    onChangeText={setEditAddress}
                    placeholder="e.g. Gulberg III, Lahore, Pakistan"
                    placeholderTextColor={colors.mutedForeground}
                    style={[
                      styles.modalInput,
                      { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
                    ]}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                onPress={() => setEditModalVisible(false)}
                style={[styles.cancelModalBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.cancelModalText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={() => void handleSaveProfile()}
                disabled={savingProfile}
                style={[styles.saveModalBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.saveModalText}>
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Page>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginTop: 4,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  themePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  themePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  authWrapper: {
    gap: 16,
  },
  formCard: {
    gap: 14,
  },
  inputsStack: {
    gap: 12,
  },
  chooseRoleHeading: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  chooseRoleSub: {
    fontSize: 14,
    lineHeight: 20,
  },
  navBarWithBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBackTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  userProfileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '800',
  },
  roleBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  userEmailText: {
    fontSize: 13,
  },
  userPhoneText: {
    fontSize: 12,
  },
  verifiedCheckBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsBar: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 28,
  },
  hostActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  actionSub: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  fleetCarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  fleetCarThumb: {
    width: 72,
    height: 52,
    borderRadius: 10,
  },
  fleetCarTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  fleetPlate: {
    fontSize: 11,
    fontWeight: '600',
  },
  fleetAddress: {
    fontSize: 11,
  },
  statusAvailablePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  fleetPrice: {
    fontSize: 14,
    fontWeight: '800',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  becomeHostBanner: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  becomeHostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goldBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  becomeHostTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  becomeHostBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  becomeHostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  becomeHostBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  menuContainer: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  linkIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    marginBottom: 40,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
  },
  userAddressText: {
    fontSize: 12,
    marginTop: 2,
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfilePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: -6,
  },
  editProfilePillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  editAvatarOverlayBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  editModalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelModalText: {
    fontWeight: '700',
    fontSize: 14,
  },
  saveModalBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveModalText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});