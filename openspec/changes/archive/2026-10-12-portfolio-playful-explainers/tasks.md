# Tasks

## 1. Base: idioma, contenido y tests

- [x] 1.1 Crear `src/lib/lang.ts` con `getLang()` y usarlo en `layout.tsx` (`<html lang>`) y `page.tsx`. Se verifica cuando `curl -H 'Accept-Language: en-US' localhost:3302` devuelve `<html lang="en">`, y con `es-MX` devuelve `lang="es"`.
- [x] 1.2 Mover los textos bilingües a `src/content.ts` con:
  - el nuevo hero: rol, stack, roles y Developer of the Year 2023 y 2024;
  - la contribución y el stack de cada proyecto;
  - etiquetas de enlace honestas: Audio Cleaner pasa a "Repositorio", sin "PUBLIC DEMO".

  Se verifica con `pnpm typecheck` y revisando ambos idiomas en el HTML.
- [x] 1.3 Añadir el script `"test": "node --test 'src/**/*.test.ts'"` y ajustar `tsconfig` si hiciera falta (`allowImportingTsExtensions`). El patrón va entre comillas para que el glob lo resuelva Node: `sh` no tiene globstar y se saltaría los tests anidados. Se verifica cuando un test trivial, colocado a dos directorios de profundidad, aparece en la salida de `pnpm test`, y `pnpm typecheck` y `pnpm build` siguen en verde.

## 2. Layout y estilo juguetón

- [x] 2.1 Añadir la fuente display (Bricolage Grotesque vía `next/font/google`) y la paleta en `tailwind.config.ts`. Se verifica cuando `pnpm build` pasa y los titulares usan la fuente.
- [x] 2.2 Reescribir `page.tsx` así:
  - sin `h-screen` ni `overflow-hidden`;
  - un hero que no empiece con un saludo;
  - chips de stack;
  - secciones de proyecto con un hueco para el explicador;
  - contacto con CV, correo y LinkedIn.

  Se verifica con capturas a 1440×900 y 390×844: nombre, rol y stack visibles sin scroll, sin scroll horizontal, y a 1280×600 se llega al contacto con scroll.

## 3. Infraestructura común de explicadores

- [x] 3.1 Crear `src/explainers/rng.ts`, un hash determinista `(seed, story, attempt) → [0,1)`, con un test que compruebe que la misma entrada da la misma salida y que la distribución es aproximadamente uniforme. Se verifica con `pnpm test`.
- [x] 3.2 Crear `src/explainers/use-autoplay.ts`, que hace lo siguiente:
  - avanza por intervalos;
  - se pausa fuera de pantalla con `IntersectionObserver`;
  - con `prefers-reduced-motion` desactiva el autoplay y expone "siguiente paso".

  Se verifica a mano activando la emulación de movimiento reducido en DevTools: no avanza solo, y el botón sí avanza.

## 4. Explicador Ralph, "el robot que no se rinde"

- [x] 4.1 Crear `src/explainers/ralph/model.ts` con 5 historias, `pFail` ajustable, `GUTTER = 3` que añade una guardrail y reduce a la mitad la `pFail` efectiva, y un tope de 24 iteraciones. Lleva tests en `model.test.ts` para:
  - que con `pFail` baja el bucle termina con todo pasado;
  - que a los 3 fallos aparece la guardrail;
  - que con `pFail` alta el bucle se detiene en el tope e informa qué quedó pendiente;
  - que subir `pFail` da más iteraciones con la misma semilla.

  Se verifica con `pnpm test`.
- [x] 4.2 Crear `src/explainers/ralph/RalphExplainer.tsx` con:
  - el tablero (pendiente, en curso, hecho);
  - el robot SVG con expresiones;
  - las notas de guardrail en la pared;
  - los controles iniciar/pausar, reiniciar y el slider de torpeza;
  - la lectura `aria-live`;
  - una descripción textual.

  Se verifica con capturas en escritorio y móvil, operándolo solo con teclado y viendo con JS desactivado un estado inicial legible.

## 5. Explicador LoopForge, "varios fogones"

- [x] 5.1 Crear `src/explainers/loopforge/model.ts` con 6 historias y un DAG de dependencias, 1 o 3 carriles, merge al pasar, revisión humana a los 3 fallos consecutivos y bloqueo de las dependientes. Lleva tests en `model.test.ts` para:
  - que 3 carriles terminan en menos ticks que 1 con la misma semilla;
  - que B no entra antes de que A pase;
  - que una historia con 3 fallos va a revisión humana;
  - que el modelo no avanza en pausa.

  Se verifica con `pnpm test`.
