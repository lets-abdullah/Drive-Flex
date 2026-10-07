'use client';

import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import { findOwnerById } from '@/data/owners';
import { getDemoOwner } from '@/utils/helpers';

export function OwnerIdentity({ ownerId, compact = false }: { ownerId: string; compact?: boolean }) {
  const owner = findOwnerById(ownerId) || getDemoOwner();
  if (!owner) return null;
  return (
    <Link
      className={`owner-identity ${compact ? 'owner-identity-compact' : ''}`}
      href={`/owners/${owner.slug}`}
      aria-label={`View ${owner.businessName} owner profile`}
      data-testid={`link-owner-${ownerId}`}
    >
      <img src={owner.logoImage || owner.profileImage} alt={`${owner.businessName} profile`} />
      <span>
        <strong>{owner.businessName}</strong>
        <small><BadgeCheck size={12} /> Verified Owner</small>
      </span>
    </Link>
  );
}
