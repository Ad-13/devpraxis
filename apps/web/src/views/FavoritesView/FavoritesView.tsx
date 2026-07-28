import Link from 'next/link';

import { getFavorites } from '@/entities/article/api/getFavorites';
import { ArticleCard } from '@/entities/article/ui/ArticleCard';
import { getTopics } from '@/entities/topic/api/getTopics';

import styles from './FavoritesView.module.css';

export async function FavoritesView() {
  const [favorites, topics] = await Promise.all([getFavorites(), getTopics()]);
  const topicNames = new Map(topics.data.map((topic) => [topic.id, topic.name]));

  return (
    <main className="container">
      <header className={styles.header}>
        <p className="label">Your workspace</p>
        <h1 className={styles.title}>Saved articles</h1>
      </header>

      {favorites.data.length === 0 ? (
        <p className={styles.empty}>
          Nothing saved yet. Star an article on the <Link href="/">feed</Link> to keep it here.
        </p>
      ) : (
        <ul className={styles.list}>
          {favorites.data.map((article) => (
            <li key={article.id}>
              <ArticleCard article={article} topicNames={topicNames} isAuthenticated />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
