'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@/types';
import { getSession } from '@/utils/helpers';

export function useSession() {
  const [session, setValue] = useState<Session | null>(null);

  useEffect(() => {
    setValue(getSession());
    const sync = () => setValue(getSession());
    window.addEventListener('driveflex-session', sync);
    return () => window.removeEventListener('driveflex-session', sync);
  }, []);

  return session;
}
