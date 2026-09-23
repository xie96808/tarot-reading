import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { CARD_LEXICON_LIST } from '@/data/lexicons/zh-1';
import { EmptyDeck } from '@/components/deck/EmptyDeck';
import { CardFaceStatic } from '@/components/deck/CardFaceStatic';
import { DeckSearch } from '@/components/deck/DeckSearch';
import { DECK_FILTERS, filterDeck, isDeckFilter, searchDeck } from '@/lib/deck-filter';
import styles from './page.module.css';
import filterStyles from '@/components/deck/DeckBrowser.module.css';

export const metadata: Metadata = { title: '牌典' };

type Props = { searchParams: Promise<{ g?: string; q?: string }> };

export default async function DeckIndexPage({ searchParams }: Props) {
  const params = await searchParams;
  const filter = params.g && isDeckFilter(params.g) ? params.g : 'all';
  const query = typeof params.q === 'string' ? params.q : '';
  const visible = searchDeck(filterDeck(CARD_LEXICON_LIST, filter), query);
  return (
    <main className={styles.main}>
      <h1>牌典</h1>
      <p>七十八张牌。词义按传统阅读，不按某一张初版画面里多画或少画的物件改写。</p>
      <div className={filterStyles.filters} role="tablist" aria-label="按牌组筛选">
        {DECK_FILTERS.map((item) => {
          const hrefParams = new URLSearchParams();
          if (item.id !== 'all') hrefParams.set('g', item.id);
          if (query.trim()) hrefParams.set('q', query);
          const qs = hrefParams.toString();
          return (
            <Link
              key={item.id}
              href={qs ? `/deck?${qs}` : '/deck'}
              role="tab"
              aria-selected={filter === item.id}
              className={filter === item.id ? filterStyles.active : undefined}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                padding: '0 14px',
                border: '1px solid rgba(196, 163, 90, 0.28)',
                textDecoration: 'none',
                color: filter === item.id ? 'var(--parchment)' : 'var(--parchment-dim)',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <Suspense fallback={null}>
        <DeckSearch initialQuery={query} />
      </Suspense>
      {visible.length === 0 ? (
        <EmptyDeck />
      ) : (
        <ul className={filterStyles.grid}>
          {visible.map((card) => (
            <li key={card.id}>
              <Link href={`/deck/${card.id}`}>
                <CardFaceStatic cardId={card.id} alt="" sizes="120px" width="100%" />
                <span>{card.nameZh}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
