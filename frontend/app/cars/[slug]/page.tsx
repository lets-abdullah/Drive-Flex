'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, MapPin, ShieldCheck, Star, Users } from 'lucide-react';
import { Layout } from '@/components/layout';
import { VehicleCard } from '@/components/vehicles/vehicle-card';
import { OwnerIdentity } from '@/components/owners/owner-identity';
import { BookingWidget } from '@/components/vehicles/booking-widget';
import { findVehicle, allCars } from '@/data/vehicles';
import { getPublishedVehicles } from '@/utils/helpers';
import { useBookingStatus } from '@/hooks/use-booking-status';

export default function CarDetailPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? decodeURIComponent(params.slug) : '';
  const vehicle = findVehicle(slug) || getPublishedVehicles().find((item) => item.slug === slug);
  const [activeImage, setActiveImage] = useState(0);
  const { isVehicleBooked } = useBookingStatus(vehicle || undefined);
  const isBooked = vehicle ? isVehicleBooked(vehicle.id) : false;

  if (!vehicle) {
    return (
      <Layout>
        <main className="not-found">
          <div>
            <div className="eyebrow">No vehicle here</div>
            <h1>That drive took a detour.</h1>
            <p className="muted">The vehicle may have moved, but there are more good choices waiting.</p>
            <Link className="btn btn-primary" href="/" data-testid="link-detail-not-found">Browse fleet</Link>
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
