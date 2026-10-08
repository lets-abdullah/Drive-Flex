'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  CircleAlert,
  ArrowUpDown,
  Car,
  MapPin,
  Check,
} from 'lucide-react';
import { Layout } from '@/components/layout';
import { VehicleCard } from '@/components/vehicles/vehicle-card';
import { allCars } from '@/data/vehicles';
import type { Vehicle } from '@/types';

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Hatchback', 'Luxury', 'Sports', 'Electric'] as const;
const CITIES = ['All Cities', 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi'] as const;
const TRANSMISSIONS = ['All Transmissions', 'Automatic', 'Manual'] as const;

export default function AllListingsPage() {
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>(() => allCars());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('All Transmissions');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'booked'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(350);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');

  // Fetch live vehicles from API with fallback to built-in fleet
  useEffect(() => {
    fetch('/api/vehicles')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setVehiclesList(data.data);
        }
      })
      .catch((err) => {
        console.warn('Using local vehicle cache:', err);
      });
  }, []);

  // Filter & Sort logic
  const filteredVehicles = useMemo(() => {
    return vehiclesList
      .filter((vehicle) => {
        // Search query (brand, model, location)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = `${vehicle.brand} ${vehicle.model}`.toLowerCase().includes(q);
          const matchLoc = vehicle.location.toLowerCase().includes(q);
          const matchCat = vehicle.category.toLowerCase().includes(q);
          if (!matchTitle && !matchLoc && !matchCat) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && vehicle.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }

        // City filter
        if (selectedCity !== 'All Cities' && !vehicle.location.toLowerCase().includes(selectedCity.toLowerCase())) {
          return false;
        }

        // Transmission filter
        if (
          selectedTransmission !== 'All Transmissions' &&
          vehicle.transmission.toLowerCase() !== selectedTransmission.toLowerCase()
        ) {
          return false;
        }

        // Availability filter
        if (availabilityFilter === 'available' && vehicle.status === 'booked') {
          return false;
        }
        if (availabilityFilter === 'booked' && vehicle.status !== 'booked') {
          return false;
        }

        // Price filter
        if (vehicle.pricePerDay > maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.pricePerDay - b.pricePerDay;
        if (sortBy === 'price-desc') return b.pricePerDay - a.pricePerDay;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // recommended / default
      });
  }, [
    vehiclesList,
    searchQuery,
    selectedCategory,
    selectedCity,
    selectedTransmission,
    availabilityFilter,
    maxPrice,
    sortBy,
  ]);

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'All' ||
    selectedCity !== 'All Cities' ||
    selectedTransmission !== 'All Transmissions' ||
    availabilityFilter !== 'all' ||
    maxPrice < 350 ||
    sortBy !== 'recommended';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedCity('All Cities');
    setSelectedTransmission('All Transmissions');
    setAvailabilityFilter('all');
    setMaxPrice(350);
    setSortBy('recommended');
  };

  return (
    <Layout>
      <main className="listings-page">
        {/* Header Banner */}
        <section className="listings-hero">
          <div className="container">
            <div className="hero-eyebrow-accent">
              <span className="eyebrow-text">DRIVEFLEX FLEET DIRECTORY</span>
              <span className="eyebrow-dash" />
            </div>
            <h1>
              Explore All <span className="gold-text">Listings</span>
            </h1>
            <p className="hero-copy">
              Discover verified executive sedans, rugged 4x4 SUVs, and fuel-efficient family cars across Pakistan with
              transparent pricing and instant reservation.
            </p>
          </div>
        </section>

        {/* Filter & Search Bar Section */}
        <section className="listings-controls section-tight">
          <div className="container">
            {/* Search + Category Tabs */}
            <div className="filter-card">
              <div className="filter-header-row">
                {/* Search Bar */}
                <div className="search-input-wrap">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by make, model, or city (e.g. Fortuner, Civic, Lahore)..."
                    className="filter-search-input"
                    data-testid="input-listings-search"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="search-clear-btn"
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Sort selector */}
                <div className="sort-wrap">
                  <ArrowUpDown size={15} className="sort-icon" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="filter-select"
                    data-testid="select-sort"
                  >
                    <option value="recommended">Sort: Recommended</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>

              {/* Category Pills */}
              <div className="category-pills-row">
                <span className="category-label">Category:</span>
                <div className="pills-scroll">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`pill-btn ${selectedCategory === cat ? 'is-active' : ''}`}
                      data-testid={`pill-category-${cat.toLowerCase()}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Filters Grid */}
              <div className="filter-details-grid">
                {/* City Filter */}
                <div className="filter-group">
                  <label htmlFor="city-filter" className="filter-label">
                    <MapPin size={13} /> City
                  </label>
                  <select
                    id="city-filter"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="filter-select"
                    data-testid="select-city-filter"
                  >
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transmission Filter */}
                <div className="filter-group">
                  <label htmlFor="transmission-filter" className="filter-label">
                    <Car size={13} /> Transmission
                  </label>
                  <select
                    id="transmission-filter"
                    value={selectedTransmission}
                    onChange={(e) => setSelectedTransmission(e.target.value)}
                    className="filter-select"
                    data-testid="select-transmission-filter"
                  >
                    {TRANSMISSIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Availability Status */}
                <div className="filter-group">
                  <label htmlFor="status-filter" className="filter-label">
                    <Check size={13} /> Availability
                  </label>
                  <select
                    id="status-filter"
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                    className="filter-select"
                    data-testid="select-status-filter"
                  >
                    <option value="all">All Vehicles</option>
                    <option value="available">Available Now</option>
                    <option value="booked">Booked / Reserved</option>
                  </select>
                </div>

                {/* Max Price Slider */}
                <div className="filter-group price-filter-group">
                  <div className="price-label-row">
                    <span className="filter-label">Max Price / Day</span>
                    <span className="gold-text price-val">${maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="350"
                    step="5"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="price-slider"
                    data-testid="range-price-filter"
                  />
                </div>
              </div>

              {/* Status Row: Count + Reset */}
              <div className="filter-bottom-bar">
                <span className="results-count">
                  Showing <strong>{filteredVehicles.length}</strong> of {vehiclesList.length} total vehicles
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="btn btn-ghost btn-sm reset-btn"
                    data-testid="button-reset-filters"
                  >
                    <RotateCcw size={13} /> Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Listings Fleet Grid */}
        <section className="section listings-results">
          <div className="container">
            {filteredVehicles.length === 0 ? (
              <div className="empty-state">
                <CircleAlert size={28} className="gold" />
                <h3>No vehicles match your criteria</h3>
                <p>Try adjusting your search query, increasing maximum budget, or clearing filter selections.</p>
                <button
                  type="button"
                  className="btn btn-gold btn-sm"
                  onClick={resetFilters}
                  data-testid="button-empty-reset"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="fleet-grid">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Embedded scoped styling for modern listings layout */}
      <style jsx>{`
        .listings-hero {
          padding: 3.5rem 0 2rem;
          background: linear-gradient(180deg, rgba(201, 162, 39, 0.05) 0%, rgba(10, 10, 10, 0) 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .listings-controls {
          padding-top: 1.5rem;
          padding-bottom: 1rem;
        }
        .filter-card {
          background: var(--charcoal, #151515);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
        }
        .filter-header-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .search-input-wrap {
          flex: 1;
          min-width: 260px;
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          color: rgba(255, 255, 255, 0.4);
          pointer-events: none;
        }
        .filter-search-input {
          width: 100%;
          padding: 0.75rem 2.5rem 0.75rem 2.75rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          color: #fff;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }
        .filter-search-input:focus {
          outline: none;
          border-color: var(--gold, #c9a227);
          background: rgba(255, 255, 255, 0.07);
        }
        .search-clear-btn {
          position: absolute;
          right: 0.75rem;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 1.25rem;
          cursor: pointer;
          line-height: 1;
        }
        .sort-wrap {
          display: flex;
          align-items: center;
          position: relative;
          min-width: 190px;
        }
        .sort-icon {
          position: absolute;
          left: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
          pointer-events: none;
        }
        .filter-select {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.25rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          color: #fff;
          font-size: 0.9rem;
          cursor: pointer;
        }
        .filter-select:focus {
          outline: none;
          border-color: var(--gold, #c9a227);
        }
        .category-pills-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .category-label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.5);
        }
        .pills-scroll {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .pill-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          padding: 0.4rem 0.9rem;
          border-radius: 20px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pill-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        .pill-btn.is-active {
          background: var(--gold, #c9a227);
          border-color: var(--gold, #c9a227);
          color: #0a0a0a;
          font-weight: 600;
        }
        .filter-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .filter-label {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: rgba(255, 255, 255, 0.55);
        }
        .price-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .price-val {
          font-weight: 700;
          font-size: 0.95rem;
        }
        .price-slider {
          accent-color: var(--gold, #c9a227);
          cursor: pointer;
          height: 6px;
        }
        .filter-bottom-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .results-count {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
        }
        .reset-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--gold, #c9a227);
        }
      `}</style>
    </Layout>
  );
}
