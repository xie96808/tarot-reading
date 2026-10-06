import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('card-back.svg', () => {
  const svg = readFileSync(path.join(process.cwd(), 'src/assets/card-back.svg'), 'utf8');

  it('is 800x1280 with specified frame insets and no text leakage', () => {
    expect(svg).toContain('width="800"');
    expect(svg).toContain('height="1280"');
    expect(svg).toContain('x="28"');
    expect(svg).toMatch(/x="(40|48)"/);
    expect(svg).not.toMatch(/<text[\s>]/);
    expect(svg).not.toMatch(/月|moon|crescent/i);
  });

  it('uses cream field, near-black frame, and candle crest', () => {
    expect(svg).toContain('#F4ECD5');
    expect(svg).toContain('#191202');
    expect(svg).toMatch(/ellipse|candle/i);
  });
});
