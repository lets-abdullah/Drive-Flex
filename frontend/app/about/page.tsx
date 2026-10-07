'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout';

export default function AboutPage() {
  return (
    <Layout>
      <main>
        <section className="page-hero page-hero--about">
          <img src="/about-hero.jpg" alt="Luxury car interior at golden hour" className="about-hero-bg" />
          <div className="about-hero-overlay" />
          <div className="container">
            <div className="eyebrow">A considered way to move</div>
            <h1>Good cars.<br /><span className="gold">Good judgment.</span></h1>
            <p>Drive Flex is a premium car-rental marketplace for people who notice the difference — and want booking to feel as good as the drive.</p>
          </div>
        </section>


        <section className="section">
          <div className="container story-grid">
            <div>
              <div className="eyebrow">Our point of view</div>
              <h2>Mobility should feel like a choice, not a compromise.</h2>
              <div className="gold-line" />
              <p className="muted">We started Drive Flex after too many rental experiences that made the car feel like an afterthought. The hidden fees, the tired vehicles, the handoff that took longer than the trip itself.</p>
              <p className="muted">Our answer is a focused marketplace: quality vehicles, honest context, and a visual standard that helps you choose with confidence. This prototype is the first expression of that idea.</p>
            </div>
            <div className="story-image" role="img" aria-label="A premium car waiting on an open road" />
          </div>
        </section>

        <section className="section surface-alt">
          <div className="container">
            <div className="section-heading">
              <div><div className="eyebrow">The Drive Flex promise</div><h2>Trust is built in the details.</h2></div>
              <p>We are designing every touchpoint around the feeling of being looked after.</p>
            </div>
            <div className="principles">
              {[
                { n: '01', title: 'A higher bar', text: 'Vehicles are presented with useful specifics, not vague promises. Know what you are choosing.' },
                { n: '02', title: 'Less friction', text: 'Clear rates, simple dates, and a focused fleet keep the decision moving in the right direction.' },
                { n: '03', title: 'Human confidence', text: 'Behind the future marketplace is a service mindset: responsive, warm, and accountable.' },
              ].map((item) => (
                <div className="principle" key={item.n}>
                  <div className="principle-number">{item.n}</div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container owner-cta">
            <div>
              <div className="eyebrow">Ready when you are</div>
              <h2>Choose a better kind of rental.</h2>
              <p>Browse the current collection or tell us what you want Drive Flex to make easier.</p>
            </div>
            <div className="hero-actions">
              <Link className="btn btn-gold" href="/" data-testid="link-about-browse">Browse cars</Link>
              <Link className="btn btn-outline" href="/contact" data-testid="link-about-contact">Contact us</Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
