'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Navigation, UserRound } from 'lucide-react';
import { Layout } from '@/components/layout';
import { useSession } from '@/hooks/use-session';
import { useFavorites } from '@/hooks/use-favorites';
import { setSession, formatMoney } from '@/utils/helpers';
import { allCars } from '@/data/vehicles';

export default function ProfilePage() {
  const session = useSession();
  const { favorites, toggle } = useFavorites();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(session?.name || '');
  const saved = allCars().filter((vehicle) => favorites.includes(vehicle.id));

  useEffect(() => { if (session?.name) setName(session.name); }, [session?.name]);

  if (!session) {
    return (
      <Layout>
        <main className="auth-wrap">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div className="eyebrow">Your garage, waiting</div>
            <h1>Sign in to see your profile.</h1>
            <p>Save favorite cars and keep track of your booking history.</p>
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <Link className="btn btn-primary" href="/renter?tab=signin" data-testid="link-profile-signin">Sign In as Renter</Link>
              <Link className="btn btn-outline" href="/renter?tab=register" data-testid="link-profile-register">Create Renter Account</Link>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  const saveProfile = () => { setSession({ ...session, name: name.trim() || session.name }); setEditing(false); };

  return (
    <Layout>
      <main>
        <div className="container profile-head">
          <div className="profile-identity">
            <div className="avatar" aria-hidden="true">
              {session.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div>
              <div className="eyebrow">Your profile</div>
              <h1>{session.name}</h1>
              <div className="muted" style={{ fontSize: '.78rem' }}>{session.email}</div>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setSession(null)} data-testid="button-sign-out">Sign out</button>
        </div>

        {session.role === 'host' && (
          <div className="container" style={{ marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(201, 162, 39, 0.1)', border: '1px solid var(--gold, #c9a227)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <strong style={{ color: 'var(--gold, #c9a227)' }}>Host / Lister Account Detected</strong>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.88rem' }}>You have host privileges to list vehicles and view bookings.</p>
              </div>
              <Link href="/owner/dashboard" className="btn btn-gold btn-sm">
                Open Host Dashboard →
              </Link>
            </div>
          </div>
        )}

        <div className="container profile-grid">
          <section className="profile-panel">
            <h2>Profile details</h2>
            {editing ? (
              <>
                <div className="form-field">
                  <label htmlFor="profile-name">Display name</label>
                  <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} data-testid="input-profile-name" />
                </div>
                <div className="form-actions">
                  <button className="btn btn-gold btn-sm" onClick={saveProfile} data-testid="button-save-profile">Save changes</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)} data-testid="button-cancel-profile">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div className="contact-item" style={{ marginBottom: 22 }}><UserRound size={17} /><div><strong>{session.name}</strong><span>Preferred driver</span></div></div>
                <div className="contact-item"><Navigation size={17} /><div><strong>Favorite pickup region</strong><span>Not set yet</span></div></div>
                <button className="btn btn-outline btn-sm" style={{ marginTop: 25 }} onClick={() => setEditing(true)} data-testid="button-edit-profile">Edit profile</button>
              </>
            )}
          </section>

          <section className="profile-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
              <h2>Saved vehicles</h2>
              <span className="muted" style={{ fontSize: '.72rem' }}>{saved.length} saved</span>
            </div>
            {saved.length ? saved.map((vehicle) => (
              <div className="history-row" key={vehicle.id}>
                <img src={vehicle.image} alt="" />
                <div><strong>{vehicle.brand} {vehicle.model}</strong><span>{vehicle.location} · {formatMoney(vehicle.pricePerDay)}/day</span></div>
                <button className="icon-btn" onClick={() => toggle(vehicle.id)} aria-label={`Remove ${vehicle.brand} ${vehicle.model}`} data-testid={`button-remove-favorite-${vehicle.id}`}><Heart size={15} fill="currentColor" /></button>
              </div>
            )) : (
              <div className="empty-state">
                <Heart size={20} className="gold" />
                <p>Save a car while browsing and it will appear here.</p>
                <Link className="btn btn-outline btn-sm" href="/" data-testid="link-profile-browse">Browse fleet</Link>
              </div>
            )}
            <h2 style={{ marginTop: 42 }}>Booking history</h2>
            <div className="history-row">
              <div style={{ display: 'grid', placeItems: 'center', width: 70, height: 46, background: '#242424', color: 'var(--gold-light)', fontSize: '.65rem' }}>SOON</div>
              <div><strong>No confirmed bookings yet</strong><span>Your booking confirmations will appear here.</span></div>
              <span className="muted" style={{ fontSize: '.68rem' }}>—</span>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
