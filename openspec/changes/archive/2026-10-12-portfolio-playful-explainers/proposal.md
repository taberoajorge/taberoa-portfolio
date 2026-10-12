# Proposal

## Why

El portafolio actual es correcto pero genérico. No refleja el estilo de Alex, que es juguetón, y falla el primer vistazo de un reclutador: el hero abre con "Hi, I'm Alex", no muestra stack ni señales de confianza, y las tarjetas dicen qué es cada proyecto, pero no qué construyó él. La investigación (popout.page, showproof.io, ejemplos como vityuk.dev o marcelocarmona.com) apunta a la misma salida. Primero texto claro para el reclutador, y después una idea distintiva que se pueda tocar y que demuestre el oficio sin depender de WebGL ni de intros.

## What Changes

- **Hero orientado a reclutadores**:
  - Rol y área en las primeras palabras ("Senior Software Engineer · Full-Stack AI Product Engineering").
  - Stack principal visible antes de hacer scroll.
  - Roles buscados.
  - Señal de confianza: Developer of the Year en Outbuild (2023 y 2024).
- **Tres explicadores interactivos en SVG**, uno por proyecto, en tono juguetón:
  - **Ralph, "el robot que no se rinde"**: tablero de historias, intento, verificación y reintento. A los 3 fallos aprende una guardrail y sigue intentándolo.
  - **LoopForge, worktrees en paralelo**: el mismo bucle en 1 o 3 carriles paralelos (git worktrees). Respeta las dependencias, fusiona al pasar y envía a revisión humana lo que llega a 3 fallos. Incluye un panel de iteraciones, commits y fallos, y control de pausa.
  - **Audio Cleaner, el pipeline de limpieza**: una onda sintética pasa por las tres etapas reales: DeepFilterNet, recorte con Silero VAD y refinado con noisereduce. Un selector usa los presets reales `gentle`, `natural` y `aggressive`.
- **Cada tarjeta de proyecto dice qué construyó Alex y con qué stack.** Los enlaces muestran honestamente a qué apuntan: repo o demo. Ninguna etiqueta "PUBLIC DEMO" apunta a un repo.
- **Visibilidad y SEO**:
  - Una URL por idioma (`/` y `/es`) con `hreflang`, sitemap, robots, JSON-LD y HTML estático.
  - Imagen Open Graph generada.
  - `<html lang>` acorde al idioma que se sirve.
  - Metadatos bilingües coherentes.
- **Layout**: se elimina el `md:h-screen md:overflow-hidden` que obliga a que todo quepa en una pantalla. La página pasa a hacer scroll para alojar los explicadores.

## Capabilities

### New Capabilities
- `portfolio-home`: Página principal. Cubre el hero para reclutadores, las tarjetas de proyecto con contribución y stack, el contacto y el CV, la selección de idioma (es/en) y los metadatos de visibilidad (OG, `lang`).
- `project-explainers`: Explicadores interactivos por proyecto. Cubre su comportamiento, su fidelidad al proyecto real, la accesibilidad (teclado, `prefers-reduced-motion`, lectura sin JS) y las reglas de rendimiento (no bloquean el contenido, sin WebGL).

### Modified Capabilities
<!-- Ninguna: el proyecto no tiene specs previas. -->

## Impact

- **Código**:
  - Se reescribe `src/app/page.tsx` y se divide en componentes bajo `src/components/`.
  - Se ajustan `src/app/layout.tsx` y `src/app/globals.css`.
  - Se añade `src/app/opengraph-image.tsx`.
- **Dependencias**: ninguna nueva. Se usan React, Next 15, Tailwind 3 y `lucide-react`, que ya están instalados. `next/og` viene incluido en Next.
- **Repos externos**: el README de `audio-cleaner-oss` es la plantilla de `create-next-app` y el repo no tiene `homepage`. Arreglarlo queda fuera de este cambio, pero conviene hacerlo en paralelo porque los reviewers llegan ahí desde el portafolio.
- **Supuestos**:
  - El título es "Senior Software Engineer", tomado del CV.
  - La onda de audio es sintética y sin sonido: no hay un clip real con permiso para publicarlo.
  - Los números de Ralph y LoopForge (umbral de fallos, carriles) son ilustrativos pero coherentes con los repos.
