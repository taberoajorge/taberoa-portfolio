import type { MetadataRoute } from 'next';
import { LANGS, PATHS, POSTS, SITE } from '../content';

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { en: `${SITE}${PATHS.en}`, es: `${SITE}${PATHS.es}` };
  return [
    ...LANGS.map((lang) => ({
      url: `${SITE}${PATHS[lang]}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: lang === 'en' ? 1 : 0.9,
      alternates: { languages },
    })),
    ...POSTS.map((post) => ({
      url: `${SITE}/writing/${post.slug}`,
      lastModified: new Date(post.published),
      changeFrequency: 'yearly' as const,
      priority: 0.8,
    })),
  ];
}
