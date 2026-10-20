import { content, type Lang, PATHS, type Post as PostData } from '../content';
import { Contact } from './Contact';
import { postJsonLd } from './jsonld';

export const dateText = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleDateString(lang, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

// `code` spans inside a paragraph: the odd segments between backticks.
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split('`').map((s, i) =>
        i % 2 ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: static text, the segments never reorder
          <code key={i} className="rounded bg-[var(--anatomy-card)] px-1 font-mono text-[0.9em]">
            {s}
          </code>
        ) : (
          s
        ),
      )}
    </>
  );
}

function Block({ block }: { block: PostData['body'][number] }) {
  if ('h2' in block) return <h2 className="mt-6 text-2xl font-semibold text-strong">{block.h2}</h2>;
  if ('pre' in block)
    return (
      <pre className="overflow-x-auto bg-[var(--anatomy-card)] p-4 font-mono text-sm leading-relaxed shadow-rule">
        {block.pre}
      </pre>
    );
  if ('ul' in block)
    return (
      <ul className="flex list-disc flex-col gap-2 pl-5">
        {block.ul.map((item) => (
          <li key={item} className="leading-relaxed">
            <Inline text={item} />
          </li>
        ))}
      </ul>
    );
  if ('table' in block)
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {block.table.head.map((h) => (
                <th key={h} className="py-2 pr-4 text-left font-semibold text-strong shadow-rule">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.table.rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell) => (
                  <td key={cell} className="py-2 pr-4 align-top shadow-rule">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  return (
    <p className="leading-relaxed">
      <Inline text={block.p} />
    </p>
  );
}

export function Post({ post }: { post: PostData }) {
  const t = content.en;
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD built from our own content
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd(post)) }}
      />
      <main className="mx-auto flex max-w-3xl flex-col gap-16 px-5 py-10 md:px-8 md:py-16">
        <article className="flex flex-col gap-5">
          <a href={PATHS.en} className="font-mono text-xs uppercase tracking-[0.14em]">
            {t.hero.name}
          </a>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em]">
            {t.writing.title} · {dateText(post.published, 'en')}
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-strong md:text-5xl">
            {post.title}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed">{post.dek}</p>
          {post.body.map((block) => (
            <Block key={JSON.stringify(block)} block={block} />
          ))}
        </article>
        <Contact lang="en" />
      </main>
    </>
  );
}
