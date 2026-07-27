'use client';

import { ARTICLE_LIMITS, LANGUAGES, LANGUAGE_LABELS } from '@devpraxis/shared';
import type { ReactNode } from 'react';

import styles from './ArticleMetaFields.module.css';

export interface TopicOption {
  id: string;
  name: string;
}

interface IProps {
  topics: readonly TopicOption[];
  selected?: readonly string[];
  language?: string;
  errors?: readonly string[];
  topicCreateSlot?: ReactNode;
}

export function ArticleMetaFields({
  topics,
  selected = [],
  language,
  errors,
  topicCreateSlot,
}: IProps) {
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
          <p className={styles.hint}>No topics yet — add the first one below.</p>
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

        {topicCreateSlot}

        {errors && errors.length > 0 && (
          <span className={styles.fieldError}>{errors.join('. ')}</span>
        )}
      </fieldset>

      <label className={styles.field}>
        <span className={styles.label}>Language</span>
        <select className={styles.select} name="language" defaultValue={language ?? LANGUAGES[0]}>
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
