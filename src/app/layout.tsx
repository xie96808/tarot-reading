import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/config/site';
import { Header } from '@/components/chrome/Header';
import { Footer } from '@/components/chrome/Footer';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: `${SITE_NAME}。${SITE_TAGLINE} 给此刻留一盏灯，用一副牌把问题慢慢看清。`,
  referrer: 'no-referrer',
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
