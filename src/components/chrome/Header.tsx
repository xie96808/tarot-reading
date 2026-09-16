'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { COPY } from '@/i18n/zh-CN';
import { shouldConfirmLeave } from '@/lib/nav-guard';
import styles from './Header.module.css';

export function Header() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();

  function go(href: string) {
    if (shouldConfirmLeave(pathname, href) && !window.confirm(COPY.navLeaveHint)) return;
    router.push(href);
  }

  return (
    <header className={styles.header}>
      <button type="button" className={styles.brand} onClick={() => go('/')}>
        {COPY.siteName}
      </button>
      <nav className={styles.nav} aria-label="主导航">
        <Link href="/read">{COPY.navStart}</Link>
        <button type="button" onClick={() => go('/deck')}>
          {COPY.navDeck}
        </button>
        <button type="button" onClick={() => go('/about')}>
          {COPY.navAbout}
        </button>
      </nav>
    </header>
  );
}
