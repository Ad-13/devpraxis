'use client';

import { useEffect, useState } from 'react';

import type { TocItem } from '@/shared/lib/toc';

import styles from './ArticleToc.module.css';

interface IProps {
  headings: readonly TocItem[];
}

export function ArticleToc({ headings }: IProps) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? '');

  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) setActiveId(visible[0].target.id);
      },
      {
        rootMargin: '-88px 0px -68% 0px',
        threshold: 0,
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className={styles.toc} aria-label="Table of contents">
      <p className={styles.head}>Contents</p>

      <ol className={styles.list}>
        {headings.map((heading) => (
          <li key={heading.id} data-level={heading.level}>
            <a
              href={`#${heading.id}`}
              className={heading.id === activeId ? `${styles.item} ${styles.active}` : styles.item}
              aria-current={heading.id === activeId ? 'location' : undefined}
            >
              <span className={styles.marker} aria-hidden="true" />
              <span className={styles.text}>{heading.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
