'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export function PremiumEdit() {
  const [activeIndex, setActiveIndex] = useState(0);

  const editions = [
    {
      id: 'v3',
      slug: 'toyota-fortuner-legender',
      name: 'Toyota Fortuner Legender',
      year: '2025',
      specs: '2.8L · 4x4',
      price: '$165',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=2000&q=80',
      thumb: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'v2',
      slug: 'honda-civic-rs-turbo',
      name: 'Honda Civic RS Turbo',
      year: '2024',
      specs: '1.5L · FWD',
      price: '$85',
      image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=2000&q=80',
      thumb: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'v10',
      slug: 'kia-sportage-awd',
      name: 'Kia Sportage AWD',
      year: '2023',
      specs: '2.0L · AWD',
      price: '$110',
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=2000&q=80',
      thumb: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const current = editions[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? editions.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === editions.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="premium-edit-section" id="premium-edit">
      <div className="premium-edit-bg-wrap">
        <img
          key={current.id}
          src={current.image}
          alt={current.name}
          className="premium-edit-bg-img"
        />
        <div className="premium-edit-gradient-overlay" />
      </div>

      <div className="container premium-edit-container">
        {/* Left Editorial Copy */}
        <div className="premium-edit-copy">
          <div className="section-eyebrow-accent">
            <span className="eyebrow-dash" />
            <span className="eyebrow-text">FEATURED EDITION</span>
            <span className="eyebrow-dash" />
          </div>

          <h2 className="premium-edit-title">
            The<br />
            Premium Edit
          </h2>

          <p className="premium-edit-description">
            Iconic. Powerful. Unforgettable. Explore our handpicked selection of the world's most desirable machines — because ordinary just isn't an option.
          </p>

          <Link href={`/cars/${current.slug}`} className="btn btn-gold-pill">
            SEE THE EDIT <ArrowRight size={14} />
          </Link>

          {/* Slider Pagination Controls */}
          <div className="premium-edit-controls">
            <span className="controls-counter">
              0{activeIndex + 1} <span className="counter-slash">/</span> 0{editions.length}
            </span>
            <div className="controls-progress-bar">
              <div
                className="controls-progress-fill"
                style={{ width: `${((activeIndex + 1) / editions.length) * 100}%` }}
              />
            </div>
            <div className="controls-arrows">
              <button
                className="control-arrow-btn"
                onClick={handlePrev}
                aria-label="Previous edition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="control-arrow-btn"
                onClick={handleNext}
                aria-label="Next edition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Right Preview Cards */}
        <div className="premium-edit-picker">
          <div className="picker-tag">EDITOR'S PICK</div>
          <div className="picker-cards-grid">
            {editions.map((item, idx) => (
              <div
                key={item.id}
                className={`picker-card ${activeIndex === idx ? 'is-active' : ''}`}
                onClick={() => setActiveIndex(idx)}
                role="button"
                tabIndex={0}
              >
                <div className="picker-card-thumb">
                  <img src={item.thumb} alt={item.name} loading="lazy" />
                </div>
                <div className="picker-card-info">
                  <h4>{item.name}</h4>
                  <span className="picker-card-specs">
                    {item.year} · {item.specs}
                  </span>
                  <div className="picker-card-price">
                    <strong>{item.price}</strong> <small>/day</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
