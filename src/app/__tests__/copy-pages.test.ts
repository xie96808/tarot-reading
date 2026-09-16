import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('method and privacy copy', () => {
  it('states randomness, reversals, and crisis boundaries', () => {
    const about = readFileSync(path.join(process.cwd(), 'src/app/about/page.tsx'), 'utf8');
    expect(about).toContain('密码学随机数');
    expect(about).toContain('逆位不是坏兆');
    expect(about).toContain('即时危险');
  });

  it('states local history, encoding, and no question logging', () => {
    const privacy = readFileSync(path.join(process.cwd(), 'src/app/privacy/page.tsx'), 'utf8');
    expect(privacy).toContain('最多 20 条');
    expect(privacy).toContain('不是加密');
    expect(privacy).toContain('不记录问题原文');
  });
});
