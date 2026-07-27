export const AUTH_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  passwordMin: 8,
  passwordMax: 72, /* is dictated by bcrypt, which truncates beyond 72 bytes. */
} as const;

export const AUTH_COOKIES = {
  access: 'accessToken',
  refresh: 'refreshToken',
  csrf: 'csrfToken',
} as const;

export const CSRF_HEADER = 'X-CSRF-Token';
