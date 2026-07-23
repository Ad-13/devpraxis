import { Frame } from '@/shared/ui/Frame';

export default function HomePage() {
  return (
    <main className="container" style={{ paddingBlock: 'var(--space-8)' }}>
      <p className="label">Foundation check</p>

      <h1 style={{ fontSize: 'var(--text-3xl)', color: 'var(--accent)' }}>DEVPRAXIS</h1>

      <Frame interactive className="frame-demo">
        <div style={{ padding: 'var(--space-5)' }}>
          <p className="label">Topic</p>
          <p style={{ color: 'var(--ink-muted)', marginTop: 'var(--space-2)' }}>
            Tokens, fonts, geometry and theming are operational.
          </p>
        </div>
      </Frame>
    </main>
  );
}
