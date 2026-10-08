'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, UserRound, X, LogOut, LayoutDashboard, Car, PlusCircle } from 'lucide-react';
import { useSession } from '@/hooks/use-session';
import { setSession } from '@/utils/helpers';

const navLinks = [
  ['/', 'Home'],
  ['/cars', 'All Fleet'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
] as const;

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = usePathname();
  const router = useRouter();
  const session = useSession();

  const handleSignOut = () => {
    setSession(null);
    setMenuOpen(false);
    router.push('/');
  };

  const isHost = session?.role === 'host';

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" className="brand" data-testid="link-brand">
          <img src="/logo.png" alt="Drive Flex" />
          <span className="brand-wordmark">
            Drive <span>Flex</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary navigation">
          {navLinks.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={location === href ? 'page' : undefined}
              data-testid={`link-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {label}
            </Link>
          ))}
          {/* Host quick link in nav if logged in as host */}
          {isHost && (
            <Link
              href="/owner/dashboard"
              aria-current={location === '/owner/dashboard' ? 'page' : undefined}
              className="gold-text"
              data-testid="link-nav-host-dashboard"
            >
              Host Dashboard
            </Link>
          )}
        </nav>

        <div className="nav-actions">
          {session ? (
            <>
              {isHost ? (
                <>
                  <Link
                    className="btn btn-outline btn-sm"
                    href="/owner/cars/new"
                    data-testid="link-nav-add-car"
                  >
                    <PlusCircle size={14} /> List Car
                  </Link>
                  <Link
                    className="btn btn-gold btn-sm"
                    href="/owner/dashboard"
                    data-testid="link-nav-dashboard"
                  >
                    <LayoutDashboard size={14} /> {session.businessName || session.name}
                  </Link>
                </>
              ) : (
                <Link
                  className="btn btn-outline btn-sm"
                  href="/profile"
                  data-testid="link-nav-profile"
                >
                  <UserRound size={14} /> {session.name}
                </Link>
              )}

              {/* Dedicated Sign Out Button */}
              <button
                type="button"
                onClick={handleSignOut}
                className="btn btn-ghost btn-sm signout-btn"
                title="Sign out of your account"
                data-testid="button-nav-signout"
              >
                <LogOut size={14} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost btn-sm" href="/renter" data-testid="link-nav-join-renter">
                Join as Renter
              </Link>
              <Link
                className="btn btn-gold btn-sm"
                href="/host"
                data-testid="link-nav-join-host"
              >
                Join as Host
              </Link>
            </>
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

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`}>
        {navLinks.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMenuOpen(false)}
            data-testid={`link-mobile-${label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {label}
          </Link>
        ))}

        {session ? (
          <>
            {isHost ? (
              <>
                <Link
                  href="/owner/dashboard"
                  onClick={() => setMenuOpen(false)}
                  data-testid="link-mobile-host-dashboard"
                >
                  Host Dashboard ({session.businessName || session.name})
                </Link>
                <Link
                  href="/owner/cars/new"
                  onClick={() => setMenuOpen(false)}
                  data-testid="link-mobile-add-car"
                >
                  + Add New Vehicle
                </Link>
              </>
            ) : (
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                data-testid="link-mobile-profile"
              >
                Renter Profile ({session.name})
              </Link>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="mobile-signout-btn"
              data-testid="button-mobile-signout"
            >
              <LogOut size={16} /> Sign out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/renter"
              onClick={() => setMenuOpen(false)}
              data-testid="link-mobile-join-renter"
              style={{ color: '#ffffff', fontWeight: 600 }}
            >
              ✦ Join as Renter (Book Luxury Cars)
            </Link>
            <Link
              href="/host"
              onClick={() => setMenuOpen(false)}
              data-testid="link-mobile-join-host"
              style={{ color: 'var(--gold, #c9a227)', fontWeight: 600 }}
            >
              ✦ Join as Host (List Cars & Earn)
            </Link>
            <Link
              href="/renter?tab=signin"
              onClick={() => setMenuOpen(false)}
              data-testid="link-mobile-signin-renter"
            >
              Sign in as Renter
            </Link>
            <Link
              href="/host?tab=signin"
              onClick={() => setMenuOpen(false)}
              data-testid="link-mobile-signin-host"
            >
              Sign in as Host / Lister
            </Link>
          </>
        )}
      </div>

      <style jsx>{`
        .signout-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: rgba(255, 255, 255, 0.7);
        }
        .signout-btn:hover {
          color: #ff6b81;
        }
        .mobile-signout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          color: #ff6b81;
          font-size: 1rem;
          padding: 0.75rem 0;
          cursor: pointer;
          text-align: left;
        }
      `}</style>
    </header>
  );
}
