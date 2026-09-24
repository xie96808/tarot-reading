import { describe, expect, it } from 'vitest';
import { CARDS } from '@/data/lexicons/zh-1';
import { ASTROLOGY_LABEL, ELEMENT_LABEL, formatCardMeta } from '@/data/lexicons/zh-1/labels';
import type { Astrology, Element } from '@/data/lexicons/zh-1/types';

describe('lexicon display labels', () => {
  it('gives every element a Chinese label that is not the English key', () => {
    const keys = Object.keys(ELEMENT_LABEL) as Element[];
    expect(keys).toEqual(['fire', 'water', 'air', 'earth']);
    for (const key of keys) expect(ELEMENT_LABEL[key]).not.toBe(key);
  });

  it('covers every astrology key', () => {
    const labels = ASTROLOGY_LABEL satisfies Record<Astrology, string>;
    expect(Object.keys(labels)).toHaveLength(22);
    for (const [key, label] of Object.entries(labels)) expect(label).not.toBe(key);
  });

  it('formats the fool with wind and uranus, and the eight of cups with water only', () => {
    expect(formatCardMeta(CARDS['00_the_fool'])).toBe('元素 风 · 星对应 天王星');
    expect(formatCardMeta(CARDS.cups_08)).toBe('元素 水');
  });
});
