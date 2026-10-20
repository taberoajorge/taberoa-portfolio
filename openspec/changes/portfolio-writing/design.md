# Design

## Context

Sitio estático en Next 15 con dos páginas (`/` y `/es`), texto en `src/content` (`en.ts` define la forma y `es.ts` la cumple), secciones en `src/site` y rutas en `src/app`. Las fronteras entre carpetas las comprueba `pnpm check`. El contenido del post ya está escrito y contrastado contra los registros del proyecto fuera de este repo.

## Goals / Non-Goals

**Goals:**
- Un post con URL propia, indexable y compartible, que cargue como el resto del sitio (sin JS nuevo en la primera carga).
- Añadir un post futuro cuesta un objeto en `posts.ts` y una carpeta de ruta.

**Non-Goals:**
- Sin MDX, sin `@tailwindcss/typography`, sin CMS, sin comentarios, sin RSS por ahora.
- Sin versión en español del post: `es.ts` está tipado contra `en.ts`, así que meter el cuerpo ahí obligaría a traducirlo. El post vive en su propio módulo.

## Decisions

1. **El post es datos, no componentes.** `src/content/posts.ts` exporta `type Post` (slug, título, dek, fecha, keywords y `body` como bloques `h2 | p | pre | ul | table`) y `POSTS`. Cumple la regla «el texto no vive en componentes» y Knip no ve exportaciones sueltas. *Alternativa descartada:* MDX; es una dependencia y un plugin de Next para un post.
2. **Una ruta estática por post** (`src/app/(en)/writing/<slug>/page.tsx`). Con un post, `[slug]` y `generateStaticParams` serían código de más. Hereda el layout en inglés y la imagen Open Graph del perfil.
3. **`Post.tsx` renderiza los bloques** con utilidades de Tailwind; `pre` con `overflow-x-auto` para que no haya scroll horizontal en móvil. Las etiquetas (sección, «Read», «In English») salen de `content[lang].writing`.
4. **Metadatos propios del post** (`postMetadata`): `canonical` sin `hreflang`, `openGraph.type: 'article'`, `publishedTime`, keywords. No se reutiliza `metadataFor`, que declara alternativas por idioma que el post no tiene.
5. **JSON-LD `BlogPosting`** con `author` apuntando a `#person`, para que los buscadores unan el post a la persona.
6. **La sección en Home** lista `POSTS` en los dos idiomas; en `/es` cada entrada lleva «En inglés» y `hrefLang="en"`.

## Risks / Trade-offs

- **Paridad:** la línea base local de `pnpm parity` cambia porque Home tiene una sección nueva. → Se compara, se confirma que la diferencia es solo la sección y se guarda la nueva línea base.
- **Presupuestos:** el HTML de `/` crece unos cientos de bytes. → `pnpm perf` sigue siendo la puerta.
- **Imagen al compartir:** la tarjeta muestra el perfil, no el título del post. Aceptado para el primer post.

## Migration Plan

Un PR. Para revertir, se revierte el commit.

## Open Questions

- El orden del cambio de motor de cronogramas (git: 12 de agosto de 2026, después de la migración). El dueño lo confirma antes del merge.
