import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('table photographs', () => {
  it('ships a darker table surface and three hand poses', () => {
    const dir = path.join(process.cwd(), 'public/table');
    for (const name of ['surface', 'hands-idle', 'hands-riffle', 'hands-cut']) {
      expect(existsSync(path.join(dir, `${name}.jpg`))).toBe(true);
      expect(existsSync(path.join(dir, `${name}.webp`))).toBe(true);
    }
  });
});
