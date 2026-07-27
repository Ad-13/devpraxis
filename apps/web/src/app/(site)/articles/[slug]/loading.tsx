import styles from './loading.module.css';

export default function ArticleLoading() {
  return (
    <main className="container" aria-hidden="true">
      <div className={styles.header}>
        <span className={`${styles.bar} ${styles.tag}`} />
        <span className={`${styles.bar} ${styles.title}`} />
        <span className={`${styles.bar} ${styles.meta}`} />
      </div>

      <div className={styles.body}>
        {Array.from({ length: 8 }, (_, index) => (
          <span key={index} className={`${styles.bar} ${styles.line}`} />
        ))}
      </div>
    </main>
  );
}
