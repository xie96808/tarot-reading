import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('display font import', () => {
  it('ships one LXGW WenKai Screen subset, not the unused mono and GB cuts', () => {
    const css = readFileSync('src/styles/globals.css', 'utf8') + readFileSync('src/styles/fonts.css', 'utf8');
    expect(css).toContain('lxgw-wenkai-screen-subset.woff2');
    expect(css).not.toContain('lxgw-wenkai-screen-web/lxgwwenkaiscreen/result.css');
    expect(css).not.toContain('lxgw-wenkai-screen-web/style.css');
    expect(css).not.toContain('lxgwwenkaimono');
    expect(css).not.toContain('lxgwwenkaigb');
    expect(css).not.toContain('noto-serif-sc-chinese-simplified-500');
    expect(css).not.toContain('@fontsource/noto-serif-sc/chinese-simplified-400.css');
    expect(css).not.toContain('@fontsource/cormorant-garamond/500.css');
    const subset = statSync('src/styles/fonts/lxgw-wenkai-screen-subset.woff2').size;
    expect(subset).toBeLessThanOrEqual(200 * 1024);
  });

  it('references client body and latin faces as woff2 only', () => {
    const cssPath = 'src/styles/fonts.css';
    const css = readFileSync(cssPath, 'utf8');
    const files = [...css.matchAll(/url\(([^)]+)\)/g)].map((match) => match[1]);
    expect(files.length).toBeGreaterThan(0);
    expect(files.every((file) => file.endsWith('.woff2'))).toBe(true);
    expect(css).not.toMatch(/\.woff(?!2)/);
    for (const file of files) {
      expect(existsSync(path.resolve(path.dirname(cssPath), file))).toBe(true);
    }
    const og = readFileSync('src/app/r/[readingId]/opengraph-image.tsx', 'utf8');
    expect(og).toContain('noto-serif-sc-chinese-simplified-400-normal.woff');
  });
});
