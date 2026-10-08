import { Suspense } from 'react';
import { AuthPage } from '@/components/auth/auth-page';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading registration...</div>}>
      <AuthPage mode="register" />
    </Suspense>
  );
}
