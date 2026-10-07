'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, UserRound, X } from 'lucide-react';
import { useSession } from '@/hooks/use-session';

const navLinks = [['/', 'Home'], ['/about', 'About'], ['/contact', 'Contact']] as const;

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = usePathname();
  const session = useSession();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" className="brand" data-testid="link-brand">
          <img src="/logo.png" alt="Drive Flex" />
          <span className="brand-wordmark">Drive <span>Flex</span></span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          {navLinks.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={location === href ? 'page' : undefined}
              data-testid={`link-nav-${label.toLowerCase()}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          {session ? (
            <Link className="btn btn-outline btn-sm" href="/profile" data-testid="link-nav-profile">
              <UserRound size={14} /> Profile
            </Link>
          ) : (
            <Link className="btn btn-ghost btn-sm" href="/sign-in" data-testid="link-nav-signin">
              Sign in
            </Link>
          )}
          {!session && (
            <Link className="btn btn-gold btn-sm" href="/owner/onboard" data-testid="link-nav-register">
              Join Drive Flex
            </Link>
          )}
        </div>
        <button
          className="nav-mobile-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          data-testid="button-mobile-menu"
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
      <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`}>
        {navLinks.map(([href, label]) => (
          <Link key={href} href={href} onClick={() => setMenuOpen(false)} data-testid={`link-mobile-${label.toLowerCase()}`}>
            {label}
          </Link>
        ))}
        {session ? (
          <Link href="/profile" onClick={() => setMenuOpen(false)} data-testid="link-mobile-profile">Profile</Link>
        ) : (
          <>
            <Link href="/sign-in" onClick={() => setMenuOpen(false)} data-testid="link-mobile-signin">Sign in</Link>
            <Link href="/owner/onboard" onClick={() => setMenuOpen(false)} data-testid="link-mobile-register">Join Drive Flex</Link>
          </>
        )}
      </div>
    </header>
  );
}
