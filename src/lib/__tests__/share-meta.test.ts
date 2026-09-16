import { describe, expect, it } from 'vitest';
import { CARD_IDS } from '@/data/card-ids';
import { decodeReading, encodeReading } from '@/lib/reading-codec';
import { shareOgLines, sharePageMeta } from '@/lib/share-meta';

describe('share metadata', () => {
  it('never puts the question into title, description, or OG lines', () => {
    const payload = {
      v: 1 as const,
      deckVersion: 'rws-1' as const,
      lexiconVersion: 'zh-1' as const,
      algo: 'fy-hkdf-2' as const,
      spreadId: 'single' as const,
      q: '这是一个不该出现在预览里的问题',
      reversals: true,
      cutIndex: 12,
      commit: 'a3f2c91b0d44e17f',
      draws: [{ positionId: 'focus', cardId: CARD_IDS[0], orientation: 'reversed' as const }],
      ts: 1_800_000_000,
    };
    const meta = sharePageMeta(payload);
    const og = shareOgLines(payload);
    expect(meta.title).not.toContain('问题');
    expect(meta.description).not.toContain('问题');
    expect(og.join('')).not.toContain('问题');
    expect(shareOgLines(null).join('')).toBe('这条记录无法显示');
  });

  it('rejects unknown protocol and content versions', () => {
    const ok = encodeReading({
      v: 1,
      deckVersion: 'rws-1',
      lexiconVersion: 'zh-1',
      algo: 'fy-hkdf-2',
      spreadId: 'single',
      q: null,
      reversals: false,
      cutIndex: 1,
      commit: 'a3f2c91b0d44e17f',
      draws: [{ positionId: 'focus', cardId: CARD_IDS[0], orientation: 'upright' }],
      ts: 1_800_000_000,
    });
    expect(decodeReading(ok.replace('1.', '2.')).ok).toBe(false);
    const json = Buffer.from(ok.slice(2), 'base64url').toString('utf8');
    const obj = JSON.parse(json);
    obj.lexiconVersion = 'zh-2';
    const unknown = `1.${Buffer.from(JSON.stringify(obj)).toString('base64url')}`;
    expect(decodeReading(unknown).ok).toBe(false);
  });
});
