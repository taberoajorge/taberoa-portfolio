import { ArrowUpRight, Download, Linkedin, Mail } from 'lucide-react';
import { headers } from 'next/headers';

type Lang = 'en' | 'es';

const content = {
  en: {
    hero: {
      intent:
        "Hi, I'm Alex. I build reliable software and I'm looking to join a strong engineering team.",
      roles: "Roles I'm looking for: Software Engineer, Full Stack, Backend, or Integrations.",
    },
    work: {
      items: [
        {
          title: 'LoopForge',
          type: 'OPEN SOURCE',
          description:
            'Desktop orchestrator for development cycles with code agents. Release draft for macOS/Linux/Windows.',
          proof: 'Repository',
          href: 'https://github.com/taberoajorge/loopforge',
        },
        {
          title: 'Ralph',
          type: 'MIT LICENSE',
          description:
            'Tool to run autonomous development cycles using Codex, Claude, Cursor, and Gemini.',
          proof: 'Repository',
          href: 'https://github.com/taberoajorge/ralph',
        },
        {
          title: 'Audio Cleaner',
          type: 'PUBLIC DEMO',
          description:
            'Audio cleaning product with a web app and GPU worker. Refactored into a public auth-free demo.',
          proof: 'Repository',
          href: 'https://github.com/taberoajorge/audio-cleaner-oss',
        },
      ],
      action: 'Review',
    },
    cv: {
      action: 'Download CV',
    },
    contact: {
      title: "Let's talk",
      description:
        'Feel free to reach out if you have an open role. You can review my public code and CV before contacting me.',
      email: 'Email me',
      linkedin: 'LinkedIn',
    },
    footer: 'English · Español',
  },
  es: {
    hero: {
      intent:
        'Hola, soy Alex. Creo software confiable y busco unirme a un gran equipo de ingeniería.',
      roles: 'Roles que busco: Software Engineer, Full Stack, Backend o Integrations.',
    },
    work: {
      items: [
        {
          title: 'LoopForge',
          type: 'OPEN SOURCE',
          description:
            'Orquestador de escritorio para ciclos de desarrollo con agentes de código. Para macOS/Linux/Windows.',
          proof: 'Repositorio',
          href: 'https://github.com/taberoajorge/loopforge',
        },
        {
          title: 'Ralph',
          type: 'MIT LICENSE',
          description:
            'Herramienta para ejecutar ciclos autónomos de desarrollo con Codex, Claude, Cursor y Gemini.',
          proof: 'Repositorio',
          href: 'https://github.com/taberoajorge/ralph',
        },
        {
          title: 'Audio Cleaner',
          type: 'PUBLIC DEMO',
          description:
            'Producto para limpiar audio con web app y worker GPU. Demo público sin autenticación.',
          proof: 'Repositorio',
          href: 'https://github.com/taberoajorge/audio-cleaner-oss',
        },
      ],
      action: 'Revisar',
    },
    cv: {
      action: 'Descargar CV',
    },
    contact: {
      title: 'Hablemos',
      description:
        'Escríbeme si tienes un rol abierto. Puedes revisar mi código público y mi CV antes de contactarme.',
      email: 'Escribir',
      linkedin: 'LinkedIn',
    },
    footer: 'Español · English',
  },
};

