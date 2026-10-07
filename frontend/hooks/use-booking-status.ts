'use client';

import { useState, useEffect, useCallback } from 'react';
import { VehicleApi, type VehicleStatusResponse } from '@/services/vehicle-api';
import { BookingApi, type CreateBookingPayload } from '@/services/booking-api';
import type { Vehicle } from '@/types';

// Global shared cache of vehicle statuses to prevent duplicate fetches
let globalStatuses: Record<string, VehicleStatusResponse> = {};
const listeners = new Set<() => void>();

function notifyAll() {
  listeners.forEach((listener) => listener());
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('driveflex-booking-changed'));
  }
}

export function useBookingStatus(initialVehicle?: Vehicle) {
  const [statuses, setStatuses] = useState<Record<string, VehicleStatusResponse>>(() => {
    if (initialVehicle?.id && !globalStatuses[initialVehicle.id]) {
      return {
        ...globalStatuses,
        [initialVehicle.id]: {
          vehicleId: initialVehicle.id,
          status: initialVehicle.status || (initialVehicle.id === 'v2' || initialVehicle.id === 'v6' ? 'booked' : 'available'),
          bookable: initialVehicle.bookable !== undefined ? initialVehicle.bookable : !(initialVehicle.id === 'v2' || initialVehicle.id === 'v6'),
          currentBooking: initialVehicle.currentBooking || (initialVehicle.id === 'v2'
            ? { id: 'book-seed-001', customer: 'Omar H.', pickup: '2026-10-22', returnDate: '2026-10-24', status: 'Confirmed' }
            : initialVehicle.id === 'v6'
            ? { id: 'book-seed-002', customer: 'Zainab R.', pickup: '2026-10-20', returnDate: '2026-10-25', status: 'Confirmed' }
            : null),
        },
      };
    }
    return globalStatuses;
  });

  const [loading, setLoading] = useState(false);

  const fetchStatuses = useCallback(async () => {
    try {
      setLoading(true);
      const vehicles = await VehicleApi.getAll();
      const newMap: Record<string, VehicleStatusResponse> = {};
      vehicles.forEach((v) => {
        newMap[v.id] = {
          vehicleId: v.id,
          status: v.status || 'available',
          bookable: v.bookable !== undefined ? v.bookable : v.status !== 'booked',
          currentBooking: v.currentBooking || null,
        };
      });
      globalStatuses = newMap;
      setStatuses(newMap);
    } catch (err) {
      console.warn('Could not fetch vehicle statuses from backend API, using cached state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Sync with global statuses
    const updateLocal = () => setStatuses({ ...globalStatuses });
    listeners.add(updateLocal);

    if (Object.keys(globalStatuses).length === 0) {
      fetchStatuses();
    }

    const onCustomEvent = () => fetchStatuses();
    window.addEventListener('driveflex-booking-changed', onCustomEvent);

    return () => {
      listeners.delete(updateLocal);
      window.removeEventListener('driveflex-booking-changed', onCustomEvent);
    };
  }, [fetchStatuses]);

  const isVehicleBooked = useCallback(
    (vehicleId: string): boolean => {
      if (statuses[vehicleId]) {
        return statuses[vehicleId].status === 'booked';
      }
      if (initialVehicle?.id === vehicleId && initialVehicle.status) {
        return initialVehicle.status === 'booked';
      }
      // Fallback for seed IDs before fetch returns
      return vehicleId === 'v2' || vehicleId === 'v6';
    },
    [statuses, initialVehicle]
  );

  const getVehicleBooking = useCallback(
    (vehicleId: string) => {
      return statuses[vehicleId]?.currentBooking || null;
    },
    [statuses]
  );

  const bookVehicle = async (payload: CreateBookingPayload) => {
    const booking = await BookingApi.create(payload);
    // Optimistically update local cache immediately
    globalStatuses[payload.vehicleId] = {
      vehicleId: payload.vehicleId,
      status: 'booked',
      bookable: false,
      currentBooking: {
        id: booking.id || `book-${Date.now()}`,
        customer: booking.customer,
        pickup: booking.pickup,
        returnDate: booking.returnDate,
        status: 'Confirmed',
      },
    };
    notifyAll();
    // Also re-verify with backend
    await fetchStatuses();
    return booking;
  };

  return {
    statuses,
    loading,
    isVehicleBooked,
    getVehicleBooking,
    bookVehicle,
    refresh: fetchStatuses,
  };
}
