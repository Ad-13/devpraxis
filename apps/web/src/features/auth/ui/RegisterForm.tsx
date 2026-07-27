'use client';

import { AUTH_LIMITS } from '@devpraxis/shared';
import { useActionState } from 'react';

import { registerAction } from '../model/actions';
import { INITIAL_AUTH_STATE } from '../model/types';

import styles from './AuthForm.module.css';

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, INITIAL_AUTH_STATE);

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.message && (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      )}

      <label className={styles.field}>
        <span className={styles.label}>Name</span>
        <input
          className={styles.input}
          type="text"
          name="name"
          autoComplete="name"
          required
          minLength={AUTH_LIMITS.nameMin}
          maxLength={AUTH_LIMITS.nameMax}
          defaultValue={state.values?.name ?? ''}
          aria-invalid={state.fieldErrors?.name ? true : undefined}
          aria-describedby={state.fieldErrors?.name ? 'name-error' : undefined}
        />
        {state.fieldErrors?.name && (
          <span id="name-error" className={styles.fieldError}>
            {state.fieldErrors.name.join('. ')}
          </span>
        )}
      </label>

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
          autoComplete="new-password"
          required
          minLength={AUTH_LIMITS.passwordMin}
          maxLength={AUTH_LIMITS.passwordMax}
          aria-invalid={state.fieldErrors?.password ? true : undefined}
          aria-describedby={state.fieldErrors?.password ? 'password-error' : undefined}
        />
        <span className={styles.hint}>At least {AUTH_LIMITS.passwordMin} characters.</span>
        {state.fieldErrors?.password && (
          <span id="password-error" className={styles.fieldError}>
            {state.fieldErrors.password.join('. ')}
          </span>
        )}
      </label>

      <button type="submit" className={styles.submit} disabled={isPending}>
        {isPending ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
