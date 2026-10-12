# Design

## Context

- **Motivación:** ver `proposal.md`. **Requisitos:** ver `specs/`.
- **Stack:** Next 15.5 (App Router, páginas estáticas), React 19, Tailwind 3, Biome y pnpm 9. Los tests usan `node --test` con type stripping.
- **Código actual:**
  - Tres figuras de unas 700 líneas cada una sobre `src/figures/engine.tsx` (476 líneas).
  - `src/content.ts` (639 líneas, los dos idiomas juntos).
  - Modelos en `src/explainers/*/model.ts`.
  - El kit `/anatomy` vendorizado en `src/iso`, excluido de Biome.
- **Referencia:** `job-search-crm`.
- **Configuración por cliente:** comprobada contra la documentación oficial vigente el 2026-10-12 (Claude Code, Codex, Cursor, OpenCode, Antigravity, Gemini CLI, Copilot, Windsurf/Devin y Orca).
- **Decisiones del dueño:**
  - harness completo como en la referencia;
  - todos los clientes;
  - el CV se mantiene;
  - arquitectura simple y sin código de relleno.

## Goals / Non-Goals

**Goals:**
- **Estructura simple.** Cualquier archivo se encuentra por su carpeta, y cada carpeta se explica en una línea.
- **Sin duplicación entre figuras.** Una figura nueva solo aporta su geometría, su coreografía y sus textos.
- **Mismo contexto, skills y guardas para todos los clientes**, con un único lugar canónico para cada cosa.
- **Reglas que se comprueban.** Las que importan (fronteras, código muerto, commits, checks) las verifica una máquina en local y en CI.

**Non-Goals:**
- **Sin capas de más:** no hay estado global, inyección de dependencias, "services", "repositories", barrels por carpeta ni una librería de componentes.
- **Next no se actualiza a 16.** El bloque de reglas que mantiene Next 16.3+ en `AGENTS.md` y `next-devtools-mcp` quedan para cuando se actualice.
- **Sin MCP de proyecto.** El portafolio no necesita ninguno. Exa y Context7 siguen siendo configuración personal de cada usuario, y `AGENTS.md` lo explica.
- **No se toca `src/iso`.** Para actualizarlo se recopia desde el skill y se anota la versión.

## Decisions

### 1. Estructura de `src/`

```
src/
  app/                (en)/, (es)/es/, sitemap.ts, robots.ts    solo rutas y archivos especiales
  middleware.ts                                                  idioma por Accept-Language y cookie
  content/            site.ts (enlaces, stack, repos, dominio), en.ts, es.ts, index.ts (Lang, tipo Content)
  site/               Home.tsx, Hero.tsx, Projects.tsx, Contact.tsx, LangSwitch.tsx, jsonld.ts, meta.ts, og.tsx
  models/             ralph/, loopforge/, audio/ (model.ts + model.test.ts), rng.ts (+ test)
  figures/
    engine/           director.ts, camera.ts, dom.ts, rig.ts, steps.tsx, shell.tsx, hooks.ts
    parts/            bench.ts (base de máquina), frames.ts (cajas de encuadre), Bench.tsx
    ralph/ loopforge/ audio/    view.ts, geometry.ts, art.tsx, rig.ts, Figure.tsx
  iso/                kit vendorizado (sin cambios)
```

- **`engine.tsx` se parte** por responsabilidad: tramos y reproducción en `director`, cámara, escritura en el DOM, la clase base `Rig`, los componentes de pasos, el shell y los hooks.
- **Cada figura separa su lógica del componente.** La lógica (`rig.ts`, la clase que hoy está dentro del componente) va aparte del componente (`Figure.tsx`, que pasa a ser un `FigureShell` con su dibujo).
- *Alternativa descartada:* una carpeta `components/` global. Mezclaría secciones de la página con el motor de figuras, y hoy no hay componentes compartidos entre los dos.

### 2. `FigureShell` y la clase base `Rig`

