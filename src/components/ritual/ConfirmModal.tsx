'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { trapTab } from '@/lib/a11y';
import styles from './RitualApp.module.css';

export function ConfirmModal({
  children,
  onCancel,
}: {
  children: ReactNode;
  onCancel: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const previous = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previous.current = document.activeElement as HTMLElement | null;
    const node = root.current;
    const first = node?.querySelector<HTMLElement>('button');
    first?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
        return;
      }
      if (node) trapTab(event, node);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previous.current?.focus?.();
    };
  }, [onCancel]);

  return (
    <div ref={root} className={styles.modal} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
