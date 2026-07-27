import Link from 'next/link';

import { getTopics } from '@/entities/topic/api/getTopics';
import { ArticleUploadForm, ArticleWriteForm, NotionImportForm } from '@/features/article-create';
import type { TopicOption } from '@/entities/article/ui/ArticleMetaFields';

import styles from './ArticleCreateView.module.css';

const MODES = ['write', 'upload', 'notion'] as const;
type Mode = (typeof MODES)[number];

const MODE_LABELS: Readonly<Record<Mode, string>> = {
  write: 'Write',
  upload: 'Upload .md',
  notion: 'Import from Notion',
};

function parseMode(raw: string | string[] | undefined): Mode {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return MODES.includes(value as Mode) ? (value as Mode) : 'write';
}

interface IProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function ArticleCreateView({ searchParams }: IProps) {
  const [params, topics] = await Promise.all([searchParams, getTopics()]);
  const mode = parseMode(params.mode);
  const options: readonly TopicOption[] = topics.data.map(({ id, name }) => ({ id, name }));

  return (
    <main className="container">
      <header className={styles.header}>
        <p className="label">New article</p>
        <h1 className={styles.title}>Add to the knowledge base</h1>
      </header>

      <nav className={styles.tabs} aria-label="Creation mode">
        {MODES.map((option) => (
          <Link
            key={option}
            href={option === 'write' ? '/new' : `/new?mode=${option}`}
            className={styles.tab}
            aria-current={option === mode ? 'page' : undefined}
          >
            {MODE_LABELS[option]}
          </Link>
        ))}
      </nav>

      {mode === 'write' && <ArticleWriteForm topics={options} />}
      {mode === 'upload' && <ArticleUploadForm topics={options} />}
      {mode === 'notion' && <NotionImportForm topics={options} />}
    </main>
  );
}
