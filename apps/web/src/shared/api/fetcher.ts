import { isApiFailure, type ApiResponse, type PaginationMeta } from '@devpraxis/shared';

import { ApiClientError } from './errors';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export const MUTATING_METHODS: ReadonlySet<HttpMethod> = new Set([
  'POST',
  'PATCH',
  'PUT',
  'DELETE',
]);

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  next?: { revalidate?: number | false; tags?: string[] };
  cache?: RequestCache;
  credentials?: RequestCredentials;

  onResponse?: (response: Response) => void | Promise<void>;
}

export interface ApiResult<T> {
  data: T;
  meta?: PaginationMeta;
}

type NextRequestInit = RequestInit & { next?: RequestOptions['next'] };

export async function performRequest<T>(
  url: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    signal,
    next,
    cache,
    credentials,
    onResponse,
  } = options;

  const isMultipart = body instanceof FormData;

  const init: NextRequestInit = {
    method,
    headers: {
      Accept: 'application/json',
      ...(body === undefined || isMultipart ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
  };

  if (body !== undefined) init.body = isMultipart ? body : JSON.stringify(body);
  if (signal) init.signal = signal;
  if (next) init.next = next;
  if (cache) init.cache = cache;
  if (credentials) init.credentials = credentials;

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (cause) {
    // fetch only rejects on transport failure — DNS, refused connection, abort.
    throw new ApiClientError(0, {
      message: cause instanceof Error ? cause.message : 'Network request failed',
      code: 'NETWORK_ERROR',
    });
  }

  await onResponse?.(response);

  // 204 No Content: logout and delete answer with an empty body.
  if (response.status === 204) {
    return { data: undefined as T };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiClientError(response.status, {
      message: `Expected JSON, got ${response.headers.get('content-type') ?? 'nothing'}`,
      code: 'INVALID_RESPONSE',
    });
  }

  const envelope = payload as ApiResponse<T>;

  if (isApiFailure(envelope)) {
    throw new ApiClientError(response.status, envelope.error);
  }

  if (!response.ok) {
    // Non-2xx that did not follow the error envelope — a proxy or a crash.
    throw new ApiClientError(response.status, {
      message: `Unexpected response ${response.status}`,
      code: 'INTERNAL',
    });
  }

  return { data: envelope.data, meta: envelope.meta };
}
