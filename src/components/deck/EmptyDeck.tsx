import Link from 'next/link';

/** Render only for a real empty result; current complete deck filters are non-empty. */
export function EmptyDeck() {
  return (
    <section style={{ textAlign: 'center', padding: '32px 0' }} aria-label="牌典暂无结果">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/ui/empty-lexicon.jpg" alt="" width={480} height={320} loading="lazy"
        style={{ width: 'min(100%, 320px)', height: 'auto', borderRadius: 4 }} />
      <p>这里暂时没有找到牌。</p>
      <Link href="/deck">查看全部七十八张牌</Link>
    </section>
  );
}
