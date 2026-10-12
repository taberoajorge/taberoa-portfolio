import type { MetadataRoute } from 'next';
import { LANGS, PATHS, SITE } from '../content';

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { en: `${SITE}${PATHS.en}`, es: `${SITE}${PATHS.es}` };
  return LANGS.map((lang) => ({
    url: `${SITE}${PATHS[lang]}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: lang === 'en' ? 1 : 0.9,
    alternates: { languages },
  }));
}
