import { ArrowUpRight } from 'lucide-react';
import { content, type Lang, POSTS } from '../content';
import { dateText } from './Post';

// The posts, newest first. They are written in English; the Spanish page says so.
export function Writing({ lang }: { lang: Lang }) {
  const t = content[lang].writing;
  return (
    <section className="flex flex-col gap-8" aria-labelledby="writing">
      <div className="flex flex-col gap-2 pb-4 shadow-rule">
        <h2 id="writing" className="text-2xl font-semibold text-strong">
          {t.title}
        </h2>
        <p>{t.lede}</p>
      </div>
      <ul className="flex flex-col gap-10">
        {POSTS.map((post) => (
          <li key={post.slug} className="flex max-w-3xl flex-col gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em]">
              {dateText(post.published, lang)}
              {lang === 'en' ? '' : ` · ${t.inEnglish}`}
            </p>
            <h3 className="text-2xl font-semibold text-strong">
              <a href={`/writing/${post.slug}`} hrefLang="en">
                {post.title}
              </a>
            </h3>
            <p className="leading-relaxed">{post.dek}</p>
            <a href={`/writing/${post.slug}`} hrefLang="en" className="link mt-1">
              {t.read} <ArrowUpRight size={14} aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
