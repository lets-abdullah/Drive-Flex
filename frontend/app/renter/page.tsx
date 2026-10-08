'use client';

import { useState, type FormEvent, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowRight, 
  User, 
  ShieldCheck, 
  Key, 
  Zap, 
  CircleAlert, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  CarFront,
  BadgeCheck,
  Headphones,
  Check
} from 'lucide-react';
import { Layout } from '@/components/layout';
import { setSession } from '@/utils/helpers';

export default function RenterPortalPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '6rem 0', textAlign: 'center', color: '#fff' }}>Loading Renter Portal...</div>}>
      <RenterPortalContent />
    </Suspense>
  );
}

function RenterPortalContent() {
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
          email: email.trim(),
          password,
          role: 'renter',
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
      setSuccessMsg('Renter account created successfully! Opening fleet catalog...');
      setTimeout(() => {
        router.push('/cars');
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
          expectedRole: 'renter',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.code === 'ROLE_MISMATCH') {
          setRoleMismatchError(data.message);
        } else {
          setError(data.message || 'Invalid credentials. Please verify your email and password.');
        }
        setLoading(false);
        return;
      }

      setSession(data.user);
      setSuccessMsg('Signed in successfully! Returning to fleet...');
      setTimeout(() => {
        router.push('/cars');
      }, 1000);
    } catch (err: any) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <main className="renter-portal-page">
        {/* Luxury Renter Banner */}
        <section className="renter-hero-banner">
          <div className="container renter-hero-content">
            <div className="renter-pill-badge">
              <Sparkles size={14} className="gold-icon" />
              <span>DRIVE FLEX DRIVER & RENTER MEMBERSHIP</span>
            </div>
            <h1 className="renter-hero-title">
              Drive Premium Cars with <span className="gold-text">Complete Freedom</span>
            </h1>
            <p className="renter-hero-desc">
              Book luxury sedans, rugged 4x4 SUVs, and sports vehicles with transparent daily rates, 
              zero paperwork delays, and certified insurance coverage.
            </p>

            <div className="renter-metrics-strip">
              <div className="metric-cell">
                <strong>50+</strong>
                <span>Curated Vehicles</span>
              </div>
              <div className="metric-cell">
                <strong>4.9 ★</strong>
                <span>Renter Satisfaction</span>
              </div>
              <div className="metric-cell">
                <strong>0 Hidden Fees</strong>
                <span>Fixed Daily Rates</span>
              </div>
              <div className="metric-cell">
                <strong>Instant</strong>
                <span>Key Handover</span>
              </div>
            </div>
          </div>
        </section>

        {/* Dedicated Renter Auth Section */}
        <section className="container renter-auth-section">
          <div className="renter-auth-grid">
            {/* Left: Renter Privileges */}
            <div className="renter-info-card">
              <div className="eyebrow">EXCLUSIVE RENTER PRIVILEGES</div>
              <h2>Why Renters Choose Drive Flex</h2>
              <p className="muted">
                From executive meetings in Islamabad to weekend getaways in Lahore and Karachi, 
                experience hassle-free premium car booking.
              </p>

              <div className="renter-perks-list">
                <div className="perk-item">
                  <div className="perk-icon-wrap">
                    <ShieldCheck size={20} className="gold" />
                  </div>
                  <div>
                    <h4>100% Insured & Verified Fleet</h4>
                    <p>Every listed vehicle is physically inspected and backed by full comprehensive insurance.</p>
                  </div>
                </div>

                <div className="perk-item">
                  <div className="perk-icon-wrap">
                    <Zap size={20} className="gold" />
                  </div>
                  <div>
                    <h4>Express Doorstep Delivery Available</h4>
                    <p>Get your vehicle delivered directly to your home, office, or airport terminal on request.</p>
                  </div>
                </div>

                <div className="perk-item">
                  <div className="perk-icon-wrap">
                    <Headphones size={20} className="gold" />
                  </div>
                  <div>
                    <h4>Dedicated Concierge & Roadside Support</h4>
                    <p>Direct 24/7 hotline with assistance ready anywhere across Pakistan.</p>
                  </div>
                </div>

                <div className="perk-item">
                  <div className="perk-icon-wrap">
                    <BadgeCheck size={20} className="gold" />
                  </div>
                  <div>
                    <h4>Transparent Security Deposit Refunds</h4>
                    <p>Prompt deposit releases immediately upon return inspection. No hidden deductibles.</p>
                  </div>
                </div>
              </div>

              <div className="renter-host-redirect">
                <span>Have a car you want to list and earn from?</span>
                <Link href="/host" className="host-link">
                  Go to Host / Lister Portal →
                </Link>
              </div>
            </div>

            {/* Right: Dedicated Renter Auth Form */}
            <div className="renter-form-wrapper">
              <div className="renter-form-card">
                {/* Switcher: Register as Renter vs Sign In as Renter */}
                <div className="renter-tab-switch">
                  <button
                    type="button"
                    className={`renter-tab-btn ${tab === 'register' ? 'active' : ''}`}
                    onClick={() => {
                      setTab('register');
                      setError('');
                      setRoleMismatchError('');
                    }}
                    data-testid="tab-renter-register"
                  >
                    <User size={16} />
                    <span>Create Renter Account</span>
                  </button>
                  <button
                    type="button"
                    className={`renter-tab-btn ${tab === 'signin' ? 'active' : ''}`}
                    onClick={() => {
                      setTab('signin');
                      setError('');
                      setRoleMismatchError('');
                    }}
                    data-testid="tab-renter-signin"
                  >
                    <Lock size={16} />
                    <span>Renter Sign In</span>
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
                      <Link href="/host?tab=signin" className="switch-portal-link">
                        Go to Host Sign In Portal →
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
                  /* REGISTER AS RENTER FORM */
                  <form onSubmit={handleRegister} className="portal-form">
                    <div className="form-header">
                      <div className="badge-tag">MEMBER REGISTRATION</div>
                      <h3>Create Your Renter Account</h3>
                      <p>Sign up in under 60 seconds to reserve vehicles, save favorites, and manage trips.</p>
                    </div>

                    <div className="form-field">
                      <label htmlFor="renter-name">Full Legal Name *</label>
                      <input
                        id="renter-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Zainab Malik"
                        data-testid="input-renter-name"
                      />
                    </div>

                    <div className="form-row-2">
                      <div className="form-field">
                        <label htmlFor="renter-city">Your City *</label>
                        <select
                          id="renter-city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="renter-select"
                          data-testid="select-renter-city"
                        >
                          <option value="Lahore">Lahore</option>
                          <option value="Karachi">Karachi</option>
                          <option value="Islamabad">Islamabad</option>
                          <option value="Rawalpindi">Rawalpindi</option>
                          <option value="Faisalabad">Faisalabad</option>
                          <option value="Multan">Multan</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label htmlFor="renter-phone">Phone / Mobile *</label>
                        <input
                          id="renter-phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+92 300 0000000"
                          data-testid="input-renter-phone"
                        />
                      </div>
                    </div>

                    <div className="form-field">
                      <label htmlFor="renter-email">Email Address *</label>
                      <input
                        id="renter-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        data-testid="input-renter-email"
                      />
                    </div>

                    <div className="form-row-2">
                      <div className="form-field">
                        <label htmlFor="renter-pass">Password *</label>
                        <input
                          id="renter-pass"
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          data-testid="input-renter-password"
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="renter-confirm-pass">Confirm Password *</label>
                        <input
                          id="renter-confirm-pass"
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          data-testid="input-renter-confirm-password"
                        />
                      </div>
                    </div>

                    <div className="terms-privacy-note">
                      By creating a renter account, you agree to Drive Flex Renter terms and identity validation checks upon booking.
                    </div>

                    <button
                      type="submit"
                      className="btn btn-gold btn-block"
                      disabled={loading}
                      data-testid="btn-submit-renter-register"
                    >
                      {loading ? 'Creating Account…' : 'Create Renter Account & Book'} <ArrowRight size={16} />
                    </button>
                  </form>
                ) : (
                  /* SIGN IN AS RENTER FORM */
                  <form onSubmit={handleSignIn} className="portal-form">
                    <div className="form-header">
                      <div className="badge-tag">RETURNING RENTER ACCESS</div>
                      <h3>Sign In as Renter</h3>
                      <p>Access your saved favorite vehicles, active bookings, and rental history.</p>
                    </div>

                    <div className="form-field">
                      <label htmlFor="renter-login-email">Email Address</label>
                      <input
                        id="renter-login-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        data-testid="input-renter-login-email"
                      />
                    </div>

                    <div className="form-field">
                      <div className="field-split-label">
                        <label htmlFor="renter-login-pass">Password</label>
                      </div>
                      <input
                        id="renter-login-pass"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                        data-testid="input-renter-login-password"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-gold btn-block"
                      disabled={loading}
                      data-testid="btn-submit-renter-login"
                    >
                      {loading ? 'Signing In…' : 'Sign In as Renter'} <ArrowRight size={16} />
                    </button>

                    <div className="portal-alt-action">
                      <span>Don’t have a Renter account yet?</span>
                      <button
                        type="button"
                        className="text-gold-btn"
                        onClick={() => setTab('register')}
                      >
                        Create Renter Account
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
        .renter-portal-page {
          background: #09090b;
          min-height: 80vh;
          padding-bottom: 5rem;
        }
        .renter-hero-banner {
          position: relative;
          padding: 5rem 1rem 3.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.06) 0%, transparent 60%);
          overflow: hidden;
        }
        .renter-hero-content {
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }
        .renter-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #ffffff;
          padding: 0.4rem 1rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          margin-bottom: 1.25rem;
        }
        .renter-hero-title {
          font-size: 2.75rem;
          font-weight: 800;
          line-height: 1.15;
          color: #ffffff;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }
        .renter-hero-desc {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.05rem;
          line-height: 1.6;
          max-width: 680px;
          margin: 0 auto 2.5rem;
        }
        .renter-metrics-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          background: rgba(18, 18, 22, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 1.25rem;
        }
        .metric-cell {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .metric-cell strong {
          font-size: 1.45rem;
          color: var(--gold, #c9a227);
          font-weight: 800;
        }
        .metric-cell span {
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .renter-auth-section {
          padding-top: 3.5rem;
        }
        .renter-auth-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 3rem;
          align-items: flex-start;
        }
        .renter-info-card {
          padding-right: 1.5rem;
        }
        .renter-info-card h2 {
          font-size: 2rem;
          color: #ffffff;
          margin: 0.5rem 0 0.8rem;
          font-weight: 800;
        }
        .renter-perks-list {
          display: flex;
          flex-direction: column;
          gap: 1.4rem;
          margin: 2rem 0;
        }
        .perk-item {
          display: flex;
          gap: 1rem;
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
          font-size: 1rem;
          color: #fff;
          margin: 0 0 0.25rem;
          font-weight: 700;
        }
        .perk-item p {
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.45;
          margin: 0;
        }
        .renter-host-redirect {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          padding: 1rem 1.25rem;
          border-radius: 10px;
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.7);
        }
        .host-link {
          color: var(--gold, #c9a227);
          font-weight: 600;
          text-decoration: underline;
        }
        .renter-form-card {
          background: #141418;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.5);
        }
        .renter-tab-switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          background: rgba(0, 0, 0, 0.35);
          padding: 0.35rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 1.75rem;
        }
        .renter-tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.7rem 0.5rem;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .renter-tab-btn.active {
          background: #ffffff;
          color: #0b0b0e;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.18);
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
          font-size: 1.4rem;
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
          gap: 1.1rem;
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .form-field label {
          font-size: 0.82rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
        }
        .form-field input,
        .renter-select {
          padding: 0.75rem 0.9rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          color: #fff;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-field input:focus,
        .renter-select:focus {
          border-color: #ffffff;
        }
        .renter-select {
          color-scheme: dark;
        }
        .renter-select option {
          background-color: #141418;
          color: #fff;
        }
        .btn-block {
          width: 100%;
          justify-content: center;
          padding: 0.85rem 1.25rem;
          font-size: 0.95rem;
          margin-top: 0.5rem;
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
          gap: 0.4rem;
        }
        .text-gold-btn {
          background: transparent;
          border: none;
          color: var(--gold, #c9a227);
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }

        @media (max-width: 900px) {
          .renter-hero-title {
            font-size: 2rem;
          }
          .renter-metrics-strip {
            grid-template-columns: repeat(2, 1fr);
          }
          .renter-auth-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .renter-info-card {
            padding-right: 0;
          }
          .form-row-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
}
