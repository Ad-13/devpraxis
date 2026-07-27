'use client';

import { ARTICLE_LIMITS, LANGUAGES, LANGUAGE_LABELS } from '@devpraxis/shared';

import type { ArticleFormState } from '../model/types';

import styles from './ArticleCreate.module.css';

export interface TopicOption {
  id: string;
  name: string;
}

interface IProps {
  topics: readonly TopicOption[];
  state: ArticleFormState;
}

export function ArticleMetaFields({ topics, state }: IProps) {
  const selected = state.values?.topicIds ?? [];
  const language = state.values?.language ?? LANGUAGES[0];

  return (
    <>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          Topics
          <span className={styles.hint}>
            {' '}
            — pick {ARTICLE_LIMITS.topicsMin} to {ARTICLE_LIMITS.topicsMax}
          </span>
        </legend>

        {topics.length === 0 ? (
          <p className={styles.hint}>No topics yet. Ask an admin to create some.</p>
        ) : (
          <div className={styles.checkboxes}>
            {topics.map((topic) => (
              <label key={topic.id} className={styles.checkbox}>
                <input
                  type="checkbox"
                  name="topicIds"
                  value={topic.id}
                  defaultChecked={selected.includes(topic.id)}
                />
                <span>{topic.name}</span>
              </label>
            ))}
          </div>
        )}

        {state.fieldErrors?.topicIds && (
          <span className={styles.fieldError}>{state.fieldErrors.topicIds.join('. ')}</span>
        )}
      </fieldset>

      <label className={styles.field}>
        <span className={styles.label}>Language</span>
        <select className={styles.select} name="language" defaultValue={language}>
          {LANGUAGES.map((code) => (
            <option key={code} value={code}>
              {LANGUAGE_LABELS[code]}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
