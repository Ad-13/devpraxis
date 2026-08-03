'use client';

import { useEffect, useRef, useState } from 'react';

import type { TocItem } from '@/shared/lib/toc';

import styles from './ArticleToc.module.css';

const READING_LINE_PX = 220;

interface IProps {
  headings: readonly TocItem[];
}

export function ArticleToc({ headings }: IProps) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? '');
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const recompute = () => {
      let current = headings[0]?.id ?? '';

      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (!element) continue;

        if (element.getBoundingClientRect().top <= READING_LINE_PX) current = heading.id;
        else break;
      }

      setActiveId(current);
    };

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        recompute();
      });
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    schedule();

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [headings]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const item = list.querySelector<HTMLElement>(`[data-id="${CSS.escape(activeId)}"]`);
    if (!item) return;

    const listBox = list.getBoundingClientRect();
    const itemBox = item.getBoundingClientRect();

    const margin = 24;
    const above = itemBox.top - listBox.top < margin;
    const below = itemBox.bottom - listBox.top > listBox.height - margin;

    if (!above && !below) return;

    const target = item.offsetTop - list.clientHeight / 2 + item.clientHeight / 2;
    const max = list.scrollHeight - list.clientHeight;

    list.scrollTo({
      top: Math.max(0, Math.min(target, max)),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }, [activeId]);

  if (headings.length < 2) return null;

  return (
    <nav className={styles.toc} aria-label="Table of contents">
      <p className={styles.head}>Contents</p>

      <ol className={styles.list} ref={listRef}>
        {headings.map((heading) => (
          <li key={heading.id} data-level={heading.level} data-id={heading.id}>
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
