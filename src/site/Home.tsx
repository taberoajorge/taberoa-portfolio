import type { Lang } from '../content';
import { Contact } from './Contact';
import { Hero } from './Hero';
import { jsonLd } from './jsonld';
import { Projects } from './Projects';

export function Home({ lang }: { lang: Lang }) {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD built from our own content
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(lang)) }}
      />
      <main className="mx-auto flex max-w-6xl flex-col gap-20 px-5 py-10 md:px-8 md:py-16">
        <Hero lang={lang} />
        <Projects lang={lang} />
        <Contact lang={lang} />
      </main>
    </>
  );
}
