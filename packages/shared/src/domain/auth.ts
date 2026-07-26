export const AUTH_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  passwordMin: 8,
  passwordMax: 72, /* is dictated by bcrypt, which truncates beyond 72 bytes. */
} as const;
