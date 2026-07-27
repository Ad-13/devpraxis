export function readCookie(name: string): string | undefined {
  const prefix = `${encodeURIComponent(name)}=`;
  const match = document.cookie.split('; ').find((entry) => entry.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : undefined;
}

export function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  const encoded = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  document.cookie = `${encoded}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

export function deleteCookie(name: string): void {
  document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Lax`;
}
