import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CARD_IDS, isCardId } from '@/data/card-ids';
import { CARDS } from '@/data/lexicons/zh-1';
import { COPY } from '@/i18n/zh-CN';
import { formatCardMeta } from '@/data/lexicons/zh-1/labels';
import { CardFaceStatic } from '@/components/deck/CardFaceStatic';

type Props = { params: Promise<{ cardId: string }> };

export function generateStaticParams() {
  return CARD_IDS.map((cardId) => ({ cardId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cardId } = await params;
  if (!isCardId(cardId)) return { title: '牌典' };
  const card = CARDS[cardId];
  return { title: `${card.nameZh} · ${card.nameEn}` };
}

export default async function CardPage({ params }: Props) {
  const { cardId } = await params;
  if (!isCardId(cardId)) notFound();
  const card = CARDS[cardId];
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 80px' }}>
      <p style={{ color: 'var(--candle)' }}>{card.arcana === 'major' ? '大阿尔卡纳' : '小阿尔卡纳'}</p>
      <h1>
        {card.nameZh} <span style={{ color: 'var(--ash)', fontSize: 20 }}>{card.nameEn}</span>
      </h1>
      <CardFaceStatic cardId={cardId} alt={card.nameZh} />
      <section>
        <h2>{COPY.upright}</h2>
        <p>{card.upright.keywords.join(' · ')}</p>
        <p>{card.upright.meaning}</p>
        <p>{card.upright.reflection}</p>
      </section>
      <section>
        <h2>{COPY.reversed}</h2>
        <p>{card.reversed.keywords.join(' · ')}</p>
        <p>{card.reversed.meaning}</p>
        <p>{card.reversed.reflection}</p>
      </section>
      <p style={{ color: 'var(--ash)' }}>{formatCardMeta(card)}</p>
    </main>
  );
}
