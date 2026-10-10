'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  CircleAlert,
  ArrowUpDown,
  Car,
  MapPin,
  Check,
  Fuel,
  Sparkles,
  ShieldCheck,
  Star,
  ChevronRight,
  X,
  Gauge,
  Sliders,
} from 'lucide-react';
import { Layout } from '@/components/layout';
import { VehicleCard } from '@/components/vehicles/vehicle-card';
import { allCars } from '@/data/vehicles';
import type { Vehicle } from '@/types';
import { useLocationFilter } from '@/context/location-context';

const CATEGORIES = [
  { name: 'All', icon: Car },
  { name: 'Sedan', icon: Car },
  { name: 'SUV', icon: Gauge },
  { name: 'Hatchback', icon: Car },
  { name: 'Luxury', icon: Sparkles },
  { name: 'Sports', icon: Gauge },
  { name: 'Electric', icon: Fuel },
] as const;

const TRANSMISSIONS = ['All Transmissions', 'Automatic', 'Manual'] as const;
const AVAILABILITIES = [
  { label: 'All Fleet', value: 'all' },
  { label: 'Available Only', value: 'available' },
  { label: 'Booked / Reserved', value: 'booked' },
] as const;

export default function AllListingsPage() {
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>(() => allCars());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('All Transmissions');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'booked'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(350);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { currentCity, radiusKm, isFilterActive, openModal, clearFilter, applyLocation, getDistanceToVehicle } = useLocationFilter();

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
        // Keyword Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = `${vehicle.brand} ${vehicle.model}`.toLowerCase().includes(q);
          const matchLoc = vehicle.location.toLowerCase().includes(q);
          const matchCat = vehicle.category.toLowerCase().includes(q);
          if (!matchTitle && !matchLoc && !matchCat) return false;
        }

        // Category
        if (selectedCategory !== 'All' && vehicle.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }

        // Transmission
        if (
          selectedTransmission !== 'All Transmissions' &&
          vehicle.transmission.toLowerCase() !== selectedTransmission.toLowerCase()
        ) {
          return false;
        }

        // Availability
        if (availabilityFilter === 'available' && vehicle.status === 'booked') {
          return false;
        }
        if (availabilityFilter === 'booked' && vehicle.status !== 'booked') {
          return false;
        }

        // Max price
        if (vehicle.pricePerDay > maxPrice) {
          return false;
        }

        // Location & Radius Filter (Facebook Marketplace Style)
        if (isFilterActive) {
          const dist = getDistanceToVehicle(vehicle);
          if (dist === null || dist > radiusKm) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.pricePerDay - b.pricePerDay;
        if (sortBy === 'price-desc') return b.pricePerDay - a.pricePerDay;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (isFilterActive) {
          const distA = getDistanceToVehicle(a) ?? 9999;
          const distB = getDistanceToVehicle(b) ?? 9999;
          return distA - distB;
        }
        return 0; // recommended
      });
  }, [
    vehiclesList,
    searchQuery,
    selectedCategory,
    selectedTransmission,
    availabilityFilter,
    maxPrice,
    sortBy,
    isFilterActive,
    radiusKm,
    getDistanceToVehicle,
  ]);

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedTransmission !== 'All Transmissions' ? 1 : 0) +
    (availabilityFilter !== 'all' ? 1 : 0) +
    (maxPrice < 350 ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedTransmission('All Transmissions');
    setAvailabilityFilter('all');
    setMaxPrice(350);
    setSortBy('recommended');
  };

  return (
    <Layout>
      <main className="fleets-experience">
        {/* =========================================================================
            1. UNIQUE HERO SECTION (Distinctive luxury automotive showroom aesthetic)
        ========================================================================== */}
        <section className="unique-fleet-hero">
          <div className="hero-atmosphere-glow" />
          <div className="hero-grid-pattern" />

          <div className="container hero-content-wrap">
            {/* Breadcrumb Navigation */}
            <nav className="fleet-breadcrumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight size={13} className="bc-sep" />
              <span className="current-crumb">Fleet Directory</span>
            </nav>

            {/* Premium Eyebrow Pill */}
            <div className="fleet-pill-badge">
              <span className="sparkle-icon">✦</span>
              <span>COMPLETE CURATED DIRECTORY · ALL PAKISTAN LOCATIONS</span>
            </div>

            {/* Hero Main Heading & Copy */}
            <div className="hero-headline-block">
              <h1>
                The Complete <span className="gold-text">DriveFlex</span> Fleet.
              </h1>
              <p className="hero-lead">
                Explore handpicked vehicles across Lahore, Karachi, and Islamabad. From rugged 4x4 Fortuners to executive
                turbo sedans, book directly with verified local hosts with zero hidden fees.
              </p>
            </div>

            {/* Quick Filter Jump Tags */}
            <div className="hero-quick-tags">
              <span className="quick-tag-label">Popular Searches:</span>
              <button
                type="button"
                className="quick-tag"
                onClick={() => {
                  setSelectedCategory('SUV');
                }}
              >
                7-Seater SUVs
              </button>
              <button
                type="button"
                className="quick-tag"
                onClick={() => {
                  setSelectedCategory('Sedan');
                }}
              >
                Executive Sedans
              </button>
              <button
                type="button"
                className="quick-tag"
                onClick={() => {
                  setMaxPrice(80);
                }}
              >
                Under $80 / Day
              </button>
              <button
                type="button"
                className="quick-tag"
                onClick={() => {
                  setAvailabilityFilter('available');
                }}
              >
                Ready for Pickup
              </button>
            </div>

            {/* Live Fleet Metrics Counter */}
            <div className="hero-metrics-strip">
              <div className="metric-box">
                <span className="metric-value">{vehiclesList.length}+</span>
                <span className="metric-label">Curated Vehicles</span>
              </div>
              <div className="metric-sep" />
              <div className="metric-box">
                <span className="metric-value">4</span>
                <span className="metric-label">Key Pakistani Cities</span>
              </div>
              <div className="metric-sep" />
              <div className="metric-box">
                <span className="metric-value">4.92 ★</span>
                <span className="metric-label">Average Fleet Rating</span>
              </div>
              <div className="metric-sep" />
              <div className="metric-box">
                <span className="metric-value">100%</span>
                <span className="metric-label">Host Verified Handover</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. MAIN EXPLORATION SECTION: STICKY LEFT SIDEBAR + RIGHT FLEET GRID
        ========================================================================== */}
        <section className="fleet-catalog-section">
          <div className="container fleet-layout-container">
            {/* Mobile Filter Toggle Button (Float/Bar for small screens) */}
            <div className="mobile-filter-trigger-bar">
              <button
                type="button"
                className="btn btn-outline mobile-filter-btn"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                data-testid="button-toggle-mobile-filters"
              >
                <SlidersHorizontal size={16} />
                <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
              </button>
              <span className="mobile-results-text">
                {filteredVehicles.length} of {vehiclesList.length} vehicles
              </span>
            </div>

            {/* -------------------------------------------------------------------
                LEFT SIDEBAR: STICKY FILTERS PANEL
            -------------------------------------------------------------------- */}
            <aside className={`fleet-sidebar ${mobileFilterOpen ? 'is-mobile-open' : ''}`}>
              <div className="sticky-filter-card">
                {/* Sidebar Header */}
                <div className="sidebar-header">
                  <div className="sidebar-title-group">
                    <SlidersHorizontal size={18} className="sidebar-title-icon" />
                    <h2>Filter Fleet</h2>
                    {activeFilterCount > 0 && <span className="active-badge">{activeFilterCount}</span>}
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="clear-filters-link"
                      data-testid="button-clear-all-filters"
                    >
                      <RotateCcw size={12} /> Clear all
                    </button>
                  )}
                  {/* Close button on mobile */}
                  <button
                    type="button"
                    className="mobile-close-sidebar"
                    onClick={() => setMobileFilterOpen(false)}
                    aria-label="Close filters"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* 1. Keyword Search */}
                <div className="filter-block">
                  <label htmlFor="sidebar-search" className="filter-block-label">
                    <Search size={14} /> Search Make or Model
                  </label>
                  <div className="sidebar-search-box">
                    <input
                      id="sidebar-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Fortuner, Civic, Alto..."
                      className="sidebar-input"
                      data-testid="input-sidebar-search"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="input-clear-btn"
                        aria-label="Clear input"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Vehicle Category */}
                <div className="filter-block">
                  <span className="filter-block-label">
                    <Car size={14} /> Vehicle Category
                  </span>
                  <div className="category-vertical-list">
                    {CATEGORIES.map(({ name, icon: CatIcon }) => {
                      const count =
                        name === 'All'
                          ? vehiclesList.length
                          : vehiclesList.filter((v) => v.category.toLowerCase() === name.toLowerCase()).length;
                      const isSelected = selectedCategory === name;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setSelectedCategory(name)}
                          className={`category-item-btn ${isSelected ? 'is-active' : ''}`}
                          data-testid={`btn-category-${name.toLowerCase()}`}
                        >
                          <div className="cat-item-left">
                            <CatIcon size={14} className="cat-icon" />
                            <span>{name}</span>
                          </div>
                          <span className="cat-count">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Location Radius (Facebook Marketplace Style) */}
                <div className="filter-block">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="filter-block-label" style={{ margin: 0 }}>
                      <MapPin size={14} /> Radius Filter
                    </span>
                    {isFilterActive && (
                      <button
                        type="button"
                        onClick={clearFilter}
                        style={{ background: 'none', border: 'none', color: '#ff6b81', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={openModal}
                    className={`navbar-location-btn ${isFilterActive ? 'is-active' : ''}`}
                    style={{ width: '100%', justifyContent: 'center', padding: '10px 12px', borderRadius: '8px' }}
                  >
                    <MapPin size={14} className="navbar-location-pin" />
                    <span>
                      {currentCity.name} · {radiusKm} km radius
                    </span>
                  </button>
                  <small style={{ display: 'block', color: 'var(--muted-foreground)', fontSize: '0.74rem', marginTop: '6px' }}>
                    Filter listings within radius on interactive map
                  </small>
                </div>

                {/* 4. Transmission Toggle */}
                <div className="filter-block">
                  <span className="filter-block-label">
                    <Gauge size={14} /> Transmission
                  </span>
                  <div className="segmented-toggle">
                    {TRANSMISSIONS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTransmission(t)}
                        className={`seg-btn ${selectedTransmission === t ? 'is-active' : ''}`}
                        data-testid={`btn-transmission-${t.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {t === 'All Transmissions' ? 'All' : t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Live Availability */}
                <div className="filter-block">
                  <span className="filter-block-label">
                    <Check size={14} /> Availability
                  </span>
                  <div className="availability-segmented">
                    {AVAILABILITIES.map(({ label, value }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAvailabilityFilter(value)}
                        className={`avail-btn ${availabilityFilter === value ? 'is-active' : ''}`}
                        data-testid={`btn-availability-${value}`}
                      >
                        <span className={`avail-dot ${value}`} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Daily Budget Range Slider */}
                <div className="filter-block">
                  <div className="price-header-row">
                    <span className="filter-block-label">Max Price / Day</span>
                    <span className="gold-text price-current-val">${maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="350"
                    step="5"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="styled-gold-slider"
                    data-testid="range-price-slider"
                  />
                  <div className="price-presets-row">
                    <button type="button" onClick={() => setMaxPrice(50)} className="price-preset-pill">
                      ≤ $50
                    </button>
                    <button type="button" onClick={() => setMaxPrice(100)} className="price-preset-pill">
                      ≤ $100
                    </button>
                    <button type="button" onClick={() => setMaxPrice(170)} className="price-preset-pill">
                      ≤ $170
                    </button>
                    <button type="button" onClick={() => setMaxPrice(350)} className="price-preset-pill">
                      Any
                    </button>
                  </div>
                </div>

                {/* Sidebar Footer for Mobile: Apply button */}
                <div className="sidebar-mobile-footer">
                  <button
                    type="button"
                    className="btn btn-gold btn-sm"
                    style={{ width: '100%' }}
                    onClick={() => setMobileFilterOpen(false)}
                  >
                    View {filteredVehicles.length} Matches
                  </button>
                </div>
              </div>
            </aside>

            {/* -------------------------------------------------------------------
                RIGHT AREA: TOP SORT TOOLBAR + FLEET CARDS GRID
            -------------------------------------------------------------------- */}
            <div className="fleet-main-content">
              {/* Active Location Filter Banner (Facebook Marketplace style) */}
              {isFilterActive && (
                <div className="location-filter-banner" style={{ marginBottom: '16px' }}>
                  <div className="location-filter-banner-info">
                    <MapPin size={16} className="gold" />
                    <span>
                      Showing vehicles within <strong>{radiusKm} km</strong> of <strong>{currentCity.name}</strong>
                    </span>
                  </div>
                  <div className="location-filter-banner-actions">
                    <button
                      type="button"
                      className="location-filter-banner-btn"
                      onClick={openModal}
                    >
                      Change Radius
                    </button>
                    <button
                      type="button"
                      className="location-filter-banner-btn reset"
                      onClick={clearFilter}
                    >
                      Show All Cities
                    </button>
                  </div>
                </div>
              )}

              {/* Top Action / Results Bar */}
              <div className="catalog-top-bar">
                <div className="results-info">
                  <h3>
                    Showing <strong>{filteredVehicles.length}</strong> of {vehiclesList.length} vehicles
                  </h3>
                </div>

                <div className="sort-selector-wrap">
                  <span className="sort-label">Sort By:</span>
                  <div className="custom-select-wrapper">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="dark-native-select sort-select"
                      data-testid="select-sort-order"
                    >
                      <option value="recommended">Featured & Recommended</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="rating">Highest Host Rating</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filter Removable Tags Strip */}
              {activeFilterCount > 0 && (
                <div className="active-tags-strip">
                  <span className="active-tags-heading">Applied:</span>
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')} className="active-chip">
                      Keyword: "{searchQuery}" <X size={12} />
                    </button>
                  )}
                  {selectedCategory !== 'All' && (
                    <button type="button" onClick={() => setSelectedCategory('All')} className="active-chip">
                      Category: {selectedCategory} <X size={12} />
                    </button>
                  )}
                  {selectedTransmission !== 'All Transmissions' && (
                    <button
                      type="button"
                      onClick={() => setSelectedTransmission('All Transmissions')}
                      className="active-chip"
                    >
                      {selectedTransmission} <X size={12} />
                    </button>
                  )}
                  {availabilityFilter !== 'all' && (
                    <button type="button" onClick={() => setAvailabilityFilter('all')} className="active-chip">
                      Status: {availabilityFilter === 'available' ? 'Available' : 'Booked'} <X size={12} />
                    </button>
                  )}
                  {maxPrice < 350 && (
                    <button type="button" onClick={() => setMaxPrice(350)} className="active-chip">
                      Max ${maxPrice} <X size={12} />
                    </button>
                  )}
                  <button type="button" onClick={resetFilters} className="clear-all-chips-btn">
                    Clear all
                  </button>
                </div>
              )}

              {/* Vehicle Cards Grid */}
              {filteredVehicles.length === 0 ? (
                <div className="empty-catalog-card">
                  <div className="empty-icon-circle">
                    <CircleAlert size={36} className="gold" />
                  </div>
                  <h3>No vehicles match these criteria</h3>
                  <p>
                    {isFilterActive
                      ? `No listings found within ${radiusKm} km of ${currentCity.name}. Try expanding your search radius to 250 km or 500 km.`
                      : "We couldn't find any fleet listings matching your selected filters. Try broadening your budget or removing city restrictions."}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {isFilterActive && radiusKm < 250 && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => applyLocation(currentCity, 250)}
                      >
                        Expand to 250 km
                      </button>
                    )}
                    {isFilterActive && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => applyLocation(currentCity, 500)}
                      >
                        Expand to 500 km
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-gold btn-sm"
                      onClick={() => {
                        resetFilters();
                        clearFilter();
                      }}
                      data-testid="button-empty-clear"
                    >
                      <RotateCcw size={14} /> Clear all filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="fleet-catalog-grid">
                  {filteredVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          SCOPED LUXURY STYLES (Fixed Native Selects + Sticky Layout + Hero Glow)
      ========================================================================== */}
      <style jsx>{`
        /* ─── UNIQUE HERO SECTION ──────────────────────────────────────────────── */
        .unique-fleet-hero {
          position: relative;
          background: linear-gradient(180deg, #121212 0%, #0a0a0a 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          padding: 3.5rem 0 2.5rem;
          overflow: hidden;
        }
        .hero-atmosphere-glow {
          position: absolute;
          top: -120px;
          right: 15%;
          width: 500px;
          height: 350px;
          background: radial-gradient(circle, rgba(201, 162, 39, 0.15) 0%, rgba(201, 162, 39, 0) 70%);
          pointer-events: none;
          filter: blur(40px);
        }
        .hero-grid-pattern {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 36px 36px;
          pointer-events: none;
        }
        .hero-content-wrap {
          position: relative;
          z-index: 2;
        }
        .fleet-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 1.25rem;
        }
        .fleet-breadcrumbs a {
          color: rgba(255, 255, 255, 0.6);
          transition: color 0.2s;
        }
        .fleet-breadcrumbs a:hover {
          color: var(--gold, #c9a227);
        }
        .current-crumb {
          color: var(--gold, #c9a227);
          font-weight: 500;
        }
        .fleet-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(201, 162, 39, 0.08);
          border: 1px solid rgba(201, 162, 39, 0.25);
          padding: 0.35rem 0.85rem;
          border-radius: 30px;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          color: var(--gold, #c9a227);
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .sparkle-icon {
          font-size: 0.8rem;
        }
        .hero-headline-block h1 {
          font-size: clamp(2rem, 4vw, 3.2rem);
          line-height: 1.15;
          margin: 0 0 1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .hero-lead {
          max-width: 720px;
          color: rgba(255, 255, 255, 0.65);
          font-size: 1rem;
          line-height: 1.6;
          margin: 0 0 1.5rem;
        }
        .hero-quick-tags {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }
        .quick-tag-label {
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.45);
          margin-right: 0.25rem;
        }
        .quick-tag {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.78rem;
          padding: 0.3rem 0.75rem;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .quick-tag:hover {
          background: rgba(201, 162, 39, 0.12);
          border-color: rgba(201, 162, 39, 0.4);
          color: #fff;
        }
        .hero-metrics-strip {
          display: flex;
          align-items: center;
          gap: 1.75rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 1rem 1.5rem;
          max-width: 820px;
          flex-wrap: wrap;
        }
        .metric-box {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .metric-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--gold, #c9a227);
        }
        .metric-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .metric-sep {
          width: 1px;
          height: 32px;
          background: rgba(255, 255, 255, 0.08);
        }

        /* ─── CATALOG LAYOUT (Sticky Sidebar + Grid) ────────────────────────── */
        .fleet-catalog-section {
          padding: 2rem 0 4rem;
        }
        .fleet-layout-container {
          display: grid;
          grid-template-columns: 290px 1fr;
          gap: 2.25rem;
          align-items: start;
        }

        /* ─── STICKY LEFT SIDEBAR ───────────────────────────────────────────── */
        .fleet-sidebar {
          position: sticky;
          top: 96px;
          z-index: 20;
        }
        .sticky-filter-card {
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 1.35rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          max-height: calc(100vh - 120px);
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .sidebar-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .sidebar-title-group h2 {
          font-size: 1.05rem;
          margin: 0;
          font-weight: 600;
          color: #fff;
        }
        .sidebar-title-icon {
          color: var(--gold, #c9a227);
        }
        .active-badge {
          background: var(--gold, #c9a227);
          color: #0a0a0a;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          border-radius: 10px;
        }
        .clear-filters-link {
          background: transparent;
          border: none;
          color: var(--gold, #c9a227);
          font-size: 0.78rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          cursor: pointer;
          padding: 0;
        }
        .clear-filters-link:hover {
          text-decoration: underline;
        }
        .mobile-close-sidebar {
          display: none;
          background: transparent;
          border: none;
          color: #fff;
          cursor: pointer;
        }

        /* Filter Blocks */
        .filter-block {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .filter-block-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: rgba(255, 255, 255, 0.55);
          font-weight: 600;
        }
        .sidebar-search-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .sidebar-input {
          width: 100%;
          padding: 0.65rem 1.8rem 0.65rem 0.75rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 0.88rem;
          transition: all 0.2s ease;
        }
        .sidebar-input:focus {
          outline: none;
          border-color: var(--gold, #c9a227);
          background: rgba(255, 255, 255, 0.07);
        }
        .input-clear-btn {
          position: absolute;
          right: 0.6rem;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          font-size: 1.1rem;
          cursor: pointer;
          line-height: 1;
        }

        /* Category Vertical List */
        .category-vertical-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .category-item-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.45rem 0.65rem;
          border-radius: 7px;
          border: 1px solid transparent;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .category-item-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }
        .category-item-btn.is-active {
          background: rgba(201, 162, 39, 0.12);
          border-color: rgba(201, 162, 39, 0.35);
          color: var(--gold, #c9a227);
          font-weight: 600;
        }
        .cat-item-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .cat-icon {
          opacity: 0.6;
        }
        .category-item-btn.is-active .cat-icon {
          opacity: 1;
        }
        .cat-count {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.35);
          background: rgba(255, 255, 255, 0.04);
          padding: 0.1rem 0.4rem;
          border-radius: 6px;
        }

        /* ─── FIX NATIVE SELECT (Dark Mode options, no white popup bug) ─────── */
        .custom-select-wrapper {
          position: relative;
        }
        .dark-native-select {
          width: 100%;
          padding: 0.65rem 0.75rem;
          background: #191919;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #f5f5f5;
          font-size: 0.85rem;
          cursor: pointer;
          color-scheme: dark; /* CRITICAL: Tells browser to render popup in dark mode */
          transition: border-color 0.2s ease;
        }
        .dark-native-select:focus {
          outline: none;
          border-color: var(--gold, #c9a227);
        }
        .dark-native-select option {
          background-color: #1a1a1a !important;
          color: #ffffff !important;
          padding: 8px;
        }

        /* Quick City Chips */
        .city-chips-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-top: 0.4rem;
        }
        .city-chip {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.65);
          font-size: 0.72rem;
          padding: 0.25rem 0.55rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .city-chip:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
        }
        .city-chip.is-active {
          background: rgba(201, 162, 39, 0.15);
          border-color: var(--gold, #c9a227);
          color: var(--gold, #c9a227);
          font-weight: 600;
        }

        /* Segmented Toggles */
        .segmented-toggle {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 0.25rem;
          gap: 0.25rem;
        }
        .seg-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.78rem;
          padding: 0.45rem 0.25rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: center;
        }
        .seg-btn:hover {
          color: #fff;
        }
        .seg-btn.is-active {
          background: var(--gold, #c9a227);
          color: #0a0a0a;
          font-weight: 700;
        }

        /* Availability Segmented Buttons */
        .availability-segmented {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .avail-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0.65rem;
          border-radius: 7px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }
        .avail-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }
        .avail-btn.is-active {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(201, 162, 39, 0.4);
          color: #fff;
          font-weight: 600;
        }
        .avail-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }
        .avail-dot.all {
          background: #888;
        }
        .avail-dot.available {
          background: #22c55e;
          box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
        }
        .avail-dot.booked {
          background: #ef4444;
        }

        /* Slider */
        .price-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .price-current-val {
          font-size: 0.95rem;
          font-weight: 700;
        }
        .styled-gold-slider {
          width: 100%;
          accent-color: var(--gold, #c9a227);
          cursor: pointer;
          height: 5px;
        }
        .price-presets-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.3rem;
          margin-top: 0.3rem;
        }
        .price-preset-pill {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.72rem;
          padding: 0.25rem 0;
          border-radius: 6px;
          cursor: pointer;
          text-align: center;
        }
        .price-preset-pill:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
        }

        .sidebar-mobile-footer {
          display: none;
        }

        /* ─── RIGHT MAIN CONTENT AREA ────────────────────────────────────────── */
        .fleet-main-content {
          min-width: 0;
        }
        .catalog-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.25rem;
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 10px;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .results-info h3 {
          font-size: 0.95rem;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.85);
          margin: 0;
        }
        .results-info strong {
          color: var(--gold, #c9a227);
        }
        .active-city-indicator {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.45);
          margin-left: 0.35rem;
        }
        .sort-selector-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .sort-label {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
        }
        .sort-select {
          min-width: 190px;
          padding: 0.45rem 0.65rem;
          font-size: 0.82rem;
        }

        /* Active Filter Chips Strip */
        .active-tags-strip {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }
        .active-tags-heading {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.45);
          text-transform: uppercase;
        }
        .active-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.3);
          color: #f0c950;
          font-size: 0.76rem;
          padding: 0.2rem 0.6rem;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .active-chip:hover {
          background: rgba(201, 162, 39, 0.2);
        }
        .clear-all-chips-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.75rem;
          text-decoration: underline;
          cursor: pointer;
          padding: 0.2rem 0.4rem;
        }
        .clear-all-chips-btn:hover {
          color: #fff;
        }

        /* Grid */
        .fleet-catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 1.25rem;
        }

        /* Empty State */
        .empty-catalog-card {
          background: #141414;
          border: 1px dashed rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          padding: 3.5rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.85rem;
        }
        .empty-icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(201, 162, 39, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.25rem;
        }
        .empty-catalog-card h3 {
          font-size: 1.25rem;
          margin: 0;
          color: #fff;
        }
        .empty-catalog-card p {
          max-width: 440px;
          color: rgba(255, 255, 255, 0.55);
          font-size: 0.9rem;
          margin: 0;
          line-height: 1.5;
        }

        /* Mobile Trigger Bar */
        .mobile-filter-trigger-bar {
          display: none;
        }

        /* ─── RESPONSIVE BREAKPOINTS ────────────────────────────────────────── */
        @media (max-width: 1024px) {
          .fleet-layout-container {
            grid-template-columns: 260px 1fr;
            gap: 1.5rem;
          }
          .hero-metrics-strip {
            gap: 1.25rem;
          }
        }

        @media (max-width: 900px) {
          .fleet-layout-container {
            grid-template-columns: 1fr;
          }
          .mobile-filter-trigger-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding: 0.75rem 1rem;
            background: #141414;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
          }
          .mobile-filter-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
          }
          .mobile-results-text {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.6);
          }
          /* Off-canvas sidebar on mobile */
          .fleet-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            z-index: 999;
            display: none;
            padding: 1.25rem;
          }
          .fleet-sidebar.is-mobile-open {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .sticky-filter-card {
            width: 100%;
            max-width: 480px;
            max-height: 85vh;
          }
          .mobile-close-sidebar {
            display: block;
          }
          .sidebar-mobile-footer {
            display: block;
            margin-top: 0.5rem;
          }
        }
      `}</style>
    </Layout>
  );
}
