import { content, LINKS, PATHS, POSTS, PROJECTS, REPOS, SITE, STACK } from '../content';

// /llms.txt (llmstxt.org): the page in plain Markdown for AI search and assistants, built from the
// same English content, so it can never drift from what visitors read.
export function llmsTxt() {
  const t = content.en;
  const email = LINKS.email.replace('mailto:', '');
  return `# ${t.hero.name}

> ${t.hero.title} · ${t.hero.area}. ${t.hero.lede}

- ${t.hero.roles}
- ${t.hero.award}
- Stack: ${STACK.join(', ')}

## Open-source projects

${PROJECTS.map((id) => `- [${t.projects[id].title}](${REPOS[id]}): ${t.projects[id].did} (${t.projects[id].stack.join(', ')})`).join('\n')}

## Writing

${POSTS.map((p) => `- [${p.title}](${SITE}/writing/${p.slug}): ${p.dek}`).join('\n')}

## Contact

- Email: ${email}
- [LinkedIn](${LINKS.linkedin})
- [GitHub](${LINKS.github})
- [CV (PDF)](${SITE}${LINKS.cv})

## Pages

- [Portfolio, English](${SITE}${PATHS.en})
- [Portafolio, español](${SITE}${PATHS.es})
`;
}
