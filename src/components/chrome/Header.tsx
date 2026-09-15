import Link from 'next/link';
import { COPY } from '@/i18n/zh-CN';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        {COPY.siteName}
      </Link>
      <nav className={styles.nav} aria-label="主导航">
        <Link href="/read">{COPY.navStart}</Link>
        <Link href="/deck">{COPY.navDeck}</Link>
        <Link href="/about">{COPY.navAbout}</Link>
      </nav>
    </header>
  );
}
