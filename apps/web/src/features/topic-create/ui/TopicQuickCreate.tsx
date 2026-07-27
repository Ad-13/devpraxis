'use client';

import { TOPIC_LIMITS } from '@devpraxis/shared';
import { useRef, useState, useTransition, type KeyboardEvent } from 'react';

import { createTopicAction } from '../model/actions';

import styles from './TopicQuickCreate.module.css';

export function TopicQuickCreate() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    const name = inputRef.current?.value.trim() ?? '';
    if (!name) return;

    startTransition(async () => {
      setError(null);
      const result = await createTopicAction(name);

      if (result.ok) {
        if (inputRef.current) inputRef.current.value = '';
      } else {
        setError(result.message ?? 'Something went wrong.');
      }
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    submit();
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="Add a topic…"
          maxLength={TOPIC_LIMITS.nameMax}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          aria-label="New topic name"
        />
        <button type="button" className={styles.button} onClick={submit} disabled={isPending}>
          {isPending ? 'Adding…' : 'Add'}
        </button>
      </div>

      {error && (
        <span className={styles.error} role="status">
          {error}
        </span>
      )}
    </div>
  );
}
