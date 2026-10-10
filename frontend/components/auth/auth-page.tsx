'use client';

import { useState, type FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CircleAlert, ShieldAlert, KeyRound, User, Briefcase, Car } from 'lucide-react';
import { Layout } from '@/components/layout';
import { setSession } from '@/utils/helpers';
import type { UserRole } from '@/types';
import { AutoLocationField } from '@/components/location/auto-location-field';

interface AuthPageProps {
  mode: 'signin' | 'register';
  defaultRole?: UserRole;
}

export function AuthPage({ mode, defaultRole }: AuthPageProps) {
  const isRegister = mode === 'register';
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determine initial role from URL query param ?role=host or defaultRole
  const queryRole = searchParams.get('role');
  const [role, setRole] = useState<UserRole>(() => {
    if (queryRole === 'host' || queryRole === 'owner') return 'host';
    return defaultRole || 'renter';
  });

  useEffect(() => {
    if (queryRole === 'host' || queryRole === 'owner') setRole('host');
    else if (queryRole === 'renter') setRole('renter');
  }, [queryRole]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    phone: '',
    city: 'Lahore',
    businessName: '',
  });

  const [error, setError] = useState('');
  const [roleMismatchError, setRoleMismatchError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setRoleMismatchError('');

    if (isRegister && !form.name.trim()) return setError('Please enter your full name.');
    if (isRegister && role === 'host' && !form.businessName.trim() && !form.name.trim()) {
      return setError('Please enter your business or host display name.');
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email address.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (isRegister && form.password !== form.confirm) return setError('Passwords do not match.');

    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister
        ? {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            role,
            phone: form.phone,
            city: form.city,
            businessName: form.businessName || form.name,
          }
        : {
            email: form.email.trim(),
            password: form.password,
            expectedRole: role,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.code === 'ROLE_MISMATCH') {
          setRoleMismatchError(data.message);
        } else {
          setError(data.message || 'Authentication failed. Please check your credentials.');
        }
        setLoading(false);
        return;
      }

      // Save user session in localStorage + window event
      setSession(data.user);

      // Distinct redirects based on role!
      if (data.user.role === 'host') {
        router.push('/owner/dashboard');
      } else {
        router.push('/profile');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <main className="auth-wrap">
        <div className="auth-card">
          {/* Role Selection Tabs */}
          <div className="role-tabs-wrap">
            <button
              type="button"
              className={`role-tab ${role === 'renter' ? 'is-active' : ''}`}
              onClick={() => {
                setRole('renter');
                setError('');
                setRoleMismatchError('');
              }}
              data-testid="tab-renter-role"
            >
              <User size={16} />
              <span>Renter / Client</span>
            </button>
            <button
              type="button"
              className={`role-tab ${role === 'host' ? 'is-active' : ''}`}
              onClick={() => {
                setRole('host');
                setError('');
                setRoleMismatchError('');
              }}
              data-testid="tab-host-role"
            >
              <Car size={16} />
              <span>Host / Lister</span>
            </button>
          </div>

          <div className="auth-header">
            <div className="eyebrow">
              {role === 'host' ? 'HOST & FLEET PORTAL' : 'CUSTOMER & RENTER PORTAL'}
            </div>
            <h1>
              {isRegister
                ? role === 'host'
                  ? 'List Your Cars & Earn'
                  : 'Rent Premium Cars'
                : role === 'host'
                ? 'Sign In as Host'
                : 'Sign In as Renter'}
            </h1>
            <p>
              {role === 'host'
                ? isRegister
                  ? 'Create your verified host account to list vehicles, manage booking requests, and grow your fleet earnings.'
                  : 'Sign in to access your host dashboard, manage active vehicle listings, and view client bookings.'
                : isRegister
                ? 'Create a customer account to reserve cars instantly, save your favorite vehicles, and track bookings.'
                : 'Sign in to browse the curated fleet, view your reservation status, and contact hosts.'}
            </p>
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
              <Link 
                href={role === 'host' ? '/host' : '/renter'} 
                style={{ color: 'var(--gold, #c9a227)', textDecoration: 'underline', fontWeight: 600 }}
              >
                ✦ Open Dedicated {role === 'host' ? 'Host & Lister' : 'Renter & Driver'} Portal →
              </Link>
            </div>
          </div>

          {/* Role Mismatch Alert */}
          {roleMismatchError && (
            <div className="role-mismatch-box" role="alert" data-testid="error-role-mismatch">
              <ShieldAlert size={20} className="alert-icon" />
              <div>
                <strong>Cross-Role Access Blocked</strong>
                <p>{roleMismatchError}</p>
                <button
                  type="button"
                  className="switch-role-btn"
                  onClick={() => {
                    setRole(role === 'host' ? 'renter' : 'host');
                    setRoleMismatchError('');
                  }}
                >
                  Switch to {role === 'host' ? 'Renter' : 'Host'} Portal →
                </button>
              </div>
            </div>
          )}

          <form onSubmit={submit} noValidate>
            {isRegister && (
              <div className="form-field">
                <label htmlFor="auth-name">Full name</label>
                <input
                  id="auth-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Abdullah Khan"
                  data-testid="input-auth-name"
                />
              </div>
            )}

            {isRegister && role === 'host' && (
              <>
                <div className="form-field">
                  <label htmlFor="auth-business">Business / Host name</label>
                  <input
                    id="auth-business"
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    placeholder="e.g. Royal Fleet Lahore or Personal Host"
                    data-testid="input-auth-business"
                  />
                </div>
                <AutoLocationField
                  id="auth-city"
                  value={form.city}
                  onChange={(city) => setForm({ ...form, city })}
                  label="Primary City"
                />
              </>
            )}

            <div className="form-field">
              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                data-testid="input-auth-email"
              />
            </div>

            {isRegister && (
              <div className="form-field">
                <label htmlFor="auth-phone">Phone number</label>
                <input
                  id="auth-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+92 300 1234567"
                  data-testid="input-auth-phone"
                />
              </div>
            )}

            <div className="form-field">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters"
                data-testid="input-auth-password"
              />
            </div>

            {isRegister && (
              <div className="form-field">
                <label htmlFor="auth-confirm">Confirm password</label>
                <input
                  id="auth-confirm"
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Repeat your password"
                  data-testid="input-auth-confirm"
                />
              </div>
            )}

            {error && (
              <div className="error-box" role="alert" data-testid="error-auth">
                <CircleAlert size={16} /> {error}
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              type="submit"
              disabled={loading}
              data-testid={`button-${mode}`}
            >
              {loading
                ? 'Verifying account…'
                : isRegister
                ? role === 'host'
                  ? 'Register as Host & Open Dashboard'
                  : 'Create Renter Account'
                : role === 'host'
                ? 'Sign In to Host Dashboard'
                : 'Sign In to Renter Account'}{' '}
              <ArrowRight size={15} />
            </button>
          </form>

          <div className="auth-switch">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <Link href={`/sign-in?role=${role}`} data-testid="link-auth-signin">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New to Drive Flex?{' '}
                <Link href={`/register?role=${role}`} data-testid="link-auth-register">
                  Create an account
                </Link>
              </>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .role-tabs-wrap {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.04);
          padding: 0.35rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 1.5rem;
        }
        .role-tab {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.65rem 0.75rem;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.65);
          font-size: 0.88rem;
          font-weight: 500;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .role-tab:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.06);
        }
        .role-tab.is-active {
          background: var(--gold, #c9a227);
          color: #0a0a0a;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(201, 162, 39, 0.25);
        }
        .role-mismatch-box {
          background: rgba(177, 18, 38, 0.15);
          border: 1px solid #d61f3c;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          margin-bottom: 1.25rem;
          color: #ffb8c2;
          font-size: 0.88rem;
          line-height: 1.4;
        }
        .role-mismatch-box strong {
          color: #ff6b81;
          display: block;
          margin-bottom: 0.25rem;
        }
        .switch-role-btn {
          margin-top: 0.5rem;
          background: transparent;
          border: 1px solid #ff6b81;
          color: #fff;
          padding: 0.3rem 0.6rem;
          border-radius: 5px;
          font-size: 0.8rem;
          cursor: pointer;
          font-weight: 600;
        }
        .auth-select {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          color: #fff;
          font-size: 0.95rem;
        }
      `}</style>
    </Layout>
  );
}
