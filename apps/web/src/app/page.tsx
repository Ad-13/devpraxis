import { ArticleFeedView } from '@/views/article-feed';

interface IProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function HomePage({ searchParams }: IProps) {
  return <ArticleFeedView searchParams={searchParams} />;
}
