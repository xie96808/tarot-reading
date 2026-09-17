import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { decodeReading } from '@/lib/reading-codec';
import { SPREADS } from '@/data/lexicons/zh-1/spreads';
import { SITE_NAME } from '@/config/site';
import { shareOgLines } from '@/lib/share-meta';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = '烛下塔罗 · 本局牌阵记录';

// Local resources keep generation independent of external font/image services.
const resources = Promise.all([
  readFile(path.join(process.cwd(), 'public/share/parchment-strip.jpg')),
  readFile(path.join(process.cwd(), 'node_modules/@fontsource/noto-serif-sc/files/noto-serif-sc-chinese-simplified-400-normal.woff')),
]);

export default async function OgImage({ params }: { params: Promise<{ readingId: string }> }) {
  const { readingId } = await params;
  const decoded = decodeReading(decodeURIComponent(readingId));
  const title = decoded.ok ? SPREADS[decoded.payload.spreadId].nameZh : '本局记录';
  const lines = shareOgLines(decoded.ok ? decoded.payload : null);
  const [paper, font] = await resources;
  const columns = lines.length > 5 ? [lines.slice(0, 5), lines.slice(5, 10)] : [lines];
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        padding: '48px 64px', background: '#f4ecd5', color: '#191202', fontFamily: 'Noto Serif SC', position: 'relative' }}>
        <img src={`data:image/jpeg;base64,${paper.toString('base64')}`} alt="" width={1200} height={400}
          style={{ position: 'absolute', top: 0, left: 0, opacity: 0.45 }} />
        <div style={{ display: 'flex', fontSize: 26, color: '#7a5830', letterSpacing: 6 }}>{SITE_NAME}</div>
        <div style={{ display: 'flex', fontSize: 46, marginTop: 16 }}>{title}</div>
        <div style={{ marginTop: 28, display: 'flex', gap: 48 }}>
          {columns.map((column, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 14 }}>
              {column.map((line, j) => (
                <div key={line} style={{ display: 'flex', fontSize: 27, lineHeight: 1.4 }}>
                  {i * 5 + j + 1}. {line}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 'auto', fontSize: 20, color: '#5c4f3a' }}>象征与自我观照 · 非命运判决</div>
      </div>
    ),
    { ...size, fonts: [{ name: 'Noto Serif SC', data: font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength), weight: 400, style: 'normal' }] },
  );
}
