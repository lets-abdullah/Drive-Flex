import type { Session, DemoOwnerProfile, DemoBooking, Vehicle } from '@/types';

// ─── Storage Keys ──────────────────────────────────────────────────────────────
export const sessionKey = 'driveflex-demo-session';
export const favoriteKey = 'driveflex-favorites';
export const ownerProfileKey = 'driveflex-demo-owner-profile';
export const publishedVehiclesKey = 'driveflex-demo-published-vehicles';
export const demoBookingsKey = 'driveflex-demo-bookings';

// ─── Session Helpers ───────────────────────────────────────────────────────────
export function getSession(): Session | null {
  try {
    return JSON.parse(localStorage.getItem(sessionKey) || 'null') as Session | null;
  } catch {
    return null;
  }
}

export function setSession(value: Session | null) {
  if (value) localStorage.setItem(sessionKey, JSON.stringify(value));
  else localStorage.removeItem(sessionKey);
  window.dispatchEvent(new Event('driveflex-session'));
}

// ─── Owner Helpers ─────────────────────────────────────────────────────────────
export function getDemoOwner(): DemoOwnerProfile | null {
  try {
    return JSON.parse(localStorage.getItem(ownerProfileKey) || 'null') as DemoOwnerProfile | null;
  } catch {
    return null;
  }
}

export function getPublishedVehicles(): Vehicle[] {
  try {
    return JSON.parse(localStorage.getItem(publishedVehiclesKey) || '[]') as Vehicle[];
  } catch {
    return [];
  }
}

export function getDemoBookings(): DemoBooking[] {
  try {
    return JSON.parse(localStorage.getItem(demoBookingsKey) || '[]') as DemoBooking[];
  } catch {
    return [];
  }
}

// ─── Date / Money Helpers ──────────────────────────────────────────────────────
export function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}
