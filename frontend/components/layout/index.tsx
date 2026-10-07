import type { ReactNode } from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
