// Server-side entry point. Never import this from a Client Component:
// it pulls in `server-only` and `next/headers`.
export { apiServer } from './server';

export { ApiClientError, isApiClientError } from './errors';
export type { ApiResult, HttpMethod, RequestOptions } from './fetcher';
