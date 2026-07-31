import type { Metadata } from 'next';

import { TopicsView } from '@/views/TopicsView';
import { Protected } from '@/features/auth/ui';

export const metadata: Metadata = {
  title: 'Topics — DevPraxis',
};

export default function TopicsPage() {
  return (
    <Protected>
      <TopicsView />
    </Protected>
  );
}
