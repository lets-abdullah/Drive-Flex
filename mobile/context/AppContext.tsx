import { Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getGetBookingsQueryKey,
  getGetVehiclesQueryKey,
  useCancelBooking,
  useCreateBooking,
  useGetBookings,
  useGetVehicles,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { demoBookings, demoVehicles, type Booking, type OwnerProfile, type Session, type Vehicle } from '@/data/catalog';

const FAVORITES_KEY = 'driveflex-favorites';
const SESSION_KEY = 'driveflex-demo-session';
const BOOKINGS_KEY = 'driveflex-demo-bookings';
const OWNER_KEY = 'driveflex-demo-owner';
const THEME_KEY = 'driveflex-theme';
const CUSTOM_VEHICLES_KEY = 'driveflex-custom-vehicles';
const DELETED_VEHICLES_KEY = 'driveflex-deleted-vehicles';

type ThemeMode = 'light' | 'dark';
type BookingPayload = Omit<Booking, 'id' | 'status'>;
type AppContextValue = {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  vehicles: Vehicle[];
  isLoadingVehicles: boolean;
  apiError: string | null;
  apiConfigured: boolean;
  bookings: Booking[];
  favorites: string[];
  session: Session | null;
  ownerProfile: OwnerProfile | null;
  hydrated: boolean;
  toggleFavorite: (vehicleId: string) => Promise<void>;
  setSession: (session: Session | null) => Promise<void>;
  updateUserProfile: (updates: Partial<Session>) => Promise<void>;
  saveOwnerProfile: (profile: OwnerProfile) => Promise<void>;
  createBooking: (payload: BookingPayload) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
  approveBooking: (bookingId: string) => Promise<void>;
  declineBooking: (bookingId: string, reason?: string) => Promise<void>;
  addVehicleListing: (vehicle: Vehicle) => Promise<void>;
  updateVehicleListing: (vehicleId: string, updates: Partial<Vehicle>) => Promise<void>;
  toggleVehicleListingStatus: (vehicleId: string) => Promise<void>;
  deleteVehicleListing: (vehicleId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);
const readableError = (error: unknown) => error instanceof Error ? error.message : 'The DriveFlex API could not be reached.';

export function AppProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() || '';
  const apiConfigured = Boolean(rawApiUrl && !rawApiUrl.includes('drive-flex.vercel.app'));
  const vehiclesQuery = useGetVehicles({
    query: { queryKey: getGetVehiclesQueryKey(), enabled: apiConfigured, retry: false, staleTime: 45_000 },
  });
  const bookingsQuery = useGetBookings(undefined, {
    query: { queryKey: getGetBookingsQueryKey(), enabled: apiConfigured, retry: false, staleTime: 30_000 },
  });
  const createBookingMutation = useCreateBooking();
  const cancelBookingMutation = useCancelBooking();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [session, setSessionState] = useState<Session | null>(null);
  const [localBookings, setLocalBookings] = useState<Booking[]>(demoBookings);
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null);
  const [customVehicles, setCustomVehicles] = useState<Vehicle[]>([]);
  const [deletedVehicleIds, setDeletedVehicleIds] = useState<string[]>([]);
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.all([
      AsyncStorage.getItem(FAVORITES_KEY),
      AsyncStorage.getItem(SESSION_KEY),
      AsyncStorage.getItem(BOOKINGS_KEY),
      AsyncStorage.getItem(OWNER_KEY),
      AsyncStorage.getItem(THEME_KEY),
      AsyncStorage.getItem(CUSTOM_VEHICLES_KEY),
      AsyncStorage.getItem(DELETED_VEHICLES_KEY),
    ]).then(([savedFavorites, savedSession, savedBookings, savedOwner, savedTheme, savedCustomVehicles, savedDeletedVehicles]) => {
      if (!active) return;
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites) as string[]);
      if (savedSession) setSessionState(JSON.parse(savedSession) as Session);
      if (savedBookings) setLocalBookings(JSON.parse(savedBookings) as Booking[]);
      if (savedOwner) setOwnerProfile(JSON.parse(savedOwner) as OwnerProfile);
      if (savedTheme === 'light' || savedTheme === 'dark') setThemeState(savedTheme);
      if (savedCustomVehicles) setCustomVehicles(JSON.parse(savedCustomVehicles) as Vehicle[]);
      if (savedDeletedVehicles) setDeletedVehicleIds(JSON.parse(savedDeletedVehicles) as string[]);
    }).catch(() => {
      if (active) setHydrated(true);
    }).finally(() => {
      if (active) setHydrated(true);
    });
    return () => { active = false; };
  }, []);

  const setTheme = useCallback(async (mode: ThemeMode) => {
    setThemeState(mode);
    await AsyncStorage.setItem(THEME_KEY, mode);
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    await AsyncStorage.setItem(THEME_KEY, next);
  }, [theme]);

  const toggleFavorite = useCallback(async (vehicleId: string) => {
    if (!session) {
      Alert.alert(
        'Account Required',
        'Please create an account or sign in to save vehicles to your favorites.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Account', onPress: () => router.push('/register') },
          { text: 'Sign In', onPress: () => router.push('/sign-in') },
        ]
      );
      return;
    }
    const next = favorites.includes(vehicleId) ? favorites.filter((id) => id !== vehicleId) : [...favorites, vehicleId];
    setFavorites(next);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  }, [favorites, session]);

  const setSession = useCallback(async (value: Session | null) => {
    setSessionState(value);
    if (value) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(value));
    else await AsyncStorage.removeItem(SESSION_KEY);
  }, []);

  const updateUserProfile = useCallback(async (updates: Partial<Session>) => {
    setSessionState((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      void AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });

    if (ownerProfile) {
      const updatedOwner: OwnerProfile = {
        ...ownerProfile,
        fullName: updates.name ?? ownerProfile.fullName,
        businessName: updates.businessName ?? ownerProfile.businessName,
        phone: updates.phone ?? ownerProfile.phone,
        email: updates.email ?? ownerProfile.email,
        city: updates.city ?? ownerProfile.city,
        location: updates.address ?? updates.city ?? ownerProfile.location,
        businessLocation: updates.address ?? updates.city ?? ownerProfile.businessLocation,
        profileImage: updates.avatar ?? ownerProfile.profileImage,
      };
      setOwnerProfile(updatedOwner);
      await AsyncStorage.setItem(OWNER_KEY, JSON.stringify(updatedOwner));
    }
  }, [ownerProfile]);

  const saveOwnerProfile = useCallback(async (profile: OwnerProfile) => {
    if (!session) {
      Alert.alert(
        'Account Required',
        'Please create an account or sign in to save host profiles and listings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Account', onPress: () => router.push('/register') },
          { text: 'Sign In', onPress: () => router.push('/sign-in') },
        ]
      );
      return;
    }
    setOwnerProfile(profile);
    await AsyncStorage.setItem(OWNER_KEY, JSON.stringify(profile));
  }, [session]);

  const addVehicleListing = useCallback(async (vehicle: Vehicle) => {
    const next = [vehicle, ...customVehicles];
    setCustomVehicles(next);
    await AsyncStorage.setItem(CUSTOM_VEHICLES_KEY, JSON.stringify(next));
  }, [customVehicles]);

  const updateVehicleListing = useCallback(async (vehicleId: string, updates: Partial<Vehicle>) => {
    setCustomVehicles((prev) => {
      const existingIndex = prev.findIndex((v) => v.id === vehicleId || v.slug === vehicleId);
      let next: Vehicle[];
      if (existingIndex >= 0) {
        next = prev.map((v, idx) => (idx === existingIndex ? { ...v, ...updates } : v));
      } else {
        const apiData = (vehiclesQuery.data?.data as Vehicle[] | undefined) ?? [];
        const base =
          apiData.find((v) => v.id === vehicleId || v.slug === vehicleId) ||
          demoVehicles.find((v) => v.id === vehicleId || v.slug === vehicleId);
        if (base) {
          next = [{ ...base, ...updates }, ...prev];
        } else {
          next = prev;
        }
      }
      void AsyncStorage.setItem(CUSTOM_VEHICLES_KEY, JSON.stringify(next));
      return next;
    });

    if (apiConfigured) {
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() || 'http://localhost:5001/api';
        await fetch(`${apiUrl.replace(/\/+$/, '')}/vehicles/${vehicleId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        await queryClient.invalidateQueries({ queryKey: getGetVehiclesQueryKey() });
      } catch {
        // Local state updated
      }
    }
  }, [apiConfigured, queryClient, vehiclesQuery.data]);

  const toggleVehicleListingStatus = useCallback(async (vehicleId: string) => {
    const apiData = (vehiclesQuery.data?.data as Vehicle[] | undefined) ?? [];
    const match =
      customVehicles.find((v) => v.id === vehicleId || v.slug === vehicleId) ||
      apiData.find((v) => v.id === vehicleId || v.slug === vehicleId) ||
      demoVehicles.find((v) => v.id === vehicleId || v.slug === vehicleId);
    const isCurrentlyDelisted = match ? Boolean(match.isDelisted || match.status === 'maintenance') : false;
    const isDelisted = !isCurrentlyDelisted;
    await updateVehicleListing(vehicleId, {
      isDelisted,
      status: isDelisted ? 'maintenance' : 'available',
    });
  }, [customVehicles, updateVehicleListing, vehiclesQuery.data]);

  const deleteVehicleListing = useCallback(async (vehicleId: string) => {
    const apiData = (vehiclesQuery.data?.data as Vehicle[] | undefined) ?? [];
    const match =
      customVehicles.find((v) => v.id === vehicleId || v.slug === vehicleId) ||
      apiData.find((v) => v.id === vehicleId || v.slug === vehicleId) ||
      demoVehicles.find((v) => v.id === vehicleId || v.slug === vehicleId);

    const idsToDelete = Array.from(new Set([vehicleId, match?.id, match?.slug].filter(Boolean) as string[]));

    // 1. Permanently add to deletedVehicleIds
    setDeletedVehicleIds((prev) => {
      const next = Array.from(new Set([...prev, ...idsToDelete]));
      void AsyncStorage.setItem(DELETED_VEHICLES_KEY, JSON.stringify(next));
      return next;
    });

    // 2. Remove from customVehicles
    setCustomVehicles((prev) => {
      const next = prev.filter((v) => !idsToDelete.includes(v.id) && !idsToDelete.includes(v.slug));
      void AsyncStorage.setItem(CUSTOM_VEHICLES_KEY, JSON.stringify(next));
      return next;
    });

    // 3. Remove from favorites
    setFavorites((prev) => {
      const next = prev.filter((id) => !idsToDelete.includes(id));
      void AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });

    // 4. Delete from backend if API enabled
    if (apiConfigured) {
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() || 'http://localhost:5001/api';
        await fetch(`${apiUrl.replace(/\/+$/, '')}/vehicles/${vehicleId}`, {
          method: 'DELETE',
        });
        await queryClient.invalidateQueries({ queryKey: getGetVehiclesQueryKey() });
      } catch {
        // Local state purged
      }
    }
  }, [apiConfigured, customVehicles, queryClient, vehiclesQuery.data]);

  const createBooking = useCallback(async (payload: BookingPayload) => {
    if (!session) {
      Alert.alert(
        'Account Required',
        'Please create an account or sign in to complete a booking.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Account', onPress: () => router.push('/register') },
          { text: 'Sign In', onPress: () => router.push('/sign-in') },
        ]
      );
      throw new Error('Account required to complete booking.');
    }
    if (apiConfigured) {
      const response = await createBookingMutation.mutateAsync({ data: payload });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getGetBookingsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getGetVehiclesQueryKey() }),
      ]);
      return response.data as Booking;
    }
    const pickupTime = new Date(`${payload.pickup}T12:00:00`).getTime();
    const returnTime = new Date(`${payload.returnDate}T12:00:00`).getTime();
    const conflict = localBookings.some((booking) => {
      if (booking.vehicleId !== payload.vehicleId || booking.status.toLowerCase() === 'cancelled') return false;
      const bookedStart = new Date(`${booking.pickup}T12:00:00`).getTime();
      const bookedEnd = new Date(`${booking.returnDate}T12:00:00`).getTime();
      return pickupTime < bookedEnd && returnTime > bookedStart;
    });
    if (conflict) throw new Error('This car already has a reservation that overlaps those dates.');
    const booking: Booking = {
      ...payload, id: `mobile-${Date.now()}`, status: 'Confirmed', createdAt: new Date().toISOString(),
    };
    const next = [booking, ...localBookings];
    setLocalBookings(next);
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(next));
    return booking;
  }, [apiConfigured, createBookingMutation, localBookings, queryClient]);

  const cancelBooking = useCallback(async (bookingId: string) => {
    if (apiConfigured) {
      await cancelBookingMutation.mutateAsync({ id: bookingId });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getGetBookingsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getGetVehiclesQueryKey() }),
      ]);
      return;
    }
    const next = localBookings.filter((booking) => booking.id !== bookingId);
    setLocalBookings(next);
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(next));
  }, [apiConfigured, cancelBookingMutation, localBookings, queryClient]);

  const approveBooking = useCallback(async (bookingId: string) => {
    const next = localBookings.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            status: 'confirmed' as const,
            refund_status: 'Guaranteed Reservation (Approved by Host)',
          }
        : b
    );
    setLocalBookings(next);
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(next));
  }, [localBookings]);

  const declineBooking = useCallback(async (bookingId: string, reason?: string) => {
    const next = localBookings.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            status: 'cancelled' as const,
            cancellation_reason: reason || 'Host declined reservation request',
            refund_status: 'Refund Processed to Card (100% Refund)',
            payment_status: 'refunded' as const,
          }
        : b
    );
    setLocalBookings(next);
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(next));
  }, [localBookings]);

  const vehicles = useMemo(() => {
    const apiData = (vehiclesQuery.data?.data as Vehicle[] | undefined) ?? [];
    const apiById = new Map<string, Vehicle>();
    apiData.forEach((v) => {
      apiById.set(v.id, v);
      if (v.slug) apiById.set(v.slug, v);
    });

    const map = new Map<string, Vehicle>();
    const seenCityBrand = new Set<string>();

    // Ensure every (City, Brand) from the 5x6 catalog has 1 canonical car
    demoVehicles.forEach((v) => {
      if (deletedVehicleIds.includes(v.id) || deletedVehicleIds.includes(v.slug)) {
        return;
      }
      const apiMatch = apiById.get(v.id) || apiById.get(v.slug);
      const merged: Vehicle = apiMatch
        ? {
            ...v,
            status: apiMatch.status ?? v.status,
            isDelisted: apiMatch.isDelisted ?? v.isDelisted,
          }
        : v;
      const cityKey = (merged.city_name || merged.location.split(',')[0] || '').trim().toLowerCase();
      const brandKey = (merged.brand || '').trim().toLowerCase();
      const pairKey = `${cityKey}::${brandKey}`;
      if (!seenCityBrand.has(pairKey)) {
        seenCityBrand.add(pairKey);
        map.set(merged.id, merged);
      }
    });

    // Apply local host edits / custom vehicles on top
    customVehicles.forEach((v) => {
      if (!deletedVehicleIds.includes(v.id) && !deletedVehicleIds.includes(v.slug)) {
        const existing = map.get(v.id);
        map.set(v.id, existing ? { ...existing, ...v } : v);
      }
    });

    return Array.from(map.values());
  }, [customVehicles, deletedVehicleIds, vehiclesQuery.data]);

  const bookings = useMemo(() => {
    const data = bookingsQuery.data?.data as Booking[] | undefined;
    return apiConfigured && data && data.length > 0 ? data : localBookings;
  }, [apiConfigured, bookingsQuery.data, localBookings]);

  const refresh = useCallback(async () => {
    if (apiConfigured) await Promise.all([vehiclesQuery.refetch(), bookingsQuery.refetch()]);
  }, [apiConfigured, bookingsQuery, vehiclesQuery]);

  const apiError = null;

  const value = useMemo<AppContextValue>(() => ({
    theme, toggleTheme, setTheme,
    vehicles, isLoadingVehicles: apiConfigured && vehiclesQuery.isLoading, apiError, apiConfigured,
    bookings, favorites, session, ownerProfile, hydrated, toggleFavorite, setSession, updateUserProfile,
    saveOwnerProfile, createBooking, cancelBooking, approveBooking, declineBooking,
    addVehicleListing, updateVehicleListing, toggleVehicleListingStatus, deleteVehicleListing, refresh,
  }), [
    theme, toggleTheme, setTheme,
    vehicles, apiConfigured, vehiclesQuery.isLoading, apiError, bookings, favorites, session, ownerProfile,
    hydrated, toggleFavorite, setSession, updateUserProfile, saveOwnerProfile, createBooking, cancelBooking,
    approveBooking, declineBooking, addVehicleListing, updateVehicleListing, toggleVehicleListingStatus,
    deleteVehicleListing, refresh,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useDriveFlex() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useDriveFlex must be used within AppProvider');
  return context;
}