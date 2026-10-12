# Proposal

## Why

El repositorio va a ser público y lo van a mantener personas y agentes de IA. Hoy funciona, pero no está listo para eso:

- **Repetición.** Las tres figuras repiten unas siete piezas casi idénticas (estado de UI, consentimiento, selección de paso, controles, encuadre, `setIo`, maqueta), y sus geometrías copian la misma base de máquina y el mismo helper de encuadre.
- **Archivos que mezclan responsabilidades.** `content.ts` junta los dos idiomas en 639 líneas, `engine.tsx` mezcla motor y componentes de UI, y los modelos viven en `src/explainers`, un nombre que ya no describe lo que contienen.
- **Nada para trabajar con agentes ni con worktrees.** No hay instrucciones para agentes, skills de proyecto, hooks, configuración de Orca, CI, ni reglas de commits y PRs.

La referencia es `job-search-crm`, que ya resuelve esto para el mismo dueño. El repo debe quedar organizado según lo que necesita: una página estática con tres figuras. Sin capas de más ni código de relleno.

## What Changes

- **Arquitectura del frontend, simple y explícita:**
  - `src/app` solo contiene rutas;
  - `src/site` contiene las secciones de la página;
  - `src/figures/engine` es el motor compartido;
  - `src/figures/parts` agrupa las piezas de máquina comunes;
  - `src/figures/<proyecto>` tiene una figura por proyecto;
  - `src/models` guarda los modelos puros con sus tests;
  - `src/content` separa los textos por idioma;
  - `src/iso` es el kit vendorizado y queda intacto.
- **Quitar la repetición:**
  - un `FigureShell` y una clase base `Rig` concentran lo común de las figuras;
  - la base de máquina y el encuadre pasan a ser piezas compartidas;
  - las secciones de `Home` se separan en componentes;
  - se borra el código muerto.
- **Contenido por idioma:** `en.ts` y `es.ts`, con el tipo del español comprobado contra el inglés, más un archivo de datos del sitio (enlaces, stack, repos).
- **Fronteras comprobadas:** un script de `pnpm check` falla si se rompe una regla de dependencias entre carpetas.
- **Higiene de repo público:**
  - README en inglés con mapa de arquitectura y comandos;
  - `.node-version` y `engines`;
  - CI en GitHub (lint, formato, tipos, tests, fronteras, build, OpenSpec y escaneo de secretos);
  - plantilla de PR (Summary/Intent/Verification) y Dependabot;
  - política de commits (Conventional Commits, sin atribución a IA);
  - `.gitignore` sin restos locales.
- **Repo AI-native para todos los clientes** (Claude Code, Codex, Cursor, OpenCode, Gemini CLI/Antigravity, GitHub Copilot), con la configuración que cada uno documenta hoy:
  - `AGENTS.md` en la raíz y por carpeta, más los adaptadores de cada cliente;
  - skills de proyecto compartidas: preparar worktree, Orca, orquestación, añadir una figura, verificar UI y las de OpenSpec;
  - un harness de hooks común: contexto al iniciar sesión, guardas antes de cada herramienta y un certificado de checks al terminar;
  - scripts de entrega (rama, PR, merge) con su validación.
- **Orca y worktrees:**
  - `orca.yaml` ejecuta `scripts/bootstrap.sh` y espera a que termine;
  - cada worktree recibe un puerto propio, derivado de su ruta y con guarda de colisiones, que usan `pnpm dev` y `pnpm start`;
  - hooks de Git versionados;
  - `docs/worktrees.md`.
- **OpenSpec:** `config.yaml` con el contexto del proyecto y reglas para las tareas.

- **Rendimiento al máximo:**
  - 100 en las cuatro categorías de Lighthouse, en móvil y escritorio, para `/` y `/es`;
  - las figuras se cargan solo al acercarse, con un póster estático mientras tanto;
  - el CSS crítico va inline;
  - presupuestos de HTML y JS;
  - contraste corregido;
  - favicon;
  - `llms.txt` para buscadores de IA.
- **Despliegue:**
  - repo público en GitHub `taberoajorge/taberoa-portfolio`;
  - el proyecto de Vercel `taberoa-portfolio` conectado a ese repo;
  - `taberoa.com` y `www` pasan del proyecto `todo-app` al portafolio.

Los textos, las figuras y el comportamiento que ve el visitante se mantienen. Mejoran la carga, el contraste y el dominio.

## Capabilities

### New Capabilities
- `codebase-architecture`: estructura de carpetas, responsabilidades, fronteras de dependencias comprobadas, reutilización de las piezas de figura y reglas contra el código de relleno.
- `agent-workspace`: instrucciones para agentes, skills, hooks, configuración por cliente y harness de checks.
- `worktree-setup`: integración con Orca, bootstrap, aislamiento de puertos y hooks de Git por worktree.
- `repository-delivery`: CI, política de commits y PRs, scripts de entrega e higiene de repo público.
- `site-performance`: puntuaciones de Lighthouse, presupuestos de carga, figuras diferidas con póster, contraste, consola limpia y `llms.txt`.
- `deployment`: repo de GitHub, proyecto de Vercel conectado por Git, dominio `taberoa.com` y paridad de medidas en producción.

### Modified Capabilities
<!-- Ninguna: el comportamiento visible de portfolio-home y project-explainers no cambia. -->

## Impact

- **Código:**
  - reorganización de `src/` (movimientos y extracciones sin cambiar el comportamiento);
  - nuevos `scripts/` (bootstrap, puertos, fronteras, hooks de agente, entrega) con sus tests;
  - nuevos `.githooks/`, `.github/` y archivos de configuración por cliente.
- **Dependencias:**
  - se añade `tsx` en desarrollo si el harness lo necesita;
  - el resto se resuelve con Node y las dependencias actuales;
  - las herramientas externas (gitleaks, OpenSpec) se ejecutan con versión fija en CI y no entran en el lockfile.
- **Supuestos y decisiones del dueño:**
  - el CV publicado se mantiene tal cual, con teléfono;
  - harness completo como en `job-search-crm`;
  - todos los clientes de agentes;
  - el cambio anterior quedó archivado y sus specs son el contrato vigente;
  - `taberoa.com` y `www` se mueven de `todo-app` al portafolio, y `todo-app` se queda sin dominio propio;
  - el repo de GitHub es público y se crea al final, con el repo ya limpio.
- **Acciones fuera de la máquina** (crear el repo, conectar Vercel, mover el dominio): autorizadas por el dueño y ejecutadas al final, después de que el build y las medidas locales estén en verde.
