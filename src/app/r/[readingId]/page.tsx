import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { decodeReading } from '@/lib/reading-codec';
import { composeReading } from '@/lib/reading';
import { CARDS } from '@/data/lexicons/zh-1';
import { SPREADS } from '@/data/lexicons/zh-1/spreads';
import { COPY } from '@/i18n/zh-CN';
import { sharePageMeta } from '@/lib/share-meta';
import { ReadingView } from '@/components/ritual/ReadingView';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ readingId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { readingId } = await params;
  const decoded = decodeReading(decodeURIComponent(readingId));
  if (!decoded.ok) {
    return { title: '本局记录', robots: { index: false, follow: false } };
  }
  const meta = sharePageMeta(decoded.payload);
  return {
    title: meta.title,
    description: meta.description,
    openGraph: { title: meta.title, description: meta.description },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description,
      images: [{ url: `/r/${encodeURIComponent(readingId)}/opengraph-image`, alt: meta.description }] },
    robots: { index: false, follow: false },
  };
}

export default async function ReadingPage({ params }: Props) {
  const { readingId } = await params;
  const decoded = decodeReading(decodeURIComponent(readingId));
  if (!decoded.ok) notFound();
  const payload = decoded.payload;
  const doc = composeReading(payload.spreadId, payload.draws, CARDS);
  const spread = SPREADS[payload.spreadId];
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 80px' }}>
      <p style={{ color: 'var(--candle)', letterSpacing: '0.2em' }}>本局记录</p>
      <h1>{spread.nameZh}</h1>
      <p>链接由浏览器生成，可复现所列结果，未验证抽牌来源。</p>
      <ReadingView question={payload.q ?? ''} doc={doc} />
      <p>{COPY.footerDisclaimer}</p>
    </main>
  );
}
