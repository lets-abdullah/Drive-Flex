'use client';

import { Heart } from 'lucide-react';
import type { Vehicle } from '@/types';

export function FavoriteButton({
  vehicle,
  favorites,
  toggle,
}: {
  vehicle: Vehicle;
  favorites: string[];
  toggle: (id: string) => void;
}) {
  const active = favorites.includes(vehicle.id);
  return (
    <button
      className={`icon-btn vehicle-favorite ${active ? 'is-favorite' : ''}`}
      onClick={() => toggle(vehicle.id)}
      aria-label={active ? `Remove ${vehicle.brand} ${vehicle.model} from favorites` : `Save ${vehicle.brand} ${vehicle.model} to favorites`}
      aria-pressed={active}
      data-testid={`button-favorite-${vehicle.id}`}
    >
      <Heart size={16} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}
