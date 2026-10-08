'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, ChevronDown, Navigation, Info, Search, RotateCcw } from 'lucide-react';
import { useLocationFilter } from '@/context/location-context';
import {
  CityLocation,
  PAKISTAN_CITIES,
  RADIUS_OPTIONS,
  findNearestCity,
} from '@/lib/location-data';

export function ChangeLocationModal() {
  const {
    currentCity,
    radiusKm,
    isModalOpen,
    closeModal,
    applyLocation,
    clearFilter,
    isFilterActive,
  } = useLocationFilter();

  const [selectedCity, setSelectedCity] = useState<CityLocation>(currentCity);
  const [selectedRadius, setSelectedRadius] = useState<number>(radiusKm);
  const [searchQuery, setSearchQuery] = useState<string>(currentCity.name);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRadiusOpen, setIsRadiusOpen] = useState(false);
  const [locating, setLocating] = useState(false);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isModalOpen) {
      setSelectedCity(currentCity);
      setSelectedRadius(radiusKm);
      setSearchQuery(currentCity.name);
      setIsDropdownOpen(false);
      setIsRadiusOpen(false);
    }
  }, [isModalOpen, currentCity, radiusKm]);

  if (!isModalOpen) return null;

  // Filter city suggestions based on search query
  const citySuggestions = PAKISTAN_CITIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Handle GPS location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const nearest = findNearestCity(pos.coords.latitude, pos.coords.longitude);
        setSelectedCity(nearest);
        setSearchQuery(nearest.name);
        setIsDropdownOpen(false);
      },
      (err) => {
        setLocating(false);
        console.warn('Geolocation error:', err);
        alert('Could not detect your exact location. Please select your city from the list.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleApply = () => {
    applyLocation(selectedCity, selectedRadius);
  };

  const handleReset = () => {
    clearFilter();
    closeModal();
  };

  // Map coordinates scaling for visual canvas (Pakistan bounding box approx 23°N-37°N, 60°E-78°E)
  const mapWidth = 520;
  const mapHeight = 310;
  const minLat = 24.0;
  const maxLat = 36.5;
  const minLng = 66.0;
  const maxLng = 76.5;

  const getCanvasPos = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * mapWidth;
    const y = mapHeight - ((lat - minLat) / (maxLat - minLat)) * mapHeight;
    return { x: Math.max(25, Math.min(mapWidth - 25, x)), y: Math.max(25, Math.min(mapHeight - 25, y)) };
  };

  const centerPos = getCanvasPos(selectedCity.lat, selectedCity.lng);

  // Circle radius scaling in pixels based on selected radius (10 km to 500 km)
  // At roughly 111 km per latitude degree, mapHeight represents ~1400 km
  const pixelRadius = Math.max(
    28,
    Math.min(170, (selectedRadius / 600) * (mapHeight * 0.95))
  );

  return (
    <div className="fb-location-overlay" onClick={closeModal}>
      <div
        className="fb-location-modal"
        onClick={(e) => {
          e.stopPropagation();
          setIsDropdownOpen(false);
          setIsRadiusOpen(false);
        }}
      >
        {/* Header */}
        <div className="fb-location-header">
          <h2>Change location</h2>
          <button
            type="button"
            className="fb-close-btn"
            onClick={closeModal}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Subtitle */}
        <p className="fb-location-subtitle">
          Search by town, city, neighbourhood or postal code.
        </p>

        {/* Location Input Box */}
        <div className="fb-field-group">
          <div
            className="fb-input-box"
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
              setIsRadiusOpen(false);
            }}
          >
            <div className="fb-input-icon">
              <MapPin size={20} className="fb-pin-icon" />
            </div>
            <div className="fb-input-content">
              <span className="fb-input-label">Location</span>
              <input
                type="text"
                className="fb-input-val"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder="Type or select city..."
              />
            </div>
            <ChevronDown size={18} className="fb-chevron" />
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {isDropdownOpen && (
            <div className="fb-suggestions-dropdown" onClick={(e) => e.stopPropagation()}>
              {citySuggestions.length > 0 ? (
                citySuggestions.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    className={`fb-suggestion-item ${
                      selectedCity.name === city.name ? 'is-active' : ''
                    }`}
                    onClick={() => {
                      setSelectedCity(city);
                      setSearchQuery(city.name);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <MapPin size={15} />
                    <span>
                      <strong>{city.name}</strong>, {city.province}
                    </span>
                  </button>
                ))
              ) : (
                <div className="fb-no-suggestions">No cities found. Try another city name.</div>
              )}
            </div>
          )}
        </div>

        {/* Radius Selector Box */}
        <div className="fb-field-group">
          <div
            className="fb-input-box"
            onClick={(e) => {
              e.stopPropagation();
              setIsRadiusOpen(!isRadiusOpen);
              setIsDropdownOpen(false);
            }}
          >
            <div className="fb-input-content" style={{ paddingLeft: '8px' }}>
              <span className="fb-input-label">Radius</span>
              <span className="fb-input-val fb-static-val">
                {selectedRadius} kilometres
              </span>
            </div>
            <ChevronDown size={18} className="fb-chevron" />
          </div>

          {/* Radius Options Dropdown */}
          {isRadiusOpen && (
            <div className="fb-radius-dropdown" onClick={(e) => e.stopPropagation()}>
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`fb-suggestion-item ${
                    selectedRadius === opt.value ? 'is-active' : ''
                  }`}
                  onClick={() => {
                    setSelectedRadius(opt.value);
                    setIsRadiusOpen(false);
                  }}
                >
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Visual Map (FB Marketplace Style) */}
        <div className="fb-map-container">
          {/* Locate Me GPS Button on Top Right */}
          <button
            type="button"
            className={`fb-gps-btn ${locating ? 'is-locating' : ''}`}
            onClick={handleLocateMe}
            title="Use current GPS location"
          >
            <Navigation size={18} className="fb-gps-icon" />
          </button>

          {/* Map Canvas Background (SVG Pakistan Geography) */}
          <svg
            className="fb-map-svg"
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="mapBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a342b" />
                <stop offset="40%" stopColor="#203d32" />
                <stop offset="70%" stopColor="#1c3029" />
                <stop offset="100%" stopColor="#172822" />
              </linearGradient>

              {/* Desert & Plateau Terrain Shades */}
              <radialGradient id="terrainGrad" cx="35%" cy="65%" r="65%">
                <stop offset="0%" stopColor="#2c473c" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#1e382d" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#162c23" stopOpacity="0" />
              </radialGradient>

              {/* Radius Circle Glow */}
              <radialGradient id="radiusGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3897f0" stopOpacity="0.22" />
                <stop offset="85%" stopColor="#3897f0" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#3897f0" stopOpacity="0.35" />
              </radialGradient>

              {/* Grid Pattern */}
              <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
              </pattern>
            </defs>

            {/* Base Background */}
            <rect width={mapWidth} height={mapHeight} fill="url(#mapBgGrad)" />
            <rect width={mapWidth} height={mapHeight} fill="url(#terrainGrad)" />
            <rect width={mapWidth} height={mapHeight} fill="url(#mapGrid)" />

            {/* River Indus & Topography aesthetic lines */}
            <path
              d="M 370 20 Q 320 80, 290 140 T 260 210 T 210 270 T 170 300"
              fill="none"
              stroke="#265042"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              opacity="0.6"
            />
            <path
              d="M 290 140 Q 340 160, 390 150"
              fill="none"
              stroke="#265042"
              strokeWidth="1.5"
              opacity="0.4"
            />

            {/* Regional Map Labels matching Facebook Marketplace screenshot */}
            <text x="35" y="235" className="fb-map-country">PAKISTAN</text>
            <text x="35" y="145" className="fb-map-label">Kandahar</text>
            <text x="75" y="195" className="fb-map-label">Quetta</text>
            <text x="375" y="145" className="fb-map-label">Lahore</text>
            <text x="180" y="275" className="fb-map-label">Sukkur</text>
            <text x="210" y="255" className="fb-map-label">Rahim Yar Khan</text>
            <text x="310" y="215" className="fb-map-label">Hanumangarh</text>
            <text x="365" y="250" className="fb-map-label">Bikaner</text>
            <text x="445" y="240" className="fb-map-label" style={{ fontWeight: 'bold' }}>Delhi</text>

            {/* Other City Dot Indicators */}
            {PAKISTAN_CITIES.map((c) => {
              const pos = getCanvasPos(c.lat, c.lng);
              const isCenter = c.name === selectedCity.name;
              if (isCenter) return null;
              return (
                <g key={c.name} opacity="0.65">
                  <circle cx={pos.x} cy={pos.y} r="2.2" fill="#d1ded9" />
                </g>
              );
            })}

            {/* Dynamic Visual Radius Circle */}
            <g className="fb-radius-group">
              {/* Outer stroke with glow */}
              <circle
                cx={centerPos.x}
                cy={centerPos.y}
                r={pixelRadius}
                fill="url(#radiusGlow)"
                stroke="#4599f7"
                strokeWidth="1.8"
              />
              {/* Subtle inner pulse ring */}
              <circle
                cx={centerPos.x}
                cy={centerPos.y}
                r={pixelRadius * 0.45}
                fill="none"
                stroke="rgba(69, 153, 247, 0.25)"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            </g>

            {/* Center Pin & Pulsing Dot */}
            <g transform={`translate(${centerPos.x}, ${centerPos.y})`}>
              {/* Pulsing ring */}
              <circle r="6" fill="#f02849" opacity="0.4">
                <animate attributeName="r" values="5;14;5" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" />
              </circle>
              {/* Center point */}
              <circle r="3.5" fill="#f02849" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          </svg>

          {/* Center City Tag Pin overlay */}
          <div
            className="fb-center-pin-tag"
            style={{
              left: `${centerPos.x}px`,
              top: `${centerPos.y}px`,
            }}
          >
            <div className="fb-pin-head">
              <span className="fb-pin-dot" />
            </div>
            <div className="fb-pin-text">{selectedCity.name}</div>
          </div>

          {/* Info icon bottom right */}
          <div className="fb-info-icon" title="Radius estimated from city center">
            <Info size={14} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="fb-location-footer">
          {isFilterActive && (
            <button
              type="button"
              className="fb-reset-btn"
              onClick={handleReset}
            >
              <RotateCcw size={14} /> Reset filter
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button
            type="button"
            className="fb-apply-btn"
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
