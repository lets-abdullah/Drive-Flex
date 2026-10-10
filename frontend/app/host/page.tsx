'use client';

import { useState, type FormEvent, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Car,
  ShieldCheck,
  TrendingUp,
  Users,
  CircleAlert,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Sparkles,
  PhoneCall,
  MapPin,
  Building2,
  CalendarCheck
} from 'lucide-react';
import { Layout } from '@/components/layout';
import { setSession } from '@/utils/helpers';
import { AutoLocationField } from '@/components/location/auto-location-field';

export default function HostPortalPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '6rem 0', textAlign: 'center', color: '#c9a227' }}>Loading Host Portal...</div>}>
      <HostPortalContent />
    </Suspense>
  );
}

function HostPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signin' ? 'signin' : 'register';
  const [tab, setTab] = useState<'register' | 'signin'>(initialTab);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'signin') setTab('signin');
    else if (t === 'register') setTab('register');
  }, [searchParams]);

  // Form states
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('Lahore');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roleMismatchError, setRoleMismatchError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setRoleMismatchError('');

    if (!name.trim()) return setError('Please enter your full name.');
    if (!businessName.trim()) return setError('Please enter your business or showroom/host name.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Please enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          businessName: businessName.trim(),
          email: email.trim(),
          password,
          role: 'host',
          city,
          phone: phone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      setSession(data.user);
      setSuccessMsg('Host account created successfully! Redirecting to your Host Dashboard...');
      setTimeout(() => {
        router.push('/owner/dashboard');
      }, 1200);
    } catch (err: any) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setRoleMismatchError('');

    if (!email.trim()) return setError('Please enter your email.');
    if (!password) return setError('Please enter your password.');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          expectedRole: 'host',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.code === 'ROLE_MISMATCH') {
          setRoleMismatchError(data.message);
        } else {
          setError(data.message || 'Invalid host credentials. Please check your email and password.');
        }
        setLoading(false);
        return;
      }

      setSession(data.user);
      setSuccessMsg('Welcome back! Opening your Host Dashboard...');
      setTimeout(() => {
        router.push('/owner/dashboard');
      }, 1000);
    } catch (err: any) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <main className="host-portal-page">
        {/* Dedicated Host Auth Section */}
        <section className="container host-auth-section">
          <div className="host-auth-grid">
            {/* Left: Host Perks & Value */}
            <div className="host-info-card">
              <div className="host-pill-badge">
                <Sparkles size={14} className="gold-icon" />
                <span>DRIVE FLEX FLEET & HOST PARTNER</span>
              </div>
              <h1 className="host-headline">
                Turn Your Vehicles into <span className="gold-text">High-Yield Assets</span>
              </h1>
              <p className="host-lead muted">
                List your cars with Pakistan’s premier luxury rental marketplace. Enjoy vetted drivers,
                guaranteed daily payouts, and complete vehicle protection.
              </p>

              <div className="host-metrics-grid">
                <div className="metric-cell">
                  <strong>85–90%</strong>
                  <span>Host Payout Rate</span>
                </div>
                <div className="metric-cell">
                  <strong>100%</strong>
                  <span>Verified Renters</span>
                </div>
                <div className="metric-cell">
                  <strong>PKR 250k+</strong>
                  <span>Avg. Monthly Earnings</span>
                </div>
                <div className="metric-cell">
                  <strong>24/7</strong>
                  <span>Handover Support</span>
                </div>
              </div>

            </div>

            {/* Right: Dedicated Host Auth Form */}
            <div className="host-form-wrapper">
              <div className="host-form-card">
                {/* Switcher: Register as Host vs Sign In as Host */}
                <div className="host-tab-switch">
                  <button
                    type="button"
                    className={`host-tab-btn ${tab === 'register' ? 'active' : ''}`}
                    onClick={() => {
                      setTab('register');
                      setError('');
                      setRoleMismatchError('');
                    }}
                    data-testid="tab-host-register"
                  >
                    <Car size={16} />
                    <span>Create Host Account</span>
                  </button>
                  <button
                    type="button"
                    className={`host-tab-btn ${tab === 'signin' ? 'active' : ''}`}
                    onClick={() => {
                      setTab('signin');
                      setError('');
                      setRoleMismatchError('');
                    }}
                    data-testid="tab-host-signin"
                  >
                    <Lock size={16} />
                    <span>Host Sign In</span>
                  </button>
                </div>

                {successMsg && (
                  <div className="success-banner" role="status">
                    <CheckCircle2 size={18} />
                    <span>{successMsg}</span>
                  </div>
                )}

                {roleMismatchError && (
                  <div className="role-mismatch-banner" role="alert">
                    <ShieldAlert size={20} />
                    <div>
                      <strong>Account Type Notice</strong>
                      <p>{roleMismatchError}</p>
                      <Link href="/renter?tab=signin" className="switch-portal-link">
                        Go to Renter Sign In Portal →
                      </Link>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="error-banner" role="alert">
                    <CircleAlert size={17} />
                    <span>{error}</span>
                  </div>
                )}

                {tab === 'register' ? (
                  /* REGISTER AS HOST FORM */
                  <form onSubmit={handleRegister} className="portal-form">
                    <div className="form-header">
                      <div className="badge-tag">STEP 1 OF PARTNERSHIP</div>
                      <h3>Register as Host & Lister</h3>
                      <p>Create your verified host credentials to list vehicles and access the host dashboard.</p>
                    </div>

                    <div className="form-row-2">
                      <div className="form-field">
                        <label htmlFor="host-fullname">Full Name *</label>
                        <input
                          id="host-fullname"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Abdullah Khan"
                          data-testid="input-host-fullname"
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="host-bizname">Business / Showroom Name *</label>
                        <input
                          id="host-bizname"
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Royal Auto Fleet or Individual Host"
                          data-testid="input-host-bizname"
                        />
                      </div>
                    </div>

                    <div className="form-row-2">
                      <AutoLocationField
                        id="host-city"
                        value={city}
                        onChange={setCity}
                        label="Primary City"
                      />
                      <div className="form-field">
                        <label htmlFor="host-phone">Phone / WhatsApp *</label>
                        <input
                          id="host-phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+92 300 1234567"
                          data-testid="input-host-phone"
                        />
                      </div>
                    </div>

                    <div className="form-field">
                      <label htmlFor="host-email">Host Email Address *</label>
                      <input
                        id="host-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="host@yourbusiness.com"
                        data-testid="input-host-email"
                      />
                    </div>

                    <div className="form-row-2">
                      <div className="form-field">
                        <label htmlFor="host-pass">Create Password *</label>
                        <input
                          id="host-pass"
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          data-testid="input-host-password"
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="host-confirm-pass">Confirm Password *</label>
                        <input
                          id="host-confirm-pass"
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          data-testid="input-host-confirm-password"
                        />
                      </div>
                    </div>

                    <div className="terms-privacy-note">
                      By registering as a Host, you agree to Drive Flex vehicle listing terms and safety standards.
                    </div>

                    <button
                      type="submit"
                      className="btn btn-gold btn-block"
                      disabled={loading}
                      data-testid="btn-submit-host-register"
                    >
                      {loading ? 'Creating Host Account…' : 'Register as Host & Open Dashboard'} <ArrowRight size={16} />
                    </button>
                  </form>
                ) : (
                  /* SIGN IN AS HOST FORM */
                  <form onSubmit={handleSignIn} className="portal-form">
                    <div className="form-header">
                      <div className="badge-tag">EXCLUSIVE HOST ACCESS</div>
                      <h3>Sign In to Host Dashboard</h3>
                      <p>Enter your host credentials to manage your fleet, active bookings, and rental inquiries.</p>
                    </div>

                    <div className="form-field">
                      <label htmlFor="host-login-email">Host Email Address</label>
                      <input
                        id="host-login-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="host@yourbusiness.com"
                        data-testid="input-host-login-email"
                      />
                    </div>

                    <div className="form-field">
                      <div className="field-split-label">
                        <label htmlFor="host-login-pass">Password</label>
                      </div>
                      <input
                        id="host-login-pass"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your host password"
                        data-testid="input-host-login-password"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-gold btn-block"
                      disabled={loading}
                      data-testid="btn-submit-host-login"
                    >
                      {loading ? 'Authenticating Host…' : 'Sign In to Host Portal'} <ArrowRight size={16} />
                    </button>

                    <div className="portal-alt-action">
                      <span>Don’t have a Host account yet?</span>
                      <button
                        type="button"
                        className="text-gold-btn"
                        onClick={() => setTab('register')}
                      >
                        Create Host Account
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .host-portal-page {
          background: #09090b;
          min-height: 85vh;
          padding: 2.5rem 0 5rem;
        }
        .host-auth-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.25rem;
        }
        .host-auth-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3.5rem;
          align-items: start;
        }
        .host-info-card {
          display: flex;
          flex-direction: column;
        }
        .host-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(201, 162, 39, 0.12);
          border: 1px solid rgba(201, 162, 39, 0.35);
          color: var(--gold, #c9a227);
          padding: 0.4rem 1rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          margin-bottom: 1.25rem;
          align-self: flex-start;
        }
        .host-headline {
          font-size: clamp(1.85rem, 3.5vw, 2.75rem);
          font-weight: 800;
          line-height: 1.15;
          color: #ffffff;
          margin: 0 0 1rem;
          letter-spacing: -0.02em;
        }
        .host-lead {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1rem;
          line-height: 1.6;
          margin: 0 0 1.75rem;
        }
        .host-metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.85rem;
          background: rgba(18, 18, 22, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 2rem;
        }
        .metric-cell {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .metric-cell strong {
          font-size: 1.35rem;
          color: var(--gold, #c9a227);
          font-weight: 800;
        }
        .metric-cell span {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .host-perks-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
        .perk-item {
          display: flex;
          gap: 0.9rem;
          align-items: flex-start;
        }
        .perk-icon-wrap {
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.25);
          padding: 0.6rem;
          border-radius: 10px;
          color: var(--gold, #c9a227);
          flex-shrink: 0;
        }
        .perk-item h4 {
          font-size: 0.95rem;
          color: #fff;
          margin: 0 0 0.25rem;
          font-weight: 700;
        }
        .perk-item p {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.45;
          margin: 0;
        }
        .host-renter-redirect {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          padding: 0.9rem 1.25rem;
          border-radius: 10px;
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.7);
        }
        .renter-link {
          color: var(--gold, #c9a227);
          font-weight: 600;
          text-decoration: underline;
        }
        .host-form-wrapper {
          width: 100%;
        }
        .host-form-card {
          background: #141418;
          border: 1px solid rgba(201, 162, 39, 0.25);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.5);
          width: 100%;
          box-sizing: border-box;
        }
        .host-tab-switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          background: rgba(0, 0, 0, 0.35);
          padding: 0.35rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 1.75rem;
          width: 100%;
          box-sizing: border-box;
        }
        .host-tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 0.5rem;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.65);
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }
        .host-tab-btn.active {
          background: var(--gold, #c9a227);
          color: #0b0b0e;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(201, 162, 39, 0.25);
        }
        .form-header {
          margin-bottom: 1.5rem;
        }
        .badge-tag {
          font-size: 0.72rem;
          color: var(--gold, #c9a227);
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 0.35rem;
        }
        .form-header h3 {
          font-size: 1.35rem;
          color: #fff;
          margin: 0 0 0.35rem;
          font-weight: 700;
        }
        .form-header p {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.4;
          margin: 0;
        }
        .portal-form {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          width: 100%;
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          width: 100%;
        }
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          width: 100%;
        }
        .form-field label {
          font-size: 0.82rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
        }
        .form-field input,
        .host-select {
          width: 100%;
          box-sizing: border-box;
          padding: 0.75rem 0.95rem;
          min-height: 46px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          color: #fff;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-field input:focus,
        .host-select:focus {
          border-color: var(--gold, #c9a227);
          box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.12);
        }
        .host-select {
          color-scheme: dark;
          cursor: pointer;
        }
        .host-select option {
          background-color: #141418;
          color: #fff;
        }
        .btn-block {
          width: 100%;
          justify-content: center;
          min-height: 48px;
          font-size: 0.95rem;
          font-weight: 700;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .terms-privacy-note {
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.4;
        }
        .success-banner {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid #22c55e;
          color: #4ade80;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          font-size: 0.88rem;
          margin-bottom: 1rem;
        }
        .error-banner {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid #ef4444;
          color: #fca5a5;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          font-size: 0.88rem;
          margin-bottom: 1rem;
        }
        .role-mismatch-banner {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background: rgba(185, 28, 28, 0.2);
          border: 1px solid #dc2626;
          color: #fecaca;
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.88rem;
          margin-bottom: 1.25rem;
          line-height: 1.45;
        }
        .role-mismatch-banner strong {
          color: #f87171;
          display: block;
          margin-bottom: 0.2rem;
        }
        .switch-portal-link {
          display: inline-block;
          margin-top: 0.5rem;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.12);
          padding: 0.35rem 0.7rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.8rem;
          text-decoration: none;
        }
        .portal-alt-action {
          text-align: center;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 1rem;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .text-gold-btn {
          background: transparent;
          border: none;
          color: var(--gold, #c9a227);
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }

        /* ─── RESPONSIVE BREAKPOINTS ─── */
        @media (max-width: 1024px) {
          .host-auth-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
        }

        @media (max-width: 640px) {
          .host-portal-page {
            padding: 1.5rem 0 3.5rem;
          }
          .host-auth-section {
            padding: 0 0.85rem;
          }
          .host-form-card {
            padding: 1.35rem 1rem;
            border-radius: 12px;
          }
          .form-row-2 {
            grid-template-columns: 1fr;
            gap: 1.15rem;
          }
          .host-metrics-grid {
            grid-template-columns: 1fr 1fr;
            padding: 1rem;
            gap: 0.6rem;
          }
          .metric-cell strong {
            font-size: 1.2rem;
          }
          .host-tab-btn {
            font-size: 0.8rem;
            padding: 0.65rem 0.35rem;
          }
        }
      `}</style>
    </Layout>
  );
}
