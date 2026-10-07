'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Tag, CalendarDays } from 'lucide-react';

export function WhyDriveFlex() {
  const cards = [
    {
      icon: ShieldCheck,
      title: 'Verified Cars',
      desc: 'Every vehicle is inspected and verified for your peace of mind.',
    },
    {
      icon: Tag,
      title: 'Transparent Pricing',
      desc: 'No hidden fees. Know your total cost upfront.',
    },
    {
      icon: CalendarDays,
      title: 'Flexible Booking',
      desc: 'Short or long term. Your schedule, your terms.',
    },
  ];

  return (
    <section className="why-df-section" id="why-drive-flex">
      <div className="why-df-bg-wrap">
        <img
          src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=2000&q=85"
          alt="Luxury car cockpit"
          className="why-df-bg-img"
        />
        <div className="why-df-overlay" />
      </div>

      <div className="container why-df-container">
        <div className="why-df-left">
          <div className="section-eyebrow-accent">
            <span className="eyebrow-dash" />
            <span className="eyebrow-text">WHY DRIVE FLEX</span>
            <span className="eyebrow-dash" />
          </div>

          <h2 className="why-df-title">
            Why<br />
            Drive <span className="gold-text">Flex</span>
          </h2>

          <p className="why-df-copy">
            More than just a car marketplace — Drive Flex is built for people who value freedom, trust and a premium experience. We bring verified vehicles, transparent pricing and flexible booking, all in one place.
          </p>

          <Link href="#fleet-results" className="btn btn-gold-pill">
            DISCOVER THE DIFFERENCE <ArrowRight size={14} />
          </Link>
        </div>

        <div className="why-df-right">
          {cards.map(({ icon: Icon, title, desc }) => (
            <div className="why-df-card" key={title}>
              <div className="why-df-card-icon">
                <Icon size={22} />
              </div>
              <div className="why-df-card-content">
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
