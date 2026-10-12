# Spec Delta

## Purpose

Que el portafolio cargue lo más rápido posible en móvil y en escritorio, sea accesible y lo entiendan bien tanto los buscadores clásicos como los de IA. Un portafolio lento o con avisos en las herramientas del navegador resta credibilidad a un ingeniero.

## ADDED Requirements

### Requirement: Lighthouse al máximo
Sobre el build de producción, Lighthouse SHALL dar 100 en Performance, Accessibility, Best Practices y SEO, para `/` y `/es`, en móvil y en escritorio. Esto se mide en local con `pnpm perf`. En CI, la variación entre máquinas MUST tolerarse solo en Performance (umbral ≥ 95) y en los presupuestos de tiempo (LCP y TBT), que se comprueban en local y contra producción; las otras tres categorías MUST dar 100, y el HTML, el JS y el CLS MUST cumplir sus presupuestos.

#### Scenario: Medición local
- **WHEN** se ejecuta `pnpm perf` contra `pnpm build && pnpm start`
- **THEN** las cuatro ejecuciones (2 páginas × 2 dispositivos) dan 100 en las cuatro categorías, y el informe las muestra por página y dispositivo

#### Scenario: Regresión en CI
- **WHEN** un PR baja la accesibilidad por debajo de 100
- **THEN** el job de rendimiento de CI falla y nombra la auditoría

### Requirement: Presupuestos de carga
La primera respuesta de `/` y `/es` SHALL cumplir:
- HTML de 40 KB o menos comprimido con gzip;
- ningún recurso que bloquee el renderizado (el CSS crítico va inline);
- sin fuentes web (hoy ya no hay ninguna; se mantiene así);
- First Load JS de 110 KB o menos comprimido, la misma cifra que informa `next build` (hoy 134 KB);
- LCP simulado por Lighthouse de 2,0 s o menos en móvil y de 0,8 s o menos en escritorio, y TBT de 50 ms o menos;
- CLS de 0.

`pnpm perf` MUST comprobar estos presupuestos y fallar si alguno se supera.

#### Scenario: HTML ligero
- **WHEN** se descarga `/` comprimido
- **THEN** pesa 40 KB o menos y no contiene la geometría de las figuras

#### Scenario: Sin bloqueo de renderizado
- **WHEN** Lighthouse analiza `/`
- **THEN** la auditoría `render-blocking-resources` no lista ningún recurso

### Requirement: Figuras diferidas con póster
Cada figura SHALL entregar en el HTML inicial solo sus textos (ficha, pasos, guía, leyenda y pie) y un póster estático:
- un SVG autónomo pregenerado en el build, con el estado de reposo;
- con ancho y alto explícitos;
- con `loading="lazy"` y sin prioridad alta: el elemento LCP es el texto del hero, en móvil y en escritorio, así que el póster no debe competir con él.

El dibujo interactivo y su código MUST cargarse después del evento `load` (y cuando el navegador está libre), solo para las figuras a menos de una pantalla de distancia, y entonces sustituir al póster sin desplazar el contenido. Sin JavaScript, MUST verse el póster y los textos.

#### Scenario: Carga inicial
- **WHEN** se abre `/`
- **THEN** antes del evento `load` no se ha descargado el código de ninguna figura

#### Scenario: Al acercarse
- **WHEN** el visitante se acerca a una figura
- **THEN** se descarga su código, el dibujo interactivo sustituye al póster y el CLS sigue en 0

#### Scenario: El LCP es el texto
- **WHEN** Lighthouse analiza `/` en móvil y en escritorio
- **THEN** el elemento LCP es el párrafo del hero, no un póster

#### Scenario: Sin JavaScript
- **WHEN** se abre la página sin JavaScript
- **THEN** cada figura muestra su póster y su guía

### Requirement: Contraste y consola limpia
Todo el texto SHALL tener un contraste de al menos 4.5:1 (o 3:1 si es texto grande), incluidos los rótulos de las esquinas de las figuras, la leyenda, los pies y la guía. La página MUST NOT producir errores ni avisos en consola, incluido el 404 del favicon. El sitio MUST servir un icono y un `apple-touch-icon`.

#### Scenario: Auditoría de contraste
- **WHEN** Lighthouse ejecuta `color-contrast` en `/` y `/es`
- **THEN** no encuentra ningún elemento

#### Scenario: Consola
- **WHEN** se carga la página en Chrome
- **THEN** la consola no muestra errores ni avisos

### Requirement: Legible para buscadores de IA
El sitio SHALL servir `/llms.txt` en Markdown, generado a partir del mismo contenido que la página. Debe incluir:
- quién es, rol, stack y búsqueda de trabajo;
- los tres proyectos, con su enlace al repositorio y una frase de qué hace cada uno;
- el contacto y el CV;
- un enlace a la versión en español.

MUST responder 200 con `text/plain` o `text/markdown` y estar permitido en `robots.txt`.

#### Scenario: llms.txt
- **WHEN** se pide `/llms.txt`
- **THEN** responde 200 con Markdown que contiene el nombre, el rol, el stack, los tres repositorios y el contacto, y coincide con los textos de la página
