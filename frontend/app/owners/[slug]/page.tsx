'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BadgeCheck, MapPin, Phone } from 'lucide-react';
import { Layout } from '@/components/layout';
import { VehicleCard } from '@/components/vehicles/vehicle-card';
import { findOwner } from '@/data/owners';
import { findOwnerById } from '@/data/owners';
import { vehicles } from '@/data/vehicles';
import { getDemoOwner, getPublishedVehicles } from '@/utils/helpers';

export default function OwnerProfilePage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? decodeURIComponent(params.slug) : '';
  const demoOwner = getDemoOwner();
  const owner = findOwner(slug) || (demoOwner?.slug === slug ? demoOwner : null);

  if (!owner) {
    return (
      <Layout>
        <main className="not-found">
          <div>
            <div className="eyebrow">Owner profile unavailable</div>
            <h1>That profile took a detour.</h1>
            <Link className="btn btn-primary" href="/" data-testid="link-owner-not-found">Browse fleet</Link>
          </div>
        </main>
      </Layout>
    );
  }

  const ownerObj = findOwnerById(owner.id);
  const base = vehicles.filter((v) => v.ownerId === owner.id || ownerObj?.vehicleIds.includes(v.id));
  const cars = [...base, ...getPublishedVehicles().filter((v) => v.ownerId === owner.id)];

  return (
    <Layout>
      <main>
        <section className="owner-profile-hero">
          <div className="owner-cover-large" style={{ backgroundImage: `linear-gradient(90deg, rgba(10,10,10,.92), rgba(10,10,10,.32)), url(${owner.coverImage})` }} />
          <div className="container owner-profile-header">
            <img className="owner-profile-avatar" src={owner.profileImage} alt={`${owner.businessName} profile`} />
            <div className="owner-profile-copy">
              <div className="eyebrow">Verified marketplace owner</div>
              <h1>{owner.businessName}</h1>
              <p className="owner-name">{owner.fullName} · {owner.ownerType} <span className="verified-badge"><BadgeCheck size={13} /> Verified Car Owner</span></p>
              <div className="owner-profile-meta">
                <span><MapPin size={14} /> {owner.location}</span>
                <span>{owner.yearsExperience} years experience</span>
                <span>{cars.length} vehicles</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container owner-profile-grid">
            <div>
              <div className="eyebrow">The person behind the fleet</div>
              <h2>A better handover starts with context.</h2>
              <p className="muted">{owner.description}</p>
              <div className="owner-facts">
                <div><strong>{owner.yearsExperience}</strong><span>years in the trade</span></div>
                <div><strong>{cars.length}</strong><span>cars available</span></div>
                <div><strong>100%</strong><span>identity verified</span></div>
              </div>
            </div>
            <div className="profile-panel owner-contact-panel">
              <div className="eyebrow">Business details</div>
              <h3>{owner.businessName}</h3>
              <p className="muted">For this frontend demo, contact details stay visible to help you understand the relationship before booking.</p>
              <div className="contact-item"><Phone size={17} /><div><strong>{owner.phone}</strong><span>{owner.email}</span></div></div>
              <div className="contact-item"><MapPin size={17} /><div><strong>Business location</strong><span>{owner.location}</span></div></div>
            </div>
          </div>

          <div className="container owner-cars-section">
            <div className="section-heading">
              <div><div className="eyebrow">Cars available from this owner</div><h2>Choose your next drive.</h2></div>
              <span className="muted">{cars.length} carefully presented vehicles</span>
            </div>
            <div className="fleet-grid">{cars.map((car) => <VehicleCard vehicle={car} key={car.id} />)}</div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
