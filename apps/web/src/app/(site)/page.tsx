import { ArticleFeedView } from '@/views/ArticleFeedView';

interface IProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function HomePage({ searchParams }: IProps) {
  return <ArticleFeedView searchParams={searchParams} />;
}
