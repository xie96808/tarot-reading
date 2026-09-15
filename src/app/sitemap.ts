import type { MetadataRoute } from 'next';
import { CARD_IDS } from '@/data/card-ids';
import { SITE_URL } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/deck', '/about', '/privacy'].map((path) => ({
    url: `${SITE_URL}${path || '/'}`,
    changeFrequency: 'monthly' as const,
  }));
  const cards = CARD_IDS.map((cardId) => ({
    url: `${SITE_URL}/deck/${cardId}`,
    changeFrequency: 'monthly' as const,
  }));
  return [...staticRoutes, ...cards];
}
