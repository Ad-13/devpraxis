'use client';

import { ARTICLE_LIMITS } from '@devpraxis/shared';
import { useActionState } from 'react';

import { ArticleMetaFields, type TopicOption } from '@/entities/article/ui/ArticleMetaFields';
import { TopicQuickCreate } from '@/features/topic-create';

import { uploadArticleAction } from '../model/actions';
import { INITIAL_ARTICLE_STATE } from '../model/types';

import styles from './ArticleCreate.module.css';

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

      <ArticleMetaFields
        topics={topics}
        selected={state.values?.topicIds}
        language={state.values?.language}
        errors={state.fieldErrors?.topicIds}
        topicCreateSlot={<TopicQuickCreate />}
      />

      <div className={styles.buttons}>
        <button
          type="submit"
          name="intent"
          value="publish"
          className={styles.submit}
          disabled={isPending}
        >
          {isPending ? 'Working…' : 'Upload and publish'}
        </button>
        <button
          type="submit"
          name="intent"
          value="draft"
          className={styles.secondary}
          disabled={isPending}
        >
          Upload as draft
        </button>
      </div>
    </form>
  );
}
