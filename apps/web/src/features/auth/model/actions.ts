'use server';

import { loginSchema, registerSchema } from '@devpraxis/shared';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { apiServer, isApiClientError } from '@/shared/api';
import { readString } from '@/shared/lib/formData';

import { relayAuthCookies } from '../lib/relayAuthCookies';
import type { AuthFormState } from './types';

interface SessionUser {
  id: string;
  name: string;
  email: string;
}

interface AuthPayload {
  user: SessionUser;
  accessToken: string;
}

function toErrorState(error: unknown, values: AuthFormState['values']): AuthFormState {
  if (isApiClientError(error)) {
    return { status: 'error', message: error.message, values };
  }

  return { status: 'error', message: 'Something went wrong. Please try again.', values };
}

export async function loginAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const values = { email: readString(formData, 'email') };

  const parsed = loginSchema.safeParse({
    email: values.email,
    password: readString(formData, 'password'),
  });

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { status: 'error', message: 'Check the highlighted fields.', fieldErrors, values };
  }

  try {
    await apiServer<AuthPayload>('/api/auth/login', {
      method: 'POST',
      body: parsed.data,
      onResponse: (response) => void relayAuthCookies(response),
    });
  } catch (error) {
    return toErrorState(error, values);
  }

  redirect('/');
}

export async function registerAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const values = {
    name: readString(formData, 'name'),
    email: readString(formData, 'email'),
  };

  const parsed = registerSchema.safeParse({
    name: values.name,
    email: values.email,
    password: readString(formData, 'password'),
  });

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { status: 'error', message: 'Check the highlighted fields.', fieldErrors, values };
  }

  try {
    await apiServer<AuthPayload>('/api/auth/register', {
      method: 'POST',
      body: parsed.data,
      onResponse: (response) => void relayAuthCookies(response),
    });
  } catch (error) {
    return toErrorState(error, values);
  }

  redirect('/');
}

export async function logoutAction(): Promise<void> {
  try {
    await apiServer('/api/auth/logout', {
      method: 'POST',
      onResponse: (response) => void relayAuthCookies(response),
    });
  } catch {
    // Even if the API refuses, the relayed clearing cookies have already landed.
  }

  redirect('/');
}
