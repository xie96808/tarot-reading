import styles from './SkipLink.module.css';

export function SkipLink() {
  return (
    <a className={styles.skip} href="#main">
      跳到正文
    </a>
  );
}
