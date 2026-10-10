'use client';

import { useState, useEffect, useCallback } from 'react';
import { favoriteKey } from '@/utils/helpers';
import { useSession } from '@/hooks/use-session';

export function useFavorites() {
  const session = useSession();
  const isRenter = session?.role === 'renter';

  const getStorageKey = useCallback(() => {
    if (!isRenter) return null;
    return session?.email ? `${favoriteKey}_${session.email}` : favoriteKey;
  }, [isRenter, session?.email]);

  const loadFavorites = useCallback((): string[] => {
    if (!isRenter) return [];
    try {
      const key = getStorageKey();
      if (!key) return [];
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as string[];
      }
      // Migrate legacy favorites if available
      const legacy = localStorage.getItem(favoriteKey);
      if (legacy) {
        const parsed = JSON.parse(legacy) as string[];
        localStorage.setItem(key, JSON.stringify(parsed));
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  }, [isRenter, getStorageKey]);

  const [favorites, setFavorites] = useState<string[]>([]);

  // Sync favorites whenever session changes
  useEffect(() => {
    setFavorites(loadFavorites());
  }, [loadFavorites]);

  // Sync favorites across components
  useEffect(() => {
    const handleSync = () => {
      setFavorites(loadFavorites());
    };
    window.addEventListener('driveflex-favorites-sync', handleSync);
    return () => {
      window.removeEventListener('driveflex-favorites-sync', handleSync);
    };
  }, [loadFavorites]);

  const toggle = useCallback((id: string): boolean => {
    // REQUIREMENT: Unauthenticated users & non-renters CANNOT bookmark listings
    if (!isRenter) {
      window.dispatchEvent(new CustomEvent('driveflex-open-renter-auth', { detail: { vehicleId: id } }));
      return false;
    }

    const key = getStorageKey();
    if (!key) return false;

    setFavorites((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch (e) {
        // Ignore localStorage quota errors
      }
      return next;
    });

    window.dispatchEvent(new Event('driveflex-favorites-sync'));
    return true;
  }, [isRenter, getStorageKey]);

  return { favorites, toggle, isRenter };
}
