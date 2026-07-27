import 'server-only';

import { cookies } from 'next/headers';
import { parse as parseSetCookie } from 'set-cookie-parser';

export async function relayAuthCookies(response: Response): Promise<void> {
  const raw = response.headers.getSetCookie();
  if (raw.length === 0) return;

  const store = await cookies();

  for (const cookie of parseSetCookie(raw)) {
    store.set({
      name: cookie.name,
      value: cookie.value,
      path: cookie.path ?? '/',
      httpOnly: cookie.httpOnly ?? false,
      secure: cookie.secure ?? false,
      sameSite: 'lax',
      ...(cookie.maxAge !== undefined ? { maxAge: cookie.maxAge } : {}),
      ...(cookie.expires !== undefined ? { expires: cookie.expires } : {}),
    });
  }
}
