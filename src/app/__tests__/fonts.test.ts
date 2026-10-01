import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('display font import', () => {
  it('ships only LXGW WenKai Screen, not the unused mono and GB cuts', () => {
    const css = readFileSync('src/styles/globals.css', 'utf8');
    expect(css).toContain("lxgw-wenkai-screen-web/lxgwwenkaiscreen/result.css");
    expect(css).not.toContain("lxgw-wenkai-screen-web/style.css");
    expect(css).not.toContain('lxgwwenkaimono');
    expect(css).not.toContain('lxgwwenkaigb');
  });
});