- **`Rig<P>`** (abstracta) contiene lo que hoy repiten las tres clases:
  - `director` (`Director<P>`);
  - `io`, con `setIo`;
  - `look(frame, s, parts)` y `showStep(i)`, a partir de una tabla `STEPS` que declara cada figura;
  - `el(selector)` y `put`.

  Cada figura implementa `plan()`, `write(pose)` y, si las tiene, `springs()` y `labels()`.
- **`FigureShell`** (cliente) recibe:
  - `fig`, `t` (textos), `steps`, `info`, `keys`, `readout`, `controls` (los controles propios: torpeza, worktrees o presets);
  - una fábrica `makeRig(refs, io)`;
  - el `Drawing`.

  Dentro gestiona el estado de UI (playing, finished, consent), `pick`, `useDirector`, `useSteps`, `useNarrator` y la maqueta (`FigureLayout`, `Stepper`, `Plate`, `FigControls`, `Guide`).
- Es la única abstracción nueva, y se justifica porque tiene **tres** implementaciones reales.
- *Alternativa descartada:* un hook `useFigure` que devuelva todo. Dejaría la maqueta repetida en cada figura.

### 3. Piezas de máquina compartidas

`parts/bench.ts` exporta `benchOf(P, plan, { label, strip })`, que devuelve la base de máquina (halo, patas, losa, ranura, tornillos, placa de etiqueta con reglas y regla con marcas). `Bench.tsx` la dibuja. Las tres geometrías dejan de copiarla.

`parts/frames.ts` exporta `boxOf(P, x0, x1, y0, y1, z0, z1)`.

### 4. Contenido

- **`content/en.ts`** es la forma de referencia: `export const en = {...}` y `export type Content = typeof en`, con las funciones como `(n: number) => string`.
- **`content/es.ts`** exporta `export const es: Content = {...}`. Si falta una clave o cambia la forma, el typecheck falla. Hace falta comprobar que las funciones con el mismo tipo de parámetros encajan, y si alguna no encaja se tipa en `en.ts`.
- **`content/site.ts`** contiene los datos sin idioma: `SITE`, `PATHS`, `LINKS`, `REPOS` y `STACK`.

### 5. Fronteras y código muerto

- **`scripts/checks/boundaries.ts`** usa expresiones regulares sobre los `import`; el código es pequeño y no necesita un parser.
  - Aplica las reglas de la spec (`models`, `iso`, `figures`, `site`, `app`).
  - Prohíbe los nombres `utils`, `helpers` y `misc` en `src/`.
  - Su test (`boundaries.test.ts`) usa fixtures en memoria.
