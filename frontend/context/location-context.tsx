'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CityLocation,
  PAKISTAN_CITIES,
  calculateDistanceKm,
  resolveLocationCoords,
} from '@/lib/location-data';
import type { Vehicle } from '@/types';

interface LocationContextType {
  currentCity: CityLocation;
  radiusKm: number;
  isFilterActive: boolean;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  applyLocation: (city: CityLocation, radius: number) => void;
  clearFilter: () => void;
  getDistanceToVehicle: (vehicle: Vehicle) => number | null;
  filterVehicles: (vehicles: Vehicle[]) => Vehicle[];
}

const STORAGE_KEY = 'driveflex_location_preference';
const DEFAULT_CITY = PAKISTAN_CITIES[0]; // Multan
const DEFAULT_RADIUS = 250;

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentCity, setCurrentCity] = useState<CityLocation>(DEFAULT_CITY);
  const [radiusKm, setRadiusKm] = useState<number>(DEFAULT_RADIUS);
  const [isFilterActive, setIsFilterActive] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Restore saved location from localStorage on load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.city && parsed.radius) {
          setCurrentCity(parsed.city);
          setRadiusKm(parsed.radius);
          setIsFilterActive(Boolean(parsed.active));
        }
      }
    } catch (e) {
      console.warn('Failed to parse location preference from storage', e);
    }
  }, []);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const applyLocation = useCallback((city: CityLocation, radius: number) => {
    setCurrentCity(city);
    setRadiusKm(radius);
    setIsFilterActive(true);
    setIsModalOpen(false);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ city, radius, active: true })
      );
    } catch {
      // LocalStorage error ignore
    }
  }, []);

  const clearFilter = useCallback(() => {
    setIsFilterActive(false);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ city: currentCity, radius: radiusKm, active: false })
      );
    } catch {
      // LocalStorage error ignore
    }
  }, [currentCity, radiusKm]);

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
        openModal,
        closeModal,
        applyLocation,
        clearFilter,
        getDistanceToVehicle,
        filterVehicles,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationFilter() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationFilter must be used within a LocationProvider');
  }
  return context;
}
