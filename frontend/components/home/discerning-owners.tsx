'use client';

import Link from 'next/link';
import { BadgeCheck, Star, ArrowRight } from 'lucide-react';

export function DiscerningOwners() {
  const stories = [
    {
      image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80',
      title: 'A smooth experience from start to finish.',
      owner: 'Sara Khan',
      car: 'Honda Civic RS Turbo',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      slug: 'sana-auto-collective-islamabad',
    },
    {
      image: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=800&q=80',
      title: 'Premium cars, real people.',
      owner: 'Usman Ali',
      car: 'Toyota Corolla Altis',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      slug: 'ali-motors-lahore',
    },
  ];

  return (
    <section className="discerning-section" id="for-owners">
      <div className="container">
        <div className="discerning-header">
          <div className="section-eyebrow-accent">
            <span className="eyebrow-dash" />
            <span className="eyebrow-text">TRUSTED OWNERS</span>
            <span className="eyebrow-dash" />
          </div>

          <h2 className="discerning-title">
            For Discerning<br />
            <span className="gold-text">Owners</span>
          </h2>

          <p className="discerning-subtitle">
            Real people. Real experiences. Our owners choose Drive Flex for the trust, convenience and premium service we deliver — every time.
          </p>
        </div>

        {/* Main Featured Testimonial Hero */}
        <div className="discerning-hero-card">
          <div className="discerning-hero-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85"
              alt="Ahmed Raza with Toyota Fortuner"
              className="discerning-hero-image"
            />
            <div className="discerning-hero-overlay" />
          </div>

          <div className="discerning-hero-content">
            <div className="quote-mark">“</div>
            <p className="testimonial-quote">
              Drive Flex made the entire process incredibly simple. My car was listed, verified and rented within days. The team is professional, and the platform is both secure and easy to use.
            </p>

            <div className="testimonial-author-row">
              <div className="author-info-group">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                  alt="Ahmed Raza"
                  className="author-avatar"
                />
                <div>
                  <strong className="author-name">Ahmed Raza</strong>
                  <span className="author-car">Toyota Fortuner Legender</span>
                  <div className="author-rating">
                    <span className="stars-gold">★★★★★</span>
                    <span className="rating-score">4.9</span>
                  </div>
                </div>
              </div>

              <div className="author-verified-badge">
                <BadgeCheck size={14} />
                <span>Verified Owner</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 2 Sub-Story Cards */}
        <div className="discerning-subgrid">
          {stories.map(({ image, title, owner, car, avatar, slug }) => (
            <Link href={`/owners/${slug}`} className="discerning-story-card" key={title}>
              <div className="story-thumb-wrap">
                <img src={image} alt={car} loading="lazy" />
              </div>
              <div className="story-content">
                <span className="story-tag">OWNER STORY</span>
                <h3 className="story-title">{title}</h3>
                <div className="story-author-footer">
                  <div className="story-avatar-group">
                    <img src={avatar} alt={owner} />
                    <span>
                      <strong>{owner}</strong> · <small>{car}</small>
                    </span>
                  </div>
                  <ArrowRight size={15} className="story-arrow" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
