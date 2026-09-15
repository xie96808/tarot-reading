import { describe, expect, it } from 'vitest';
import { createHkdfRng, createSequenceRng, packSamples, uniformInt } from '@/lib/rng';

describe('uniformInt', () => {
  it('rejects incomplete tail of the uint32 range', async () => {
    const range = 2 ** 32;
    const n = 78;
    const limit = range - (range % n);
    const values = [limit, range - 1, 77];
    const rng = createSequenceRng(values);
    await expect(uniformInt(rng, 78)).resolves.toBe(77);
  });

  it('rejects invalid bounds', async () => {
    const rng = createSequenceRng([0]);
    for (const bad of [0, 79.5, -1, Number.NaN, Infinity, 2 ** 32 + 1]) {
      await expect(uniformInt(rng, bad)).rejects.toBeInstanceOf(RangeError);
    }
  });
});

describe('HKDF stream', () => {
  it('is deterministic, and samples/purpose change the stream', async () => {
    const seed = new Uint8Array(32);
    const a = await createHkdfRng(seed, new Uint8Array(), 'shuffle');
    const b = await createHkdfRng(seed, new Uint8Array(), 'shuffle');
    const c = await createHkdfRng(seed, new Uint8Array(12), 'shuffle');
    const d = await createHkdfRng(seed, new Uint8Array(), 'cut');
    const firstA = await a.nextUint32();
    expect(firstA).toBe(await b.nextUint32());
    expect(firstA).not.toBe(await c.nextUint32());
    expect(firstA).not.toBe(await d.nextUint32());
    for (let i = 0; i < 512; i += 1) {
      expect(await a.nextUint32()).toBe(await b.nextUint32());
    }
  });
});

describe('packSamples', () => {
  it('drops non-finite values and caps at 1024', () => {
    const packed = packSamples([
      { x: 1, y: 2, t: 3 },
      { x: Number.NaN, y: 0, t: 0 },
    ]);
    expect(packed.byteLength).toBe(12);
  });
});
