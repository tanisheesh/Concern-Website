import { MetadataRoute } from 'next';

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
  
  // Note: For a fully dynamic sitemap, you would fetch album slugs here
  // and generate URLs for each one. For now, this covers the main pages.

  return [...staticUrls];
}
