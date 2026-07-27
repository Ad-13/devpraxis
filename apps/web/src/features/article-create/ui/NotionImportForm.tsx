'use client';

import { useActionState } from 'react';

import { importNotionAction } from '../model/actions';
import { INITIAL_ARTICLE_STATE } from '../model/types';

import { ArticleMetaFields, type TopicOption } from './ArticleMetaFields';
import styles from './ArticleCreate.module.css';

export function NotionImportForm({ topics }: { topics: readonly TopicOption[] }) {
  const [state, formAction, isPending] = useActionState(importNotionAction, INITIAL_ARTICLE_STATE);

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.message && (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      )}

      <label className={styles.field}>
        <span className={styles.label}>Notion page ID</span>
        <input
          className={styles.input}
          type="text"
          name="pageId"
          required
          defaultValue={state.values?.pageId ?? ''}
          aria-invalid={state.fieldErrors?.pageId ? true : undefined}
        />
        <span className={styles.hint}>The 32-character identifier at the end of the page URL.</span>
        {state.fieldErrors?.pageId && (
          <span className={styles.fieldError}>{state.fieldErrors.pageId.join('. ')}</span>
        )}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Integration token</span>
        <input
          className={styles.input}
          type="password"
          name="integrationToken"
          autoComplete="off"
          required
          aria-invalid={state.fieldErrors?.integrationToken ? true : undefined}
        />
        <span className={styles.hint}>
          Used once for this import and never stored. Re-enter it for each import.
        </span>
        {state.fieldErrors?.integrationToken && (
          <span className={styles.fieldError}>{state.fieldErrors.integrationToken.join('. ')}</span>
        )}
      </label>

      <ArticleMetaFields topics={topics} state={state} />

      <button type="submit" className={styles.submit} disabled={isPending}>
        {isPending ? 'Importing…' : 'Import and publish'}
      </button>
    </form>
  );
}
