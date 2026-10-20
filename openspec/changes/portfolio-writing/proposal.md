# Proposal

## Why

El portafolio muestra qué construí, pero no cómo pienso. La primera historia que vale la pena contar ya está investigada y escrita: la migración de un servicio Java a TypeScript con un agente en un loop y el harness de paridad que le permitió al agente ver lo que rompía. Hoy no hay dónde publicarla con una URL propia, y LinkedIn y X necesitan un enlace a un texto largo que sea mío.

## What Changes

- Una sección **Writing** (en `/es`, **Escritos**) en la página principal, entre los proyectos y el contacto, con la lista de posts.
- Una página por post en `/writing/<slug>`, en inglés, estática, con su `canonical`, metadatos Open Graph de artículo y JSON-LD `BlogPosting` enlazado a la `Person` del sitio.
- El primer post: *The service only two people could touch*.
- El sitemap y `llms.txt` listan los posts.

Lo que el visitante ve en el hero, los proyectos y el contacto no cambia. Las figuras no cambian.

## Capabilities

### New Capabilities
- `portfolio-writing`: la sección de escritos, las páginas de post y sus metadatos.

### Modified Capabilities
- `portfolio-home`: «Encontrable en buscadores» pasa a listar también los posts en el sitemap.

## Impact

- **Código:** `src/content/posts.ts` (el post como datos), etiquetas `writing` en `en.ts` y `es.ts`, `src/site/Writing.tsx` y `src/site/Post.tsx`, `postMetadata` en `meta.ts`, `postJsonLd` en `jsonld.ts`, la ruta `src/app/(en)/writing/<slug>/page.tsx`, `sitemap.ts` y `llms.ts`.
- **Dependencias:** ninguna nueva. La prosa se estila con utilidades de Tailwind.
- **Decisiones del dueño:** los posts se escriben en inglés y `/es` lo dice; la empresa no se nombra en el texto del post (el hero ya la nombra; es una palabra si quiere cambiarlo); la fecha del cambio de motor de cronogramas (agosto de 2026) se cuenta según git y el dueño la confirma antes de publicar.
- **Acciones fuera de la máquina:** el PR y el merge despliegan a producción y van al final, con el visto bueno del dueño.
