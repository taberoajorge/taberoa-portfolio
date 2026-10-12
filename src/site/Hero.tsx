import { content, type Lang, STACK } from '../content';
import { ContactLinks } from './Contact';
import { LangSwitch } from './LangSwitch';

export function Hero({ lang }: { lang: Lang }) {
  const t = content[lang].hero;
  return (
    <header className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.14em]">{t.name}</p>
        <LangSwitch lang={lang} />
      </div>
      <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-strong md:text-5xl">
        <span className="sr-only">{t.name} · </span>
        {t.title}
        <span className="block text-2xl font-normal text-body md:text-3xl">{t.area}</span>
      </h1>
      <ul className="flex flex-wrap gap-2" aria-label="Stack">
        {STACK.map((s) => (
          <li key={s} className="chip">
            {s}
          </li>
        ))}
      </ul>
      <p className="max-w-3xl text-lg leading-relaxed">{t.lede}</p>
      <p className="text-sm">{t.roles}</p>
      <p className="font-mono text-xs uppercase tracking-wider text-strong">{t.award}</p>
      <ContactLinks lang={lang} />
    </header>
  );
}
