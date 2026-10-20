import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { Metadata, Viewport } from 'next';
import { content, type Lang, LINKS, PATHS, type Post, SITE } from '../content';

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

// The card's URL carries a hash of the file, so a re-rendered card is fetched afresh by the CDN
// and by the networks that cache previews by image URL.
export function cardUrl(post: Post) {
  const png = readFileSync(`public/writing/${post.slug}.png`);
  return `/writing/${post.slug}.png?v=${createHash('sha256').update(png).digest('hex').slice(0, 8)}`;
}

// A post has one URL and one language, so no hreflang. Its share card is rendered by `pnpm og`.
export function postMetadata(post: Post): Metadata {
  const t = content.en;
  const url = `/writing/${post.slug}`;
  const card = cardUrl(post);
  return {
    metadataBase: new URL(SITE),
    title: `${post.title} · ${t.hero.name}`,
    description: post.dek,
    authors: [{ name: t.hero.name, url: SITE }],
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      siteName: t.hero.name,
      title: post.title,
      description: post.dek,
      locale: t.seo.locale,
      publishedTime: `${post.published}T12:00:00Z`,
      authors: [SITE],
      images: [{ url: card, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.dek,
      images: [card],
    },
    robots: { index: true, follow: true },
  };
}
