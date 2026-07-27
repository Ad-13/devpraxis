import Link from 'next/link';

export default function ArticleNotFound() {
  return (
    <main className="container">
      <p className="label">404</p>
      <h1>This article does not exist</h1>
      <p>It may have been unpublished, renamed, or never existed at all.</p>
      <Link href="/">← Back to the feed</Link>
    </main>
  );
}
