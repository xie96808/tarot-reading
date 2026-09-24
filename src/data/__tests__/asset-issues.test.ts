import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ASSET_ISSUES } from '@/data/asset-issues';
import { CARDS } from '@/data/lexicons/zh-1';
import { CELTIC_READING_GROUPS } from '@/lib/reading';
import { SPREADS } from '@/data/lexicons/zh-1/spreads';

const COUNTED = ['cups_08', 'cups_09', 'swords_10', 'pents_10'] as const;

describe('asset issue registry', () => {
  it('tracks painted periods without changing the lexicon names', () => {
    for (const id of ['01_the_magician', '03_the_empress'] as const) {
      expect(ASSET_ISSUES.find((issue) => issue.cardId === id)?.status).toBe('reported');
      expect(CARDS[id].nameEn.endsWith('.')).toBe(false);
    }
  });

  it('keeps the about page consistent with the four counted minors', () => {
    const about = readFileSync(path.join(process.cwd(), 'src/app/about/page.tsx'), 'utf8');
    const open = COUNTED.filter((id) => ASSET_ISSUES.find((issue) => issue.cardId === id)?.status === 'reported');
    if (open.length === 0) {
      expect(about).not.toContain('可能不准');
      return;
    }
    expect(about).not.toContain('四张小牌物件计数可能不准');
    for (const id of open) expect(about).toContain(CARDS[id].nameZh);
  });
});

describe('celtic reading groups', () => {
  it('matches each position group and uses every relation once', () => {
    const grouped = new Map<string, string>();
    const edges = new Set<string>();
    for (const group of CELTIC_READING_GROUPS) {
      for (const id of group.positionIds) grouped.set(id, group.id);
      for (const edge of group.edgeIds) edges.add(edge);
    }
    for (const position of SPREADS.celtic.positions) {
      expect(grouped.get(position.id)).toBe(position.group);
    }
    expect([...edges].sort()).toEqual(SPREADS.celtic.relationEdges.map(([a, b]) => `${a}->${b}`).sort());
    expect(grouped.size).toBe(10);
    expect(edges.size).toBe(6);
  });
});
