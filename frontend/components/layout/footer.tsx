'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, PhoneCall } from 'lucide-react';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link href="/" className="brand" data-testid="link-footer-brand">
            <img src="/logo.png" alt="Drive Flex" />
            <span className="brand-wordmark">Drive <span>Flex</span></span>
          </Link>
          <p>
            Pakistan’s premier curated luxury & executive car rental marketplace. 
            Verified hosts, insured journeys, and seamless digital booking.
          </p>
          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.75rem', color: '#c9a227' }}>
            <ShieldCheck size={16} />
            <span>100% Insured & Identity-Verified Fleet</span>
          </div>
        </div>

        <div>
          <h3>Curated Fleet</h3>
          <Link href="/cars">All Fleet Listings</Link>
          <Link href="/cars?category=Sedan">Executive Sedans</Link>
          <Link href="/cars?category=SUV">Luxury 4x4 SUVs</Link>
          <Link href="/cars?category=Sports">Sports & Prestige</Link>
          <Link href="/cars?category=Luxury">Chauffeur & Luxury</Link>
        </div>

        <div>
          <h3>Portals & Access</h3>
          <Link href="/host" style={{ color: '#e5c058', fontWeight: 600 }}>
            ✦ Join as Host (List Cars)
          </Link>
          <Link href="/host?tab=signin">Host Dashboard Sign In</Link>
          <Link href="/renter" style={{ color: '#ffffff', fontWeight: 600 }}>
            ✦ Join as Renter (Book Cars)
          </Link>
          <Link href="/renter?tab=signin">Renter Account Sign In</Link>
          <Link href="/about">How Drive Flex Works</Link>
        </div>

        <div>
          <h3>Concierge & Support</h3>
          <p style={{ margin: '0 0 10px', color: '#aaa' }}>
            VIP Roadside & Booking Desk<br />
            Available 24 Hours / 7 Days
          </p>
          <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#fff', fontWeight: 600 }}>
            Contact Concierge <ArrowRight size={13} />
          </Link>
          <p style={{ marginTop: '12px', fontSize: '0.75rem', color: '#777' }}>
            Operating in Lahore, Karachi, Islamabad & Rawalpindi.
          </p>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 Drive Flex Rental Car LLC · All Rights Reserved</span>
        <span>Secured Marketplace & Verified Host Network</span>
      </div>
    </footer>
  );
}
