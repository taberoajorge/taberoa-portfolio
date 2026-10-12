# Design

## Context

- **Estado actual.** Next 15 (App Router), React 19, Tailwind 3, `lucide-react` y Biome. No hay framework de tests y Node es v26, con type stripping nativo.
- **Página.** Todo está en `src/app/page.tsx`: un bento de 4×2 forzado a una pantalla (`md:h-screen md:overflow-hidden`), con contenido bilingüe en un objeto `content` y el idioma elegido por `Accept-Language`.
- **Idioma.** `layout.tsx` fija `<html lang="es">`.
- **Imagen OG.** No existe.
- **Requisitos y motivación.** Ver `proposal.md` y `specs/`.

## Goals / Non-Goals

**Goals:**
- **Una sola fuente de verdad por explicador.** Un modelo puro y determinista que produce los estados. El dibujo y la lectura en vivo salen de ese mismo estado.
- **Cero dependencias nuevas** de ejecución y de desarrollo.
- **Estilo juguetón** con medios baratos: color, formas redondeadas, un robot dibujado en SVG, transiciones CSS y una fuente display.

**Non-Goals:**
- **No hay figuras isométricas ni WebGL.** El kit de `/anatomy` queda fuera: es demasiado peso para tres explicadores juguetones.
- **No hay CMS, blog ni modo oscuro.** Se pueden añadir más adelante.
- **No se toca el README de `audio-cleaner-oss`.** Queda como tarea fuera de este repo.

## Decisions

1. **Modelos puros en `src/explainers/<name>/model.ts`.** Cada uno exporta `initial(opts)` y `step(state) → state`, sin React. Así se pueden probar con `node --test` y se ejecutan igual en servidor y cliente.
   - *Alternativa:* lógica dentro de los componentes. Se descarta porque no se puede probar sin un DOM y mezclaría la verdad con el dibujo.

2. **Aleatoriedad determinista por historia e intento.** El resultado del intento *n* de la historia *k* es `rng(seed, k, n) < pFail_efectiva`, con un hash entero tipo mulberry32.
   - **Por qué así:** el resultado no depende del orden de ejecución, de modo que LoopForge con 1 o con 3 carriles ve los mismos éxitos y fallos. La comparación "paralelo termina antes" es justa y se puede probar.
   - *Alternativa:* un único RNG secuencial. Se descarta porque cambiar el número de carriles cambiaría los resultados.

3. **Ralph.**
   - 5 historias.
   - `pFail` se ajusta con un slider de 0.1 a 0.9.
   - Al llegar a `GUTTER = 3` fallos se añade una guardrail y la `pFail` efectiva de esa historia se reduce a la mitad (ilustrativo).
   - Tope ilustrativo de 24 iteraciones: con la semilla por defecto, la torpeza máxima (0.95) lo alcanza y 0.9 o menos termina.

   **LoopForge.**
   - 6 historias con un DAG pequeño, por ejemplo B depende de A y E depende de C y D.
   - 1 o 3 carriles.
   - Cada tick, cada carril ocupado hace un intento.
   - Al pasar, la historia hace commit y merge y libera el carril.
   - Con 3 fallos consecutivos, la historia va a "revisión humana" y libera el carril.
   - Las historias que dependen de una que está en revisión humana se quedan bloqueadas, y el bucle termina cuando no queda trabajo ejecutable.

4. **Audio.**
   - Una lista determinista de segmentos `{tipo: voz|silencio, ms}` de unos 16 s.
   - La envolvente se muestrea a unos 200 puntos para la vista "antes".
   - Las etapas son funciones puras sobre esa estructura:
     1. `denoise`: baja el piso de ruido. DeepFilterNet no tiene parámetro de preset, así que la reducción es fija.
     2. `trim`: aplica la semántica del pipeline real. Un silencio menor que `min_silence` se queda dentro del segmento. Uno mayor o igual se convierte en `pad + 150 + pad`.
     3. `refine`: escala el ruido restante por `1 − prop_decrease`.
   - Comprobado: en los tres presets, `2·pad + 150 < min_silence`, así que el recorte siempre acorta.
   - Ningún segmento de voz dura menos de 500 ms (`min_speech_duration_ms`), así que Silero no descarta ninguno y no hace falta modelar ese parámetro.
   - Como en el pipeline real, la vista "después" termina con 150 ms extra tras el último segmento.
   - La lectura muestra la duración "antes → después".

