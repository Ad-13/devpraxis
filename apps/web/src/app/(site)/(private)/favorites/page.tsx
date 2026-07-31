import type { Metadata } from 'next';

import { FavoritesView } from '@/views/FavoritesView';
import { Protected } from '@/features/auth/ui';

export const metadata: Metadata = {
  title: 'Saved articles — DevPraxis',
};

export default function FavoritesPage() {
  return (
    <Protected>
      <FavoritesView />
    </Protected>
  );
}
