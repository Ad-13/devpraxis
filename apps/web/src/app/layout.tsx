import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';

import { fontVariables } from '@/shared/config/fonts';
import { ACCENT_COOKIE, accentAttribute, parseAccent } from '@/shared/config/theme';

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
        <div className="ambience" aria-hidden="true">
          <span className="ambience__wash" />
          <span className="ambience__grid" />
          <span className="ambience__ray" />
          <span className="ambience__ray ambience__ray--2" />
          <span className="ambience__hex ambience__hex--a" />
          <span className="ambience__hex ambience__hex--b" />
          <span className="ambience__hex ambience__hex--c" />
          <span className="ambience__hex ambience__hex--d" />
          <span className="ambience__hex ambience__hex--e" />
          <span className="ambience__hex ambience__hex--f" />
          <span className="ambience__scan" />
          <span className="ambience__vignette" />
        </div>

        {children}
      </body>
    </html>
  );
}
