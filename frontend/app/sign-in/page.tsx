import { Suspense } from 'react';
import { AuthPage } from '@/components/auth/auth-page';

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading sign in...</div>}>
      <AuthPage mode="signin" />
    </Suspense>
  );
}
