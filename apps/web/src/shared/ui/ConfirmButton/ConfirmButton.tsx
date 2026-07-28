'use client';

import { useId, useRef, type ReactNode } from 'react';

import { Button, type ButtonSize, type ButtonVariant } from '@/shared/ui/Button';

import styles from './ConfirmButton.module.css';

interface IProps {
  children: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onConfirm: () => void;
}

export function ConfirmButton({
  children,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  variant = 'ghost',
  size = 'sm',
  disabled,
  onConfirm,
}: IProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const titleId = useId();

  return (
    <>
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={() => dialogRef.current?.showModal()}
      >
        {children}
      </Button>

      <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={titleId}>
        <div className={styles.body}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <p className={styles.description}>{description}</p>

          <div className={styles.buttons}>
            <Button variant="quiet" onClick={() => dialogRef.current?.close()}>
              {cancelLabel}
            </Button>
            <Button
              variant={tone === 'danger' ? 'danger' : 'primary'}
              onClick={() => {
                dialogRef.current?.close();
                onConfirm();
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
