'use client';

import { useActionState } from 'react';

import { loginAction } from '../model/actions';
import { INITIAL_AUTH_STATE } from '../model/types';

import styles from './AuthForm.module.css';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, INITIAL_AUTH_STATE);

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.message && (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      )}

      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input
          className={styles.input}
          type="email"
          name="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email ?? ''}
          aria-invalid={state.fieldErrors?.email ? true : undefined}
          aria-describedby={state.fieldErrors?.email ? 'email-error' : undefined}
        />
        {state.fieldErrors?.email && (
          <span id="email-error" className={styles.fieldError}>
            {state.fieldErrors.email.join('. ')}
          </span>
        )}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Password</span>
        <input
          className={styles.input}
          type="password"
          name="password"
          autoComplete="current-password"
          required
          aria-invalid={state.fieldErrors?.password ? true : undefined}
          aria-describedby={state.fieldErrors?.password ? 'password-error' : undefined}
        />
        {state.fieldErrors?.password && (
          <span id="password-error" className={styles.fieldError}>
            {state.fieldErrors.password.join('. ')}
          </span>
        )}
      </label>

      <button type="submit" className={styles.submit} disabled={isPending}>
        {isPending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
