'use client';

import { AI_LIMITS, type ChatMessage } from '@devpraxis/shared';
import { useEffect, useRef, useState, useTransition, type SubmitEvent } from 'react';

import { sendChatMessageAction } from '../model/actions';

import styles from './PrepCoachChat.module.css';
import { Button } from '@/shared/ui/Button';

const SUGGESTIONS = [
  'Explain the event loop in Node.js',
  'What is the difference between RSC and SSR?',
  'How would you design a rate limiter?',
];

export function PrepCoachChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isPending]);

  function send(text: string) {
    const content = text.trim();
    if (!content || isPending) return;

    const newMessage: ChatMessage = { role: 'user', content };

    const next: ChatMessage[] = [...messages, newMessage].slice(-AI_LIMITS.chatMessagesMax);

    setMessages(next);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';

    startTransition(async () => {
      const result = await sendChatMessageAction(next);

      if (result.ok) {
        setMessages((current) => [...current, { role: 'assistant', content: result.reply }]);
      } else {
        setError(result.message);
      }
    });
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    send(inputRef.current?.value ?? '');
  }

  return (
    <div className={styles.chat}>
      <div className={styles.thread} role="log" aria-live="polite">
        {messages.length === 0 && (
          <div className={styles.intro}>
            <p className={styles.introText}>
              Prep Coach answers from the articles in this knowledge base. It will decline anything
              outside programming.
            </p>
            <div className={styles.suggestions}>
              {SUGGESTIONS.map((text) => (
                <Button
                  key={text}
                  className={styles.suggestion}
                  variant="quiet"
                  onClick={() => send(text)}
                >
                  {text}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <article
            key={index}
            className={message.role === 'user' ? styles.userMessage : styles.coachMessage}
          >
            <span className={styles.role}>{message.role === 'user' ? 'You' : 'Coach'}</span>
            <p className={styles.text}>{message.content}</p>
          </article>
        ))}

        {isPending && (
          <p className={styles.thinking} role="status">
            <span className={styles.spinner} aria-hidden="true" />
            Thinking — it may search the knowledge base first.
          </p>
        )}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className={styles.composer}>
        <label htmlFor="coach-input" className="visually-hidden">
          Your question
        </label>
        <input
          id="coach-input"
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="Ask about anything technical…"
          maxLength={AI_LIMITS.chatMessageLength}
          disabled={isPending}
          autoComplete="off"
        />
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? 'Asking…' : 'Ask'}
        </Button>
      </form>
    </div>
  );
}
