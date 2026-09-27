'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';
import { COPY } from '@/i18n/zh-CN';
import { shouldConfirmLeave } from '@/lib/nav-guard';
import { loadSession } from '@/lib/storage';

type GuardedLinkProps = ComponentProps<typeof Link>;

/** Same leave confirmation as the header, for footer and in-ritual links. */
export function GuardedLink({ href, onNavigate, ...props }: GuardedLinkProps) {
  const pathname = usePathname() ?? '/';
  const target = typeof href === 'string' ? href : (href.pathname ?? '');
  return (
    <Link
      href={href}
      {...props}
      onNavigate={(event) => {
        const stage = pathname.startsWith('/read') ? loadSession()?.stage ?? null : null;
        if (shouldConfirmLeave(pathname, target, stage) && !window.confirm(COPY.navLeaveHint)) {
          event.preventDefault();
          return;
        }
        onNavigate?.(event);
      }}
    />
  );
}
