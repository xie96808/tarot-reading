import type { SpreadId } from '@/data/lexicons/zh-1/spreads';

export function parseSpreadQuery(value: string | string[] | null | undefined): SpreadId | null {
  if (typeof value !== 'string') return null;
  if (value === 'single' || value === 'three' || value === 'celtic') return value;
  return null;
}
