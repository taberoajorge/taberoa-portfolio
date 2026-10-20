# Tasks

## 1. Contenido y página del post

- [x] 1.1 Crear `src/content/posts.ts` con el tipo `Post`, el primer post como bloques y `POSTS`; añadir `writing` a `en.ts` y `es.ts`; exportarlo desde `content/index.ts`; anotar en `content/AGENTS.md` que los posts son solo en inglés. Se verifica con `pnpm typecheck` en verde y el post entero presente en el módulo.
- [x] 1.2 Crear `src/site/Post.tsx` (bloques, cabecera, JSON-LD, contacto) y la ruta `src/app/(en)/writing/java-to-typescript-migration-parity-harness/page.tsx` con `postMetadata`. Se verifica cuando `pnpm build` genera la página como estática y `/writing/<slug>` responde 200 con `<html lang="en">`, `canonical` propio y un `BlogPosting` válido.

## 2. Sección en la página principal y descubrimiento

- [x] 2.1 Crear `src/site/Writing.tsx` y colocarla en `Home.tsx` entre proyectos y contacto; en `/es` cada post indica «En inglés». Se verifica a 1440 px y 390 px en `/` y `/es`: la sección aparece, el enlace lleva al post y no hay scroll horizontal.
- [x] 2.2 Añadir los posts a `sitemap.ts` y a `llms.ts`. Se verifica cuando `/sitemap.xml` lista la URL del post y `/llms.txt` tiene la sección «Writing».

## 3. Verificación

- [x] 3.1 `pnpm check` y `pnpm build` en verde; `pnpm parity compare` muestra solo la sección nueva y se guarda con `pnpm parity save`; `pnpm perf` mantiene 100 en las cuatro categorías para `/` y `/es`. Se verifica con la salida de los tres comandos.
- [ ] 3.2 Revisar el post en el navegador a 1440 px y 390 px, con JavaScript desactivado el texto sigue; el bloque de código no desborda. Se verifica con capturas en `shots/`. Estado el 20 de octubre: visto a 1440 px; a 390 px solo se comprobó por script (`body` a 390 px: sin desbordamiento, `pre` y tabla desplazan por dentro), sin capturas ni media queries reales. Pendiente la pasada real a 390 px.

## 4. Entrega (con el visto bueno del dueño)

- [ ] 4.1 El dueño confirma el texto del post y el orden del cambio de motor de agosto. Commit `feat(writing): add the writing section and the first post`, PR con `pnpm delivery:pr-create`, merge cuando CI esté en verde. Se verifica cuando `https://taberoa.com/writing/java-to-typescript-migration-parity-harness` responde 200 y `pnpm perf --url https://taberoa.com` sigue en verde.
