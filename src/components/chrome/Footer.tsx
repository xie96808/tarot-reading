import { COPY } from '@/i18n/zh-CN';
import { GuardedLink } from './GuardedLink';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p>{COPY.footerDisclaimer}</p>
      <p className={styles.meta}>
        <span>象征与自我观照 · 非命运判决</span>
        <span className={styles.links}>
          <GuardedLink href="/about">{COPY.navMethod}</GuardedLink>
          <GuardedLink href="/privacy">{COPY.navPrivacy}</GuardedLink>
          {COPY.icp ? (
            <a href={COPY.icpHref} rel="noreferrer">
              {COPY.icp}
            </a>
          ) : null}
        </span>
      </p>
    </footer>
  );
}
