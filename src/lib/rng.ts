const productionBrand: unique symbol = Symbol('ProductionRng');

export type ProductionRng = {
  readonly [productionBrand]: true;
  nextUint32(): Promise<number>;
};

export type Uint32Source = {
  nextUint32(): Promise<number>;
};

const encoder = new TextEncoder();

function getSubtle(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle || typeof globalThis.crypto.getRandomValues !== 'function') {
    throw new Error('Web Crypto is unavailable. Use HTTPS or a supported browser.');
  }
  return subtle;
}

export async function createHkdfRng(
  seed: Uint8Array,
  samples: Uint8Array,
  purpose: 'shuffle' | 'cut',
): Promise<Uint32Source> {
  const subtle = getSubtle();
  const ikm = new Uint8Array(seed.length + samples.length);
  ikm.set(seed);
  ikm.set(samples, seed.length);
  const key = await subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  const salt = new Uint8Array(32);
  let counter = 0;
  let pool = new DataView(new ArrayBuffer(0));
  let offset = 0;
  let cancelled = false;

  return {
    async nextUint32() {
      if (cancelled) throw new Error('rng cancelled');
      if (offset === pool.byteLength) {
        const info = encoder.encode(`tarot/fy-hkdf-2/${purpose}/block/${counter++}`);
        const bits = await subtle.deriveBits(
          { name: 'HKDF', hash: 'SHA-256', salt, info },
          key,
          1024 * 8,
        );
        pool = new DataView(bits);
        offset = 0;
      }
      const value = pool.getUint32(offset, false);
      offset += 4;
      return value;
    },
  };
}

export async function createProductionRng(
  samples: Uint8Array,
  purpose: 'shuffle' | 'cut' = 'shuffle',
): Promise<ProductionRng> {
  const seed = new Uint8Array(32);
  globalThis.crypto.getRandomValues(seed);
  const inner = await createHkdfRng(seed, samples, purpose);
  return {
    [productionBrand]: true,
    nextUint32: () => inner.nextUint32(),
  };
}

export function isProductionRng(value: unknown): value is ProductionRng {
  return Boolean(value && typeof value === 'object' && productionBrand in value);
}

export async function uniformInt(rng: Uint32Source, n: number): Promise<number> {
  const range = 2 ** 32;
  if (!Number.isInteger(n) || n < 1 || n > range) throw new RangeError('n');
  const limit = range - (range % n);
  for (;;) {
    const x = await rng.nextUint32();
    if (x < limit) return x % n;
  }
}

export function createSequenceRng(values: number[]): Uint32Source {
  let i = 0;
  return {
    async nextUint32() {
      if (i >= values.length) throw new Error('sequence rng exhausted');
      return values[i++] >>> 0;
    },
  };
}

export type PointerSample = { x: number; y: number; t: number };

export function packSamples(samples: PointerSample[]): Uint8Array {
  const sliced = samples.slice(0, 1024).filter((s) =>
    Number.isFinite(s.x) && Number.isFinite(s.y) && Number.isFinite(s.t),
  );
  const out = new Uint8Array(sliced.length * 12);
  const view = new DataView(out.buffer);
  sliced.forEach((sample, index) => {
    const base = index * 12;
    view.setFloat32(base, sample.x, true);
    view.setFloat32(base + 4, sample.y, true);
    view.setFloat32(base + 8, sample.t, true);
  });
  return out;
}
