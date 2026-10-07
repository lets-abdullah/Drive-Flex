'use client';

import { CheckCircle2, Lock, CalendarX } from 'lucide-react';
import type { Vehicle } from '@/types';
import { useBookingStatus } from '@/hooks/use-booking-status';
import { availabilityLabel } from '@/data/vehicles';

export function AvailabilityPill({
  vehicle,
  pickup = '',
  returnDate = '',
}: {
  vehicle: Vehicle;
  pickup?: string;
  returnDate?: string;
}) {
  const { isVehicleBooked } = useBookingStatus(vehicle);
  const isBooked = isVehicleBooked(vehicle.id);

  let label = isBooked ? 'Booked' : availabilityLabel(vehicle, pickup, returnDate);
  if (isBooked) label = 'Booked';

  const unavailable = label !== 'Available';

  return (
    <span
      className={`availability-pill ${unavailable ? 'is-unavailable' : ''}`}
      data-testid={`status-availability-${vehicle.id}`}
    >
      {isBooked ? (
        <Lock size={12} style={{ marginRight: 2 }} />
      ) : unavailable ? (
        <CalendarX size={12} style={{ marginRight: 2 }} />
      ) : (
        <CheckCircle2 size={13} style={{ marginRight: 2 }} />
      )}
      {label}
    </span>
  );
}
