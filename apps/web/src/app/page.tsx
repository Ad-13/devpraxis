import { getArticleFeed } from '@/entities/article/api/getArticleFeed';
import { isApiClientError } from '@/shared/api';

export default async function HomePage() {
  let data, meta;
  try {
    const { data: data1, meta: meta1 } = await getArticleFeed({ limit: 5 });
    data = data1;
    meta = meta1;
  } catch (error) {
    if (isApiClientError(error)) {
      return (
        <main>
          API error {error.status}: {error.message}
        </main>
      );
    }
    throw error;
  }

  return (
    <main>
      <p>total: {meta?.total ?? 0}</p>
      <ul>
        {data.map((article) => (
          <li key={article.id}>{article.title}</li>
        ))}
      </ul>
    </main>
  );
}
