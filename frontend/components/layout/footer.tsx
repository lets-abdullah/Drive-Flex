'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link href="/" className="brand" data-testid="link-footer-brand">
            <img src="/logo.png" alt="Drive Flex" />
            <span className="brand-wordmark">Drive <span>Flex</span></span>
          </Link>
          <p>Premium cars. Powerful choices.<br />Simple booking.</p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/">Browse fleet</Link>
          <Link href="/about">Our story</Link>
          <Link href="/owner/onboard">Join Drive Flex</Link>
        </div>
        <div>
          <h3>Account</h3>
          <Link href="/sign-in">Sign in</Link>
          <Link href="/profile">Profile</Link>
        </div>
        <div>
          <h3>Talk to us</h3>
          <p>Monday — Friday<br />8:00 AM — 6:00 PM EST</p>
          <Link href="/contact">
            Contact concierge <ArrowRight size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Drive Flex Rental Car LLC</span>
        <span>Frontend prototype — no real reservations or payments.</span>
      </div>
    </footer>
  );
}
