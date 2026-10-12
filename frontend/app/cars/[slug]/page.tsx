'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, MapPin, ShieldCheck, Star, Users, Loader2, RotateCw, Compass, X } from 'lucide-react';
import { Layout } from '@/components/layout';
import { VehicleCard } from '@/components/vehicles/vehicle-card';
import { OwnerIdentity } from '@/components/owners/owner-identity';
import { BookingWidget } from '@/components/vehicles/booking-widget';
import { findVehicle, allCars } from '@/data/vehicles';
import { getPublishedVehicles } from '@/utils/helpers';
import { useBookingStatus } from '@/hooks/use-booking-status';
import type { Vehicle } from '@/types';

export default function CarDetailPage() {
  const params = useParams();
  const rawSlug = typeof params?.slug === 'string' ? decodeURIComponent(params.slug) : '';
  const [vehicle, setVehicle] = useState<Vehicle | null>(() => {
    if (!rawSlug) return null;
    return (
      findVehicle(rawSlug) ||
      getPublishedVehicles().find(
        (item) =>
          item.slug?.toLowerCase() === rawSlug.toLowerCase() ||
          item.id?.toLowerCase() === rawSlug.toLowerCase()
      ) ||
      null
    );
  });
  const [loading, setLoading] = useState<boolean>(!vehicle);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!rawSlug) return;

    const localMatch =
      findVehicle(rawSlug) ||
      getPublishedVehicles().find(
        (item) =>
          item.slug?.toLowerCase() === rawSlug.toLowerCase() ||
          item.id?.toLowerCase() === rawSlug.toLowerCase()
      );

    if (localMatch) {
      setVehicle(localMatch);
      setLoading(false);
    }

    // Always attempt live fetch from API to ensure DB cars or updated status are fresh
    fetch(`/api/vehicles/${encodeURIComponent(rawSlug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) {
          setVehicle(json.data);
        }
      })
      .catch((err) => {
        console.warn('Vehicle detail live API fetch notice:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [rawSlug]);

  const { isVehicleBooked } = useBookingStatus(vehicle || undefined);
  const isBooked = vehicle ? isVehicleBooked(vehicle.id) : false;

  if (loading) {
    return (
      <Layout>
        <main className="not-found" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={32} className="spin-gold" style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <div className="eyebrow">Locating vehicle...</div>
          </div>
        </main>
      </Layout>
    );
  }

  if (!vehicle) {
    return (
      <Layout>
        <main className="not-found">
          <div>
            <div className="eyebrow">No vehicle here</div>
            <h1>That drive took a detour.</h1>
            <p className="muted">The vehicle may have moved, but there are more good choices waiting.</p>
            <Link className="btn btn-primary" href="/cars" data-testid="link-detail-not-found">Browse fleet</Link>
          </div>
        </main>
      </Layout>
    );
  }

  const related = allCars().filter((item) => item.id !== vehicle.id && item.category === vehicle.category).slice(0, 3);

  return (
    <Layout>
      <main>
        <section className="detail-hero">
          <div className="container">
            <Link className="back-link" href="/" data-testid="link-detail-back"><ChevronLeft size={15} /> Back to fleet</Link>
            <div className="detail-grid">
              <div>
                <div className="gallery-main">
                  <img src={vehicle.gallery[activeImage]} alt={`${vehicle.brand} ${vehicle.model}, exterior view`} />
                </div>
                <div className="gallery-thumbs">
                  {vehicle.gallery.map((image, index) => (
                    <button className={`gallery-thumb ${activeImage === index ? 'active' : ''}`} key={image + index} onClick={() => setActiveImage(index)} aria-label={`View image ${index + 1}`} data-testid={`button-gallery-${index}`}>
                      <img src={image} alt="" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="detail-copy">
                <div className="detail-eyebrow-row">
                  <div className="eyebrow">{vehicle.category} · {vehicle.location}</div>
                  <span className={`status-pill ${isBooked ? 'is-booked' : 'is-available'}`} data-testid="detail-status-pill">
                    <span className="status-dot" />
                    {isBooked ? 'Booked by another driver' : 'Available'}
                  </span>
                </div>
                <h1>{vehicle.brand}<br /><span className="gold">{vehicle.model}</span></h1>
                <div className="detail-rating"><Star size={15} fill="currentColor" /> {vehicle.rating} <span>from {vehicle.reviewCount} verified reviews</span></div>
                <OwnerIdentity ownerId={vehicle.ownerId} />
                <p>{vehicle.description}</p>
                <div className="spec-grid">
                  <div className="spec"><label>Seats</label><strong><Users size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />{vehicle.seats}</strong></div>
                  <div className="spec"><label>Transmission</label><strong>{vehicle.transmission}</strong></div>
                  <div className="spec"><label>Powertrain</label><strong>{vehicle.fuelType}</strong></div>
                  <div className="spec"><label>Range</label><strong>{vehicle.range || 'Performance tuned'}</strong></div>
                  <div className="spec"><label>Pickup</label><strong><MapPin size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />{vehicle.location}</strong></div>
                  <div className="spec"><label>Host</label><strong>Verified</strong></div>
                </div>
                <BookingWidget vehicle={vehicle} />
              </div>
            </div>
          </div>
        </section>

        {/* ─── FULL SPECIFICATIONS SECTION (Moved to Car Details Bottom) ─── */}
        <section className="section-tight" style={{ padding: '2.5rem 0', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="container">
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="eyebrow" style={{ color: '#c9a227' }}>COMPREHENSIVE VEHICLE DATA</div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0.25rem 0' }}>
                Full Technical Specifications
              </h2>
              <p className="muted" style={{ fontSize: '0.9rem', maxWidth: '600px' }}>
                Factory-verified performance metrics, dimensions, transmission, powertrain, and driver assistance capabilities.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
            }}>
              <div className="spec-card-clean" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Powertrain & Engine</span>
                <strong style={{ display: 'block', fontSize: '1.15rem', color: '#fff', marginTop: '0.35rem' }}>{(vehicle as any).specs?.engine || vehicle.engine || '2.0L Turbocharged I4'}</strong>
                <span style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>Power: {(vehicle as any).specs?.horsepower || vehicle.horsepower || '255 HP / Performance Tuned'}</span>
              </div>

              <div className="spec-card-clean" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transmission</span>
                <strong style={{ display: 'block', fontSize: '1.15rem', color: '#fff', marginTop: '0.35rem' }}>{(vehicle as any).specs?.transmission || vehicle.transmission || 'Automatic'}</strong>
                <span style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>Drive: All-Wheel / Rear Drive</span>
              </div>

              <div className="spec-card-clean" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fuel & Efficiency</span>
                <strong style={{ display: 'block', fontSize: '1.15rem', color: '#fff', marginTop: '0.35rem' }}>{(vehicle as any).specs?.fuelType || vehicle.fuelType || 'Gasoline'}</strong>
                <span style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>Usage: {(vehicle as any).specs?.mileage || vehicle.mileage || '10 L / 100 km'}</span>
              </div>

              <div className="spec-card-clean" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seating & Wheels</span>
                <strong style={{ display: 'block', fontSize: '1.15rem', color: '#fff', marginTop: '0.35rem' }}>{vehicle.seats} Passengers</strong>
                <span style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>Wheels: {(vehicle as any).specs?.wheels || vehicle.wheels || '19" Premium Alloy'}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section-tight surface-alt">
          <div className="container detail-lower">
            <div>
              <div className="eyebrow">The details</div>
              <h2>Confidence, down to the last stitch.</h2>
              <p className="muted">This vehicle is presented with clear context so you can decide without a dozen open tabs. Availability is checked against our calendar when you choose your dates.</p>
              <div className="contact-item" style={{ marginTop: 22 }}>
                <ShieldCheck size={18} />
                <div><strong>Drive Flex verified host</strong><span>Vehicle information and host profile reviewed by our team.</span></div>
              </div>
            </div>
            <div>
              <div className="eyebrow">Driver notes</div>
              <div className="review"><div className="review-top"><span>★★★★★</span><span>Jordan R.</span></div><p>"Exactly the kind of car you want waiting outside. The details were clear and the handoff felt considered."</p></div>
              <div className="review"><div className="review-top"><span>★★★★★</span><span>Priya S.</span></div><p>"The photos match the feeling of the car. Calm, quick, and genuinely premium."</p></div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="section-heading"><div><div className="eyebrow">Keep looking</div><h2>More in this mood.</h2></div></div>
              <div className="fleet-grid">{related.map((item) => <VehicleCard key={item.id} vehicle={item} />)}</div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}
