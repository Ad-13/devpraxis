import Link from 'next/link';

import styles from './Footer.module.css';

const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brandBlock}>
          <p className={styles.brand}>DevPraxis</p>
          <p className={styles.tagline}>
            Notes become practice: summaries, interview questions and reviewed translations over a
            shared knowledge base.
          </p>
        </div>

        <nav className={styles.column} aria-label="Footer">
          <p className={styles.columnHead}>Navigate</p>
          <Link href="/" className={styles.navLink}>
            Feed
          </Link>
          <Link href="/topics" className={styles.navLink}>
            Topics
          </Link>
          <Link href="/coach" className={styles.navLink}>
            Prep Coach
          </Link>
        </nav>

        <div className={styles.column}>
          <p className={styles.columnHead}>Stack</p>
          <span className={styles.stackLine}>Next 16 · React 19</span>
          <span className={styles.stackLine}>Node 24 · Express 5</span>
          <span className={styles.stackLine}>MongoDB · Zod · Ollama</span>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>© {YEAR} DevPraxis</span>
        <span className={styles.marker} aria-hidden="true" />
        <span>Built as a full-stack reference project</span>
      </div>
    </footer>
  );
}
