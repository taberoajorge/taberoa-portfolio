import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { content, type Lang, PROJECTS, type ProjectId, REPOS } from '../content';
import { AudioFigure } from '../figures/audio/Figure';
import { LoopForgeFigure } from '../figures/loopforge/Figure';
import { RalphFigure } from '../figures/ralph/Figure';

const FIGURES: Record<ProjectId, (props: { lang: Lang; info: ReactNode }) => ReactNode> = {
  ralph: RalphFigure,
  loopforge: LoopForgeFigure,
  audio: AudioFigure,
};

// The project card that sits beside its figure.
function Info({ lang, id }: { lang: Lang; id: ProjectId }) {
  const p = content[lang].projects[id];
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em]">{p.tag}</p>
      <h3 className="text-2xl font-semibold text-strong">{p.title}</h3>
      <p className="leading-relaxed">{p.did}</p>
      <ul className="flex flex-wrap gap-1.5" aria-label="Stack">
        {p.stack.map((s) => (
          <li key={s} className="chip">
            {s}
          </li>
        ))}
      </ul>
      <a href={REPOS[id]} target="_blank" rel="noreferrer" className="link mt-1">
        {p.link} <ArrowUpRight size={14} aria-hidden />
      </a>
    </div>
  );
}

export function Projects({ lang }: { lang: Lang }) {
  const t = content[lang];
  return (
    <section className="flex flex-col gap-16" aria-labelledby="projects">
      <div className="flex flex-col gap-2 pb-4 shadow-rule">
        <h2 id="projects" className="text-2xl font-semibold text-strong">
          {t.projectsTitle}
        </h2>
        <p>{t.projectsLede}</p>
      </div>
      {PROJECTS.map((id) => {
        const Figure = FIGURES[id];
        return (
          <article key={id} id={id}>
            <Figure lang={lang} info={<Info lang={lang} id={id} />} />
          </article>
        );
      })}
    </section>
  );
}
