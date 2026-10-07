'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarDays, Check, Lock, AlertCircle, ShieldAlert } from 'lucide-react';
import type { Vehicle } from '@/types';
import { formatMoney, todayString, getDemoBookings, demoBookingsKey } from '@/utils/helpers';
import { calculateRentalPrice, datesOverlap } from '@/data/vehicles';
import { useSession } from '@/hooks/use-session';
import { useBookingStatus } from '@/hooks/use-booking-status';

export function BookingWidget({ vehicle }: { vehicle: Vehicle }) {
  const session = useSession();
  const router = useRouter();
  const { isVehicleBooked, getVehicleBooking, bookVehicle } = useBookingStatus(vehicle);
  const isBooked = isVehicleBooked(vehicle.id);
  const currentBooking = getVehicleBooking(vehicle.id);

  const [pickup, setPickup] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const quote = calculateRentalPrice(vehicle.pricePerDay, pickup, returnDate);

  const validate = () => {
    if (isBooked) return 'This vehicle has already been booked by another customer.';
    if (!pickup || !returnDate) return 'Select both dates to see your estimate.';
    if (pickup < todayString()) return 'Pickup date must be today or later.';
    if (returnDate <= pickup) return 'Return date must be after pickup date.';
    if (datesOverlap(vehicle, pickup, returnDate)) return 'This vehicle is unavailable for part of those dates.';
    return '';
  };

  const handleBook = async () => {
    const message = validate();
    if (message) return setError(message);
    setError('');

    if (!session) {
      setShowPrompt(true);
      return;
    }

    try {
      setSubmitting(true);
      // Call backend REST API endpoint POST /api/bookings
      await bookVehicle({
        vehicleId: vehicle.id,
        customer: session.name,
        pickup,
        returnDate,
        totalAmount: quote.total,
      });

      // Keep local storage synced for offline/demo profile views
      try {
        const bookings = getDemoBookings();
        bookings.push({
          vehicleId: vehicle.id,
          customer: session.name,
          pickup,
          returnDate,
          status: 'Confirmed',
          totalAmount: quote.total,
        });
        localStorage.setItem(demoBookingsKey, JSON.stringify(bookings));
      } catch {
        // Ignore localStorage error
      }

      setConfirmed(true);
    } catch (err: any) {
      console.error('Booking failed:', err);
      // Handles 409 Conflict / VEHICLE_ALREADY_BOOKED from backend
      setError(err?.message || 'This vehicle has already been booked by another customer.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStatus = isBooked
    ? 'Unavailable — Already booked by someone else'
    : pickup && returnDate
    ? datesOverlap(vehicle, pickup, returnDate)
      ? 'Unavailable for selected dates'
      : 'Available'
    : 'Choose dates to check availability';

  return (
    <aside className={`booking-card ${isBooked ? 'is-widget-booked' : ''}`}>
      <div className="eyebrow">
        {isBooked ? 'Listing status · Reserved' : 'Reserve your drive'}
      </div>
      <h2>{isBooked ? 'Currently Booked' : 'Ready when you are.'}</h2>

      <div className="booking-price">
        <strong>{formatMoney(vehicle.pricePerDay)}</strong>
        <span>per day</span>
      </div>

      {isBooked ? (
        <div className="booking-unavailable-banner" data-testid="banner-vehicle-booked">
          <div className="banner-header">
            <Lock size={16} />
            <span>Unavailable for booking</span>
          </div>
          <p className="banner-copy">
            This car has already been booked by another customer
            {currentBooking?.customer ? ` (${currentBooking.customer})` : ''}.
          </p>
          <div className="banner-subtext">
            You can review the full vehicle specifications, gallery, and host details, but this listing is currently closed for new reservations.
          </div>
        </div>
      ) : (
        <>
          <div className="form-field">
            <label htmlFor="booking-pickup">Pickup date</label>
            <input
              id="booking-pickup"
              type="date"
              min={todayString()}
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value);
                setConfirmed(false);
                setShowPrompt(false);
                setError('');
              }}
              data-testid="input-booking-pickup"
            />
          </div>
          <div className="form-field">
            <label htmlFor="booking-return">Return date</label>
            <input
              id="booking-return"
              type="date"
              min={pickup || todayString()}
              value={returnDate}
              onChange={(e) => {
                setReturnDate(e.target.value);
                setConfirmed(false);
                setShowPrompt(false);
                setError('');
              }}
              data-testid="input-booking-return"
            />
          </div>

          <div className={`booking-availability ${selectedStatus === 'Available' ? 'is-available' : 'is-unavailable'}`}>
            <CalendarDays size={15} />
            <span>{selectedStatus}</span>
          </div>

          {quote.days > 0 && !error && (
            <div className="booking-summary">
              <div className="summary-row"><span>Rental duration</span><strong>{quote.days} {quote.days === 1 ? 'day' : 'days'}</strong></div>
              <div className="summary-row"><span>{formatMoney(vehicle.pricePerDay)} × {quote.days}</span><strong>{formatMoney(quote.total)}</strong></div>
              <div className="summary-row total"><span>Estimated total</span><strong>{formatMoney(quote.total)}</strong></div>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="error-box" role="alert" data-testid="error-booking">
          <AlertCircle size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {error}
        </div>
      )}

      {confirmed ? (
        <div className="booking-confirm" role="status" data-testid="status-booking-confirmed">
          <Check size={17} style={{ verticalAlign: 'middle', marginRight: 7 }} />
          <strong>Booking confirmed with backend!</strong>
          <br />Your reservation has been recorded. This vehicle is now marked as Booked.
        </div>
      ) : isBooked ? (
        <button
          className="btn btn-disabled"
          disabled
          style={{ width: '100%', marginTop: 20, cursor: 'not-allowed', opacity: 0.65 }}
          data-testid="button-already-booked"
        >
          <Lock size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Already Booked
        </button>
      ) : (
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 20 }}
          onClick={handleBook}
          disabled={submitting || selectedStatus === 'Unavailable for selected dates'}
          data-testid="button-book-now"
        >
          {submitting ? 'Confirming booking...' : 'Book this car'} <ArrowRight size={15} />
        </button>
      )}

      {showPrompt && !isBooked && (
        <div className="auth-prompt" data-testid="prompt-booking-auth">
          You're almost there. Sign in or create an account to continue your booking.
          <div className="auth-prompt-actions">
            <button className="btn btn-gold btn-sm" onClick={() => router.push('/sign-in')} data-testid="button-booking-signin">Sign in</button>
            <button className="btn btn-outline btn-sm" onClick={() => router.push('/register')} data-testid="button-booking-register">Create account</button>
          </div>
        </div>
      )}
    </aside>
  );
}
