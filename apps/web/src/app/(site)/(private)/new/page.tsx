import type { Metadata } from 'next';

import { ArticleCreateView } from '@/views/ArticleCreateView';
import { Protected } from '@/features/auth/ui';

export const metadata: Metadata = {
  title: 'New article — DevPraxis',
};

interface IProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function NewArticlePage({ searchParams }: IProps) {
  return (
    <Protected>
      <ArticleCreateView searchParams={searchParams} />
    </Protected>
  );
}
