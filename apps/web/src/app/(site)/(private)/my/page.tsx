import type { Metadata } from 'next';

import { MyArticlesView } from '@/views/MyArticlesView';
import { Protected } from '@/features/auth/ui';

export const metadata: Metadata = {
  title: 'My articles — DevPraxis',
};

interface IProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function MyArticlesPage({ searchParams }: IProps) {
  return (
    <Protected>
      <MyArticlesView searchParams={searchParams} />
    </Protected>
  );
}
