'use client';

import { useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BadgeCheck, Check, CheckCircle2, ImagePlus, LayoutDashboard, Pencil, ShieldCheck } from 'lucide-react';
import { Layout } from '@/components/layout';
import { getDemoOwner, ownerProfileKey, setSession } from '@/utils/helpers';
import type { Owner, OwnerType } from '@/types';
import type { DemoOwnerProfile } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const existing = getDemoOwner();
  const [step, setStep] = useState(existing ? 2 : 1);
  const [submitted, setSubmitted] = useState(Boolean(existing));
  const [form, setForm] = useState({
    fullName: existing?.fullName || '', cnic: '', phone: existing?.phone || '',
    email: existing?.email || '', city: existing?.city || 'Lahore',
    businessName: existing?.businessName || '', ownerType: (existing?.ownerType || 'Individual') as OwnerType,
    yearsExperience: String(existing?.yearsExperience || 3), description: existing?.description || '',
    businessLocation: existing?.location || '', profileImage: existing?.profileImage || '',
    logoImage: '', coverImage: existing?.coverImage || '',
  });

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const readFile = (key: 'profileImage' | 'logoImage' | 'coverImage') => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update(key, String(reader.result));
    reader.readAsDataURL(file);
  };
  const next = () => {
    if (!form.fullName || !form.cnic || !form.phone || !form.email || !form.businessName || !form.description) return;
    setStep(2);
  };
  const submit = () => {
    const owner: DemoOwnerProfile = {
      id: 'demo-owner', slug: 'my-drive-flex-profile', fullName: form.fullName,
      businessName: form.businessName, ownerType: form.ownerType, city: form.city,
      location: form.businessLocation || form.city, phone: form.phone, email: form.email,
      yearsExperience: Number(form.yearsExperience) || 0, description: form.description,
      profileImage: form.profileImage || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=300',
      logoImage: form.logoImage,
      coverImage: form.coverImage || 'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=1600',
      verified: true, identityVerified: true, vehicleIds: [], cnic: form.cnic,
      businessLocation: form.businessLocation || form.city,
    };
    localStorage.setItem(ownerProfileKey, JSON.stringify(owner));
    setSession({
      id: owner.id,
      name: owner.fullName,
      email: owner.email,
      role: 'host',
      phone: owner.phone,
      city: owner.city,
      businessName: owner.businessName,
      ownerId: owner.id,
    });
    setSubmitted(true);
    setStep(3);
  };

  return (
    <Layout>
      <main>
        <section className="section onboard-section">
          <img src="/onboard-hero.jpg" alt="Luxury showroom background" className="onboard-bg-img" />
          <div className="onboard-bg-overlay" />
          <div className="container onboard-layout">
            <div className="onboard-intro">
              <div className="step-rail">
                <span className={step >= 1 ? 'active' : ''}>01 <small>Profile</small></span>
                <span className={step >= 2 ? 'active' : ''}>02 <small>Preview</small></span>
                <span className={step >= 3 ? 'active' : ''}>03 <small>Verified</small></span>
              </div>
              <div className="eyebrow">Owner onboarding</div>
              <h2>A profile people can trust.</h2>
              <p className="muted">Your owner identity becomes reusable across every car you publish. This is a local demo: no real identity check, email, or backend storage occurs.</p>
              <div className="demo-note"><ShieldCheck size={16} /> CNIC is used only to simulate local verification. Public profiles show Identity Verified, never the number.</div>
            </div>
            <form className="form-card" onSubmit={(event) => { event.preventDefault(); if (step === 1) next(); }}>
              {submitted ? (
                <div className="verification-success">
                  <CheckCircle2 size={34} />
                  <div>
                    <div className="eyebrow">Verification complete</div>
                    <h2>Verified Car Owner</h2>
                    <p>Your owner area is ready. Add your first car or review your profile.</p>
                  </div>
                  <div className="hero-actions">
                    <Link className="btn btn-gold" href="/owner/dashboard" data-testid="link-owner-dashboard">Open owner dashboard <LayoutDashboard size={15} /></Link>
                    <button type="button" className="btn btn-outline" onClick={() => { setSubmitted(false); setStep(1); }} data-testid="button-edit-owner-profile"><Pencil size={14} /> Edit profile</button>
                  </div>
                </div>
              ) : step === 1 ? (
                <>
                  <div className="eyebrow">Step 01 · Create profile</div>
                  <h2 className="form-title">Tell us who is behind the keys.</h2>
                  <div className="form-grid">
                    <div className="form-field"><label htmlFor="owner-full-name">Full name</label><input id="owner-full-name" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="Your full name" data-testid="input-owner-full-name" /></div>
                    <div className="form-field"><label htmlFor="owner-cnic">CNIC / National ID</label><input id="owner-cnic" type="password" autoComplete="off" value={form.cnic} onChange={(e) => update('cnic', e.target.value)} placeholder="Used for demo verification only" data-testid="input-owner-cnic" /></div>
                  </div>
                  <div className="form-grid">
                    <div className="form-field"><label htmlFor="owner-phone">Phone number</label><input id="owner-phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+92 300 000 0000" data-testid="input-owner-phone" /></div>
                    <div className="form-field"><label htmlFor="owner-email">Email address</label><input id="owner-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@business.com" data-testid="input-owner-email" /></div>
                  </div>
                  <div className="form-grid">
                    <div className="form-field"><label htmlFor="owner-city">City</label><select id="owner-city" value={form.city} onChange={(e) => update('city', e.target.value)} data-testid="select-owner-city">{['Lahore', 'Islamabad', 'Karachi', 'Rawalpindi', 'Faisalabad', 'Multan'].map((city) => <option key={city}>{city}</option>)}</select></div>
                    <div className="form-field"><label htmlFor="owner-business">Business / shop name</label><input id="owner-business" value={form.businessName} onChange={(e) => update('businessName', e.target.value)} placeholder="The name customers will remember" data-testid="input-owner-business" /></div>
                  </div>
                  <div className="form-grid">
                    <div className="form-field"><label htmlFor="owner-type">Owner type</label><select id="owner-type" value={form.ownerType} onChange={(e) => update('ownerType', e.target.value)} data-testid="select-owner-type">{['Individual', 'Car Rental Business', 'Dealership', 'Fleet Owner'].map((type) => <option key={type}>{type}</option>)}</select></div>
                    <div className="form-field"><label htmlFor="owner-years">Years of experience</label><input id="owner-years" type="number" min="0" value={form.yearsExperience} onChange={(e) => update('yearsExperience', e.target.value)} data-testid="input-owner-years" /></div>
                  </div>
                  <div className="form-field"><label htmlFor="owner-description">Short professional description</label><textarea id="owner-description" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="What makes your cars and handovers considered?" data-testid="textarea-owner-description" /></div>
                  <div className="form-field"><label htmlFor="owner-location">Business location</label><input id="owner-location" value={form.businessLocation} onChange={(e) => update('businessLocation', e.target.value)} placeholder="Area, street, or pickup detail" data-testid="input-owner-location" /></div>
                  <div className="upload-grid">
                    <label className="upload-field"><ImagePlus size={18} /><span>Profile image<input type="file" accept="image/*" onChange={readFile('profileImage')} data-testid="input-owner-profile-image" /></span></label>
                    <label className="upload-field"><ImagePlus size={18} /><span>Business logo<input type="file" accept="image/*" onChange={readFile('logoImage')} data-testid="input-owner-logo" /></span></label>
                    <label className="upload-field"><ImagePlus size={18} /><span>Cover image<input type="file" accept="image/*" onChange={readFile('coverImage')} data-testid="input-owner-cover" /></span></label>
                  </div>
                  <button className="btn btn-primary" type="submit" data-testid="button-owner-next">Review profile <ArrowRight size={15} /></button>
                </>
              ) : (
                <>
                  <div className="eyebrow">Step 02 · Profile preview</div>
                  <h2 className="form-title">Make sure it feels like you.</h2>
                  <div className="profile-preview">
                    <div className="preview-cover" style={{ backgroundImage: `url(${form.coverImage || 'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=1200'})` }} />
                    <img src={form.profileImage || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=300'} alt="Profile preview" />
                    <h3>{form.businessName}</h3>
                    <p>{form.fullName} · {form.city}</p>
                    <span className="verified-badge"><BadgeCheck size={13} /> Identity ready for verification</span>
                    <div className="preview-description">{form.description}</div>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => setStep(1)} data-testid="button-owner-back">Back to edit</button>
                    <button type="button" className="btn btn-gold" onClick={submit} data-testid="button-submit-verification">Submit for Verification <Check size={15} /></button>
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
