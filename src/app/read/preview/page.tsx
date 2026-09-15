import type { Metadata } from 'next';
import { COPY } from '@/i18n/zh-CN';
import { CardBack } from '@/components/ritual/CardBack';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: '三张阅读（静态样例）',
  robots: { index: false, follow: false },
};

const SAMPLE = [
  { pos: '过去', name: '愚者', orient: '正位', text: '一个开端曾让你愿意轻装尝试。这里首先谈的是起步的方式，而不是保证此刻仍应继续向前。' },
  { pos: '现在', name: '圣杯八', orient: '正位', text: '杯还在，但已经喂不饱你。此刻的主题是辨认：哪些曾经足够的东西，如今值得重新衡量。' },
  { pos: '未来', name: '星币王后', orient: '逆位', text: '若维持当前轨迹，值得留意的是照顾与资源分配。园子还在，园丁也需要被算进照顾的名单。' },
];

export default function StaticThreePreview() {
  return (
    <main className={styles.main}>
      <p className={styles.banner}>静态样例 · 不是一次真实抽牌</p>
      <div className={styles.table}>
        {SAMPLE.map((card) => (
          <figure key={card.pos}>
            <CardBack alt={`${card.pos}牌背占位`} />
            <figcaption>
              <strong>{card.pos}</strong>
              <span>
                {card.name}（{card.orient}）
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <article className={styles.page}>
        {SAMPLE.map((card) => (
          <section key={card.pos}>
            <h2>
              {card.pos} · {card.name}（{card.orient}）
            </h2>
            <p>{card.text}</p>
          </section>
        ))}
        <p className={styles.note}>{COPY.yesNoDisclaimer.replace('这一张', '这些牌')}</p>
      </article>
    </main>
  );
}
