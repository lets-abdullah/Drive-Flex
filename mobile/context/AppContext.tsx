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
  saveOwnerProfile: (profile: OwnerProfile) => Promise<void>;
  createBooking: (payload: BookingPayload) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);
const readableError = (error: unknown) => error instanceof Error ? error.message : 'The DriveFlex API could not be reached.';

export function AppProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const apiConfigured = Boolean(process.env.EXPO_PUBLIC_API_URL?.trim());
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
    ]).then(([savedFavorites, savedSession, savedBookings, savedOwner, savedTheme]) => {
      if (!active) return;
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites) as string[]);
      if (savedSession) setSessionState(JSON.parse(savedSession) as Session);
      if (savedBookings) setLocalBookings(JSON.parse(savedBookings) as Booking[]);
      if (savedOwner) setOwnerProfile(JSON.parse(savedOwner) as OwnerProfile);
      if (savedTheme === 'light' || savedTheme === 'dark') setThemeState(savedTheme);
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
    const next = favorites.includes(vehicleId) ? favorites.filter((id) => id !== vehicleId) : [...favorites, vehicleId];
    setFavorites(next);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  }, [favorites]);

  const setSession = useCallback(async (value: Session | null) => {
    setSessionState(value);
    if (value) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(value));
    else await AsyncStorage.removeItem(SESSION_KEY);
  }, []);

  const saveOwnerProfile = useCallback(async (profile: OwnerProfile) => {
    setOwnerProfile(profile);
    await AsyncStorage.setItem(OWNER_KEY, JSON.stringify(profile));
  }, []);

  const createBooking = useCallback(async (payload: BookingPayload) => {
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

  const vehicles = useMemo(() => {
    const data = vehiclesQuery.data?.data as Vehicle[] | undefined;
    return apiConfigured && data?.length ? data : demoVehicles;
  }, [apiConfigured, vehiclesQuery.data]);
  const bookings = useMemo(() => {
    const data = bookingsQuery.data?.data as Booking[] | undefined;
    return apiConfigured ? data ?? [] : localBookings;
  }, [apiConfigured, bookingsQuery.data, localBookings]);
  const refresh = useCallback(async () => {
    if (apiConfigured) await Promise.all([vehiclesQuery.refetch(), bookingsQuery.refetch()]);
  }, [apiConfigured, bookingsQuery, vehiclesQuery]);
  const apiError = apiConfigured
    ? vehiclesQuery.error ? readableError(vehiclesQuery.error)
      : bookingsQuery.error ? readableError(bookingsQuery.error) : null
    : null;
  const value = useMemo<AppContextValue>(() => ({
    theme, toggleTheme, setTheme,
    vehicles, isLoadingVehicles: apiConfigured && vehiclesQuery.isLoading, apiError, apiConfigured,
    bookings, favorites, session, ownerProfile, hydrated, toggleFavorite, setSession, saveOwnerProfile,
    createBooking, cancelBooking, refresh,
  }), [
    theme, toggleTheme, setTheme,
    vehicles, apiConfigured, vehiclesQuery.isLoading, apiError, bookings, favorites, session, ownerProfile,
    hydrated, toggleFavorite, setSession, saveOwnerProfile, createBooking, cancelBooking, refresh,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useDriveFlex() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useDriveFlex must be used within AppProvider');
  return context;
}