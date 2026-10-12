import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [loading, setLoading] = useState(false);

  // Host's specific fleet cars
  const hostCars = vehicles.filter(
    (v) =>
      v.host_id === session?.id ||
      v.ownerId === session?.id ||
      (session?.role === 'host' && (v.ownerId === 'owner-ali' || v.ownerId === 'owner-sana'))
  );

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
      await setSession({
        id: `usr-${selectedRole}-${Date.now()}`,
        name: email.split('@')[0],
        email: email.trim(),
        role: selectedRole,
        phone: phone || '+92 300 1234567',
        businessName: selectedRole === 'host' ? 'Prime Auto Fleet' : undefined,
      });
      setLoading(false);
    } catch {
      // Offline fallback
      await setSession({
        id: `usr-${selectedRole}-${Date.now()}`,
        name: email.split('@')[0],
        email: email.trim(),
        role: selectedRole,
        phone: phone || '+92 300 1234567',
        businessName: selectedRole === 'host' ? 'Prime Auto Fleet' : undefined,
      });
      setLoading(false);
    }
  };

  const handleQuickDemoSignIn = async (demoRole: 'renter' | 'host') => {
    setLoading(true);
    setSelectedRole(demoRole);
    const demoEmail = demoRole === 'renter' ? 'renter@driveflex.pk' : 'host@driveflex.pk';
    const demoPassword = 'password123';
    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: demoEmail,
          password: demoPassword,
          expectedRole: demoRole,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
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
    } catch {
      // offline fallback
    }

    await setSession({
      id: demoRole === 'host' ? 'owner-ali' : 'usr-demo-renter',
      name: demoRole === 'host' ? 'Ali Raza' : 'Omar Farooq',
      email: demoEmail,
      role: demoRole,
      phone: demoRole === 'host' ? '+92 321 440 7812' : '+92 300 8472910',
      city: 'Lahore',
      businessName: demoRole === 'host' ? 'Ali Motors Lahore' : undefined,
    });
    setLoading(false);
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
                onSelectRole={setSelectedRole}
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

              {/* Quick Demo Credentials Box */}
              <View
                style={[
                  styles.demoCredentialsBox,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.demoBoxHeader}>
                  <Feather name="zap" size={14} color="#D97706" />
                  <Text style={[styles.demoBoxTitle, { color: colors.foreground }]}>
                    Demo Credentials (1-Tap Login)
                  </Text>
                </View>

                <View style={styles.demoCardsRow}>
                  {/* Demo Renter Card */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="1-Tap Login as Demo Renter"
                    onPress={() => void handleQuickDemoSignIn('renter')}
                    style={[
                      styles.demoCard,
                      {
                        backgroundColor: selectedRole === 'renter' ? (colors.isDark ? '#261619' : '#FEF2F2') : (colors.isDark ? '#141822' : '#F8FAFC'),
                        borderColor: selectedRole === 'renter' ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <View style={styles.demoCardTop}>
                      <View style={[styles.demoBadge, { backgroundColor: 'rgba(177, 18, 38, 0.12)' }]}>
                        <Text style={[styles.demoBadgeText, { color: colors.primary }]}>RENTER</Text>
                      </View>
                      <Text style={[styles.demoActionText, { color: colors.primary }]}>⚡ Login</Text>
                    </View>
                    <Text style={[styles.demoNameText, { color: colors.foreground }]} numberOfLines={1}>
                      Omar Farooq
                    </Text>
                    <Text style={[styles.demoEmailText, { color: colors.mutedForeground }]} numberOfLines={1}>
                      renter@driveflex.pk
                    </Text>
                    <Text style={[styles.demoPassText, { color: colors.mutedForeground }]}>
                      🔑 password123
                    </Text>
                  </Pressable>

                  {/* Demo Host Card */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="1-Tap Login as Demo Host"
                    onPress={() => void handleQuickDemoSignIn('host')}
                    style={[
                      styles.demoCard,
                      {
                        backgroundColor: selectedRole === 'host' ? (colors.isDark ? '#262013' : '#FEFCE8') : (colors.isDark ? '#141822' : '#F8FAFC'),
                        borderColor: selectedRole === 'host' ? '#C9A227' : colors.border,
                      },
                    ]}
                  >
                    <View style={styles.demoCardTop}>
                      <View style={[styles.demoBadge, { backgroundColor: 'rgba(201, 162, 39, 0.16)' }]}>
                        <Text style={[styles.demoBadgeText, { color: '#C9A227' }]}>HOST</Text>
                      </View>
                      <Text style={[styles.demoActionText, { color: '#C9A227' }]}>⚡ Login</Text>
                    </View>
                    <Text style={[styles.demoNameText, { color: colors.foreground }]} numberOfLines={1}>
                      Ali Raza
                    </Text>
                    <Text style={[styles.demoEmailText, { color: colors.mutedForeground }]} numberOfLines={1}>
                      host@driveflex.pk
                    </Text>
                    <Text style={[styles.demoPassText, { color: colors.mutedForeground }]}>
                      🔑 password123
                    </Text>
                  </Pressable>
                </View>
              </View>

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
              <View style={{ marginBottom: 18 }}>
                <Text style={[styles.chooseRoleHeading, { color: colors.foreground }]}>
                  Choose Your Account Type
                </Text>
                <Text style={[styles.chooseRoleSub, { color: colors.mutedForeground }]}>
                  DriveFlex strictly separates Host fleet owners from Renters for privacy and security.
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
                  prompt="Already have an account?"
                  actionText="Sign In"
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
            <Avatar size={64} />
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
            </View>

            <View style={[styles.verifiedCheckBadge, { backgroundColor: 'rgba(201,162,39,0.2)' }]}>
              <Ionicons name="shield-checkmark" size={16} color={colors.star} />
            </View>
          </View>

          {/* Host Financial & Fleet Performance Metrics */}
          <View
            style={[
              styles.metricsBar,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: '#10B981' }]}>$14,250</Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                Total Earned
              </Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: colors.foreground }]}>
                {hostCars.length}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                Listed Cars
              </Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: colors.star }]}>4.95 ★</Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                Host Rating
              </Text>
            </View>
          </View>

          {/* Quick Host Navigation Card */}
          <Pressable
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
                Fleet Bookings & Approvals
              </Text>
              <Text style={[styles.actionSub, { color: colors.mutedForeground }]}>
                Review renter requests, active on-road drives, and completed payouts
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
              <Text style={[styles.actionSub, { color: colors.mutedForeground }]}>
                Track live vehicle GPS locations, city hubs & cluster radius on real-time map
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>

          {/* Active Fleet Listings Section */}
          <View style={{ marginTop: 6 }}>
            <SectionTitle eyebrow="MANAGEMENT" title="My Active Vehicle Fleet" />
          </View>

          <View style={{ gap: 10 }}>
            {hostCars.map((car) => (
              <View
                key={car.id}
                style={[
                  styles.fleetCarCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Image
                  source={{ uri: car.image }}
                  contentFit="cover"
                  style={styles.fleetCarThumb}
                />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text numberOfLines={1} style={[styles.fleetCarTitle, { color: colors.foreground }]}>
                    {car.brand} {car.model}
                  </Text>
                  <Text style={[styles.fleetPlate, { color: colors.mutedForeground }]}>
                    Plate: {car.license_plate || 'REG-2023'} • {car.category}
                  </Text>
                  <Text style={[styles.fleetAddress, { color: colors.mutedForeground }]} numberOfLines={1}>
                    📍 {car.address_text || car.location}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <View style={[styles.statusAvailablePill, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                    <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '700' }}>
                      AVAILABLE
                    </Text>
                  </View>
                  <Text style={[styles.fleetPrice, { color: colors.foreground }]}>
                    ${car.price_per_day || car.pricePerDay}/d
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Action: List a New Vehicle */}
          <Pressable
            onPress={() => router.push('/owner/onboard')}
            style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="plus-circle" size={18} color="#FFFFFF" />
            <Text style={styles.primaryActionBtnText}>List a New Vehicle</Text>
          </Pressable>

          {/* Sign Out CTA */}
          <Pressable
            onPress={handleSignOut}
            style={[
              styles.signOutBtn,
              { backgroundColor: colors.card, borderColor: colors.border, marginTop: 10 },
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
            <Avatar size={64} />
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
            </View>

            <View style={[styles.verifiedCheckBadge, { backgroundColor: 'rgba(177,18,38,0.12)' }]}>
              <Feather name="check" size={14} color={colors.primary} />
            </View>
          </View>

          {/* Renter Metric Stats */}
          <View
            style={[
              styles.metricsBar,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: colors.foreground }]}>
                {renterBookings.length}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                My Trips
              </Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: colors.foreground }]}>
                {favorites.length}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                Saved Cars
              </Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: colors.foreground }]}>
                2024
              </Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                Member Since
              </Text>
            </View>
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
              Want to earn money by listing your cars? In DriveFlex, host accounts are strictly separate from renter accounts for security and commercial compliance. You must create a dedicated Host account with verified vehicle details.
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
                Saved Cars Collection
              </Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Pressable>

            <Pressable
              onPress={() => {
                if (Platform.OS === 'web' && typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
                router.push('/map');
              }}
              style={[styles.linkRow, { borderBottomColor: colors.border }]}
            >
              <View style={[styles.linkIconWrap, { backgroundColor: colors.secondary }]}>
                <Feather name="map" size={16} color={colors.accent} />
              </View>
              <Text style={[styles.linkText, { color: colors.foreground }]}>
                Interactive Fleet Map
              </Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Pressable>

            <Pressable
              onPress={() => router.push('/contact')}
              style={[styles.linkRow, { borderBottomWidth: 0 }]}
            >
              <View style={[styles.linkIconWrap, { backgroundColor: colors.secondary }]}>
                <Feather name="message-circle" size={16} color={colors.accent} />
              </View>
              <Text style={[styles.linkText, { color: colors.foreground }]}>
                DriveFlex Customer Support
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
  demoCredentialsBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  demoBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoBoxTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  demoCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  demoCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  demoBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  demoBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  demoActionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  demoNameText: {
    fontSize: 13,
    fontWeight: '700',
  },
  demoEmailText: {
    fontSize: 11,
    fontWeight: '500',
  },
  demoPassText: {
    fontSize: 10.5,
    marginTop: 1,
  },
});