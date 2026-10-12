'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CarFront, ImagePlus, ShieldCheck, Compass, CheckCircle2, RotateCw } from 'lucide-react';
import { Layout } from '@/components/layout';
import { OwnerIdentity } from '@/components/owners/owner-identity';
import { getDemoOwner, getPublishedVehicles, publishedVehiclesKey, formatMoney } from '@/utils/helpers';
import type { Vehicle } from '@/types';

export default function AddCarPage() {
  const owner = getDemoOwner();
  const router = useRouter();
  const [image, setImage] = useState('');

  // 360 Angle Photos Upload States
  const [anglePhotos, setAnglePhotos] = useState<{
    front: string;
    quarter: string;
    side: string;
    rear: string;
    top: string;
  }>({
    front: '',
    quarter: '',
    side: '',
    rear: '',
    top: '',
  });

  const [form, setForm] = useState({
    name: '',
    brand: '',
    model: '',
    year: String(new Date().getFullYear()),
    variant: '',
    description: '',
    price: '',
    pricingType: 'Per Day',
    location: owner?.city || 'Lahore',
    features: '',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    seats: '5',
    availability: 'Available',
    // Dynamic specifications
    engine: '2.0L Turbo',
    horsepower: '255 HP',
    mileage: '18 km/l',
    wheels: '18" Alloy',
    safetyFeatures: '6 Airbags, ABS with EBD, Traction Control, Cruise Control',
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

  const readMainImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result);
      setImage(res);
      setAnglePhotos((prev) => ({ ...prev, quarter: prev.quarter || res }));
    };
    reader.readAsDataURL(file);
  };

  const readAnglePhoto = (angleKey: 'front' | 'quarter' | 'side' | 'rear' | 'top') => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAnglePhotos((prev) => ({ ...prev, [angleKey]: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const publish = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.brand || !form.model || !form.price || !form.description) return;
    const slug = `${form.brand}-${form.model}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const primaryImg = image || anglePhotos.quarter || anglePhotos.front || 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=1600';

    // Assemble dynamic 360 angle frames
    const angleImages: { angle: number; label: string; url: string; vertical?: 'standard' | 'top' | 'interior' }[] = [];
    if (anglePhotos.front) angleImages.push({ angle: 0, label: '0° Front', url: anglePhotos.front, vertical: 'standard' });
    if (anglePhotos.quarter || primaryImg) angleImages.push({ angle: 30, label: '30° Quarter', url: anglePhotos.quarter || primaryImg, vertical: 'standard' });
    if (anglePhotos.side) angleImages.push({ angle: 90, label: '90° Side', url: anglePhotos.side, vertical: 'standard' });
    if (anglePhotos.rear) angleImages.push({ angle: 180, label: '180° Rear', url: anglePhotos.rear, vertical: 'standard' });
    if (anglePhotos.top) angleImages.push({ angle: 360, label: 'Top View', url: anglePhotos.top, vertical: 'top' });

    const newVehicle: Vehicle = {
      id: `demo-${Date.now()}`,
      slug,
      brand: form.brand,
      model: form.model,
      category: 'Premium',
      location: `${form.location}, Pakistan`,
      pricePerDay: Number(form.price),
      rating: 5,
      reviewCount: 0,
      seats: Number(form.seats) || 5,
      transmission: form.transmission,
      fuelType: form.fuelType,
      description: form.description,
      image: primaryImg,
      gallery: [primaryImg, ...Object.values(anglePhotos).filter(Boolean)],
      unavailableDates: [],
      rentalPeriods: [],
      provider: owner.businessName,
      ownerId: owner.id,
      pricingType: form.pricingType as Vehicle['pricingType'],
      features: form.features.split(',').map((item) => item.trim()).filter(Boolean),
      year: Number(form.year),
      variant: form.variant,
      // 360 Dynamic Specifications
      engine: form.engine.trim(),
      horsepower: form.horsepower.trim(),
      mileage: form.mileage.trim(),
      wheels: form.wheels.trim(),
      safetyFeatures: form.safetyFeatures.split(',').map((item) => item.trim()).filter(Boolean),
      angleImages: angleImages.length > 0 ? angleImages : undefined,
    };

    try {
      await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicle),
      });
    } catch (err) {
      console.warn('Could not save car to MongoDB API:', err);
    }
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
            <p>Clear details make the difference. Upload multi-angle photos to enable the 360° Interactive Car Viewer for guests.</p>
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
              
              {/* Dynamic Vehicle Specifications Section */}
              <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <ShieldCheck size={18} className="gold" />
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Full Vehicle Specifications</strong>
                </div>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="car-engine">Engine</label>
                    <input id="car-engine" value={form.engine} onChange={(e) => update('engine', e.target.value)} placeholder="e.g. 2.0L Turbo, 1.8L VVT-i" />
                  </div>
                  <div className="form-field">
                    <label htmlFor="car-power">Max Power / Horsepower</label>
                    <input id="car-power" value={form.horsepower} onChange={(e) => update('horsepower', e.target.value)} placeholder="e.g. 255 HP, 140 HP" />
                  </div>
                  <div className="form-field">
                    <label htmlFor="car-mileage">Fuel Economy / Mileage</label>
                    <input id="car-mileage" value={form.mileage} onChange={(e) => update('mileage', e.target.value)} placeholder="e.g. 18 km/l, 14 km/l" />
                  </div>
                  <div className="form-field">
                    <label htmlFor="car-wheels">Wheels & Rims</label>
                    <input id="car-wheels" value={form.wheels} onChange={(e) => update('wheels', e.target.value)} placeholder='e.g. 18" Alloy, 16" Alloy' />
                  </div>
                </div>
                <div className="form-field" style={{ marginTop: '0.75rem' }}>
                  <label htmlFor="car-safety">Safety Features</label>
                  <input id="car-safety" value={form.safetyFeatures} onChange={(e) => update('safetyFeatures', e.target.value)} placeholder="6 Airbags, ABS with EBD, Traction Control" />
                  <span className="field-hint">Displayed in the full technical specifications section.</span>
                </div>
              </div>

              <div className="form-grid" style={{ marginTop: '1.25rem' }}>
                <div className="form-field"><label htmlFor="car-transmission">Transmission</label><select id="car-transmission" value={form.transmission} onChange={(e) => update('transmission', e.target.value)} data-testid="select-car-transmission"><option>Automatic</option><option>Manual</option></select></div>
                <div className="form-field"><label htmlFor="car-fuel">Fuel type</label><select id="car-fuel" value={form.fuelType} onChange={(e) => update('fuelType', e.target.value)} data-testid="select-car-fuel"><option>Gasoline</option><option>Diesel</option><option>Hybrid</option><option>Electric</option></select></div>
                <div className="form-field"><label htmlFor="car-seats">Seats</label><input id="car-seats" type="number" min="1" max="12" value={form.seats} onChange={(e) => update('seats', e.target.value)} data-testid="input-car-seats" /></div>
                <div className="form-field"><label htmlFor="car-availability">Availability</label><select id="car-availability" value={form.availability} onChange={(e) => update('availability', e.target.value)} data-testid="select-car-availability"><option>Available</option><option>Currently Rented</option><option>Coming soon</option></select></div>
              </div>

              {/* Main Photo Upload */}
              <label className="upload-field listing-upload"><ImagePlus size={20} /><span>Primary Car Photo (Front 30°)<input type="file" accept="image/*" onChange={readMainImage} data-testid="input-car-image" /></span></label>

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
              <div className="demo-note"><ShieldCheck size={15} /> Published cars remain in this browser only. You can see them in your owner dashboard with full specifications.</div>
            </aside>
          </div>
        </section>
      </main>
    </Layout>
  );
}
