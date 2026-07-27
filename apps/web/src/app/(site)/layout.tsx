import type { ReactNode } from 'react';

import { Header } from '@/widgets/Header';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
