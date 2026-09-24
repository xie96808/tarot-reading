'use client';

import { useEffect, useRef, type ReactNode, type MouseEvent } from 'react';
import styles from './RitualApp.module.css';

export function ConfirmModal({
  children,
  onCancel,
}: {
  children: ReactNode;
  onCancel: () => void;
}) {
  const root = useRef<HTMLDialogElement>(null);
  const previous = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previous.current = document.activeElement as HTMLElement | null;
    const node = root.current;
    if (!node) return;
    node.showModal();
    const onCancelEvent = (event: Event) => {
      event.preventDefault();
      onCancel();
    };
    node.addEventListener('cancel', onCancelEvent);
    return () => {
      node.removeEventListener('cancel', onCancelEvent);
      node.close();
      previous.current?.focus?.();
    };
  }, [onCancel]);

  function onMouseDown(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) onCancel();
  }

  return (
    <dialog ref={root} className={styles.modal} aria-modal="true" onMouseDown={onMouseDown}>
      {children}
    </dialog>
  );
}
