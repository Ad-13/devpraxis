export interface PaginationMeta {
  total: number;
  page: number;
  pages: number;
}

export interface ApiSuccess<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorPayload {
  message: string;
  code: string;
  details?: unknown;
}

export interface ApiFailure {
  error: ApiErrorPayload;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export const API_ERROR_CODES = [
  'VALIDATION_ERROR',
  'INVALID_ID',
  'DUPLICATE_KEY',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'INTERNAL',
  'TOKEN_EXPIRED',
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export function isApiFailure<T>(body: ApiResponse<T>): body is ApiFailure {
  return typeof body === 'object' && body !== null && 'error' in body;
}
