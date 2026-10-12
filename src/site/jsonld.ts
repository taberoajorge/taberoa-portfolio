import { content, type Lang, LINKS, PATHS, PROJECTS, REPOS, SITE, STACK } from '../content';

// Structured data: who this is, and the open-source work as source code.
export function jsonLd(lang: Lang) {
  const t = content[lang];
  const person = `${SITE}/#person`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${SITE}${PATHS[lang]}#page`,
        url: `${SITE}${PATHS[lang]}`,
        name: t.seo.title,
        description: t.seo.description,
        inLanguage: lang,
        mainEntity: { '@id': person },
      },
      {
        '@type': 'Person',
        '@id': person,
        name: t.hero.name,
        alternateName: 'Alexander Taberoa',
        jobTitle: t.hero.title,
        description: t.hero.lede,
        url: SITE,
        sameAs: [LINKS.linkedin, LINKS.github],
        knowsAbout: [...STACK, 'AI agents', 'LLM evaluation', 'Full-stack development'],
        award: ['Developer of the Year, Outbuild (2023)', 'Developer of the Year, Outbuild (2024)'],
        worksFor: { '@type': 'Organization', name: 'Outbuild' },
        homeLocation: { '@type': 'Country', name: 'Mexico' },
        workExample: PROJECTS.map((id) => ({
          '@type': 'SoftwareSourceCode',
          name: t.projects[id].title,
          description: t.projects[id].did,
          codeRepository: REPOS[id],
          programmingLanguage: t.projects[id].stack,
          author: { '@id': person },
        })),
      },
    ],
  };
}
