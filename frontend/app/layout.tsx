import type { Metadata } from 'next';
import '../styles/globals.css';
import { LocationProvider } from '@/context/location-context';
import { ChangeLocationModal } from '@/components/location/change-location-modal';
import { RenterAuthModal } from '@/components/auth/renter-auth-modal';

export const metadata: Metadata = {
  title: 'Drive Flex',
  description: 'A premium car-rental marketplace for discovering verified vehicles, exploring trusted owners, and previewing date-based bookings.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LocationProvider>
          {children}
          <ChangeLocationModal />
          <RenterAuthModal />
        </LocationProvider>
      </body>
    </html>
  );
}
