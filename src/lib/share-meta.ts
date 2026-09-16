import { CARDS } from '@/data/lexicons/zh-1';
import { SPREADS } from '@/data/lexicons/zh-1/spreads';
import type { ReadingPayloadV1 } from '@/lib/reading-codec';

export function sharePageMeta(payload: ReadingPayloadV1): { title: string; description: string } {
  const spread = SPREADS[payload.spreadId];
  const description = payload.draws
    .map((draw) => `${CARDS[draw.cardId].nameZh}${draw.orientation === 'reversed' ? '逆' : '正'}`)
    .join(' · ');
  return {
    title: `本局记录 · ${spread.nameZh}`,
    description,
  };
}

export function shareOgLines(payload: ReadingPayloadV1 | null): string[] {
  if (!payload) return ['这条记录无法显示'];
  return payload.draws.map((draw) => {
    const card = CARDS[draw.cardId];
    return `${card.nameZh} ${draw.orientation === 'reversed' ? '逆位' : '正位'}`;
  });
}
