'use client';

import { useActionState } from 'react';

import { uploadArticleAction } from '../model/actions';
import { INITIAL_ARTICLE_STATE } from '../model/types';

import { ArticleMetaFields, type TopicOption } from './ArticleMetaFields';
import styles from './ArticleCreate.module.css';
import { ARTICLE_LIMITS } from '@devpraxis/shared';

export function ArticleUploadForm({ topics }: { topics: readonly TopicOption[] }) {
  const [state, formAction, isPending] = useActionState(uploadArticleAction, INITIAL_ARTICLE_STATE);

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.message && (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      )}

      <label className={styles.field}>
        <span className={styles.label}>Markdown file</span>
        <input
          className={styles.file}
          type="file"
          name="file"
          accept=".md,text/markdown"
          required
        />
        <span className={styles.hint}>
          Up to {ARTICLE_LIMITS.uploadMaxBytes / 1_000_000} MB. The first level-one heading becomes
          the title; without one, the file name is used. A file selection cannot be restored after
          an error — you would have to pick it again.
        </span>
      </label>

      <ArticleMetaFields topics={topics} state={state} />

      <button type="submit" className={styles.submit} disabled={isPending}>
        {isPending ? 'Uploading…' : 'Upload and publish'}
      </button>
    </form>
  );
}
