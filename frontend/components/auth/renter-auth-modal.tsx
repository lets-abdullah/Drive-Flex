'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Heart, Sparkles, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useSession } from '@/hooks/use-session';

export function RenterAuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const session = useSession();

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener('driveflex-open-renter-auth', handleOpen);
    return () => {
      window.removeEventListener('driveflex-open-renter-auth', handleOpen);
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isHost = session?.role === 'host';

  return (
    <div className="renter-auth-modal-backdrop" onClick={() => setIsOpen(false)}>
      <div
        className="renter-auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="renter-modal-title"
      >
        <button
          className="modal-close-btn"
          onClick={() => setIsOpen(false)}
          aria-label="Close dialog"
          data-testid="btn-close-renter-modal"
        >
          <X size={18} />
        </button>

        <div className="modal-icon-badge">
          <Heart size={28} className="gold-heart-icon" fill="currentColor" />
        </div>

        <div className="modal-eyebrow">
          <Sparkles size={13} className="sparkle-icon" />
          <span>RENTER ACCOUNT REQUIRED</span>
        </div>

        <h2 id="renter-modal-title" className="modal-heading">
          {isHost ? 'Renter Account Needed' : 'Sign In to Bookmark Vehicles'}
        </h2>

        <p className="modal-subtext">
          {isHost
            ? 'You are currently signed in as a Host. Bookmarking and saving favorite listings is reserved for Renter accounts. Please register or sign in as a Renter.'
            : 'Jab tak aap Renter account create ya sign in nahi karenge, tab tak listings ko bookmark nahi kiya ja sakta. Create an account in under 60 seconds to save your favorite fleet.'}
        </p>

        <div className="modal-perks">
          <div className="modal-perk-item">
            <ShieldCheck size={16} className="gold-perk-icon" />
            <span>Save unlimited luxury vehicles to your personal garage</span>
          </div>
          <div className="modal-perk-item">
            <Sparkles size={16} className="gold-perk-icon" />
            <span>Track live daily rates & instant handover availability</span>
          </div>
        </div>

        <div className="modal-action-buttons">
          <Link
            href="/renter?tab=register"
            className="btn btn-gold modal-btn"
            onClick={() => setIsOpen(false)}
            data-testid="modal-btn-create-renter"
          >
            <UserPlus size={16} />
            <span>Create Renter Account</span>
            <ArrowRight size={15} />
          </Link>

          <Link
            href="/renter?tab=signin"
            className="btn btn-outline modal-btn"
            onClick={() => setIsOpen(false)}
            data-testid="modal-btn-signin-renter"
          >
            <LogIn size={16} />
            <span>Sign In as Renter</span>
          </Link>
        </div>

        <button
          type="button"
          className="modal-dismiss-link"
          onClick={() => setIsOpen(false)}
        >
          Continue Browsing Without Saving
        </button>
      </div>

      <style jsx>{`
        .renter-auth-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(10px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem;
          animation: fadeIn 0.2s ease-out;
        }

        .renter-auth-modal-card {
          position: relative;
          background: #141418;
          border: 1px solid rgba(201, 162, 39, 0.35);
          border-radius: 18px;
          padding: 2.25rem 2rem 2rem;
          max-width: 480px;
          width: 100%;
          text-align: center;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(201, 162, 39, 0.12);
          animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-close-btn {
          position: absolute;
          top: 1.15rem;
          right: 1.15rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.65);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
          transform: scale(1.05);
        }

        .modal-icon-badge {
          width: 60px;
          height: 60px;
          margin: 0 auto 1.25rem;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201, 162, 39, 0.2) 0%, rgba(201, 162, 39, 0.05) 70%);
          border: 1px solid rgba(201, 162, 39, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 24px rgba(201, 162, 39, 0.25);
        }

        :global(.gold-heart-icon) {
          color: var(--gold, #c9a227);
        }

        .modal-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.3);
          color: var(--gold, #c9a227);
          padding: 0.3rem 0.8rem;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          margin-bottom: 0.85rem;
        }

        .modal-heading {
          font-size: 1.55rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 0.75rem;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .modal-subtext {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.55;
          margin: 0 0 1.5rem;
        }

        .modal-perks {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 0.9rem 1rem;
          margin-bottom: 1.6rem;
          text-align: left;
        }

        .modal-perk-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.83rem;
          color: rgba(255, 255, 255, 0.85);
        }

        :global(.gold-perk-icon) {
          color: var(--gold, #c9a227);
          flex-shrink: 0;
        }

        .modal-action-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.15rem;
        }

        .modal-btn {
          width: 100%;
          justify-content: center;
          padding: 0.85rem 1rem;
          font-size: 0.92rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .modal-dismiss-link {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.45);
          font-size: 0.82rem;
          cursor: pointer;
          transition: color 0.15s ease;
          padding: 0.4rem;
        }
        .modal-dismiss-link:hover {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: underline;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: scale(0.94) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @media (max-width: 480px) {
          .renter-auth-modal-card {
            padding: 1.75rem 1.25rem 1.5rem;
          }
          .modal-heading {
            font-size: 1.35rem;
          }
        }
      `}</style>
    </div>
  );
}