5. **Componentes cliente con SSR del estado inicial.**
   - Cada explicador es un único `"use client"`. Next lo renderiza en el servidor con `initial(...)`, de modo que sin JS se ve un estado estático legible y los controles quedan presentes pero inertes.
   - Avanzan con un `setInterval` de unos 700 ms. Los pasos son discretos, así que un re-render por paso es barato, y las transiciones CSS suavizan el movimiento.
   - Hay un hook común, `useAutoplay`, de unas 30 líneas: un `IntersectionObserver` pausa fuera de pantalla, y `matchMedia('(prefers-reduced-motion: reduce)')` desactiva el autoplay y muestra "siguiente paso".
   - La lectura usa `aria-live="polite"`.
   - *Alternativa:* separar un servidor estático de un cliente que muta refs, que es el patrón de `/anatomy`. Se descarta porque es más código y el ritmo de 1–2 Hz no lo necesita.

6. **Idioma.**
   - Un helper `getLang()` en `src/lib/lang.ts` lee `headers()`. Lo usan `layout.tsx`, para el `lang` del `<html>`, y `page.tsx`.
   - Los textos se mueven a `src/content.ts`, que también contiene los textos de los explicadores.
   - Ya es una página dinámica por `headers()`, así que esto no cambia la estrategia de render.

7. **OG.** `src/app/opengraph-image.tsx` con `ImageResponse` de `next/og`, que viene incluido. La imagen es de 1200×630, en inglés, con nombre, rol y stack; el stack no depende del idioma.

8. **Estilo.**
   - Una fuente display redondeada vía `next/font/google`, que viene con Next (sin dependencia nueva): Bricolage Grotesque para titulares y la fuente del sistema para el cuerpo.
   - Una paleta de 3 o 4 colores vivos sobre fondo crema, guardada en `tailwind.config.ts`.
   - El robot se dibuja con primitivas SVG simples, con cara y antena, y cambia de expresión según el estado: intentando, contento o frustrado.

9. **Layout.** Se quita `h-screen` y `overflow-hidden`. El orden queda así:
   1. Hero, con nombre, rol, stack en chips, roles buscados, Developer of the Year y los CTA de CV y contacto.
   2. Una sección por proyecto: la tarjeta (qué construí, stack y enlace) junto a su explicador. En móvil van apilados.
   3. Contacto.

10. **Tests.**
    - Se añade el script `"test": "node --test 'src/**/*.test.ts'"`, que usa el type stripping de Node 26. Va entre comillas para que el glob lo resuelva Node y no `sh`, que sin globstar se saltaría los tests anidados.
    - Un único archivo de test por modelo, con los escenarios de las specs: el gutter de Ralph, que 3 carriles son más rápidos que 1, las dependencias, los presets y el recorte de silencios.

