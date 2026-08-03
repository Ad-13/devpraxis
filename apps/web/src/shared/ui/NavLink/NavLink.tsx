'use client';

import Link, { type LinkProps, useLinkStatus } from 'next/link';
import { useEffect, type ReactNode } from 'react';

import { finishNavigation, startNavigation } from '@/shared/ui/NavProgress/navProgressStore';

function StatusReporter() {
  const { pending } = useLinkStatus();

  useEffect(() => {
    if (!pending) return;

    startNavigation();

    return () => finishNavigation();
  }, [pending]);

  return null;
}

interface IProps extends LinkProps {
  children: ReactNode;
  className?: string;
}

export function NavLink({ children, className, ...rest }: IProps) {
  return (
    <Link className={className} {...rest}>
      {children}
      <StatusReporter />
    </Link>
  );
}
