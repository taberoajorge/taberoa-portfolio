import { en } from './en';
import { es } from './es';

export type Lang = 'en' | 'es';
export const LANGS: Lang[] = ['en', 'es'];
export const content = { en, es } satisfies Record<Lang, unknown>;
export type { Content } from './en';
export * from './posts';
export * from './site';
