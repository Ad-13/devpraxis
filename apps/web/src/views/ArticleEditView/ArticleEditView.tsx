import Link from 'next/link';

import { getArticleBySlug } from '@/entities/article/api/getArticleBySlug';
import { getTopics } from '@/entities/topic/api/getTopics';
import { ArticleEditForm } from '@/features/article-edit';

import styles from './ArticleEditView.module.css';

interface IProps {
  slug: string;
}

export async function ArticleEditView({ slug }: IProps) {
  const [result, topics] = await Promise.all([getArticleBySlug(slug), getTopics()]);

  if (!result) return null;

  const article = result.data;

  return (
    <main className="container">
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/my">← Back to my articles</Link>
      </nav>

      <header className={styles.header}>
        <p className="label">Editing · {article.status}</p>
        <h1 className={styles.title}>{article.title}</h1>
        <p className={styles.hint}>
          The URL stays <code>/articles/{article.slug}</code> even if you change the title, so
          existing links keep working.
        </p>
      </header>

      <ArticleEditForm
        article={{
          id: article.id,
          slug: article.slug,
          title: article.title,
          content: article.content,
          topicIds: article.topicIds,
          language: article.language,
        }}
        topics={topics.data}
      />
    </main>
  );
}
