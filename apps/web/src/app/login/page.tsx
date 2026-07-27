import type { Metadata } from 'next';

import { LoginForm } from '@/features/auth/ui';
import { AuthView } from '@/views/AuthView';

export const metadata: Metadata = {
  title: 'Sign in — DevPraxis',
};

export default function LoginPage() {
  return (
    <AuthView
      title="Welcome back"
      subtitle="Sign in to save articles and use the AI assistant."
      footer={{ question: 'No account yet?', href: '/register', action: 'Create one' }}
    >
      <LoginForm />
    </AuthView>
  );
}
