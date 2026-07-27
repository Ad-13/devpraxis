import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';

import { fontVariables } from '@/shared/config/fonts';
import { ACCENT_COOKIE, accentAttribute, parseAccent } from '@/shared/config/theme';
import { Header } from '@/widgets/Header';
import '@/shared/styles/index.css';

export const metadata: Metadata = {
  title: 'DevPraxis',
  description: 'Collaborative knowledge hub for tech-interview preparation',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const store = await cookies();
  const accent = parseAccent(store.get(ACCENT_COOKIE)?.value);

  return (
    <html lang="en" data-accent={accentAttribute(accent)} className={fontVariables}>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
