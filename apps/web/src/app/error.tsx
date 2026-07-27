'use client';

import { useEffect } from 'react';

export default function FeedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container">
      <h1>The feed is unavailable</h1>
      <p>The API did not respond. This is usually temporary.</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