- [x] 5.2 Crear `src/explainers/loopforge/LoopForgeExplainer.tsx` con:
  - el interruptor de 1 o 3 carriles ("fogones");
  - la cola con candados de dependencia;
  - la rama principal donde se fusionan las historias;
  - la bandeja de revisión humana;
  - el panel de iteraciones, commits y fallos;
  - la pausa;
  - la lectura `aria-live` y la descripción.

  Se verifica con capturas, teclado y JS desactivado.

## 6. Explicador Audio Cleaner, "lavadora de audio"

- [x] 6.1 Crear `src/explainers/audio/model.ts` con los segmentos deterministas (~16 s), los `PRESETS` copiados de `presets.py` y las etapas `denoise`, `trim` (`pad + 150 ms + pad` para silencios ≥ `min_silence`) y `refine` (`1 − prop_decrease`). Lleva tests en `model.test.ts` para:
  - que los valores de los tres presets son exactos;
  - que un silencio ≥ `min_silence` se convierte en `2·pad + 150`;
  - que un silencio < `min_silence` se conserva;
  - que la duración con `aggressive` es menor que con `natural`, y esta menor que con `gentle`;
  - que todos los segmentos de voz duran al menos 500 ms (`min_speech_duration_ms`, igual en los tres presets), para que Silero no descarte ninguno;
  - que la duración "después" incluye los 150 ms que el pipeline real añade también tras el último segmento.

  Se verifica con `pnpm test`.
- [x] 6.2 Crear `src/explainers/audio/AudioExplainer.tsx` con:
  - la lavadora SVG con tres ciclos (lavado = DeepFilterNet, centrifugado = VAD y recorte, enjuague = noisereduce);
  - la onda antes y después;
  - el selector de presets;
  - la lectura de duración "antes → después" y de los parámetros activos;
  - una descripción que aclare que la onda es sintética.

  Se verifica con capturas, teclado y JS desactivado.

## 7. Visibilidad

- [x] 7.1 Crear `src/app/opengraph-image.tsx` (1200×630, con nombre, rol y stack) y actualizar los metadatos OG y la descripción en `layout.tsx`. Se verifica cuando `curl -I localhost:3302/opengraph-image` devuelve 200 con `image/png` y el HTML incluye `og:image`, `og:title` y `og:description`.
- [x] 7.2 Actualizar el README con el comando `pnpm test` y la estructura de `src/explainers/`. Se verifica cuando los comandos documentados se ejecutan tal cual.

## 8. Verificación integral

- [x] 8.1 Ejecutar `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`. Se verifica cuando todo está en verde.
- [x] 8.2 Pasar Lighthouse en móvil contra `pnpm start` (MCP lighthouse). Se verifica con Performance y Accessibility ≥ 90 y sin pantallas de carga ni intro.
- [x] 8.3 Revisar el diff con `/code-review`. Se verifica cuando los hallazgos están resueltos o justificados.

## 9. Dirección `/anatomy` (tras revisión del usuario)