11. **Cambio de dirección visual (tras revisar la versión juguetona): estilo `/anatomy`.**
    - El usuario descartó el estilo juguetón. Cada explicador pasa a ser una figura isométrica del skill `/anatomy`: un objeto físico cuyo mecanismo *es* el concepto, en grafito sobre papel, con un único acento iluminado. El kit se copia tal cual en `src/iso/` y queda fuera de Biome por ser código vendorizado.
    - Los modelos puros (`src/explainers/*/model.ts`) siguen siendo la fuente de verdad: la figura mueve sus piezas y escribe la lectura a partir de ellos.
    - **Ralph = banco de inspección de tarjetas** (`src/figures/ralph/`):
      - cargador con la pila de historias;
      - carro sobre dos guías;
      - sonda en la estación de prueba;
      - reloj comparador cuya aguja marca la tirada real (`roll`) frente a la marca del umbral efectivo (`roll ≥ pFail`);
      - un agujero perforado por cada fallo;
      - una etiqueta de guardrail en el tablero perforado cada 3 fallos;
      - bandeja de terminadas.
    - Con esta decisión se revierte el non-goal "sin figuras isométricas". La página adopta el tema claro del kit (`.iso[data-theme="light"]`). Se elimina la fuente display: la interfaz usa la tipografía del sistema y monoespaciada.
    - **Rendimiento (60/120 fps).** La figura se compone de capas SVG apiladas que comparten `viewBox`, en orden de pintado:
      - El carro, la pila, la sonda y la tarjeta expulsada son capas propias y se mueven con CSS `transform`, sin repintar.
      - La aguja y las etiquetas tienen capas mínimas.
      - El bucle no pasa por React: los cambios discretos se escriben en el DOM.
      - La aguja y las etiquetas usan muelles amortiguados.
      - Las travesías usan una curva quíntica, y la caída de tarjetas usa gravedad.
      - Medido con traza de Chrome: unos 0.8 ms de hilo principal por fotograma en escritorio y unos 1.5 ms en móvil con la CPU ralentizada 4×.
    - **Dirección del movimiento (tras la segunda revisión del usuario).** La fluidez no venía de los fps, sino del lenguaje del movimiento. Se adoptan tres recursos del worktree de referencia `job-search-crm/docs/anatomy`:
      - una cámara (`src/figures/camera.ts`) que hace zoom y paneo con curva quíntica hacia cada estación, a la vez que se mueven las piezas;
      - foco: lo que no participa baja un tono;
      - narración de cada paso en la lectura.
    - **Consentimiento.** Con movimiento reducido no hay autoplay, pero si el visitante pulsa Play o "Siguiente paso", la animación se reproduce suave en lugar de saltar.
    - Las capas solo se componen durante el movimiento de cámara (`will-change` temporal), para que el dibujo quede nítido al terminar el zoom.
    - **LoopForge = banco de tres yunques** bajo un puente, uno por worktree:
      - bandeja de cola con pasadores de dependencia;
      - las tarjetas vuelan en arco a los yunques libres y las tres sondas prueban a la vez;
      - lámparas por fallo consecutivo;
      - plataforma de main y bandeja de revisión con bandera.
    - **Audio Cleaner = mesa de cinta:**
      - forma de onda impresa sobre una regla en segundos reales;
      - pórtico con fieltro (DeepFilterNet), cuchilla (Silero VAD) y rodillo (noisereduce), que limpian detrás de su paso;
      - la cinta se contrae según `spans()` y `afterCut()`, con test;
      - selector de preset.
    - **Explicación paso a paso**, tomada del worktree de referencia:
      - etiquetas numeradas sobre las piezas, una fila de pasos y una guía en lenguaje claro con "En el dibujo";
      - la animación marca el paso activo; elegir un paso pausa y encuadra la estación;
      - es texto HTML real y renderizado en servidor, así que también lo indexan los buscadores.
    - Las tres figuras comparten `src/figures/engine.tsx`. Ya no quedan explicadores HTML con un estilo gris provisional hasta tener figura propia.

## Risks / Trade-offs

- **Los imports con extensión `.ts` necesarios para `node --test` pueden chocar con Next/tsc.** → Activar `allowImportingTsExtensions` en `tsconfig` (compatible con `noEmit`), o mantener los modelos sin imports relativos.
- **La fuente de Google necesita red en el build.** → Vercel la tiene. Si falla, el respaldo es la fuente del sistema.
- **Lo juguetón puede restar seriedad ante un reclutador.** → El hero se mantiene sobrio y lo juguetón queda dentro de los explicadores, siguiendo la regla de la propuesta.
- **El ruido sintético no es audio real.** → Se dice explícitamente en la descripción del explicador.
- **Un slider en 0.9 puede no terminar nunca en Ralph.** → El tope de 24 iteraciones lo resuelve y la lectura explica qué historias quedaron sin pasar.

## Migration Plan

Es un solo deploy en Vercel, y para revertir basta con revertir el commit. No hay datos ni APIs que migrar.

## Open Questions

- ¿Fecha de la release de LoopForge, o enlace a una demo de vídeo? Se puede añadir a la tarjeta después sin cambiar las specs.
