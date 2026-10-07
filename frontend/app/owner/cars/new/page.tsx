'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CarFront, ImagePlus, ShieldCheck } from 'lucide-react';
import { Layout } from '@/components/layout';
import { OwnerIdentity } from '@/components/owners/owner-identity';
import { getDemoOwner, getPublishedVehicles, publishedVehiclesKey, formatMoney } from '@/utils/helpers';
import type { Vehicle } from '@/types';

export default function AddCarPage() {
  const owner = getDemoOwner();
  const router = useRouter();
  const [image, setImage] = useState('');
  const [form, setForm] = useState({
    name: '', brand: '', model: '', year: String(new Date().getFullYear()), variant: '',
    description: '', price: '', pricingType: 'Per Day', location: owner?.city || 'Lahore',
    features: '', transmission: 'Automatic', fuelType: 'Gasoline', seats: '5', availability: 'Available',
  });

  if (!owner) {
    return (
      <Layout>
        <main className="not-found">
          <div>
            <div className="eyebrow">Owner profile required</div>
            <h1>Let's start with who you are.</h1>
            <Link className="btn btn-gold" href="/owner/onboard" data-testid="link-add-car-onboard">Create owner profile</Link>
          </div>
        </main>
      </Layout>
    );
  }

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const readImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const publish = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.brand || !form.model || !form.price || !form.description) return;
    const slug = `${form.brand}-${form.model}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newVehicle: Vehicle = {
      id: `demo-${Date.now()}`, slug, brand: form.brand, model: form.model, category: 'Premium',
      location: `${form.location}, Pakistan`, pricePerDay: Number(form.price), rating: 5, reviewCount: 0,
      seats: Number(form.seats) || 5, transmission: form.transmission, fuelType: form.fuelType,
      description: form.description,
      image: image || 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=1600',
      gallery: [image || 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=1600'],
      unavailableDates: [], rentalPeriods: [], provider: owner.businessName, ownerId: owner.id,
      pricingType: form.pricingType as Vehicle['pricingType'],
      features: form.features.split(',').map((item) => item.trim()).filter(Boolean),
      year: Number(form.year), variant: form.variant,
    };
    localStorage.setItem(publishedVehiclesKey, JSON.stringify([...getPublishedVehicles(), newVehicle]));
    router.push('/owner/dashboard');
  };

  return (
    <Layout>
      <main>
        <section className="page-hero">
          <div className="container">
            <div className="eyebrow">Owner studio · add listing</div>
            <h1>Give your next car<br /><span className="gold">the right introduction.</span></h1>
            <p>Clear details make the difference. This local demo listing can be edited by publishing a new version from your browser.</p>
          </div>
        </section>
        <section className="section">
          <div className="container form-layout listing-layout">
            <form className="form-card" onSubmit={publish}>
              <div className="eyebrow">Vehicle details</div>
              <h2 className="form-title">Build the listing.</h2>
              <div className="form-grid">
                <div className="form-field"><label htmlFor="car-name">Car name</label><input id="car-name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="The name guests will see" data-testid="input-car-name" /></div>
                <div className="form-field"><label htmlFor="car-brand">Brand</label><input id="car-brand" value={form.brand} onChange={(e) => update('brand', e.target.value)} placeholder="Toyota" data-testid="input-car-brand" /></div>
                <div className="form-field"><label htmlFor="car-model">Model</label><input id="car-model" value={form.model} onChange={(e) => update('model', e.target.value)} placeholder="Land Cruiser" data-testid="input-car-model" /></div>
                <div className="form-field"><label htmlFor="car-year">Year</label><input id="car-year" type="number" value={form.year} onChange={(e) => update('year', e.target.value)} data-testid="input-car-year" /></div>
                <div className="form-field"><label htmlFor="car-variant">Variant</label><input id="car-variant" value={form.variant} onChange={(e) => update('variant', e.target.value)} placeholder="Executive" data-testid="input-car-variant" /></div>
                <div className="form-field"><label htmlFor="car-price">Rental price / day</label><input id="car-price" type="number" min="1" value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="150" data-testid="input-car-price" /></div>
                <div className="form-field"><label htmlFor="car-pricing">Pricing type</label><select id="car-pricing" value={form.pricingType} onChange={(e) => update('pricingType', e.target.value)} data-testid="select-car-pricing"><option>Per Day</option><option>Per Week</option><option>Per Month</option></select></div>
                <div className="form-field"><label htmlFor="car-location">Location</label><input id="car-location" value={form.location} onChange={(e) => update('location', e.target.value)} data-testid="input-car-location" /></div>
              </div>
              <div className="form-field"><label htmlFor="car-description">Description</label><textarea id="car-description" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe the condition, feeling, and ideal use of the car." data-testid="textarea-car-description" /></div>
              <div className="form-field">
                <label htmlFor="car-features">Features</label>
                <input id="car-features" value={form.features} onChange={(e) => update('features', e.target.value)} placeholder="Leather interior, Sunroof, Airport pickup" data-testid="input-car-features" />
                <span className="field-hint">Separate features with commas.</span>
              </div>
              <div className="form-grid">
                <div className="form-field"><label htmlFor="car-transmission">Transmission</label><select id="car-transmission" value={form.transmission} onChange={(e) => update('transmission', e.target.value)} data-testid="select-car-transmission"><option>Automatic</option><option>Manual</option></select></div>
                <div className="form-field"><label htmlFor="car-fuel">Fuel type</label><select id="car-fuel" value={form.fuelType} onChange={(e) => update('fuelType', e.target.value)} data-testid="select-car-fuel"><option>Gasoline</option><option>Diesel</option><option>Hybrid</option><option>Electric</option></select></div>
                <div className="form-field"><label htmlFor="car-seats">Seats</label><input id="car-seats" type="number" min="1" max="12" value={form.seats} onChange={(e) => update('seats', e.target.value)} data-testid="input-car-seats" /></div>
                <div className="form-field"><label htmlFor="car-availability">Availability</label><select id="car-availability" value={form.availability} onChange={(e) => update('availability', e.target.value)} data-testid="select-car-availability"><option>Available</option><option>Currently Rented</option><option>Coming soon</option></select></div>
              </div>
              <label className="upload-field listing-upload"><ImagePlus size={20} /><span>Add car image<input type="file" accept="image/*" onChange={readImage} data-testid="input-car-image" /></span></label>
              <button className="btn btn-primary publish-button" type="submit" data-testid="button-publish-car">Publish car <ArrowRight size={15} /></button>
            </form>

            <aside className="listing-preview">
              <div className="eyebrow">Live preview</div>
              <div className="vehicle-preview-card">
                {image ? (
                  <img src={image} alt="Car listing preview" />
                ) : (
                  <div className="preview-placeholder"><CarFront size={28} /><span>Your car image</span></div>
                )}
                <div>
                  <div className="vehicle-category">{form.pricingType}</div>
                  <h3>{form.brand || 'Your brand'} {form.model || 'Your model'}</h3>
                  <p>{form.description || 'A concise description will help guests imagine the drive.'}</p>
                  <OwnerIdentity ownerId={owner.id} compact />
                  <div className="price">{form.price ? formatMoney(Number(form.price)) : '$—'} <small>/ day</small></div>
                </div>
              </div>
              <div className="demo-note"><ShieldCheck size={15} /> Published cars remain in this browser only. You can see them in your owner dashboard.</div>
            </aside>
          </div>
        </section>
      </main>
    </Layout>
  );
}
