'use client';

import { ARTICLE_LIMITS, type Language } from '@devpraxis/shared';
import Link from 'next/link';
import { useActionState } from 'react';

import { ArticleMetaFields, type TopicOption } from '@/entities/article/ui/ArticleMetaFields';
import { INITIAL_ARTICLE_STATE } from '@/features/article-create/model/types';
import { TopicQuickCreate } from '@/features/topic-create';

import { updateArticleAction } from '../model/actions';

import styles from './ArticleEdit.module.css';
import { Button, buttonClass } from '@/shared/ui/Button';

interface IProps {
  article: {
    id: string;
    slug: string;
    title: string;
    content: string;
    topicIds: string[];
    language: Language;
  };
  topics: readonly TopicOption[];
}

export function ArticleEditForm({ article, topics }: IProps) {
  const action = updateArticleAction.bind(null, article.id);
  const [state, formAction, isPending] = useActionState(action, INITIAL_ARTICLE_STATE);

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
          defaultValue={state.values?.title ?? article.title}
          aria-invalid={state.fieldErrors?.title ? true : undefined}
        />
        {state.fieldErrors?.title && (
          <span className={styles.fieldError}>{state.fieldErrors.title.join('. ')}</span>
        )}
      </label>

      <ArticleMetaFields
        topics={topics}
        selected={state.values?.topicIds ?? article.topicIds}
        language={state.values?.language ?? article.language}
        errors={state.fieldErrors?.topicIds}
        topicCreateSlot={<TopicQuickCreate />}
      />

      <label className={styles.field}>
        <span className={styles.label}>Content — markdown</span>
        <textarea
          className={styles.textarea}
          name="content"
          rows={24}
          required
          defaultValue={state.values?.content ?? article.content}
          aria-invalid={state.fieldErrors?.content ? true : undefined}
        />
        {state.fieldErrors?.content && (
          <span className={styles.fieldError}>{state.fieldErrors.content.join('. ')}</span>
        )}
      </label>

      <div className={styles.buttons}>
        <Button type="submit" variant="primary" value="publish" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
        <Link href={`/articles/${article.slug}`} className={buttonClass({ variant: 'quiet' })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
