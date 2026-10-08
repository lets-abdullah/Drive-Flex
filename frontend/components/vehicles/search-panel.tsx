'use client';

import { useState, type FormEvent } from 'react';
import { Compass, MapPin } from 'lucide-react';
import type { Vehicle } from '@/types';
import { todayString } from '@/utils/helpers';
import { allCars } from '@/data/vehicles';
import { datesOverlap } from '@/data/vehicles';
import { useLocationFilter } from '@/context/location-context';

export function SearchPanel({ onResults }: { onResults: (items: Vehicle[], message: string) => void }) {
  const { currentCity, radiusKm, isFilterActive, openModal } = useLocationFilter();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!pickup || !dropoff) return setError('Choose both a pickup and return location.');
    if (!start || !end) return setError('Select pickup and return dates to check availability.');
    if (start < todayString()) return setError('Pickup date must be today or later.');
    if (end <= start) return setError('Return date must be after pickup date.');
    const results = allCars().filter(
      (vehicle) =>
        (vehicle.location.toLowerCase().includes(pickup.toLowerCase()) || pickup.toLowerCase() === 'anywhere') &&
        (vehicle.location.toLowerCase().includes(dropoff.toLowerCase()) || dropoff.toLowerCase() === 'anywhere') &&
        !datesOverlap(vehicle, start, end),
    );
    onResults(
      results,
      results.length
        ? `${results.length} vehicles match your route and dates.`
        : 'No vehicles match those dates yet. Try another city or a wider window.',
    );
    document.getElementById('fleet-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <form className="search-panel container-wide" onSubmit={submit} noValidate>
      <div className="search-top">
        <span className="eyebrow">Find your next drive</span>
        <button
          type="button"
          onClick={openModal}
          className="navbar-location-btn"
          style={{ fontSize: '0.78rem', padding: '4px 10px' }}
        >
          <MapPin size={13} className="navbar-location-pin" />
          <span>{currentCity.name} · {radiusKm} km</span>
        </button>
      </div>
      <div className="search-grid">
        <div className="field">
          <label htmlFor="pickup-location">Pickup location</label>
          <input
            id="pickup-location"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder={`e.g. ${currentCity.name} or airport`}
            data-testid="input-pickup-location"
          />
        </div>
        <div className="field">
          <label htmlFor="dropoff-location">Return location</label>
          <input id="dropoff-location" value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder="Same city or another" data-testid="input-dropoff-location" />
        </div>
        <div className="field">
          <label htmlFor="pickup-date">Pickup date</label>
          <input id="pickup-date" type="date" min={todayString()} value={start} onChange={(e) => setStart(e.target.value)} data-testid="input-pickup-date" />
        </div>
        <div className="field">
          <label htmlFor="return-date">Return date</label>
          <input id="return-date" type="date" min={start || todayString()} value={end} onChange={(e) => setEnd(e.target.value)} data-testid="input-return-date" />
        </div>
        <div className="search-submit">
          <button className="btn btn-primary" type="submit" data-testid="button-find-cars">
            <Compass size={15} /> Find cars
          </button>
        </div>
      </div>
      {error && <div className="search-error" role="alert" data-testid="error-search">{error}</div>}
    </form>
  );
}
