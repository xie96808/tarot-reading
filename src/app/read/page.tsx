import type { Metadata } from 'next';
import { RitualApp } from '@/components/ritual/RitualApp';
import { parseSpreadQuery } from '@/lib/spread-query';

export const metadata: Metadata = {
  title: '入席',
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ spread?: string | string[] }> };

export default async function ReadPage({ searchParams }: Props) {
  const params = await searchParams;
  return <RitualApp initialSpread={parseSpreadQuery(params.spread)} />;
}
