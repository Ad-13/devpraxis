'use client';

import { useRef, useState, useTransition } from 'react';

import { generateSummaryAction } from '../model/actions';

import styles from './SummaryButton.module.css';

interface IProps {
  articleId: string;
  title: string;
}

export function SummaryButton({ articleId, title }: IProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function open() {
    dialogRef.current?.showModal();

    if (summary || isPending) return;

    startTransition(async () => {
      setError(null);
      const result = await generateSummaryAction(articleId);
      if (result.ok) setSummary(result.data);
      else setError(result.message);
    });
  }

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={open}
        aria-label={`AI summary of “${title}”`}
      >
        Summary
      </button>

      <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="summary-title">
        <div className={styles.body}>
          <p className={styles.label}>AI summary</p>
          <h2 id="summary-title" className={styles.title}>
            {title}
          </h2>

          {isPending && (
            <p className={styles.pending} role="status">
              <span className={styles.spinner} aria-hidden="true" />
              Reading the article…
            </p>
          )}

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          {summary && <p className={styles.summary}>{summary}</p>}

          <button type="button" className={styles.close} onClick={() => dialogRef.current?.close()}>
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}
