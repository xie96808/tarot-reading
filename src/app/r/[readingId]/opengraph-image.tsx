import { ImageResponse } from 'next/og';
import { decodeReading } from '@/lib/reading-codec';
import { CARDS } from '@/data/lexicons/zh-1';
import { SPREADS } from '@/data/lexicons/zh-1/spreads';
import { SITE_NAME } from '@/config/site';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage({ params }: { params: Promise<{ readingId: string }> }) {
  const { readingId } = await params;
  const decoded = decodeReading(decodeURIComponent(readingId));
  const title = decoded.ok ? SPREADS[decoded.payload.spreadId].nameZh : '本局记录';
  const lines = decoded.ok
    ? decoded.payload.draws.map((draw) => {
        const card = CARDS[draw.cardId];
        return `${card.nameZh} ${draw.orientation === 'reversed' ? '逆位' : '正位'}`;
      })
    : ['记录无法显示'];
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: '#100e0c',
          color: '#f4ecd5',
        }}
      >
        <div style={{ fontSize: 28, color: '#c4a35a', letterSpacing: 8 }}>{SITE_NAME}</div>
        <div style={{ fontSize: 56, marginTop: 24 }}>{title}</div>
        <div style={{ fontSize: 28, marginTop: 32, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lines.slice(0, 10).map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