- **El código muerto lo detecta [Knip](https://knip.dev)**, en desarrollo. Detecta exportaciones y archivos sin uso, entiende Next y es la herramienta habitual para esto. *Alternativa descartada:* escribir un detector propio, que sería más código frágil.

### 6. Configuración por cliente

**Instrucciones:**
- `AGENTS.md` es el archivo canónico, en la raíz y en cada carpeta de `src/*` y `scripts/`.
- `CLAUDE.md` contiene `@AGENTS.md` y las notas propias de Claude.
- `.gemini/settings.json` usa `context.fileName: ["AGENTS.md"]`.
- Copilot, Cursor, OpenCode, Antigravity y Windsurf/Devin leen `AGENTS.md` sin más archivos. No se añaden `.cursor/rules` ni `.github/copilot-instructions.md`, porque duplicarían.

**Skills:**
- Canónicas en `.agents/skills/<nombre>/SKILL.md`. Las leen Codex, Cursor, OpenCode, Antigravity, Copilot, Windsurf y Gemini.
- Claude Code solo lee `.claude/skills`, así que necesita adaptadores.
- **Problema de nombres duplicados:** Cursor, OpenCode y Copilot leen también `.claude/skills`, y OpenCode exige nombres únicos. Decisión: los adaptadores de Claude llevan el prefijo `claude-` en el nombre del frontmatter y solo remiten a la canónica. La duplicación visible queda acotada a una línea por skill.
- Se verifica en la implementación con Context7 sobre la documentación de OpenCode y Copilot. Si ignoran los nombres duplicados entre directorios, se quita el prefijo.

**Hooks, con un solo script (`scripts/agent-hooks.ts`):**

| Cliente | Archivo | Notas |
|---|---|---|
| Claude Code | `.claude/settings.json` | Eventos `SessionStart`, `PreToolUse` y `Stop`. Cursor, Copilot, Devin y Orca también ejecutan este archivo, así que **no** se duplica en `.cursor/hooks.json` ni en `.github/hooks`. |
| Codex | `.codex/hooks.json` | Mismos eventos; requiere proyecto de confianza y aprobar los hooks en `/hooks`, y así se documenta. |
| Antigravity | `.agents/hooks.json` | Formato propio, agrupado por nombre de hook y con los nombres de herramienta de Antigravity (`run_command`…). |
| OpenCode | `.opencode/plugins/agent-hooks.ts` | Plugin que llama al script en `tool.execute.before` y en el evento de cierre. |
| Gemini CLI | `.gemini/settings.json` | Hooks `SessionStart`, `BeforeTool` y `AfterTool`. |

**El script:** `node --import tsx scripts/agent-hooks.ts hook <cliente> <evento>`.
- Normaliza la entrada de cada cliente, que llega por stdin en JSON, a un `HookEvent` común.
- Devuelve la salida en el formato de cada cliente.
- **Estado:** el certificado de checks (la huella de los archivos versionados y modificados y la lista de checks que pasaron) se guarda en `.git/agent-hooks/` de cada checkout. Así no se versiona y queda aislado por worktree.
- **`pnpm check` escribe el certificado** al terminar en verde, con un paso final que llama a `agent-hooks certify`.
- Se toma de la referencia la idea de certificado y guardas, pero no los checkpoints de operaciones de CRM, porque aquí no hay operaciones externas.

**MCP:** ninguno de proyecto (ver Non-Goals).

**Copilot cloud:** `.github/workflows/copilot-setup-steps.yml` (job `copilot-setup-steps`) instala Node desde `.node-version` y ejecuta el bootstrap.

**Ajustes locales en `.gitignore`:** `*.local.json`, `CLAUDE.local.md`, `AGENTS.local.md`, `.claude/settings.local.json` y `.devin/*.local.json`.

### 7. Orca y puertos

`orca.yaml`:

```yaml
scripts:
  setup: sh scripts/bootstrap.sh
setupAgentStartupPolicy: wait-for-setup
defaultTabs:
  - { title: dev, command: pnpm dev }
```

- `setupAgentStartupPolicy` va en el nivel superior.
- No se comparte `node_modules`: cada checkout tiene el suyo y pnpm reutiliza su almacén.

**Puertos (`scripts/port.ts`):**
- Puerto = `3300 + (hash(ruta canónica) mod 100)`.
- El checkout principal mantiene `3302` como excepción explícita para no romper los hábitos actuales.
- Antes de arrancar, compara con los puertos de los worktrees registrados (`git worktree list --porcelain`). Si coinciden, falla y nombra el otro worktree.
- `pnpm dev` y `pnpm start` pasan por `scripts/run.ts dev|start`, que resuelve el puerto y lanza `next` con `--port`.

**Hooks de Git (`.githooks/`):**
- `commit-msg` llama a `scripts/commit-msg.ts`, que valida Conventional Commits y la ausencia de atribución sin dependencias, con la misma regex que el script de entrega.
- `pre-push` comprueba la versión de Node, ejecuta `pnpm check` y `pnpm build`, y bloquea un push forzado a `main`.

### 8. Entrega (`scripts/delivery.ts`)

- **Subcomandos:**
  - `branch <tipo/nombre>` crea una rama desde `origin/main` actualizado;
  - `pr-check <título> <cuerpo.md>` valida el título y las secciones del cuerpo;
  - `pr-create` hace lo mismo, comprueba que la rama esté al día y llama a `gh pr create`;
  - `merge <pr>` hace un squash después de comprobar que CI está en verde.
- **Uso de `git-spice`:** la regla del dueño lo prefiere para stacks. `AGENTS.md` lo nombra para stacks, y `delivery` cubre el PR único.
- **CI (`.github/workflows/check.yml`):**
  - acciones fijadas por SHA y permisos `contents: read`;
  - `pnpm install --frozen-lockfile`, `pnpm check` y `pnpm build`;
  - `pnpm audit --prod`;
  - gitleaks con versión fija y sha256;
  - `commit-msg` sobre los commits del PR.
- **Dependabot:** npm y github-actions, semanal.

### 9. README, licencia y `.gitignore`

- **README en inglés:** qué es, el mapa de `src/`, los comandos, cómo añadir una figura (remite a la skill), la preparación de agentes y worktrees, y la licencia.
- **`LICENSE`:** MIT para el código, con el año actualizado. Una sección del README (y una línea en `LICENSE`) aclara que los textos personales, el CV y la marca no se licencian.

### 10. Rendimiento

- **Medición actual** (build de producción, Lighthouse 12, móvil):
  - Performance 98, Accessibility 96, Best Practices 96, SEO 100;
  - LCP 2.4 s, del que el 81 % es retraso de renderizado;
  - HTML de 442 KB (78 KB con gzip) con 1.763 trazos SVG;
  - un CSS que bloquea el renderizado;
  - el gris `#8c8c90` en contraste 3:1;
  - un 404 del favicon.
- **Figuras diferidas:**
  - `FigureShell` deja en el servidor los textos y un `<img>` del póster, con su ancho y alto;
  - el dibujo y su rig se importan con `import()` cuando un `IntersectionObserver` con margen de una pantalla detecta que la figura se acerca;
  - mientras el código llega, el póster ocupa exactamente el mismo hueco;
  - en escritorio, la primera figura cae en la primera pantalla y su póster puede ser el LCP (un `<img>` sí cuenta, el SVG inline no). Por eso el póster de la primera figura no es diferido y lleva `fetchpriority="high"`; los demás van con `loading="lazy"`.
  - *Alternativa descartada:* `next/dynamic` con SSR, que hidrata y descarga el código igual.
- **Pósters:** `scripts/posters.tsx` usa `react-dom/server` para renderizar cada `Drawing` en su estado inicial. Junta las capas en un solo `<svg>` con el CSS del tema claro embebido y lo escribe en `public/figures/<id>.svg`. Se ejecuta antes de `next build` (`prebuild`). Pesa un orden de magnitud menos que el SVG inline porque se descarga en diferido, se cachea y no bloquea.
- **CSS:** se activa `experimental.inlineCss` de Next 15, que mete *todo* el CSS en el HTML (no solo el crítico): hoy son 22 KB, 5,7 KB con gzip, y caben de sobra en el presupuesto de 40 KB. Elimina la petición bloqueante.
- **Contraste:** se sobrescribe el token `--anatomy-muted` del tema claro con `#6b6b70`, que da unos 4,7:1 sobre `#f2f2ef` y más sobre `#fbfbfa`. Se hace en `globals.css`, no en el kit. El token solo lo usa texto (esquinas, leyenda, pies y guía), no trazos de la geometría, así que el atenuado del foco no cambia.
- **Iconos:** `src/app/icon.svg` y `apple-icon.png`, con las convenciones de archivo de Next, que generan sus `<link>`.
- **`llms.txt`:** la ruta `src/app/llms.txt/route.ts` es estática (`dynamic = 'force-static'`) y se genera a partir de `content/en.ts` y `site.ts`. Incluye un enlace a `/es`.
- **First Load JS:** el presupuesto se mide sin comprimir, igual que lo informa `next build`. Hoy son 136 KB (102 KB compartidos). Bajarlo a 110 KB o menos sale de sacar el código de las figuras de la primera carga.
- **`pnpm perf` (`scripts/checks/perf.ts`):**
  - ejecuta Lighthouse en versión fija con `pnpm dlx`, en móvil y escritorio, sobre `/` y `/es`;
  - comprueba las puntuaciones;
  - mide el HTML comprimido, el JS de la primera carga (manifiesto del build) y el LCP, el TBT y el CLS frente a los presupuestos;
  - con `--url`, apunta a producción.
- **CI:** un job `perf` levanta `pnpm start` y ejecuta `pnpm perf --ci`, que en Performance acepta 95 o más.
- **Middleware de idioma:** se mantiene, porque en Vercel es Routing Middleware y su coste es mínimo. Se mide en producción, y si sube el TTFB se sustituye por `redirects` con condiciones `has`/`missing` en `next.config`.

### 11. Despliegue

Se hace al final, con el repo limpio y todo en verde:
0. Confirmar la cuenta con `gh api user -q .login` (debe ser `taberoajorge`) y actualizar la CLI de Vercel (60.0.1 → la última).
1. `gh repo create taberoajorge/taberoa-portfolio --public --source . --push`, y protección de `main` con `gh api`: check `check` obligatorio y sin pushes forzados.
2. `vercel git connect` para el proyecto `taberoa-portfolio` (Node 24 y pnpm), comprobando que el despliegue de producción sale de `main`. Requiere que la GitHub App de Vercel tenga acceso al repo nuevo; si no lo tiene, el dueño la autoriza en GitHub.
3. Antes de tocar nada, `vercel domains inspect taberoa.com` para ver el registrador y los nameservers. Después, con la API de dominios **del proyecto** (`vercel api`):
   - `DELETE /v9/projects/<todo-app>/domains/taberoa.com` y lo mismo para `www`;
   - `POST /v10/projects/taberoa-portfolio/domains` con `taberoa.com`;
   - `POST` con `www.taberoa.com`, `redirect: "taberoa.com"` y `redirectStatusCode: 308`.

   *No se usa `vercel domains rm`, que quita el dominio de la cuenta y no solo del proyecto.* Como el dominio está en el mismo equipo de Vercel, no hay que tocar el DNS.
4. Repetir `pnpm perf --url https://taberoa.com` y la paridad de head y JSON-LD contra producción.

El MCP de Vercel necesita autorización OAuth, que no está disponible en esta sesión, así que se usa la CLI (autenticada como `taberoajorge`) y `gh`. Si el MCP se autoriza, sirve para el mismo trabajo.

## Risks / Trade-offs

- **El 100 en Performance móvil depende del entorno de laboratorio.** → El presupuesto apunta a un LCP ≤ 1.2 s con margen. En CI se acepta 95 o más en Performance; las demás categorías deben dar 100.
- **Póster y figura viva podrían diferir.** → El póster se genera con el mismo componente `Drawing` en su estado inicial, así que no puede divergir.
- **Mover el dominio deja a `todo-app` sin `taberoa.com`.** → Es la decisión del dueño, y `todo-app` sigue en su URL `.vercel.app`.

- **Paridad visual tras mover el código.** → Se toman instantáneas del HTML de `/` y `/es` (head, textos y JSON-LD) antes de mover nada y se comparan después. La hoja de contactos de cada figura con Play se compara a ojo.
- **Knip y Next.** El route group y el middleware pueden dar falsos positivos. → Su configuración declara los puntos de entrada de Next. Lo que se ignore se anota con su motivo.
- **Hooks que bloquean de más.** → Las guardas son concretas (rutas, `push --force`, patrones de secretos y de atribución) y tienen tests por cliente con entradas de ejemplo.
- **Duplicación de skills en Cursor, OpenCode y Copilot.** → Se resuelve con el prefijo `claude-` en los adaptadores (decisión 6) y se verifica con la documentación vigente.
- **Codex y Claude piden confianza para hooks y MCP en un repo público.** Es lo deseable por seguridad. → Se documenta en el README.
- **Tamaño del harness.** → Vive en `scripts/`, fuera de `src/`, con tests. Si algo no lo usa ningún cliente, no se escribe.

## Migration Plan

1. Instantáneas de paridad (HTML y JSON-LD de `/` y `/es`).
2. Reorganizar `src/` por pasos pequeños, comprobando check, build y paridad en cada uno.
3. Añadir tooling, hooks, CI y configuración de agentes.
4. Rendimiento (sección 10) con `pnpm perf` en verde.
5. Commits en Conventional Commits por bloque.
6. Despliegue (sección 11): repo, Vercel y dominio, al final.
7. Para revertir, basta con revertir los commits; no hay datos que migrar. El dominio vuelve a `todo-app` con `vercel domains` si hiciera falta.

## Open Questions

Ninguna. El dominio quedó resuelto: `taberoa.com`, movido desde `todo-app`.
