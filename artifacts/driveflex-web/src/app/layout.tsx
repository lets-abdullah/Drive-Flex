import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'Drive Flex',
  description: 'A premium car-rental marketplace for discovering verified vehicles, exploring trusted owners, and previewing date-based bookings.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}