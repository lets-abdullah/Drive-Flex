'use client';

import Link from 'next/link';
import { Layout } from '@/components/layout';

export default function NotFound() {
  return (
    <Layout>
      <main className="not-found">
        <div>
          <div className="eyebrow">Page not found</div>
          <h1>That route took a detour.</h1>
          <p className="muted">The page you're looking for doesn't exist, or it moved.</p>
          <Link className="btn btn-primary" href="/">Back to Drive Flex</Link>
        </div>
      </main>
    </Layout>
  );
}
