import type { Lang } from '.';

export const SITE = 'https://taberoa.com';
export const PATHS: Record<Lang, string> = { en: '/', es: '/es' };

export const STACK = ['TypeScript', 'Python', 'Node.js', 'React', 'PostgreSQL', 'MCP'];

export const LINKS = {
  cv: '/alex-taberoa-cv.pdf',
  email: 'mailto:job@taberoa.simplelogin.com',
  linkedin: 'https://www.linkedin.com/in/taberoajorge',
  github: 'https://github.com/taberoajorge',
};

export const REPOS = {
  ralph: 'https://github.com/taberoajorge/ralph',
  loopforge: 'https://github.com/taberoajorge/loopforge',
  audio: 'https://github.com/taberoajorge/audio-cleaner-oss',
};

export type ProjectId = keyof typeof REPOS;
export const PROJECTS: ProjectId[] = ['ralph', 'loopforge', 'audio'];
