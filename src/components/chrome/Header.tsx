'use client';

import { usePathname, useRouter } from 'next/navigation';
import { COPY } from '@/i18n/zh-CN';
import { ritualProgress, shouldConfirmLeave, startNavAction } from '@/lib/nav-guard';
import { clearSession, loadSession } from '@/lib/storage';
import styles from './Header.module.css';

export function Header() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();

  function go(href: string) {
    const stage = pathname.startsWith('/read') ? loadSession()?.stage ?? null : null;
    if (href === '/read') {
      const action = startNavAction({
        fromPath: pathname,
        toPath: '/read',
        progress: ritualProgress(stage),
      });
      if (action === 'confirm-restart') {
        if (!window.confirm(COPY.resumeRestartConfirm)) return;
        clearSession();
        window.dispatchEvent(new Event('tarot:restart'));
        if (pathname !== '/read') router.push('/read');
        return;
      }
      if (pathname !== '/read') router.push('/read');
      return;
    }
    if (shouldConfirmLeave(pathname, href, stage) && !window.confirm(COPY.navLeaveHint)) return;
    router.push(href);
  }

  return (
    <header className={styles.header}>
      <button type="button" className={styles.brand} onClick={() => go('/')}>
        {COPY.siteName}
      </button>
      <nav className={styles.nav} aria-label="主导航">
        <button type="button" onClick={() => go('/read')}>
          {COPY.navStart}
        </button>
        <button type="button" onClick={() => go('/deck')}>
          {COPY.navDeck}
        </button>
        <button type="button" onClick={() => go('/about')}>
          {COPY.navMethod}
        </button>
      </nav>
    </header>
  );
}
