'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Star, Users } from 'lucide-react';
import type { Vehicle } from '@/types';
import { formatMoney } from '@/utils/helpers';
import { useFavorites } from '@/hooks/use-favorites';
import { useBookingStatus } from '@/hooks/use-booking-status';
import { useLocationFilter } from '@/context/location-context';
import { FavoriteButton } from '@/components/favorite-button';
import { OwnerIdentity } from '@/components/owners/owner-identity';

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();
  const { favorites, toggle } = useFavorites();
  const { isVehicleBooked } = useBookingStatus(vehicle);
  const { isFilterActive, getDistanceToVehicle } = useLocationFilter();
  const booked = isVehicleBooked(vehicle.id);
  const distance = isFilterActive ? getDistanceToVehicle(vehicle) : null;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Do not trigger card navigation if clicking favorite button or other buttons/links
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    router.push(`/cars/${vehicle.slug}`);
  };

  return (
    <article
      className={`vehicle-card ${booked ? 'is-card-booked' : ''}`}
      data-testid={`card-vehicle-${vehicle.id}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="vehicle-image">
        <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} loading="lazy" />
        {vehicle.category === 'Luxury' && <span className="vehicle-badge">Premium</span>}
        {booked && (
          <span className="vehicle-image-badge is-booked" data-testid={`image-badge-booked-${vehicle.id}`}>
            Booked · Reserved
          </span>
        )}
        <FavoriteButton vehicle={vehicle} favorites={favorites} toggle={toggle} />
      </div>
      <div className="vehicle-body">
        <div className="vehicle-card-top">
          <span className="vehicle-category">{vehicle.category}</span>
          <span
            className={`status-pill ${booked ? 'is-booked' : 'is-available'}`}
            data-testid={`status-badge-${vehicle.id}`}
          >
            <span className="status-dot" />
            {booked ? 'Booked' : 'Available'}
          </span>
        </div>
        <h3 className="vehicle-title">{vehicle.brand} {vehicle.model}</h3>
        <div className="vehicle-meta">
          <span><MapPin size={13} /> {vehicle.location}</span>
          {distance !== null && (
            <span className="distance-badge" title={`Approximately ${distance} km from ${vehicle.location}`}>
              {distance} km away
            </span>
          )}
          <span className="rating"><Star size={12} fill="currentColor" /> {vehicle.rating}</span>
          <span><Users size={13} /> {vehicle.seats}</span>
        </div>
        <div className="vehicle-owner-row">
          <OwnerIdentity ownerId={vehicle.ownerId} compact />
        </div>
        <div className="vehicle-bottom">
          <div className="price">{formatMoney(vehicle.pricePerDay)} <small>/ day</small></div>
          <Link className="btn btn-outline btn-sm" href={`/cars/${vehicle.slug}`} data-testid={`link-view-car-${vehicle.id}`}>
            View car
          </Link>
        </div>
      </div>
    </article>
  );
}
