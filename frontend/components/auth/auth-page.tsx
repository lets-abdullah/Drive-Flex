'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CircleAlert } from 'lucide-react';
import { Layout } from '@/components/layout';
import { setSession } from '@/utils/helpers';

interface AuthPageProps {
  mode: 'signin' | 'register';
}

export function AuthPage({ mode }: AuthPageProps) {
  const isRegister = mode === 'register';
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (isRegister && !form.name.trim()) return setError('Please enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email address.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (isRegister && form.password !== form.confirm) return setError('Passwords do not match.');
    setError('');
    setLoading(true);
    window.setTimeout(() => {
      setSession({
        name: isRegister ? form.name : (form.email.split('@')[0] || 'Drive Flex member'),
        email: form.email,
      });
      router.push('/profile');
    }, 650);
  };

  return (
    <Layout>
      <main className="auth-wrap">
        <form className="auth-card" onSubmit={submit} noValidate>
          <div className="eyebrow">{isRegister ? 'Join the movement' : 'Welcome back'}</div>
          <h1>{isRegister ? 'Make the next drive yours.' : 'Pick up where you left off.'}</h1>
          <p>
            {isRegister
              ? 'Save favorites, remember your preferences, and preview a more personal rental experience.'
              : 'Sign in to see your saved cars and booking history.'}
          </p>
          <div className="demo-note"><CircleAlert size={16} /> No account or password is stored on a server.</div>
          {isRegister && (
            <div className="form-field">
              <label htmlFor="auth-name">Full name</label>
              <input id="auth-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Morgan" data-testid="input-auth-name" />
            </div>
          )}
          <div className="form-field">
            <label htmlFor="auth-email">Email</label>
            <input id="auth-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" data-testid="input-auth-email" />
          </div>
          <div className="form-field">
            <label htmlFor="auth-password">Password</label>
            <input id="auth-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="8 characters minimum" data-testid="input-auth-password" />
          </div>
          {isRegister && (
            <div className="form-field">
              <label htmlFor="auth-confirm">Confirm password</label>
              <input id="auth-confirm" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Repeat your password" data-testid="input-auth-confirm" />
            </div>
          )}
          {error && <div className="error-box" role="alert" data-testid="error-auth">{error}</div>}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 6 }} type="submit" disabled={loading} data-testid={`button-${mode}`}>
            {loading ? 'Opening your profile…' : isRegister ? 'Create profile' : 'Sign in'} <ArrowRight size={15} />
          </button>
          <div className="auth-switch">
            {isRegister ? (
              <>Already have an account? <Link href="/sign-in" data-testid="link-auth-signin">Sign in</Link></>
            ) : (
              <>New to Drive Flex? <Link href="/register" data-testid="link-auth-register">Create an account</Link></>
            )}
          </div>
        </form>
      </main>
    </Layout>
  );
}
