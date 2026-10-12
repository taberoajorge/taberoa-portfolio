import type { Metadata, Viewport } from 'next';
import { content, type Lang, LINKS, PATHS, SITE } from '../content';

/** @public Next reads it through the layouts' re-export. */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f2f2ef',
};

// Each language has its own URL, linked to the other with hreflang; `/` is the default.
export function metadataFor(lang: Lang): Metadata {
  const t = content[lang];
  const other: Lang = lang === 'en' ? 'es' : 'en';
  return {
    metadataBase: new URL(SITE),
    title: t.seo.title,
    description: t.seo.description,
    applicationName: 'Alex Taberoa',
    authors: [{ name: t.hero.name, url: SITE }],
    creator: t.hero.name,
    keywords: [
      'Alex Taberoa',
      'Senior Software Engineer',
      'Full Stack Engineer',
      'AI agents',
      'MCP',
      'TypeScript',
      'Python',
      'React',
      'Node.js',
      'PostgreSQL',
      'remote',
      'Mexico',
    ],
    alternates: {
      canonical: PATHS[lang],
      languages: { en: PATHS.en, es: PATHS.es, 'x-default': PATHS.en },
    },
    openGraph: {
      type: 'profile',
      url: PATHS[lang],
      siteName: 'Alex Taberoa',
      title: t.seo.title,
      description: t.seo.description,
      locale: t.seo.locale,
      alternateLocale: content[other].seo.locale,
      firstName: 'Alex',
      lastName: 'Taberoa',
      username: LINKS.github.split('/').pop(),
    },
    twitter: { card: 'summary_large_image', title: t.seo.title, description: t.seo.description },
    robots: { index: true, follow: true },
  };
}
