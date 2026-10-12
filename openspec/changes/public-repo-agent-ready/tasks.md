# Tasks

## 1. Línea base de paridad

- [x] 1.1 Crear `scripts/checks/parity.ts`, que extrae de `/` y `/es` el `<head>` (título, meta, `canonical`, `hreflang`, `og:*`), los textos visibles y el JSON-LD a `artifacts/parity/*.json` (ignorado por Git), y que tiene un modo de comparación. Guardar la línea base con el código actual. Se verifica cuando el comando produce los dos JSON y, al compararlos contra sí mismos, no muestra diferencias.

## 2. Contenido por idioma

- [x] 2.1 Partir `src/content.ts` en `src/content/site.ts`, `en.ts`, `es.ts` e `index.ts`, con `es: Content` comprobado contra `en`. Se verifica cuando `pnpm typecheck` pasa, borrar una clave de `es.ts` hace fallar el typecheck (comprobado a mano y revertido) y la paridad (1.1) no muestra diferencias.

## 3. Modelos

- [x] 3.1 Mover `src/explainers/*` a `src/models/*` (modelos, `rng` y tests) y actualizar las importaciones y el script de test. Se verifica cuando `pnpm test` pasa con los 22 tests y no queda ninguna referencia a `explainers`.

## 4. Motor de figuras y piezas compartidas

- [x] 4.1 Partir `src/figures/engine.tsx` en `src/figures/engine/` (`director.ts`, `camera.ts`, `dom.ts`, `steps.tsx`, `hooks.ts`) sin cambiar su comportamiento. Se verifica con typecheck, build y una pasada con Play de las tres figuras (hoja de contactos con `--reduced`).
- [x] 4.2 Crear `engine/rig.ts` (clase base `Rig<P>`: `director`, `io`/`setIo`, `look`, `showStep` a partir de `STEPS`, `el` y `put`) y `engine/shell.tsx` (`FigureShell`: estado de UI, consentimiento, `pick`, hooks y maqueta). Se verifica con typecheck.
- [x] 4.3 Crear `src/figures/parts/bench.ts`, `Bench.tsx` y `frames.ts`, y que las tres geometrías los usen. Se verifica cuando las capturas en reposo de las tres figuras se ven iguales a las actuales.
- [x] 4.4 Migrar Ralph, LoopForge y Audio a `rig.ts` (que extiende `Rig`) y `Figure.tsx` (que usa `FigureShell`). Se verifica con:
  - cada `Figure.tsx` con al menos un 30 % menos de líneas que la versión actual;
  - ninguna definición de `blank`, `pick`, `setIo` ni `look` fuera de `engine/`;
  - la misma secuencia de pasos con Play (por `drive.mjs`);
  - la paridad sin diferencias.

## 5. Secciones del sitio

- [x] 5.1 Partir `src/site/Home.tsx` en `Hero.tsx`, `Projects.tsx`, `Contact.tsx` y `LangSwitch.tsx`, y llevar el JSON-LD a `jsonld.ts`. Se verifica con la paridad sin diferencias y un build en verde.

## 6. Fronteras, código muerto y `pnpm check`

- [x] 6.1 Crear `scripts/checks/boundaries.ts` con su test (`boundaries.test.ts`, que usa fixtures para cada regla y para los nombres prohibidos). Se verifica cuando el test pasa y el script pasa sobre `src/`.
- [x] 6.2 Añadir Knip en desarrollo con la configuración de los puntos de entrada de Next, y eliminar lo que detecte. Se verifica cuando `pnpm knip` pasa sin ignorar nada salvo lo justificado en su configuración.
- [x] 6.3 Redefinir `pnpm check` como Biome (lint y formato), typecheck, tests, fronteras, Knip y `openspec validate --all --strict`. Se verifica cuando pasa en verde y un fallo inyectado en cada paso lo hace terminar con un código distinto de cero.

## 7. Worktrees y Orca

- [x] 7.1 Crear `.node-version` (24), `engines.node` y `scripts/bootstrap.sh` (POSIX). Se verifica:
  - en un worktree nuevo, termina con código 0, deja `node_modules` y `core.hooksPath=.githooks` e imprime la URL;
  - con Node 22 activo, falla sin instalar nada;
  - con otro `core.hooksPath`, se detiene.
