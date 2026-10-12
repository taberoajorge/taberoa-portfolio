import { ArrowUpRight } from 'lucide-react';
import { content, type Lang, LINKS } from '../content';

export function ContactLinks({ lang }: { lang: Lang }) {
  const t = content[lang].contact;
  const links = [
    { href: LINKS.cv, text: t.cv, download: true },
    { href: LINKS.email, text: t.email },
    { href: LINKS.linkedin, text: t.linkedin, me: true },
    { href: LINKS.github, text: t.github, me: true },
  ];
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2">
      {links.map(({ href, text, download, me }) => (
        <li key={href}>
          <a
            href={href}
            download={download}
            target={me ? '_blank' : undefined}
            rel={me ? 'noreferrer me' : undefined}
            className="link"
          >
            {text} <ArrowUpRight size={14} aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Contact({ lang }: { lang: Lang }) {
  const t = content[lang].contact;
  return (
    <footer className="flex flex-col gap-4 pt-8 shadow-rule-top">
      <h2 className="text-2xl font-semibold text-strong">{t.title}</h2>
      <p className="max-w-2xl">{t.description}</p>
      <ContactLinks lang={lang} />
    </footer>
  );
}
