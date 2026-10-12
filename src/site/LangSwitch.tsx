import { content, type Lang, PATHS } from '../content';

// The other language: Spanish is a plain link; English goes through ?hl=en so the choice is remembered.
export function LangSwitch({ lang }: { lang: Lang }) {
  const t = content[lang].nav;
  const other: Lang = lang === 'en' ? 'es' : 'en';
  return (
    <nav aria-label={t.label}>
      <a
        href={other === 'es' ? PATHS.es : '/?hl=en'}
        hrefLang={other}
        lang={other}
        className="link"
      >
        {t.other}
      </a>
    </nav>
  );
}
