import { describe, expect, it } from 'vitest';
import { seedSession } from '@/lib/ritual-machine';
import { parseSpreadQuery } from '@/lib/spread-query';

describe('parseSpreadQuery', () => {
  it('accepts the three spread ids', () => {
    expect(parseSpreadQuery('single')).toBe('single');
    expect(parseSpreadQuery('three')).toBe('three');
    expect(parseSpreadQuery('celtic')).toBe('celtic');
  });

  it('rejects anything that is not exactly one id', () => {
    expect(parseSpreadQuery('')).toBeNull();
    expect(parseSpreadQuery('Celtic')).toBeNull();
    expect(parseSpreadQuery('three ')).toBeNull();
    expect(parseSpreadQuery(null)).toBeNull();
    expect(parseSpreadQuery(undefined)).toBeNull();
    expect(parseSpreadQuery(['three'])).toBeNull();
  });
});

describe('seedSession', () => {
  it('starts at enter with the requested spread, defaulting to three', () => {
    expect(seedSession('single').spreadId).toBe('single');
    expect(seedSession('single').stage).toBe('enter');
    expect(seedSession(null).spreadId).toBe('three');
    expect(seedSession(null).stage).toBe('enter');
  });
});
