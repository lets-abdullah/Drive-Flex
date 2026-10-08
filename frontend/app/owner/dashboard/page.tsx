'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CarFront,
  LayoutDashboard,
  Pencil,
  Plus,
  LogOut,
  ShieldAlert,
  Car,
} from 'lucide-react';
import { Layout } from '@/components/layout';
import { AvailabilityPill } from '@/components/vehicles/availability-pill';
import { getDemoOwner, getDemoBookings, setSession } from '@/utils/helpers';
import { vehicles } from '@/data/vehicles';
import { findOwnerById } from '@/data/owners';
import { getPublishedVehicles } from '@/utils/helpers';
import { formatMoney } from '@/utils/helpers';
import { useBookingStatus } from '@/hooks/use-booking-status';
import { useSession } from '@/hooks/use-session';

export default function OwnerDashboardPage() {
  const router = useRouter();
  const session = useSession();
  const demoOwner = getDemoOwner();

  const handleSignOut = () => {
    setSession(null);
    router.push('/');
  };

  // 1. Not logged in
  if (!session && !demoOwner) {
    return (
      <Layout>
        <main className="auth-wrap">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div className="eyebrow">Host & Fleet Studio</div>
            <h1>Sign in to manage your fleet.</h1>
            <p>
              Verified car hosts and fleet owners can publish vehicles, view reservation requests, and track daily earnings.
            </p>
            <div className="hero-actions" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
              <Link className="btn btn-gold" href="/sign-in?role=host" data-testid="link-dashboard-signin-host">
                Sign in as Host <ArrowRight size={15} />
              </Link>
              <Link className="btn btn-outline" href="/register?role=host" data-testid="link-dashboard-register-host">
                Join Drive Flex
              </Link>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  // 2. Strict Role Protection: Logged in as RENTER trying to access Host dashboard
  if (session && session.role === 'renter') {
    return (
      <Layout>
        <main className="auth-wrap">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(177, 18, 38, 0.15)', borderRadius: '50%', color: '#d61f3c', marginBottom: '1rem' }}>
              <ShieldAlert size={36} />
            </div>
            <div className="eyebrow" style={{ color: '#d61f3c' }}>RESTRICTED ACCESS</div>
            <h1>Host Portal Only</h1>
            <p style={{ marginTop: '0.75rem' }}>
              You are currently signed in as <strong>{session.name}</strong> with a <strong>Renter Account</strong>.
              Only verified car hosts and fleet partners can access this dashboard.
            </p>
            <div className="hero-actions" style={{ justifyContent: 'center', marginTop: '1.5rem', gap: '0.75rem' }}>
              <Link className="btn btn-primary" href="/profile" data-testid="link-back-profile">
                Go to My Renter Profile
              </Link>
              <Link className="btn btn-outline" href="/sign-in?role=host" data-testid="link-switch-host">
                Switch to Host Account
              </Link>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  // 3. Authenticated Host
  const hostName = session?.businessName || session?.name || demoOwner?.fullName || 'Host Partner';
  const ownerId = session?.ownerId || demoOwner?.id || 'demo-owner';
  const ownerObj = findOwnerById(ownerId);
  const base = vehicles.filter((v) => v.ownerId === ownerId || ownerObj?.vehicleIds.includes(v.id));
  const cars = [...base, ...getPublishedVehicles().filter((v) => v.ownerId === ownerId)];
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
              <div className="eyebrow">VERIFIED HOST STUDIO · DRIVEFLEX PARTNER</div>
              <h1>
                Welcome back, <span className="gold">{hostName.split(' ')[0]}.</span>
              </h1>
              <p>Manage your active listings, dates, availability, and rental requests.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link className="btn btn-gold" href="/owner/cars/new" data-testid="link-add-new-car">
                <Plus size={15} /> Add new car
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="btn btn-outline btn-sm"
                title="Sign out of Host account"
                data-testid="button-dashboard-signout"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </div>
        </section>

        <section className="section-tight">
          <div className="container">
            <div className="dashboard-stats">
              <div>
                <span>Total cars</span>
                <strong>{cars.length}</strong>
                <small>Published in your fleet</small>
              </div>
              <div>
                <span>Available cars</span>
                <strong>{availableCarsCount}</strong>
                <small>Ready for new bookings</small>
              </div>
              <div>
                <span>Currently rented</span>
                <strong>{bookedCarsCount}</strong>
                <small>Active booked listings</small>
              </div>
              <div>
                <span>Active reservations</span>
                <strong>{bookings.length}</strong>
                <small>Confirmed client bookings</small>
              </div>
            </div>
          </div>
        </section>

        <section className="section surface-alt">
          <div className="container dashboard-grid">
            <div className="dashboard-main">
              <div className="dashboard-section-heading">
                <div>
                  <div className="eyebrow">My cars</div>
                  <h2>Your published fleet.</h2>
                </div>
                <Link className="btn btn-outline btn-sm" href="/owner/cars/new" data-testid="link-dashboard-add-car">
                  <Plus size={13} /> Add car
                </Link>
              </div>
              {cars.length ? (
                <div className="dashboard-car-list">
                  {cars.map((car) => (
                    <div className="dashboard-car-row" key={car.id}>
                      <img src={car.image} alt={`${car.brand} ${car.model}`} />
                      <div>
                        <strong>
                          {car.brand} {car.model}
                        </strong>
                        <span>
                          {car.location} · {formatMoney(car.pricePerDay)} / day
                        </span>
                        <AvailabilityPill vehicle={car} />
                      </div>
                      <Link
                        className="btn btn-ghost btn-sm"
                        href={`/cars/${car.slug}`}
                        data-testid={`link-dashboard-car-${car.id}`}
                      >
                        View <ArrowRight size={13} />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <CarFront size={32} className="gold" />
                  <h3>No vehicles published yet</h3>
                  <p>Add your first luxury sedan or SUV to start earning on DriveFlex.</p>
                  <Link className="btn btn-gold btn-sm" href="/owner/cars/new">
                    Add first vehicle
                  </Link>
                </div>
              )}
            </div>

            <aside className="dashboard-side">
              <div className="dashboard-side-card">
                <div className="eyebrow">Host Profile</div>
                <h3>{hostName}</h3>
                <p>{session?.email || demoOwner?.email || 'Verified Host Partner'}</p>
                <div className="stat-pill gold-border">
                  <BadgeCheck size={14} className="gold" /> Identity & Commercial License Verified
                </div>
                <div style={{ marginTop: '1.25rem' }}>
                  <Link className="btn btn-outline btn-sm" href="/owner/onboard" style={{ width: '100%', justifyContent: 'center' }}>
                    <Pencil size={13} /> Edit Host Profile
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </Layout>
  );
}
