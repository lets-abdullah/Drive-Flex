'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import type { Vehicle } from '@/types';

export function FavoriteButton({
  vehicle,
  favorites,
  toggle,
}: {
  vehicle: Vehicle;
  favorites: string[];
  toggle: (id: string) => void | boolean;
}) {
  const active = favorites.includes(vehicle.id);
  return (
    <button
      type="button"
      className={`icon-btn vehicle-favorite ${active ? 'is-favorite' : ''}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(vehicle.id);
      }}
      aria-label={
        active
          ? `Remove ${vehicle.brand} ${vehicle.model} from favorites`
          : `Save ${vehicle.brand} ${vehicle.model} to favorites`
      }
      aria-pressed={active}
      data-testid={`button-favorite-${vehicle.id}`}
      title={active ? 'Remove from favorites' : 'Save to favorites (Renter account required)'}
    >
      <Heart size={16} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}
