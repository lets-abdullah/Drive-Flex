'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, CalendarDays, CarFront, Check, CheckCircle2, CircleAlert, Clock3, Compass, MapPin, MessageSquare, ShieldCheck, Sparkles, Star, UserCheck, Users, Zap } from 'lucide-react';
import { Layout } from '@/components/layout';
import { VehicleCard } from '@/components/vehicles/vehicle-card';
import { SearchPanel } from '@/components/vehicles/search-panel';
import { owners } from '@/data/owners';
import { vehicles } from '@/data/vehicles';
import type { Vehicle } from '@/types';
import { WhyDriveFlex } from '@/components/home/why-drive-flex';
import { ClearerRoute } from '@/components/home/clearer-route';
import { DiscerningOwners } from '@/components/home/discerning-owners';
import { PremiumEdit } from '@/components/home/premium-edit';

export default function HomePage() {
  const [results, setResults] = useState<Vehicle[] | null>(null);
  const [resultMessage, setResultMessage] = useState('');

  return (
    <Layout>
      <main>
        <section className="hero">
          <div className="hero-bg-wrap">
            <img src="/hero-fortuner.jpg" alt="Toyota Fortuner at sunset in Pakistan" className="hero-bg-img" />
            <div className="hero-gradient-overlay" />
          </div>
          <div className="container hero-content">
            <div className="hero-eyebrow-accent">
              <span className="eyebrow-text">THE DRIVE FLEX STANDARD</span>
              <span className="eyebrow-dash" />
            </div>
            <h1>
              Find a car<br />
              with <span className="gold-text">character.</span>
            </h1>
            <p className="hero-copy">
              Premium cars, trusted hosts, and a clearer way to move. Choose the drive that makes the destination feel closer.
            </p>
            <div className="hero-actions">
              <a className="btn btn-gold" href="#fleet-results" data-testid="link-hero-find-cars">
                EXPLORE THE FLEET <ArrowRight size={15} />
              </a>
              <Link className="btn btn-outline" href="/owner/onboard" data-testid="link-hero-list-car">
                LIST YOUR CAR
              </Link>
            </div>
          </div>
        </section>

        <SearchPanel onResults={(items, message) => { setResults(items); setResultMessage(message); }} />

        <section className="section" id="fleet-results">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">Curated, not crowded</div>
                <h2>{results ? 'Your route, matched.' : 'A better way to choose your drive.'}</h2>
              </div>
              <p>{results ? resultMessage : 'From the first key turn to the last mile, every vehicle in our marketplace earns its place.'}</p>
            </div>
            {results && results.length === 0 ? (
              <div className="empty-state">
                <CircleAlert size={24} className="gold" />
                <h3>No exact matches</h3>
                <p>Try searching "anywhere" for a broader look at the current fleet.</p>
                <button className="btn btn-outline btn-sm" onClick={() => setResults(null)} data-testid="button-clear-search">View featured fleet</button>
              </div>
            ) : (
              <>
                <div className="fleet-grid">
                  {(results || vehicles.slice(0, 8)).map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
                </div>
                <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                  <Link href="/cars" className="btn btn-gold" data-testid="link-view-all-listings">
                    VIEW ALL LISTINGS ({vehicles.length}+ FLEET) <ArrowRight size={15} />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* 4 Feature Sections matching the design reference */}
        <WhyDriveFlex />
        <ClearerRoute />
        <DiscerningOwners />
        <PremiumEdit />
      </main>
    </Layout>
  );
}
