import type { Vehicle } from '@/data/catalog';

export function isoDate(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
}

export function dateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

export function shortDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function daysBetween(start: string, end: string) {
  const startTime = new Date(`${start}T12:00:00`).getTime();
  const endTime = new Date(`${end}T12:00:00`).getTime();
  return Math.max(0, Math.ceil((endTime - startTime) / 86_400_000));
}

export function dateIsUnavailable(vehicle: Vehicle, dateString: string) {
  if (vehicle.unavailableDates?.includes(dateString)) return true;
  const date = new Date(`${dateString}T12:00:00`).getTime();
  const current = vehicle.currentBooking;
  if (current && ['confirmed', 'pending'].includes(current.status.toLowerCase())) {
    const start = new Date(`${current.pickup}T12:00:00`).getTime();
    const end = new Date(`${current.returnDate}T12:00:00`).getTime();
    if (date >= start && date < end) return true;
  }
  return Boolean(vehicle.rentalPeriods?.some((period) => {
    if (period.status !== 'confirmed') return false;
    return date >= new Date(`${period.start}T12:00:00`).getTime()
      && date < new Date(`${period.end}T12:00:00`).getTime();
  }));
}

export function rangeIsUnavailable(vehicle: Vehicle, pickup: string, returnDate: string) {
  if (!pickup || !returnDate) return false;
  const start = new Date(`${pickup}T12:00:00`).getTime();
  const end = new Date(`${returnDate}T12:00:00`).getTime();
  const legacy = vehicle.unavailableDates?.some((date) => {
    const point = new Date(`${date}T12:00:00`).getTime();
    return point >= start && point < end;
  });
  const overlaps = (reservedStart: string, reservedEnd: string) => (
    start < new Date(`${reservedEnd}T12:00:00`).getTime()
      && end > new Date(`${reservedStart}T12:00:00`).getTime()
  );
  const booked = vehicle.rentalPeriods?.some((period) => period.status === 'confirmed' && overlaps(period.start, period.end));
  const current = vehicle.currentBooking;
  const currentRange = current && ['confirmed', 'pending'].includes(current.status.toLowerCase())
    ? overlaps(current.pickup, current.returnDate)
    : false;
  return Boolean(legacy || booked || currentRange);
}