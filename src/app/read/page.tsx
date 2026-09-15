import type { Metadata } from 'next';
import { RitualApp } from '@/components/ritual/RitualApp';

export const metadata: Metadata = {
  title: '入席',
  robots: { index: false, follow: false },
};

export default function ReadPage() {
  return <RitualApp />;
}