- [x] 9.1 Copiar el kit de `/anatomy` a `src/iso/`, aplicar el tema claro en `<body>` y excluir `src/iso` de Biome. Se verifica cuando `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan.
- [x] 9.2 Exponer `roll` y `threshold` en el modelo de Ralph, con un test que compruebe que `pass ⇔ roll ≥ threshold`. Se verifica con `pnpm test`.
- [x] 9.3 Crear la figura de Ralph (`src/figures/ralph/`): banco de inspección con unas 60 piezas, animación por segmentos desde el modelo, lectura en la esquina, región `aria-live`, sin autoplay con movimiento reducido y controles con teclado. Se verifica con hoja de contactos, acercamientos a 4× (reloj, sonda, cargador, bandeja, tablero) y capturas a 1440 px y 390 px.
- [x] 9.4 Rediseñar la página en grafito sobre papel y dar a LoopForge y Audio un estilo gris provisional. Se verifica con capturas en escritorio y móvil, sin scroll horizontal.
- [x] 9.4b Animación de Ralph a 60/120 fps: capas compuestas, cero React en el bucle, muelles y curvas. Se verifica con trazas de Chrome a 1× y 4× de CPU (escritorio y móvil), hoja de contactos a cámara lenta y acercamientos de alineación de capas.
- [x] 9.4c Cámara, foco, narración y consentimiento con movimiento reducido en la figura de Ralph. Se verifica con hojas de contactos a velocidad real, con y sin `--reduced`, pulsando Play.
- [x] 9.5 Crear la figura de LoopForge: el mismo modelo con 1 o 3 estaciones en paralelo, fusión a main y revisión humana. Pendiente de aprobar la dirección.
- [x] 9.6 Crear la figura de Audio Cleaner: una pletina de cinta o un bastidor de procesado con las 3 etapas y los presets reales. Pendiente de aprobar la dirección.
- [x] 9.7 Extraer el motor compartido (`src/figures/engine.tsx`, `camera.ts`): director de tramos, cámara, foco, narración y consentimiento con movimiento reducido. Ralph, LoopForge y Audio lo usan; se borran los explicadores HTML antiguos y su CSS. Se verifica con lint, typecheck, 22 tests, build y hojas de contactos de las tres figuras pulsando Play con `--reduced`.

## 10. Layout, copy y SEO (tras la tercera revisión del usuario)

- [x] 10.1 Layout de dos columnas en escritorio (texto fijo a la izquierda, figura a la derecha) y apilado en móvil. Se verifica con capturas a 1440 px y 390 px, sin scroll horizontal.
- [x] 10.2 Reescribir `content.ts`:
  - quitar los textos de los explicadores borrados;
  - cambiar el copy de Audio Cleaner a las etapas reales (eliminación de ruido, detección de voz, recorte de silencios y pasada final);
  - cambiar "fogones" por "worktrees" en LoopForge.

  Se verifica cuando `grep` no encuentra lavado, centrifugado, enjuague ni fogones, y con typecheck.
- [x] 10.3 Una URL por idioma: grupos de rutas `(en)` → `/` y `(es)` → `/es`, con layout raíz y `<html lang>` propios, `canonical` y `hreflang` vía `src/site/meta.ts`, imagen OG por idioma y `src/middleware.ts` (redirección por `Accept-Language` y cookie `lang` con `?hl=`). Se verifica con `curl`:
  - `/` y `/es` responden 200 con el `lang` correcto;
  - un navegador en español pasa por un 307 hacia `/es`;
  - con `?hl=en` se fija la cookie y ya no se redirige;
  - sin `Accept-Language` responde 200 en inglés.
- [x] 10.4 SEO: `sitemap.ts`, `robots.ts`, JSON-LD (`Person`, `ProfilePage` y `SoftwareSourceCode`), el nombre dentro del `h1`, el orden de encabezados y enlaces con texto descriptivo. Se verifica con `curl` y el JSON-LD parseado.
- [x] 10.5 Lighthouse en móvil contra el build de producción en `/` y `/es`. Se verifica con SEO, Accessibility y Performance ≥ 90.

## 11. Explicación paso a paso (enfoque del worktree `job-search-crm/docs/anatomy`)

- [x] 11.1 Motor: etiquetas numeradas ancladas al dibujo que se mueven con la cámara (debajo de su punto si no caben encima; en móvil, solo la activa), un `Stepper`, una `Guide` (paso n de N, qué pasa, "En el dibujo" = pieza → significado, Anterior/Siguiente) y `FigureLayout` (escritorio: ficha y guía fija a la izquierda, figura a la derecha; móvil: ficha → figura → guía). Se verifica con capturas a 1440 px y 390 px, sin scroll horizontal.
- [x] 11.2 Cinco pasos por figura en en/es, fieles a cada repo. La animación marca el paso activo, y elegir un paso pausa, encuadra su estación y cambia la guía. Se verifica con `drive.mjs`: al elegir el paso 4 de Ralph → "Step 4 of 5" con su etiqueta activa; con Play, LoopForge y Audio avanzan solos ("Merge to main", "Silence trim").

## 12. Flujos legibles (tras la cuarta revisión del usuario)

- [x] 12.1 LoopForge:
  - plano general fijo mientras corre (solo hace zoom al elegir un paso);
  - cada ronda recorre los pasos en orden (cola → worktrees → verificar → main / revisión), con una pausa al cambiar;
  - vuelos de uno en uno;
  - los pasadores se levantan al desbloquearse;
  - lectura corta, sin el prefijo de contadores.

  Se verifica con una hoja de contactos con `--reduced` + Play: el paso 1 aparece primero y la cámara no salta.
- [x] 12.2 Audio Cleaner:
  - la cinta empieza en blanco ("esperando una grabación");
  - el paso 1 es la llegada de la grabación desde la bobina izquierda;
  - el paso 5 es "Resultado" (listo para descargar) y no "Presets"; los presets se explican en los pasos de recorte y pasada final;
  - pausa antes de cada cabezal;
  - en reposo solo se etiqueta el cabezal activo.

  Se verifica con capturas en reposo y con la hoja de contactos de la ejecución completa.
