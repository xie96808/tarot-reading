import Link from 'next/link';
import { COPY } from '@/i18n/zh-CN';
import { SPREADS } from '@/data/lexicons/zh-1/spreads';
import { CardBack } from '@/components/ritual/CardBack';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.kicker}>夜间书房 · 七十八张纸上的故事</p>
          <h1>{COPY.tagline}</h1>
          <p className={styles.lead}>{COPY.homeLead}</p>
          <Link className={styles.cta} href="/read">
            {COPY.homeCta}
          </Link>
          <p className={styles.meta}>{COPY.homeMeta}</p>
        </div>
        <div className={styles.fan} aria-hidden="true">
          <div className={`${styles.card} ${styles.c1}`}>
            <CardBack />
          </div>
          <div className={`${styles.card} ${styles.c2}`}>
            <CardBack />
          </div>
          <div className={`${styles.card} ${styles.c3}`}>
            <CardBack />
          </div>
        </div>
      </section>
      <section className={styles.beats}>
        <p>洗一副牌</p>
        <span>/</span>
        <p>看一个处境</p>
        <span>/</span>
        <p>留一句给自己</p>
      </section>
      <section className={styles.spreads} aria-labelledby="spread-heading">
        <h2 id="spread-heading">三种阅读方式</h2>
        <p className={styles.spreadNote}>时间是阅读参考，不是准确度等级。</p>
        <ul>
          {Object.values(SPREADS).map((spread) => (
            <li key={spread.id}>
              <Link href={`/read?spread=${spread.id}`}>
                <strong>{spread.nameZh}</strong>
                <span>
                  {spread.titleZh} · {spread.blurbZh}
                </span>
                <em>{spread.durationZh}</em>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
