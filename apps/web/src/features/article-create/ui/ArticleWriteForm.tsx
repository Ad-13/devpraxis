'use client';

import { ARTICLE_LIMITS } from '@devpraxis/shared';
import { useActionState } from 'react';

import { createArticleAction } from '../model/actions';
import { INITIAL_ARTICLE_STATE } from '../model/types';

import { ArticleMetaFields, type TopicOption } from './ArticleMetaFields';
import styles from './ArticleCreate.module.css';

export function ArticleWriteForm({ topics }: { topics: readonly TopicOption[] }) {
  const [state, formAction, isPending] = useActionState(createArticleAction, INITIAL_ARTICLE_STATE);

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.message && (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      )}

      <label className={styles.field}>
        <span className={styles.label}>Title</span>
        <input
          className={styles.input}
          type="text"
          name="title"
          required
          minLength={ARTICLE_LIMITS.titleMin}
          maxLength={ARTICLE_LIMITS.titleMax}
          defaultValue={state.values?.title ?? ''}
          aria-invalid={state.fieldErrors?.title ? true : undefined}
        />
        {state.fieldErrors?.title && (
          <span className={styles.fieldError}>{state.fieldErrors.title.join('. ')}</span>
        )}
      </label>

      <ArticleMetaFields topics={topics} state={state} />

      <label className={styles.field}>
        <span className={styles.label}>Content — markdown</span>
        <textarea
          className={styles.textarea}
          name="content"
          rows={20}
          required
          defaultValue={state.values?.content ?? ''}
          aria-invalid={state.fieldErrors?.content ? true : undefined}
        />
        {state.fieldErrors?.content && (
          <span className={styles.fieldError}>{state.fieldErrors.content.join('. ')}</span>
        )}
      </label>

      <button type="submit" className={styles.submit} disabled={isPending}>
        {isPending ? 'Publishing…' : 'Publish article'}
      </button>
    </form>
  );
}
