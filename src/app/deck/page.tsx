import type { Metadata } from 'next';
import Link from 'next/link';
import { CARD_LEXICON_LIST } from '@/data/lexicons/zh-1';
import styles from './page.module.css';

export const metadata: Metadata = { title: '牌典' };

export default function DeckIndexPage() {
  const majors = CARD_LEXICON_LIST.filter((card) => card.arcana === 'major');
  const minors = CARD_LEXICON_LIST.filter((card) => card.arcana === 'minor');
  return (
    <main className={styles.main}>
      <h1>牌典</h1>
      <p>七十八张牌。词义按传统阅读，不按某一张初版画面里多画或少画的物件改写。</p>
      <h2>大阿尔卡纳</h2>
      <ul>
        {majors.map((card) => (
          <li key={card.id}>
            <Link href={`/deck/${card.id}`}>
              {String(card.number).padStart(2, '0')} {card.nameZh}
            </Link>
          </li>
        ))}
      </ul>
      <h2>小阿尔卡纳</h2>
      <ul>
        {minors.map((card) => (
          <li key={card.id}>
            <Link href={`/deck/${card.id}`}>{card.nameZh}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