- [x] 7.2 Crear `scripts/port.ts` y `scripts/run.ts` con un test (ruta → puerto estable, 3302 para el checkout principal y detección de colisiones con worktrees simulados). Hacer que `pnpm dev` y `pnpm start` los usen. Se verifica con el test y con dos worktrees reales sirviendo a la vez en puertos distintos.
- [ ] 7.3 Crear `orca.yaml` (`scripts.setup`, `setupAgentStartupPolicy` en el nivel superior, `defaultTabs`) y `docs/worktrees.md`. Se verifica creando un worktree con Orca (`orca` CLI): el bootstrap se ejecuta antes de que arranque el agente.

## 8. Commits, hooks de Git, CI y entrega

- [x] 8.1 Crear `scripts/commit-msg.ts` con su test (formato convencional, atribución y casos permitidos de revert, fixup y squash), y `.githooks/commit-msg` y `pre-push`. Se verifica cuando el test pasa, un commit con `Co-Authored-By: Claude` se rechaza en local y un push con un test roto se cancela.
- [x] 8.2 Crear `scripts/delivery.ts` (`branch`, `pr-check`, `pr-create` y `merge`) con un test de la validación de título y cuerpo y de la frescura respecto a `origin/main`, y añadir los scripts `delivery:*`. Se verifica con el test y con `pr-check` sobre un cuerpo válido y otro sin `Verification`.
- [x] 8.3 Crear `.github/workflows/check.yml` (acciones fijadas por SHA, solo lectura, check, build, audit, gitleaks fijado y commit-msg sobre los commits del PR), `.github/pull_request_template.md`, `.github/dependabot.yml` y `.github/workflows/copilot-setup-steps.yml`. Se verifica cuando `actionlint` (vía `pnpm dlx` o binario) no muestra errores y el workflow de Copilot tiene el job `copilot-setup-steps`.

## 9. Espacio de trabajo para agentes

- [x] 9.1 Crear `AGENTS.md` raíz (propósito, mapa, comandos, reglas de arquitectura y contra el código de relleno, OpenSpec, commits y PRs, prohibiciones, confianza de hooks) y los `AGENTS.md` de una a cinco líneas en cada carpeta de `src/*` y `scripts/`. Crear también `CLAUDE.md` (`@AGENTS.md`) y `.gemini/settings.json` (`context.fileName`). Se verifica cuando cada carpeta de `src/` tiene su `AGENTS.md` y el raíz ocupa menos de 32 KiB.
- [x] 9.2 Crear las skills canónicas en `.agents/skills/` (`worktree-bootstrap`, `orca-cli`, `orchestration`, `add-figure`, `verify-ui`) y los adaptadores `claude-*` en `.claude/skills/`. Comprobar con Context7 cómo tratan OpenCode y Copilot los nombres duplicados, y generar las skills de OpenSpec con `openspec init --tools` para los clientes compatibles. Se verifica cuando cada skill tiene un frontmatter válido, los nombres no se repiten entre `.agents/skills` y `.claude/skills` y la decisión del prefijo queda anotada en el diseño.
- [x] 9.3 Crear `scripts/agent-hooks.ts` (normalización por cliente, contexto de inicio, guardas, certificado en `.git/agent-hooks/`, `certify`) con tests por cliente y evento, y añadir el paso `certify` al final de `pnpm check`. Se verifica con tests que cubren:
  - editar `src/iso` se bloquea;
  - un `push --force` a `main` se bloquea;
  - un commit con atribución se bloquea;
  - `Stop` sin certificado pide checks;
  - `Stop` con certificado del árbol actual deja terminar.
- [x] 9.4 Conectar los hooks de cada cliente: `.claude/settings.json`, `.codex/hooks.json`, `.agents/hooks.json` (formato de Antigravity), `.opencode/plugins/agent-hooks.ts` y `.gemini/settings.json`, sin copias en `.cursor` ni en `.github/hooks`. Se verifica pasando un evento de ejemplo de cada cliente por el script en un test de integración, y con Claude Code en real: intentar editar `src/iso/iso-kit.ts` queda bloqueado.
- [x] 9.5 Completar `openspec/config.yaml` con el contexto del proyecto y las reglas de tareas. Se verifica con `openspec validate --all --strict`.

## 10. Repo público

