'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BadgeCheck, CalendarDays, CarFront, LayoutDashboard, Pencil, Plus } from 'lucide-react';
import { Layout } from '@/components/layout';
import { AvailabilityPill } from '@/components/vehicles/availability-pill';
import { getDemoOwner, getDemoBookings } from '@/utils/helpers';
import { vehicles, availabilityLabel } from '@/data/vehicles';
import { findOwnerById } from '@/data/owners';
import { getPublishedVehicles } from '@/utils/helpers';
import { formatMoney } from '@/utils/helpers';
import { useBookingStatus } from '@/hooks/use-booking-status';

export default function OwnerDashboardPage() {
  const router = useRouter();
  const owner = getDemoOwner();

  if (!owner) {
    return (
      <Layout>
        <main className="auth-wrap">
          <div className="auth-card">
            <div className="eyebrow">Owner access</div>
            <h1>Start with your profile.</h1>
            <p>Verified owners can publish cars, see rental previews, and refine their public profile.</p>
            <Link className="btn btn-gold" href="/owner/onboard" data-testid="link-dashboard-onboard">Create owner profile <ArrowRight size={15} /></Link>
          </div>
        </main>
      </Layout>
    );
  }

  const ownerObj = findOwnerById(owner.id);
  const base = vehicles.filter((v) => v.ownerId === owner.id || ownerObj?.vehicleIds.includes(v.id));
  const cars = [...base, ...getPublishedVehicles().filter((v) => v.ownerId === owner.id)];
  const { isVehicleBooked } = useBookingStatus();
  const bookings = getDemoBookings().filter((booking) => cars.some((car) => car.id === booking.vehicleId));

  const availableCarsCount = cars.filter((car) => !isVehicleBooked(car.id)).length;
  const bookedCarsCount = cars.filter((car) => isVehicleBooked(car.id)).length;

  return (
    <Layout>
      <main>
        <section className="dashboard-hero">
          <div className="container dashboard-header">
            <div>
              <div className="eyebrow">Owner studio · frontend demo</div>
              <h1>Good to have you, <span className="gold">{owner.fullName.split(' ')[0]}.</span></h1>
              <p>Manage the cars, dates, and details behind your Drive Flex profile.</p>
            </div>
            <Link className="btn btn-gold" href="/owner/cars/new" data-testid="link-add-new-car"><Plus size={15} /> Add new car</Link>
          </div>
        </section>

        <section className="section-tight">
          <div className="container">
            <div className="dashboard-stats">
              <div><span>Total cars</span><strong>{cars.length}</strong><small>Published in your fleet</small></div>
              <div><span>Available cars</span><strong>{availableCarsCount}</strong><small>Ready for a new route</small></div>
              <div><span>Currently rented</span><strong>{bookedCarsCount}</strong><small>Active booked listings</small></div>
              <div><span>Upcoming rentals</span><strong>{bookings.length}</strong><small>Demo booking previews</small></div>
            </div>
          </div>
        </section>

        <section className="section surface-alt">
          <div className="container dashboard-grid">
            <div className="dashboard-main">
              <div className="dashboard-section-heading">
                <div><div className="eyebrow">My cars</div><h2>Your published fleet.</h2></div>
                <Link className="btn btn-outline btn-sm" href="/owner/cars/new" data-testid="link-dashboard-add-car"><Plus size={13} /> Add car</Link>
              </div>
              {cars.length ? (
                <div className="dashboard-car-list">
                  {cars.map((car) => (
                    <div className="dashboard-car-row" key={car.id}>
                      <img src={car.image} alt={`${car.brand} ${car.model}`} />
                      <div><strong>{car.brand} {car.model}</strong><span>{car.location} · {formatMoney(car.pricePerDay)} / day</span><AvailabilityPill vehicle={car} /></div>
                      <Link className="btn btn-ghost btn-sm" href={`/cars/${car.slug}`} data-testid={`link-dashboard-car-${car.id}`}>View <ArrowRight size={13} /></Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <CarFront size={24} className="gold" />
                  <h3>Your first car is waiting.</h3>
                  <p>Publish a polished listing and make it available to the marketplace.</p>
                  <Link className="btn btn-gold btn-sm" href="/owner/cars/new" data-testid="link-empty-add-car">Add new car</Link>
                </div>
              )}

              <div className="dashboard-section-heading rental-heading">
                <div><div className="eyebrow">Rentals</div><h2>Dates to keep in view.</h2></div>
              </div>
              <div className="rental-table">
                {bookings.length ? bookings.map((booking, index) => {
                  const car = cars.find((item) => item.id === booking.vehicleId);
                  return (
                    <div className="rental-row" key={`${booking.vehicleId}-${index}`}>
                      <strong>{car?.brand} {car?.model}</strong>
                      <span>{booking.customer}</span>
                      <span>{booking.pickup} → {booking.returnDate}</span>
                      <b>{booking.status}</b>
                    </div>
                  );
                }) : (
                  <div className="empty-state"><CalendarDays size={22} className="gold" /><p>No demo rentals yet. Confirmations will appear here.</p></div>
                )}
              </div>
            </div>

            <aside className="dashboard-side">
              <div className="profile-panel">
                <div className="dashboard-profile-top">
                  <img src={owner.profileImage} alt={`${owner.businessName} profile`} />
                  <div>
                    <div className="eyebrow">Your profile</div>
                    <h3>{owner.businessName}</h3>
                    <span className="verified-badge"><BadgeCheck size={12} /> Verified</span>
                  </div>
                </div>
                <p className="muted">{owner.description}</p>
                <button className="btn btn-outline btn-sm" onClick={() => router.push(`/owners/${owner.slug}`)} data-testid="button-view-public-owner">View public profile <ArrowRight size={13} /></button>
              </div>
              <div className="profile-panel">
                <div className="eyebrow">Demo storage</div>
                <h3>Local by design.</h3>
                <p className="muted">Your owner profile, published cars, and booking previews live only in this browser. No real CNIC or payment is processed.</p>
                <Link className="btn btn-ghost btn-sm" href="/owner/onboard" data-testid="link-edit-owner-profile"><Pencil size={13} /> Edit profile</Link>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </Layout>
  );
}
