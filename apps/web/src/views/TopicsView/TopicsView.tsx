import { getTopics } from '@/entities/topic/api/getTopics';
import { TopicManager } from '@/features/topic-create/ui/TopicManager';

import styles from './TopicsView.module.css';

export async function TopicsView() {
  const topics = await getTopics();

  return (
    <main className="container">
      <header className={styles.header}>
        <p className="label">Knowledge base</p>
        <h1 className={styles.title}>Topics</h1>
        <p className={styles.lead}>
          Topics group articles. A topic can only be removed once no article uses it.
        </p>
      </header>

      <TopicManager topics={topics.data} />
    </main>
  );
}