export default async function HomePage() {
  const acceptLanguage = (await headers()).get('accept-language') || '';
  const lang: Lang = acceptLanguage.toLowerCase().startsWith('es') ? 'es' : 'en';
  const t = content[lang];

  return (
    <main className="w-full min-h-screen md:h-screen md:overflow-hidden p-4 md:p-6 antialiased flex flex-col items-center justify-center bg-[#F5F5F7]">
      <div className="w-full max-w-[1400px] h-full flex flex-col justify-center">
        {/* On mobile: Flex column so it scrolls naturally. On Desktop: Strict 4x2 Grid */}
        <div className="flex flex-col md:grid md:grid-cols-4 md:grid-rows-2 gap-4 md:gap-6 w-full h-auto md:h-full">
          {/* Hero */}
          <div className="bento-card md:col-span-2 md:row-span-2 p-8 md:p-12 flex flex-col justify-center relative min-h-[350px]">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-8 shadow-sm">
              AT
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight mb-6 text-[#1D1D1F]">
              {t.hero.intent}
            </h1>
            <p className="text-gray-500 md:text-xl font-medium">{t.hero.roles}</p>
            <div className="mt-auto pt-8 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400 tracking-widest uppercase">
                {t.footer}
              </span>
            </div>
          </div>

          {/* Project 1 */}
          <div className="bento-card md:col-span-1 md:row-span-1 p-6 md:p-8 flex flex-col min-h-[250px]">
            <div className="text-xs font-bold tracking-wider uppercase mb-3 text-indigo-500">
              {t.work.items[0].type}
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2 text-[#1D1D1F]">
              {t.work.items[0].title}
            </h3>
            <p className="text-gray-500 mb-4 text-sm leading-relaxed flex-grow">
              {t.work.items[0].description}
            </p>
            <div className="mt-auto flex justify-between items-center">
              <span className="text-xs text-gray-400 font-medium">{t.work.items[0].proof}</span>
              <a
                href={t.work.items[0].href}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-gray-700 hover:text-indigo-600 transition-colors"
                aria-label={t.work.action}
              >
                <ArrowUpRight size={18} strokeWidth={2.5} />
              </a>
            </div>
          </div>

          {/* Project 2 */}
          <div className="bento-card md:col-span-1 md:row-span-1 p-6 md:p-8 flex flex-col min-h-[250px]">
            <div className="text-xs font-bold tracking-wider uppercase mb-3 text-emerald-500">
              {t.work.items[1].type}
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2 text-[#1D1D1F]">
              {t.work.items[1].title}
            </h3>
            <p className="text-gray-500 mb-4 text-sm leading-relaxed flex-grow">
              {t.work.items[1].description}
            </p>
            <div className="mt-auto flex justify-between items-center">
              <span className="text-xs text-gray-400 font-medium">{t.work.items[1].proof}</span>
              <a
                href={t.work.items[1].href}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-gray-700 hover:text-emerald-600 transition-colors"
                aria-label={t.work.action}
              >
                <ArrowUpRight size={18} strokeWidth={2.5} />
              </a>
            </div>
          </div>

          {/* Project 3 */}
          <div className="bento-card md:col-span-1 md:row-span-1 p-6 md:p-8 flex flex-col min-h-[250px]">
            <div className="text-xs font-bold tracking-wider uppercase mb-3 text-orange-500">
              {t.work.items[2].type}
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2 text-[#1D1D1F]">
              {t.work.items[2].title}
            </h3>
            <p className="text-gray-500 mb-4 text-sm leading-relaxed flex-grow">
              {t.work.items[2].description}
            </p>
            <div className="mt-auto flex justify-between items-center">
              <span className="text-xs text-gray-400 font-medium">{t.work.items[2].proof}</span>
              <a
                href={t.work.items[2].href}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-gray-700 hover:text-orange-600 transition-colors"
                aria-label={t.work.action}
              >
                <ArrowUpRight size={18} strokeWidth={2.5} />
              </a>
            </div>
          </div>

          {/* Contact Card */}
          <div className="bento-card md:col-span-1 md:row-span-1 p-6 md:p-8 flex flex-col justify-between min-h-[250px]">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-[#1D1D1F]">
                {t.contact.title}
              </h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">{t.contact.description}</p>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href="/alex-taberoa-cv.pdf"
                download
                className="glass-dark-button flex items-center justify-center gap-2 py-3 px-4 text-center font-semibold transition-all"
              >
                {t.cv.action} <Download size={16} />
              </a>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <a
                  href="mailto:job@taberoa.simplelogin.com"
                  className="glass-button flex items-center justify-center gap-2 py-3 text-center font-medium transition-all"
                >
                  <Mail size={16} /> <span className="text-sm">{t.contact.email}</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/taberoajorge"
                  target="_blank"
                  rel="noreferrer"
                  className="glass-button flex items-center justify-center gap-2 py-3 text-center font-medium transition-all"
                >
                  <Linkedin size={16} /> <span className="text-sm">{t.contact.linkedin}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
