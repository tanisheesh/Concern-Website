import { MetadataRoute } from 'next';
import { ALL_ALBUM_SLUGS } from '@/lib/albums';

const BASE_URL = 'https://your-website-url.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '',
    '/our-team',
    '/gallery',
    '/annual-reports-and-itr',
    '/assessments',
    '/therapy',
    '/training',
    '/mosje',
    '/contact-us',
  ];

  const staticUrls = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const galleryUrls = ALL_ALBUM_SLUGS.map((slug) => ({
    url: `${BASE_URL}/gallery/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticUrls, ...galleryUrls];
}
