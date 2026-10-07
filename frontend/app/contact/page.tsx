'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, Clock3, MapPin, Phone } from 'lucide-react';
import { Layout } from '@/components/layout';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', category: 'General question', message: '' });
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) return setError('Please enter your name and a valid email address.');
    if (form.message.trim().length < 12) return setError('Tell us a little more so we can route your note well.');
    setError('');
    setStatus('loading');
    window.setTimeout(() => setStatus('success'), 700);
  };

  return (
    <Layout>
      <main>
        <section className="page-hero page-hero--contact">
          <img src="/contact-hero.jpg" alt="Luxury sports car on rooftop at night overlooking city" className="contact-hero-bg" />
          <div className="contact-hero-overlay" />
          <div className="container">
            <div className="eyebrow">The door is open</div>
            <h1>Let's talk<br /><span className="gold">about the drive.</span></h1>
            <p>Questions, feedback, or a car with a story? Send a note to the Drive Flex team.</p>
          </div>
        </section>


        <section className="section">
          <div className="container form-layout">
            <div>
              <div className="eyebrow">Contact concierge</div>
              <h2>We're building this with care.</h2>
              <p className="muted">This is a frontend demo, so no email is sent — but the interaction is designed to feel like the real thing.</p>
              <div className="contact-list">
                <div className="contact-item"><MapPin size={18} /><div><strong>Studio</strong><span>1450 Brickell Avenue<br />Miami, FL 33131</span></div></div>
                <div className="contact-item"><Phone size={18} /><div><strong>Concierge line</strong><span>+1 (305) 555-0148<br />Mon–Fri, 8:00 AM–6:00 PM EST</span></div></div>
                <div className="contact-item"><Clock3 size={18} /><div><strong>Typical response</strong><span>Within one business day</span></div></div>
              </div>
            </div>

            <form className="form-card" onSubmit={submit} noValidate>
              <div className="eyebrow">Send a note</div>
              <h2 style={{ margin: '10px 0 28px', fontSize: '2rem' }}>What's on your mind?</h2>
              {status === 'success' ? (
                <div className="success-box" role="status" data-testid="status-contact-success">
                  <Check size={17} style={{ verticalAlign: 'middle', marginRight: 7 }} />
                  Your message has been submitted in this frontend demo. Nothing was sent, but your flow is complete.
                </div>
              ) : (
                <>
                  <div className="form-grid">
                    <div className="form-field">
                      <label htmlFor="contact-name">Name</label>
                      <input id="contact-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" data-testid="input-contact-name" />
                    </div>
                    <div className="form-field">
                      <label htmlFor="contact-email">Email</label>
                      <input id="contact-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" data-testid="input-contact-email" />
                    </div>
                  </div>
                  <div className="form-field">
                    <label htmlFor="contact-category">Inquiry type</label>
                    <select id="contact-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} data-testid="select-contact-category">
                      <option>General question</option>
                      <option>List my car</option>
                      <option>Vehicle feedback</option>
                      <option>Partnership</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor="contact-message">Message</label>
                    <textarea id="contact-message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us where we can help." data-testid="textarea-contact-message" />
                  </div>
                  {error && <div className="error-box" role="alert" data-testid="error-contact">{error}</div>}
                  <div className="form-actions">
                    <button className="btn btn-primary" type="submit" disabled={status === 'loading'} data-testid="button-send-message">
                      {status === 'loading' ? 'Submitting…' : 'Send message'} <ArrowRight size={15} />
                    </button>
                    <span className="muted" style={{ fontSize: '.68rem' }}>Frontend demo only</span>
                  </div>
                </>
              )}
            </form>
          </div>
        </section>
      </main>
    </Layout>
  );
}
