import type { Metadata } from 'next';

import { RegisterForm } from '@/features/auth/ui';
import { AuthView } from '@/views/AuthView';

export const metadata: Metadata = {
  title: 'Create account — DevPraxis',
};

export default function RegisterPage() {
  return (
    <AuthView
      title="Create an account"
      subtitle="Publish your notes and turn them into interview practice."
      footer={{ question: 'Already registered?', href: '/login', action: 'Sign in' }}
    >
      <RegisterForm />
    </AuthView>
  );
}
