import Link from 'next/link';
import { COPY } from '@/i18n/zh-CN';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p>{COPY.footerDisclaimer}</p>
      <p className={styles.meta}>
        <span>象征与自我观照 · 非命运判决</span>
        <span className={styles.links}>
          <Link href="/about">{COPY.navMethod}</Link>
          <Link href="/privacy">{COPY.navPrivacy}</Link>
          {COPY.icp ? (
            <a href={COPY.icpHref} rel="noreferrer">
              {COPY.icp}
            </a>
          ) : (
            <span>备案号待填</span>
          )}
        </span>
      </p>
    </footer>
  );
}
