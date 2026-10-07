'use client';

import { useState } from 'react';
import { favoriteKey } from '@/utils/helpers';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(favoriteKey) || '[]') as string[];
    } catch {
      return [];
    }
  });

  const toggle = (id: string) => {
    setFavorites((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      localStorage.setItem(favoriteKey, JSON.stringify(next));
      return next;
    });
  };

  return { favorites, toggle };
}
