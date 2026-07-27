export interface AuthFormState {
  status: 'idle' | 'error';
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: { name?: string; email?: string };
}

export const INITIAL_AUTH_STATE: AuthFormState = { status: 'idle' };
