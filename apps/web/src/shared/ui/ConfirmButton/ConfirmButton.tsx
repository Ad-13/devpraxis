'use client';

import { useRef, type ReactNode } from 'react';

import styles from './ConfirmButton.module.css';

interface IProps {
  /** Label of the trigger button. */
  children: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Visual weight of the confirming action. */
  tone?: 'default' | 'danger';
  className?: string;
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
  className,
  disabled,
  onConfirm,
}: IProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        className={className}
        disabled={disabled}
        // showModal (not show) is what activates the backdrop, Esc handling
        // and the focus trap.
        onClick={() => dialogRef.current?.showModal()}
      >
        {children}
      </button>

      <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="confirm-title">
        <div className={styles.body}>
          <h2 id="confirm-title" className={styles.title}>
            {title}
          </h2>
          <p className={styles.description}>{description}</p>

          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.cancel}
              onClick={() => dialogRef.current?.close()}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={tone === 'danger' ? styles.danger : styles.confirm}
              onClick={() => {
                dialogRef.current?.close();
                onConfirm();
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