- [ ] 10.1 Reescribir el README en inglés y actualizar `LICENSE` (MIT para el código; textos, CV y marca excluidos) y `.gitignore` (shots, artifacts, estado de hooks, ajustes locales de los clientes, `.env*`). Se verifica cuando `git ls-files` no muestra archivos locales ni generados y los comandos del README funcionan tal cual.
- [x] 10.2 Escanear todo el historial con gitleaks. Se verifica sin hallazgos o con los hallazgos explicados (el CV con teléfono es una decisión del dueño, no un secreto).

## 11. Rendimiento

- [ ] 11.1 Corregir el contraste (`--anatomy-muted` a `#6b6b70` en el tema claro) y añadir `src/app/icon.svg` y `apple-icon.png`. Se verifica con Lighthouse sin elementos en `color-contrast`, sin errores en consola y Accessibility y Best Practices en 100.
- [ ] 11.2 Crear `scripts/posters.tsx` (como `prebuild`), que genera `public/figures/<id>.svg` autónomos desde cada `Drawing`. Se verifica cuando los tres pósters se ven iguales a la figura en reposo, abiertos directamente en el navegador.
- [ ] 11.3 Diferir las figuras en `FigureShell`: póster `<img>` con su tamaño e `import()` del dibujo y su rig al acercarse. Se verifica con:
  - el HTML de `/` sin geometría y ≤ 40 KB comprimido;
  - el póster de la primera figura no es diferido, y `lcp-lazy-loaded` pasa en escritorio;
  - First Load JS de 110 KB o menos en `next build`;
  - sin descargas de código de figuras sin hacer scroll (se mira en la pestaña de red);
  - CLS 0;
  - sin JS, póster y guía visibles;
  - las figuras se comportan igual (hoja de contactos con Play).
- [ ] 11.4 Activar `experimental.inlineCss` y comprobar que no queda ningún recurso que bloquee el renderizado. Se verifica con la auditoría `render-blocking-resources` vacía.
- [ ] 11.5 Crear `src/app/llms.txt/route.ts` (estático, desde el contenido). Se verifica cuando `/llms.txt` responde 200 con el nombre, el rol, el stack, los tres repos y el contacto.
- [ ] 11.6 Crear `scripts/checks/perf.ts` (`pnpm perf`: puntuaciones, presupuestos y `--url`/`--ci`) y el job `perf` en CI. Se verifica con `pnpm perf` en local dando 100 en las cuatro categorías en móvil y escritorio, para `/` y `/es`, con los presupuestos cumplidos.

## 12. Despliegue (al final, con todo en verde; autorizado por el dueño)

- [ ] 12.1 Confirmar `gh api user -q .login` = `taberoajorge`. Crear el repo público `taberoajorge/taberoa-portfolio`, hacer push de `main` y proteger la rama (check obligatorio y sin pushes forzados). Se verifica con `git remote get-url origin` y `gh api` de la protección.
- [ ] 12.2 Conectar el proyecto de Vercel `taberoa-portfolio` al repo (Node 24, pnpm, `main` de producción). Se verifica cuando el push a `main` genera un despliegue de producción con la metadata del commit de GitHub.
- [ ] 12.3 Mover `taberoa.com` y `www.taberoa.com` de `todo-app` al portafolio, con `www` redirigiendo con 308 al apex. Se hace con la API de dominios del proyecto, nunca con `vercel domains rm`, y antes se ejecuta `vercel domains inspect taberoa.com`. Se verifica con `curl -I` en ambos (200 en el apex y 308 hacia el apex en `www`) y con `GET /v9/projects/<todo-app>/domains` sin esos dominios.
- [ ] 12.4 Repetir `pnpm perf --url https://taberoa.com` y la paridad de head y JSON-LD contra producción. Se verifica cuando se cumplen los mismos umbrales que en local.

## 13. Verificación integral

- [ ] 13.1 Ejecutar `pnpm check` y `pnpm build`, la paridad final contra la línea base y una hoja de contactos de las tres figuras con Play. Se verifica con todo en verde y la paridad sin diferencias.
- [ ] 13.2 Ejecutar `pnpm perf` final (local) sobre `/` y `/es`. Se verifica con 100 en las cuatro categorías en móvil y escritorio.
- [ ] 13.3 Revisar el diff con `/code-review` y una pasada contra el código de relleno (exportaciones, comentarios, abstracciones). Se verifica cuando los hallazgos están resueltos o justificados.
