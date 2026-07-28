'use client';

import { LANGUAGES, LANGUAGE_LABELS, type Language } from '@devpraxis/shared';
import { useState, useTransition } from 'react';

import {
  generateQuestionsAction,
  generateSummaryAction,
  translateArticleAction,
  type QuestionItem,
} from '../model/actions';

import styles from './ArticleAiPanel.module.css';

interface IProps {
  articleId: string;
  articleLanguage: Language;
}

type Output =
  | { kind: 'none' }
  | { kind: 'summary'; text: string }
  | { kind: 'questions'; items: QuestionItem[] };

export function ArticleAiPanel({ articleId, articleLanguage }: IProps) {
  const [isPending, startTransition] = useTransition();
  const [output, setOutput] = useState<Output>({ kind: 'none' });
  const [error, setError] = useState<string | null>(null);
  const [busyLabel, setBusyLabel] = useState('');

  const targets = LANGUAGES.filter((code) => code !== articleLanguage);

  function summarise() {
    setBusyLabel('Summarising');
    startTransition(async () => {
      setError(null);
      const result = await generateSummaryAction(articleId);
      if (result.ok) setOutput({ kind: 'summary', text: result.data });
      else setError(result.message);
    });
  }

  function askQuestions() {
    setBusyLabel('Writing questions');
    startTransition(async () => {
      setError(null);
      const result = await generateQuestionsAction(articleId);
      if (result.ok) setOutput({ kind: 'questions', items: result.data });
      else setError(result.message);
    });
  }

  function translate(target: Language) {
    setBusyLabel(`Translating to ${LANGUAGE_LABELS[target]}`);
    startTransition(async () => {
      setError(null);
      const result = await translateArticleAction(articleId, target);
      if (result && !result.ok) setError(result.message);
    });
  }

  return (
    <section className={styles.panel} aria-labelledby="ai-tools-title">
      <div className={styles.head}>
        <h2 id="ai-tools-title" className={styles.heading}>
          AI tools
        </h2>
        <p className={styles.note}>
          Runs a language model over this article. Answers take a few seconds.
        </p>
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.button} onClick={summarise} disabled={isPending}>
          Summarise
        </button>

        <button type="button" className={styles.button} onClick={askQuestions} disabled={isPending}>
          Interview questions
        </button>

        {targets.map((code) => (
          <button
            key={code}
            type="button"
            className={styles.button}
            onClick={() => translate(code)}
            disabled={isPending}
          >
            Translate → {LANGUAGE_LABELS[code]}
          </button>
        ))}
      </div>

      {isPending && (
        <p className={styles.pending} role="status">
          <span className={styles.spinner} aria-hidden="true" />
          {busyLabel}… this can take a while.
        </p>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!isPending && output.kind === 'summary' && (
        <div className={styles.result}>
          <h3 className={styles.resultTitle}>Summary</h3>
          <p className={styles.summary}>{output.text}</p>
        </div>
      )}

      {!isPending && output.kind === 'questions' && (
        <div className={styles.result}>
          <h3 className={styles.resultTitle}>Interview questions</h3>
          <ol className={styles.questions}>
            {output.items.map((item, index) => (
              <li key={index}>
                <details className={styles.question}>
                  <summary>{item.question}</summary>
                  <p className={styles.answer}>{item.answer}</p>
                </details>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
