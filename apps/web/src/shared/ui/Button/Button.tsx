import type { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'quiet';
export type ButtonSize = 'sm' | 'md';

interface StyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function buttonClass({ variant = 'ghost', size = 'md', className }: StyleOptions = {}) {
  return [styles.base, styles[variant], styles[size], className ?? ''].filter(Boolean).join(' ');
}

interface IProps extends ButtonHTMLAttributes<HTMLButtonElement>, StyleOptions {
  children: ReactNode;
}

export function Button({ children, variant, size, className, type = 'button', ...rest }: IProps) {
  return (
    <button type={type} className={buttonClass({ variant, size, className })} {...rest}>
      {children}
    </button>
  );
}
