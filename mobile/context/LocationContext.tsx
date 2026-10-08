import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import {
  CityLocation,
  PAKISTAN_CITIES,
  calculateDistanceKm,
  resolveLocationCoords,
} from '@/lib/location-data';
import type { Vehicle } from '@/data/catalog';

interface LocationContextType {
  currentCity: CityLocation;
  radiusKm: number;
  isFilterActive: boolean;
  isModalOpen: boolean;
  isLocating: boolean;
  openModal: () => void;
  closeModal: () => void;
  applyLocation: (city: CityLocation, radius: number) => void;
  clearFilter: () => void;
  detectUserLocation: () => Promise<CityLocation | null>;
  getDistanceToVehicle: (vehicle: Vehicle) => number | null;
  filterVehicles: (vehicles: Vehicle[]) => Vehicle[];
}

const STORAGE_KEY = '@driveflex_location_preference';
const DEFAULT_CITY = PAKISTAN_CITIES[0]; // Multan
const DEFAULT_RADIUS = 250;

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentCity, setCurrentCity] = useState<CityLocation>(DEFAULT_CITY);
  const [radiusKm, setRadiusKm] = useState<number>(DEFAULT_RADIUS);
  const [isFilterActive, setIsFilterActive] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Restore saved location from AsyncStorage on launch
  useEffect(() => {
    async function loadPreference() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.city && parsed.radius) {
            setCurrentCity(parsed.city);
            setRadiusKm(parsed.radius);
            setIsFilterActive(Boolean(parsed.active));
          }
        }
      } catch (e) {
        console.warn('Failed to parse location preference from AsyncStorage', e);
      }
    }
    void loadPreference();
  }, []);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const applyLocation = useCallback((city: CityLocation, radius: number) => {
    setCurrentCity(city);
    setRadiusKm(radius);
    setIsFilterActive(true);
    setIsModalOpen(false);

    void AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ city, radius, active: true })
    ).catch(() => {});
  }, []);

  const clearFilter = useCallback(() => {
    setIsFilterActive(false);
    void AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ city: currentCity, radius: radiusKm, active: false })
    ).catch(() => {});
  }, [currentCity, radiusKm]);

  // Use GPS location via expo-location to detect nearest Pakistani city
  const detectUserLocation = useCallback(async (): Promise<CityLocation | null> => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsLocating(false);
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      // Find closest Pakistani city
      let closestCity = PAKISTAN_CITIES[0];
      let minDistance = calculateDistanceKm(
        latitude,
        longitude,
        closestCity.lat,
        closestCity.lng
      );

      for (let i = 1; i < PAKISTAN_CITIES.length; i++) {
        const city = PAKISTAN_CITIES[i];
        const dist = calculateDistanceKm(latitude, longitude, city.lat, city.lng);
        if (dist < minDistance) {
          minDistance = dist;
          closestCity = city;
        }
      }

      setIsLocating(false);
      return closestCity;
    } catch (err) {
      console.warn('Failed to detect GPS location:', err);
      setIsLocating(false);
      return null;
    }
  }, []);

  const getDistanceToVehicle = useCallback(
    (vehicle: Vehicle): number | null => {
      const vehicleCoords = resolveLocationCoords(vehicle.location);
      if (!vehicleCoords) return null;
      return calculateDistanceKm(
        currentCity.lat,
        currentCity.lng,
        vehicleCoords.lat,
        vehicleCoords.lng
      );
    },
    [currentCity]
  );

  const filterVehicles = useCallback(
    (vehicles: Vehicle[]): Vehicle[] => {
      if (!isFilterActive) {
        return vehicles;
      }

      return vehicles
        .map((v) => ({
          vehicle: v,
          distance: getDistanceToVehicle(v),
        }))
        .filter((item): item is { vehicle: Vehicle; distance: number } => {
          return item.distance !== null && item.distance <= radiusKm;
        })
        .sort((a, b) => a.distance - b.distance)
        .map((item) => item.vehicle);
    },
    [isFilterActive, radiusKm, getDistanceToVehicle]
  );

  return (
    <LocationContext.Provider
      value={{
        currentCity,
        radiusKm,
        isFilterActive,
        isModalOpen,
        isLocating,
        openModal,
        closeModal,
        applyLocation,
        clearFilter,
        detectUserLocation,
        getDistanceToVehicle,
        filterVehicles,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationFilter(): LocationContextType {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationFilter must be used within a LocationProvider');
  }
  return context;
}
