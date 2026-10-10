'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLocationFilter } from '@/context/location-context';
import { findNearestCity } from '@/lib/location-data';

interface AutoLocationFieldProps {
  value: string;
  onChange: (city: string) => void;
  label?: string;
  id?: string;
}

export function AutoLocationField({
  value,
  onChange,
  label = 'City Location',
  id = 'auto-city-location',
}: AutoLocationFieldProps) {
  const { currentCity, applyLocation } = useLocationFilter();
  const [detecting, setDetecting] = useState(false);
  const [detectedSuccessfully, setDetectedSuccessfully] = useState(false);

  // Sync with currentCity on mount if value is not set
  useEffect(() => {
    if (!value && currentCity?.name) {
      onChange(currentCity.name);
    }
  }, [currentCity, value, onChange]);

  // GPS auto-detect function
  const handleAutoDetect = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      // Fallback to location context preference
      if (currentCity?.name) {
        onChange(currentCity.name);
        setDetectedSuccessfully(true);
      }
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetecting(false);
        const nearest = findNearestCity(pos.coords.latitude, pos.coords.longitude);
        if (nearest) {
          onChange(nearest.name);
          applyLocation(nearest, 250);
          setDetectedSuccessfully(true);
        }
      },
      (err) => {
        setDetecting(false);
        console.warn('Geolocation permission not granted or timeout, using system location:', err);
        if (currentCity?.name) {
          onChange(currentCity.name);
          setDetectedSuccessfully(true);
        }
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  }, [currentCity, onChange, applyLocation]);

  // Attempt auto-detection once on mount if not already confirmed
  useEffect(() => {
    if (!value || value === 'Lahore') {
      handleAutoDetect();
    }
  }, [handleAutoDetect, value]);

  const displayCity = value || currentCity?.name || 'Lahore';

  return (
    <div className="form-field auto-location-field-wrapper">
      <div className="auto-location-label-row">
        <label htmlFor={id} className="auto-location-label">
          {label} *
        </label>
        <span className="auto-badge-pill">
          <Sparkles size={11} className="gold" />
        </span>
      </div>

      <div className="auto-location-card" id={id} data-testid="auto-detected-city-box">
        <div className="auto-location-city-info">
          <div className="pin-icon-wrap">
            <MapPin size={16} className="gold" />
          </div>
          <div className="city-text-group">
            <span className="city-name">{displayCity}</span>
          </div>
        </div>

        <button
          type="button"
          className="auto-detect-refresh-btn"
          onClick={handleAutoDetect}
          disabled={detecting}
          title="Re-detect your current GPS city"
          data-testid="btn-redetect-gps"
        >
          <Navigation size={13} className={detecting ? 'spinning' : ''} />
        </button>
      </div>

      <input type="hidden" name="city" value={displayCity} />

      <style jsx>{`
        .auto-location-field-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          width: 100%;
        }

        .auto-location-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .auto-location-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
        }

        .auto-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(201, 162, 39, 0.12);
          border: 1px solid rgba(201, 162, 39, 0.3);
          color: var(--gold, #c9a227);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 0.15rem 0.5rem;
          border-radius: 999px;
        }

        .auto-location-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(201, 162, 39, 0.35);
          border-radius: 8px;
          padding: 0.65rem 0.85rem;
          min-height: 46px;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .auto-location-card:hover {
          border-color: var(--gold, #c9a227);
          box-shadow: 0 0 12px rgba(201, 162, 39, 0.1);
        }

        .auto-location-city-info {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .pin-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201, 162, 39, 0.12);
          border-radius: 6px;
          padding: 0.35rem;
        }

        .city-text-group {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .city-name {
          font-size: 0.92rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.01em;
        }

        .city-accuracy {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.55);
        }

        :global(.green) {
          color: #22c55e;
        }

        .auto-detect-refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.35rem 0.65rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .auto-detect-refresh-btn:hover:not(:disabled) {
          background: rgba(201, 162, 39, 0.15);
          border-color: var(--gold, #c9a227);
          color: var(--gold, #c9a227);
        }

        .auto-detect-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        :global(.spinning) {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
